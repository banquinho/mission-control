import type { TaskStatus, AgentHealth, LogLevel, CronJobStatus } from "@/types";

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function relativeTime(iso: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const statusColors: Record<TaskStatus, string> = {
  pending: "bg-gray-500",
  queued: "bg-blue-400",
  running: "bg-yellow-400",
  completed: "bg-green-500",
  failed: "bg-red-500",
  cancelled: "bg-gray-400",
};

export function taskStatusColor(status: TaskStatus): string {
  return statusColors[status];
}

const healthColors: Record<AgentHealth, string> = {
  healthy: "bg-green-500",
  degraded: "bg-yellow-400",
  offline: "bg-red-500",
};

export function agentHealthColor(health: AgentHealth): string {
  return healthColors[health];
}

const logLevelColors: Record<LogLevel, string> = {
  debug: "text-gray-400",
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
};

export function logLevelColor(level: LogLevel): string {
  return logLevelColors[level];
}

const cronStatusColors: Record<CronJobStatus, string> = {
  active: "bg-green-500",
  paused: "bg-yellow-400",
  error: "bg-red-500",
};

export function cronStatusColor(status: CronJobStatus): string {
  return cronStatusColors[status];
}
