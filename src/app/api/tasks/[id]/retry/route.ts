import { isLiveMode, requireConnected } from "@/lib/live-mode";
import { retryTask } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isLiveMode()) {
    return ok({ id, status: "queued", message: "Retry queued (mock)" });
  }

  try {
    requireConnected();
    return ok(await retryTask(id));
  } catch (e) {
    return err(e);
  }
}
