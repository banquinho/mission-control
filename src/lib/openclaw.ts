import { execFile } from "node:child_process";
import { getOpenClawConfig, type OpenClawConfig } from "./config";
import type {
  AgentStatus,
  CronJob,
  Task,
  LogEntry,
  CreateTaskPayload,
} from "@/types";
import type { MailboxMessage } from "@/types/mailbox";
import {
  validateMailboxMessage,
  validateAgentId,
  validateMessageId,
} from "@/types/mailbox";

// ── Error type ──────────────────────────────────────────────

export type OpenClawErrorCode =
  | "OPENCLAW_NOT_CONFIGURED"
  | "OPENCLAW_CONNECTION_FAILED"
  | "OPENCLAW_TIMEOUT"
  | "OPENCLAW_INVALID_RESPONSE"
  | "OPENCLAW_SSH_ERROR"
  | "OPENCLAW_INVALID_ID";

export class OpenClawError extends Error {
  constructor(
    public readonly code: OpenClawErrorCode,
    message: string,
    public readonly stderr: string = ""
  ) {
    super(message);
    this.name = "OpenClawError";
  }
}

// ── Logging ─────────────────────────────────────────────────

function log(level: "debug" | "info" | "warn" | "error", msg: string) {
  const ts = new Date().toISOString();
  const fn = level === "debug" ? console.debug
    : level === "warn" ? console.warn
    : level === "error" ? console.error
    : console.info;
  fn(`[OpenClaw] ${ts} ${msg}`);
}

// ── Shell escaping ──────────────────────────────────────────

/**
 * Escape a string for safe inclusion inside a single-quoted bash string.
 * The technique: end the current single-quote, insert an escaped literal
 * single-quote, then re-open a single-quote.
 *   hello'world  →  'hello'\''world'
 */
function shellQuote(s: string): string {
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

// ── SSH execution core ──────────────────────────────────────

function requireConfig(): OpenClawConfig {
  const cfg = getOpenClawConfig();
  if (!cfg) {
    throw new OpenClawError(
      "OPENCLAW_NOT_CONFIGURED",
      "OpenClaw SSH is not configured (OPENCLAW_SSH_HOST not set)"
    );
  }
  return cfg;
}

/**
 * Sanitize stderr for logging — strip paths that may contain key file locations.
 */
function sanitizeStderr(stderr: string): string {
  return stderr
    .replace(/\/[\w/._-]*id_[\w._-]*/g, "(identity-file)")
    .replace(/\/home\/[\w.-]+/g, "/home/***")
    .replace(/\/Users\/[\w.-]+/g, "/Users/***")
    .trim()
    .slice(0, 500);
}

/**
 * Build the shell command string that runs inside `bash -lc` on the remote host.
 *
 * Produces a properly-quoted shell command like:
 *   cd '/home/user/openclaw' && 'npm' 'run' 'openclaw' '--' 'status' '--json'
 *
 * - remoteCwd: quoted with double-quotes so $HOME expands (~ is rewritten to $HOME)
 * - cliPrefix tokens: each individually single-quoted
 * - subcommand args: each individually single-quoted (prevents injection)
 * - cd and && are left as unquoted shell operators
 */
function buildRemoteCommand(
  subcommandArgs: string[],
  config: OpenClawConfig
): string {
  // Replace leading ~ with $HOME so it expands inside the inner bash -c.
  // Use double-quotes around the path so $HOME expands and spaces are safe.
  const cwd = config.remoteCwd.replace(/^~(?=\/|$)/, "$HOME");
  const cwdExpr = `"${cwd}"`;

  const prefixTokens = config.cliPrefix.map(shellQuote).join(" ");
  const argTokens = subcommandArgs.map(shellQuote).join(" ");

  return `cd ${cwdExpr} && ${prefixTokens} ${argTokens}`;
}

/**
 * Execute an OpenClaw subcommand on the remote host via SSH.
 *
 * Uses `ssh <opts> <host> -- bash -lc '<command>'` so that:
 * - bash -l loads the login profile (ensures node/npm are on PATH)
 * - The entire remote command is shell-quoted into a single token so the
 *   remote login shell passes it intact as one argument to bash -lc
 * - execFile is used (no local shell interpolation)
 *
 * SSH concatenates all args after the hostname with spaces, so the remote
 * login shell sees:
 *   bash -lc 'cd "$HOME/openclaw" && '\''npm'\'' '\''run'\'' ...'
 *
 * The login shell strips the outer quoting and hands the inner string to
 * bash -lc, which then executes the actual command with $HOME expanded.
 *
 * @param subcommandArgs - args AFTER the cli prefix, e.g. ["status", "--json"]
 */
function sshExec(
  subcommandArgs: string[],
  config: OpenClawConfig
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const remoteCmd = buildRemoteCommand(subcommandArgs, config);

    const args: string[] = [
      ...config.sshOpts,
      "-p",
      String(config.sshPort),
      config.sshHost,
      "--",
      "bash",
      "-lc",
      shellQuote(remoteCmd),
    ];

    log("debug", `exec: ${config.cliPrefix.join(" ")} ${subcommandArgs.join(" ")}`);
    const start = Date.now();

    const child = execFile("ssh", args, {
      timeout: config.timeoutMs,
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true,
    }, (error, stdout, stderr) => {
      const elapsed = Date.now() - start;

      if (error) {
        if (error.killed) {
          log("error", `timeout after ${elapsed}ms: ${subcommandArgs[0]} ${subcommandArgs[1] ?? ""}`);
          return reject(
            new OpenClawError(
              "OPENCLAW_TIMEOUT",
              `OpenClaw command timed out after ${config.timeoutMs}ms`,
              sanitizeStderr(stderr)
            )
          );
        }

        const code = error.code;
        const errorCode: OpenClawErrorCode =
          code === 255 ? "OPENCLAW_CONNECTION_FAILED" : "OPENCLAW_SSH_ERROR";

        const sanitized = sanitizeStderr(stderr);
        log("error", `failed (exit ${code}, ${elapsed}ms): ${sanitized}`);
        return reject(
          new OpenClawError(
            errorCode,
            `OpenClaw command failed (exit ${code})${sanitized ? ": " + sanitized : ""}`,
            sanitized
          )
        );
      }

      log("debug", `ok ${elapsed}ms: ${subcommandArgs[0]} ${subcommandArgs[1] ?? ""}`);
      resolve({ stdout, stderr });
    });

    child.unref?.();
  });
}

/**
 * Extract the first top-level JSON object or array from stdout that may
 * contain npm banner lines or other non-JSON preamble.
 *
 * Uses brace/bracket depth counting rather than regex so it handles
 * multi-line JSON with nested structures correctly.
 */
function extractJsonFromOutput(stdout: string): string {
  // Find the first '{' or '[' — the start of a JSON value
  let startChar: "{" | "[" | null = null;
  let endChar: "}" | "]" | null = null;
  let start = -1;

  for (let i = 0; i < stdout.length; i++) {
    if (stdout[i] === "{") {
      startChar = "{";
      endChar = "}";
      start = i;
      break;
    }
    if (stdout[i] === "[") {
      startChar = "[";
      endChar = "]";
      start = i;
      break;
    }
  }

  if (start === -1 || !startChar || !endChar) {
    throw new OpenClawError(
      "OPENCLAW_INVALID_RESPONSE",
      `No JSON object/array found in output: ${stdout.slice(0, 200)}`
    );
  }

  // Walk forward tracking depth, respecting strings
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < stdout.length; i++) {
    const ch = stdout[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      if (inString) escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === startChar) {
      depth++;
    } else if (ch === endChar) {
      depth--;
      if (depth === 0) {
        return stdout.slice(start, i + 1);
      }
    }
  }

  throw new OpenClawError(
    "OPENCLAW_INVALID_RESPONSE",
    `Unterminated JSON in output: ${stdout.slice(0, 200)}`
  );
}

/**
 * Run an openclaw subcommand over SSH and parse JSON output.
 * @param subcommandArgs - args after the CLI prefix, e.g. ["status", "--json"]
 */
async function openclawExec<T>(subcommandArgs: string[]): Promise<T> {
  const config = requireConfig();
  const { stdout, stderr } = await sshExec(subcommandArgs, config);

  const trimmed = stdout.trim();
  if (!trimmed) {
    log("error", "empty response from OpenClaw");
    throw new OpenClawError(
      "OPENCLAW_INVALID_RESPONSE",
      "OpenClaw returned empty output",
      sanitizeStderr(stderr)
    );
  }

  try {
    const jsonStr = extractJsonFromOutput(trimmed);
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    if (e instanceof OpenClawError) throw e;
    log("error", `JSON parse failure: ${trimmed.slice(0, 120)}`);
    throw new OpenClawError(
      "OPENCLAW_INVALID_RESPONSE",
      `Failed to parse OpenClaw JSON output: ${trimmed.slice(0, 200)}`,
      sanitizeStderr(stderr)
    );
  }
}

// ── Connection test ─────────────────────────────────────────

export interface ConnectionTestResult {
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Test SSH connectivity by running `openclaw status --json`.
 * Measures roundtrip time. Does NOT throw — always returns a result.
 */
export async function testConnection(): Promise<ConnectionTestResult> {
  const config = getOpenClawConfig();
  if (!config) {
    return { connected: false, error: "Not configured (mock mode)" };
  }

  log("info", "testing connection...");
  const start = Date.now();

  try {
    await sshExec(["status", "--json"], config);
    const latencyMs = Date.now() - start;
    log("info", `connection OK (${latencyMs}ms)`);
    return { connected: true, latencyMs };
  } catch (e) {
    const latencyMs = Date.now() - start;
    const message =
      e instanceof OpenClawError ? e.message : "Unknown connection error";
    log("warn", `connection failed (${latencyMs}ms): ${message}`);
    return { connected: false, latencyMs, error: message };
  }
}

// ── Public API ──────────────────────────────────────────────
// All functions pass only subcommand args (everything after the CLI prefix).
// e.g. ["status", "--json"] becomes: cd ~/openclaw && npm run openclaw -- status --json

export async function getAgentStatus(): Promise<AgentStatus> {
  return openclawExec<AgentStatus>(["status", "--json"]);
}

export async function listCronJobs(): Promise<CronJob[]> {
  return openclawExec<CronJob[]>(["cron", "list", "--json"]);
}

export async function listTasks(): Promise<Task[]> {
  return openclawExec<Task[]>(["tasks", "list", "--json"]);
}

export async function createTask(input: CreateTaskPayload): Promise<Task> {
  const args: string[] = [
    "task",
    "run",
    "--json",
    "--name",
    input.name,
    "--priority",
    input.priority,
  ];

  if (input.description) {
    args.push("--description", input.description);
  }

  if (input.metadata) {
    args.push("--metadata", JSON.stringify(input.metadata));
  }

  return openclawExec<Task>(args);
}

export async function retryTask(taskId: string): Promise<Task> {
  validateId(taskId);
  return openclawExec<Task>(["task", "retry", taskId, "--json"]);
}

export async function cancelTask(taskId: string): Promise<Task> {
  validateId(taskId);
  return openclawExec<Task>(["task", "cancel", taskId, "--json"]);
}

export async function getTaskLogs(taskId: string): Promise<LogEntry[]> {
  validateId(taskId);
  return openclawExec<LogEntry[]>(["task", "logs", taskId, "--json"]);
}

// ── Mailbox ─────────────────────────────────────────────────

/**
 * Get the workspace directory from openclaw status --json.
 * Result: status.memory.workspaceDir
 */
export async function getWorkspaceDir(): Promise<string> {
  const status = await openclawExec<{ memory: { workspaceDir: string } }>(
    ["status", "--json"]
  );
  const dir = status?.memory?.workspaceDir;
  if (!dir || typeof dir !== "string") {
    throw new OpenClawError(
      "OPENCLAW_INVALID_RESPONSE",
      "status --json did not include memory.workspaceDir"
    );
  }
  return dir;
}

/**
 * Write content to a remote file using base64 env var + heredoc python3 script.
 * Payload travels via env var — safe for any JSON content.
 * Python validates JSON before writing. Atomic via tmp + os.replace.
 */
async function remoteWriteFile(
  remotePath: string,
  content: string,
  config: OpenClawConfig
): Promise<void> {
  const encoded = Buffer.from(content, "utf-8").toString("base64");

  const pyScript = [
    "import os, base64, json",
    'payload = base64.b64decode(os.environ["MAILBOX_B64"]).decode("utf-8")',
    "json.loads(payload)",
    'path = os.environ["MAILBOX_PATH"]',
    "os.makedirs(os.path.dirname(path), exist_ok=True)",
    'tmp = path + ".tmp"',
    'with open(tmp, "w", encoding="utf-8") as f:',
    "    f.write(payload)",
    "os.replace(tmp, path)",
  ].join("\n");

  log("debug", `remoteWriteFile: ${remotePath}`);
  await remotePython(pyScript, {
    MAILBOX_B64: encoded,
    MAILBOX_PATH: remotePath,
  }, config);
}

/**
 * Send a message: write to inbox/<to>/ and outbox/<from>/.
 */
export async function mailboxSend(
  message: MailboxMessage
): Promise<MailboxMessage> {
  const errors = validateMailboxMessage(message);
  if (errors.length > 0) {
    throw new OpenClawError(
      "OPENCLAW_INVALID_ID",
      `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`
    );
  }

  const config = requireConfig();
  const workspaceDir = await getWorkspaceDir();
  const json = JSON.stringify(message, null, 2);
  const fileName = `${message.id}.json`;

  const inboxPath = `${workspaceDir}/mailbox/inbox/${message.to}/${fileName}`;
  const outboxPath = `${workspaceDir}/mailbox/outbox/${message.from}/${fileName}`;

  await remoteWriteFile(inboxPath, json, config);
  await remoteWriteFile(outboxPath, json, config);

  return message;
}

/**
 * Execute a python3 script on the remote host via SSH heredoc.
 * Environment variables are passed safely as env var assignments before bash.
 * Returns stdout.
 */
function remotePython(
  pyScript: string,
  envVars: Record<string, string>,
  config: OpenClawConfig
): Promise<string> {
  // Encode the python script as base64 so it survives SSH transport
  // without any quoting issues. The remote side decodes and executes it.
  const scriptB64 = Buffer.from(pyScript, "utf-8").toString("base64");

  // Build env var exports and a python3 invocation that decodes the script
  const envExports = Object.entries(envVars)
    .map(([k, v]) => `export ${k}=${shellQuote(v)}`)
    .join(" && ");

  const remoteCmd = envExports
    ? `${envExports} && echo ${shellQuote(scriptB64)} | base64 -d | python3`
    : `echo ${shellQuote(scriptB64)} | base64 -d | python3`;

  const args: string[] = [
    ...config.sshOpts,
    "-p",
    String(config.sshPort),
    config.sshHost,
    "--",
    "bash",
    "-lc",
    shellQuote(remoteCmd),
  ];

  return new Promise((resolve, reject) => {
    log("debug", `remotePython: ${Object.keys(envVars).join(", ")}`);

    execFile("ssh", args, {
      timeout: config.timeoutMs,
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true,
    }, (error, stdout, stderr) => {
      if (error) {
        const sanitized = sanitizeStderr(stderr);
        const code: OpenClawErrorCode =
          error.killed ? "OPENCLAW_TIMEOUT"
            : (error.code as unknown) === 255 ? "OPENCLAW_CONNECTION_FAILED"
            : "OPENCLAW_SSH_ERROR";
        return reject(new OpenClawError(code, `Remote python failed: ${sanitized}`, sanitized));
      }
      resolve(stdout);
    });
  });
}

/**
 * List messages in inbox/<agentId>/, sorted newest first, limited to 100.
 */
export async function mailboxList(agentId: string): Promise<MailboxMessage[]> {
  if (!validateAgentId(agentId)) {
    throw new OpenClawError("OPENCLAW_INVALID_ID", `Invalid agentId: ${agentId}`);
  }

  const config = requireConfig();
  const workspaceDir = await getWorkspaceDir();
  const inboxDir = `${workspaceDir}/mailbox/inbox/${agentId}`;

  const pyScript = [
    "import json, os",
    'd = os.environ["MAILBOX_DIR"]',
    "msgs = []",
    "if os.path.isdir(d):",
    "    for f in sorted(os.listdir(d), reverse=True)[:100]:",
    "        if f.endswith('.json'):",
    "            with open(os.path.join(d, f)) as fh:",
    "                msgs.append(json.load(fh))",
    "print(json.dumps(msgs))",
  ].join("\n");

  const stdout = await remotePython(pyScript, { MAILBOX_DIR: inboxDir }, config);

  const trimmed = stdout.trim();
  if (!trimmed) return [];

  let parsed: MailboxMessage[];
  try {
    parsed = JSON.parse(trimmed) as MailboxMessage[];
  } catch {
    throw new OpenClawError(
      "OPENCLAW_INVALID_RESPONSE",
      `Failed to parse mailbox list output: ${trimmed.slice(0, 200)}`
    );
  }
  parsed.sort((a, b) => (b.ts > a.ts ? 1 : b.ts < a.ts ? -1 : 0));
  return parsed;
}

/**
 * Acknowledge a message: move from inbox to archive.
 */
export async function mailboxAck(
  agentId: string,
  messageId: string
): Promise<void> {
  if (!validateAgentId(agentId)) {
    throw new OpenClawError("OPENCLAW_INVALID_ID", `Invalid agentId: ${agentId}`);
  }
  if (!validateMessageId(messageId)) {
    throw new OpenClawError("OPENCLAW_INVALID_ID", `Invalid messageId: ${messageId}`);
  }

  const config = requireConfig();
  const workspaceDir = await getWorkspaceDir();
  const fileName = `${messageId}.json`;
  const src = `${workspaceDir}/mailbox/inbox/${agentId}/${fileName}`;
  const dstDir = `${workspaceDir}/mailbox/archive/${agentId}`;
  const dst = `${dstDir}/${fileName}`;

  const pyScript = [
    "import os, sys, shutil",
    'src = os.environ["MAILBOX_SRC"]',
    'dst_dir = os.environ["MAILBOX_DST_DIR"]',
    'dst = os.environ["MAILBOX_DST"]',
    "if not os.path.exists(src):",
    "    sys.exit(1)",
    "os.makedirs(dst_dir, exist_ok=True)",
    "shutil.move(src, dst)",
  ].join("\n");

  await remotePython(pyScript, {
    MAILBOX_SRC: src,
    MAILBOX_DST_DIR: dstDir,
    MAILBOX_DST: dst,
  }, config);
}

// ── Helpers ─────────────────────────────────────────────────

function validateId(id: string): void {
  if (!/^[\w.:-]+$/.test(id)) {
    throw new OpenClawError(
      "OPENCLAW_INVALID_ID",
      `Invalid identifier: ${id}`
    );
  }
}
