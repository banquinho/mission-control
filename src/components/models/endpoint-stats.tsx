import { relativeTime } from "@/lib/utils";
import type { EndpointUsage } from "@/types/models";

export function EndpointStats({ endpoints }: { endpoints: EndpointUsage[] }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-100">API Endpoint Usage</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
              <th className="pb-2 font-medium">Endpoint</th>
              <th className="pb-2 font-medium text-right">Calls</th>
              <th className="pb-2 font-medium text-right">Avg Response</th>
              <th className="pb-2 font-medium text-right">Error Rate</th>
              <th className="pb-2 font-medium text-right">Last Called</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {endpoints.map((ep) => (
              <tr
                key={`${ep.method}-${ep.path}`}
                className="border-b border-zinc-800/50"
              >
                <td className="py-2">
                  <span className="mr-2 font-mono text-xs text-zinc-500">
                    {ep.method}
                  </span>
                  <span className="font-mono text-zinc-100">{ep.path}</span>
                </td>
                <td className="py-2 text-right">{ep.calls}</td>
                <td className="py-2 text-right">{ep.avgResponseMs}ms</td>
                <td className="py-2 text-right">
                  <span
                    className={
                      ep.errorRate > 5 ? "text-red-400" : "text-zinc-400"
                    }
                  >
                    {ep.errorRate.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2 text-right text-xs text-zinc-500">
                  {relativeTime(ep.lastCalledAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
