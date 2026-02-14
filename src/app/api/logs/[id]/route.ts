import { isLiveMode, requireConnected } from "@/lib/live-mode";
import { getTaskLogs } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";
import { mockLogs } from "@/lib/mock-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isLiveMode()) {
    const filtered = mockLogs.filter((l) => !l.taskId || l.taskId === id);
    return ok(filtered);
  }

  try {
    requireConnected();
    return ok(await getTaskLogs(id));
  } catch (e) {
    return err(e);
  }
}
