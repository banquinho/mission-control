import { ok, err } from "@/lib/api-response";
import { getOpenClawConfig } from "@/lib/config";
import { isLiveMode } from "@/lib/live-mode";
import type { OpenClawSettings } from "@/types/settings";

export async function GET() {
  try {
    const live = isLiveMode();
    const cfg = getOpenClawConfig();

    const settings: OpenClawSettings = live && cfg
      ? {
          mode: "live",
          sshHost: cfg.sshHost.includes("@")
            ? `***@${cfg.sshHost.split("@").pop()}`
            : cfg.sshHost,
          sshPort: cfg.sshPort,
          remoteCwd: cfg.remoteCwd,
          timeoutMs: cfg.timeoutMs,
          cliPrefix: cfg.cliPrefix.join(" "),
        }
      : { mode: "mock" };

    return ok(settings);
  } catch (e) {
    return err(e);
  }
}
