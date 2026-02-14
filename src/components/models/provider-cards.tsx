import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import type { ProviderSummary } from "@/types/models";

export function ProviderCards({ providers }: { providers: ProviderSummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((p) => (
        <Card key={p.provider}>
          <CardHeader>
            <CardTitle>{p.provider}</CardTitle>
            <StatusDot color="bg-green-500" pulse />
          </CardHeader>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-zinc-100">
                {p.totalCalls.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500">Calls</p>
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-100">
                {(p.totalTokens / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-zinc-500">Tokens</p>
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-100">
                ${p.totalCostUsd.toFixed(2)}
              </p>
              <p className="text-xs text-zinc-500">Cost</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
