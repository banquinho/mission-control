import { Badge } from "@/components/ui/badge";
import type { ProviderSummary } from "@/types/models";

export function ModelBreakdownTable({
  providers,
}: {
  providers: ProviderSummary[];
}) {
  const rows = providers.flatMap((p) =>
    p.models.map((m) => ({ ...m, provider: p.provider }))
  );

  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-100">Model Breakdown</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
              <th className="pb-2 font-medium">Model</th>
              <th className="pb-2 font-medium">Provider</th>
              <th className="pb-2 font-medium text-right">Calls</th>
              <th className="pb-2 font-medium text-right">Avg Latency</th>
              <th className="pb-2 font-medium text-right">Tokens</th>
              <th className="pb-2 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {rows.map((r) => (
              <tr
                key={`${r.provider}-${r.model}`}
                className="border-b border-zinc-800/50"
              >
                <td className="py-2 font-mono text-zinc-100">{r.model}</td>
                <td className="py-2">
                  <Badge variant="outline">{r.provider}</Badge>
                </td>
                <td className="py-2 text-right">{r.calls}</td>
                <td className="py-2 text-right">{r.avgLatencyMs}ms</td>
                <td className="py-2 text-right">
                  {r.totalTokens.toLocaleString()}
                </td>
                <td className="py-2 text-right">${r.totalCostUsd.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
