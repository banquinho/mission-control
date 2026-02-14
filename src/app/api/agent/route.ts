import { isLiveMode, requireConnected } from "@/lib/live-mode";
import { getAgentStatus } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";
import { mockAgent } from "@/lib/mock-data";

export async function GET() {
  if (!isLiveMode()) return ok(mockAgent);

  try {
    requireConnected();
    return ok(await getAgentStatus());
  } catch (e) {
    return err(e);
  }
}
