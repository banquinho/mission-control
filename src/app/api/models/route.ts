import { isLiveMode } from "@/lib/live-mode";
import { ok, err } from "@/lib/api-response";
import {
  mockModelUsage,
  mockProviderSummaries,
  mockEndpointUsage,
} from "@/lib/mock-data";

export async function GET() {
  if (!isLiveMode()) {
    return ok({
      usage: mockModelUsage,
      providers: mockProviderSummaries,
      endpoints: mockEndpointUsage,
    });
  }

  try {
    // Live mode: wire to openclawExec(["models", "usage", "--json"]) later
    return ok({
      usage: mockModelUsage,
      providers: mockProviderSummaries,
      endpoints: mockEndpointUsage,
    });
  } catch (e) {
    return err(e);
  }
}
