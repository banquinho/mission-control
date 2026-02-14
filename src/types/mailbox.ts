export type MailboxMessageType = "MESSAGE" | "REQUEST" | "RESPONSE";
export type MailboxPriority = "low" | "normal" | "high";

export interface MailboxMessage {
  id: string;
  from: string;
  to: string;
  ts: string;
  type: MailboxMessageType;
  subject: string;
  body: string;
  replyTo?: string;
  meta?: {
    priority?: MailboxPriority;
  };
}

// ── Validation ─────────────────────────────────────────────

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AGENT_ID_RE = /^[\w.:-]+$/;
const VALID_TYPES: MailboxMessageType[] = ["MESSAGE", "REQUEST", "RESPONSE"];
const SUBJECT_MAX = 200;
const BODY_MAX = 10_000;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateMailboxMessage(
  msg: Partial<MailboxMessage>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!msg.id || !UUID_V4_RE.test(msg.id)) {
    errors.push({ field: "id", message: "Must be a valid UUID v4" });
  }
  if (!msg.from || !AGENT_ID_RE.test(msg.from)) {
    errors.push({ field: "from", message: "Invalid agentId format" });
  }
  if (!msg.to || !AGENT_ID_RE.test(msg.to)) {
    errors.push({ field: "to", message: "Invalid agentId format" });
  }
  if (!msg.type || !VALID_TYPES.includes(msg.type)) {
    errors.push({ field: "type", message: `Must be one of: ${VALID_TYPES.join(", ")}` });
  }
  if (!msg.subject || typeof msg.subject !== "string") {
    errors.push({ field: "subject", message: "Required" });
  } else if (msg.subject.length > SUBJECT_MAX) {
    errors.push({ field: "subject", message: `Max ${SUBJECT_MAX} characters` });
  }
  if (!msg.body && msg.body !== "") {
    errors.push({ field: "body", message: "Required" });
  } else if (typeof msg.body === "string" && msg.body.length > BODY_MAX) {
    errors.push({ field: "body", message: `Max ${BODY_MAX} characters` });
  }
  if (msg.replyTo !== undefined && !UUID_V4_RE.test(msg.replyTo)) {
    errors.push({ field: "replyTo", message: "Must be a valid UUID v4" });
  }
  if (msg.meta?.priority !== undefined) {
    if (!["low", "normal", "high"].includes(msg.meta.priority)) {
      errors.push({ field: "meta.priority", message: "Must be low, normal, or high" });
    }
  }

  return errors;
}

export function validateAgentId(agentId: string): boolean {
  return AGENT_ID_RE.test(agentId);
}

export function validateMessageId(messageId: string): boolean {
  return UUID_V4_RE.test(messageId);
}
