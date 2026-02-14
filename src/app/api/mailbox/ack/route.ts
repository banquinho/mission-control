import { isLiveMode } from "@/lib/live-mode";
import { mailboxAck } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";
import { validateAgentId, validateMessageId } from "@/types/mailbox";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return err(new Error("Invalid JSON body"), 400);
  }

  const agentId = String(body.agentId ?? "");
  const messageId = String(body.messageId ?? "");

  if (!validateAgentId(agentId)) {
    return err(new Error("Missing or invalid agentId"), 400);
  }
  if (!validateMessageId(messageId)) {
    return err(new Error("Missing or invalid messageId (must be UUID v4)"), 400);
  }

  if (!isLiveMode()) {
    return ok({ acknowledged: true });
  }

  try {
    await mailboxAck(agentId, messageId);
    return ok({ acknowledged: true });
  } catch (error) {
    return err(error);
  }
}
