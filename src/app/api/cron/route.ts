import { isLiveMode, requireConnected } from "@/lib/live-mode";
import { listCronJobs } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";
import { mockCronJobs } from "@/lib/mock-data";

export async function GET() {
  if (!isLiveMode()) return ok(mockCronJobs);

  try {
    requireConnected();
    return ok(await listCronJobs());
  } catch (e) {
    return err(e);
  }
}
