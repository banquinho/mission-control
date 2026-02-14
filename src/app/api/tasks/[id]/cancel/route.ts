import { isLiveMode, requireConnected } from "@/lib/live-mode";
import { cancelTask } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isLiveMode()) {
    return ok({ id, status: "cancelled", message: "Task cancelled (mock)" });
  }

  try {
    requireConnected();
    return ok(await cancelTask(id));
  } catch (e) {
    return err(e);
  }
}
