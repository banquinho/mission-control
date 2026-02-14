import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relativeTime, formatDuration } from "@/lib/utils";
import type { ModelUsageRecord } from "@/types/models";

export function UsageLog({ records }: { records: ModelUsageRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent LLM Calls</CardTitle>
      </CardHeader>
      <div className="space-y-2">
        {records.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800/50 px-3 py-2 text-sm"
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
    </Card>
  );
}
