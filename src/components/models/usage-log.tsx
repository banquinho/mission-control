import { Badge } from "@/components/ui/badge";
import { relativeTime, formatDuration } from "@/lib/utils";
import type { ModelUsageRecord } from "@/types/models";

export function UsageLog({ records }: { records: ModelUsageRecord[] }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-100">Recent LLM Calls</h2>
      <div className="mt-4 space-y-2">
        {records.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-zinc-100">{r.model}</span>
              <Badge variant="outline">{r.agentId}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>{r.totalTokens} tok</span>
              <span>${r.costUsd.toFixed(4)}</span>
              <span>{formatDuration(r.latencyMs)}</span>
              <span>{relativeTime(r.ts)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
