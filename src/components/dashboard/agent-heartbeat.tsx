import { StatusDot } from "@/components/ui/status-dot";
import { agentHealthColor, formatUptime, relativeTime } from "@/lib/utils";
import type { AgentStatus } from "@/types";

export function AgentHeartbeat({ agent }: { agent: AgentStatus }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-100">OpenClaw Agent</h2>
        <div className="flex items-center gap-2">
          <StatusDot
            color={agentHealthColor(agent.health)}
            pulse={agent.health === "healthy"}
          />
          <span className="text-xs capitalize text-zinc-400">
            {agent.health}
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Uptime" value={formatUptime(agent.uptime)} />
        <Stat label="Last Heartbeat" value={relativeTime(agent.lastHeartbeat)} />
        <Stat label="Active Tasks" value={String(agent.activeTasks)} />
        <Stat label="Queue Depth" value={String(agent.queueDepth)} />
      </div>
      <p className="mt-3 text-xs text-zinc-600">
        Agent {agent.agentId} &middot; v{agent.version}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-mono text-zinc-200">{value}</p>
    </div>
  );
}
