import { isLiveMode } from "@/lib/live-mode";
import { mailboxSend } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";
import { validateMailboxMessage } from "@/types/mailbox";
import type { MailboxMessage } from "@/types/mailbox";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return err(new Error("Invalid JSON body"), 400);
  }

  const message: MailboxMessage = {
    id: crypto.randomUUID(),
    from: String(body.from ?? ""),
    to: String(body.to ?? ""),
    ts: new Date().toISOString(),
    type: body.type as MailboxMessage["type"],
    subject: String(body.subject ?? ""),
    body: String(body.body ?? ""),
    ...(body.replyTo ? { replyTo: String(body.replyTo) } : {}),
    ...(body.meta ? { meta: body.meta as MailboxMessage["meta"] } : {}),
  };

  const errors = validateMailboxMessage(message);
  if (errors.length > 0) {
    return err(
      new Error(`Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`),
      400
    );
  }

  if (!isLiveMode()) {
    return ok(message, 201);
  }

  try {
    const sent = await mailboxSend(message);
    return ok(sent, 201);
  } catch (error) {
    return err(error);
  }
}
