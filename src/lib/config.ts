export interface OpenClawConfig {
  sshHost: string;
  sshPort: number;
  sshIdentityFile?: string;
  sshOpts: string[];
  timeoutMs: number;
  remoteCwd: string;
  cliPrefix: string[];
}

let _config: OpenClawConfig | null = null;
let _checked = false;

/**
 * Returns OpenClaw SSH config, or null if OPENCLAW_SSH_HOST is not set
 * (triggering mock fallback mode).
 */
export function getOpenClawConfig(): OpenClawConfig | null {
  if (_checked) return _config;
  _checked = true;

  const host = process.env.OPENCLAW_SSH_HOST;
  if (!host) {
    console.warn(
      "[OpenClaw] OPENCLAW_SSH_HOST not set — running in mock mode"
    );
    return null;
  }

  const port = parseInt(process.env.OPENCLAW_SSH_PORT ?? "22", 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `[OpenClaw] Invalid OPENCLAW_SSH_PORT: ${process.env.OPENCLAW_SSH_PORT}`
    );
  }

  const sshOpts: string[] = [];

  const identityFile = process.env.OPENCLAW_SSH_IDENTITY_FILE;
  if (identityFile) {
    sshOpts.push("-i", identityFile);
  }

  const extraOpts = process.env.OPENCLAW_SSH_OPTS;
  if (extraOpts) {
    sshOpts.push(...extraOpts.split(/\s+/).filter(Boolean));
  }

  // Disable interactive prompts and host key checking noise in automation
  sshOpts.push(
    "-o", "BatchMode=yes",
    "-o", "ConnectTimeout=10",
    "-o", "StrictHostKeyChecking=accept-new"
  );

  const timeoutMs = parseInt(process.env.OPENCLAW_TIMEOUT_MS ?? "30000", 10);

  const remoteCwd = process.env.OPENCLAW_REMOTE_CWD ?? "~/openclaw";
  const cliPrefixRaw = process.env.OPENCLAW_CLI_PREFIX ?? "npm run openclaw --";
  const cliPrefix = cliPrefixRaw.split(/\s+/).filter(Boolean);

  _config = {
    sshHost: host,
    sshPort: port,
    sshIdentityFile: identityFile,
    sshOpts,
    timeoutMs,
    remoteCwd,
    cliPrefix,
  };

  return _config;
}

/**
 * Returns a sanitized description of the config for diagnostics.
 * Never exposes identity file paths or full host user info.
 */
export function getSanitizedConfigSummary(): Record<string, string> {
  const cfg = getOpenClawConfig();
  if (!cfg) return { mode: "mock" };
  return {
    mode: "live",
    host: cfg.sshHost.includes("@")
      ? `***@${cfg.sshHost.split("@").pop()}`
      : cfg.sshHost,
    port: String(cfg.sshPort),
    identityFile: cfg.sshIdentityFile ? "(set)" : "(default)",
    timeoutMs: String(cfg.timeoutMs),
    remoteCwd: cfg.remoteCwd,
    cliPrefix: cfg.cliPrefix.join(" "),
  };
}
