import { isLiveMode, getConnectionStatus, refreshConnectionStatus } from "@/lib/live-mode";
import { getSanitizedConfigSummary } from "@/lib/config";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "1";

  if (!isLiveMode()) {
    return ok({
      mode: "mock",
      connected: false,
      lastChecked: new Date().toISOString(),
      config: getSanitizedConfigSummary(),
    });
  }

  const status = forceRefresh
    ? await refreshConnectionStatus()
    : await getConnectionStatus();

  return ok({
    mode: "live",
    ...status,
    config: getSanitizedConfigSummary(),
  });
}
