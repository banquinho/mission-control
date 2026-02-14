// ── Task Types ──────────────────────────────────────────────

export type TaskStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type TaskPriority = "low" | "normal" | "high" | "critical";

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  retryCount: number;
  maxRetries: number;
  result?: TaskResult;
  metadata?: Record<string, unknown>;
}

export interface TaskResult {
  success: boolean;
  output?: string;
  error?: string;
  durationMs?: number;
}

export interface CreateTaskPayload {
  name: string;
  description: string;
  priority: TaskPriority;
  metadata?: Record<string, unknown>;
}

// ── Cron Job Types ──────────────────────────────────────────

export type CronJobStatus = "active" | "paused" | "error";

export interface CronJob {
  id: string;
  name: string;
  schedule: string; // cron expression
  status: CronJobStatus;
  lastRunAt?: string;
  nextRunAt?: string;
  lastResult?: TaskResult;
  createdAt: string;
}

// ── Agent / Heartbeat Types ─────────────────────────────────

export type AgentHealth = "healthy" | "degraded" | "offline";

export interface AgentStatus {
  agentId: string;
  health: AgentHealth;
  lastHeartbeat: string;
  uptime: number; // seconds
  version: string;
  activeTasks: number;
  queueDepth: number;
}

// ── Log Types ───────────────────────────────────────────────

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

// ── Data Source Types (placeholder) ─────────────────────────

export type DataSourceType = "api" | "database" | "file" | "webhook";

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: "connected" | "disconnected" | "error";
  config: Record<string, unknown>;
  createdAt: string;
}
