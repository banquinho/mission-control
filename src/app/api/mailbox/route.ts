import { isLiveMode } from "@/lib/live-mode";
import { mailboxList } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";
import { mockMailboxMessages } from "@/lib/mock-data";
import { validateAgentId } from "@/types/mailbox";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (!agentId || !validateAgentId(agentId)) {
    return err(new Error("Missing or invalid agentId query parameter"), 400);
  }

  if (!isLiveMode()) {
    const filtered = mockMailboxMessages.filter((m) => m.to === agentId);
    return ok(filtered);
  }

  try {
    const messages = await mailboxList(agentId);
    return ok(messages);
  } catch (error) {
    return err(error);
  }
}
