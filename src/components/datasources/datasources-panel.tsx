import { StatusDot } from "@/components/ui/status-dot";
import type { DataSource } from "@/types";

const statusColor: Record<DataSource["status"], string> = {
  connected: "bg-green-500",
  disconnected: "bg-gray-500",
  error: "bg-red-500",
};

export function DataSourcesPanel({ sources }: { sources: DataSource[] }) {
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((ds) => (
          <div key={ds.id} className="rounded-lg bg-zinc-800/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-200">{ds.name}</h3>
              <StatusDot color={statusColor[ds.status]} />
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-zinc-500">
                Type: <span className="capitalize text-zinc-300">{ds.type}</span>
              </p>
              <p className="text-zinc-500">
                Status:{" "}
                <span className="capitalize text-zinc-300">{ds.status}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-600">
        Data source configuration will be available when OpenClaw integration is
        implemented.
      </p>
    </div>
  );
}
