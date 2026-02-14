import type {
  Task,
  CronJob,
  AgentStatus,
  LogEntry,
  DataSource,
} from "@/types";
import type { MailboxMessage } from "@/types/mailbox";
import type {
  ModelUsageRecord,
  ProviderSummary,
  EndpointUsage,
} from "@/types/models";

export const mockAgent: AgentStatus = {
  agentId: "openclaw-primary",
  health: "healthy",
  lastHeartbeat: new Date().toISOString(),
  uptime: 86400,
  version: "0.1.0",
  activeTasks: 3,
  queueDepth: 7,
};

export const mockTasks: Task[] = [
  {
    id: "task-001",
    name: "Scrape pricing data",
    description: "Pull latest pricing from upstream API",
    status: "completed",
    priority: "high",
    createdAt: "2026-02-12T08:00:00Z",
    updatedAt: "2026-02-12T08:05:00Z",
    startedAt: "2026-02-12T08:00:10Z",
    completedAt: "2026-02-12T08:05:00Z",
    retryCount: 0,
    maxRetries: 3,
    result: { success: true, output: "200 records synced", durationMs: 29400 },
  },
  {
    id: "task-002",
    name: "Generate weekly report",
    description: "Compile metrics into weekly PDF",
    status: "running",
    priority: "normal",
    createdAt: "2026-02-12T09:00:00Z",
    updatedAt: "2026-02-12T09:01:00Z",
    startedAt: "2026-02-12T09:00:05Z",
    retryCount: 0,
    maxRetries: 3,
  },
  {
    id: "task-003",
    name: "Cleanup temp files",
    description: "Remove stale temp artifacts older than 7 days",
    status: "pending",
    priority: "low",
    createdAt: "2026-02-12T10:00:00Z",
    updatedAt: "2026-02-12T10:00:00Z",
    retryCount: 0,
    maxRetries: 1,
  },
  {
    id: "task-004",
    name: "Sync user permissions",
    description: "Reconcile permissions with identity provider",
    status: "failed",
    priority: "critical",
    createdAt: "2026-02-12T07:00:00Z",
    updatedAt: "2026-02-12T07:02:00Z",
    startedAt: "2026-02-12T07:00:05Z",
    completedAt: "2026-02-12T07:02:00Z",
    retryCount: 3,
    maxRetries: 3,
    result: { success: false, error: "Timeout after 120s", durationMs: 120000 },
  },
];

export const mockCronJobs: CronJob[] = [
  {
    id: "cron-001",
    name: "Heartbeat check",
    schedule: "*/5 * * * *",
    status: "active",
    lastRunAt: "2026-02-12T11:55:00Z",
    nextRunAt: "2026-02-12T12:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cron-002",
    name: "Daily digest",
    schedule: "0 9 * * *",
    status: "active",
    lastRunAt: "2026-02-12T09:00:00Z",
    nextRunAt: "2026-02-13T09:00:00Z",
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "cron-003",
    name: "Weekly backup",
    schedule: "0 2 * * 0",
    status: "paused",
    lastRunAt: "2026-02-09T02:00:00Z",
    nextRunAt: undefined,
    createdAt: "2026-01-10T00:00:00Z",
  },
];

export const mockLogs: LogEntry[] = [
  {
    id: "log-001",
    timestamp: "2026-02-12T11:55:01Z",
    level: "info",
    source: "scheduler",
    message: "Heartbeat check completed successfully",
  },
  {
    id: "log-002",
    timestamp: "2026-02-12T11:50:00Z",
    level: "warn",
    source: "task-runner",
    message: "Task task-002 approaching timeout threshold",
    taskId: "task-002",
  },
  {
    id: "log-003",
    timestamp: "2026-02-12T11:45:00Z",
    level: "error",
    source: "task-runner",
    message: "Task task-004 failed after 3 retries",
    taskId: "task-004",
  },
  {
    id: "log-004",
    timestamp: "2026-02-12T11:40:00Z",
    level: "info",
    source: "queue",
    message: "New task queued: Cleanup temp files",
    taskId: "task-003",
  },
  {
    id: "log-005",
    timestamp: "2026-02-12T11:35:00Z",
    level: "debug",
    source: "agent",
    message: "Agent heartbeat received, uptime: 86400s",
  },
];

export const mockMailboxMessages: MailboxMessage[] = [
  {
    id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    from: "openclaw-primary",
    to: "mission-control",
    ts: "2026-02-12T11:50:00Z",
    type: "MESSAGE",
    subject: "Scraping job completed",
    body: "Successfully scraped 200 pricing records from upstream API. All records validated and stored.",
    meta: { priority: "normal" },
  },
  {
    id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    from: "data-processor",
    to: "mission-control",
    ts: "2026-02-12T11:45:00Z",
    type: "REQUEST",
    subject: "Permission to purge stale cache",
    body: "Cache size has exceeded 2GB threshold. Requesting approval to purge entries older than 7 days.",
    meta: { priority: "high" },
  },
  {
    id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    from: "mission-control",
    to: "data-processor",
    ts: "2026-02-12T11:30:00Z",
    type: "RESPONSE",
    subject: "Re: Weekly report status",
    body: "Report generation is on track. ETA 15 minutes.",
    replyTo: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
    meta: { priority: "low" },
  },
];

export const mockModelUsage: ModelUsageRecord[] = [
  { id: "mu-001", model: "gpt-4-turbo", provider: "OpenAI", agentId: "openclaw-primary", promptTokens: 1200, completionTokens: 450, totalTokens: 1650, costUsd: 0.0285, latencyMs: 3200, ts: "2026-02-12T11:55:00Z", taskId: "task-001" },
  { id: "mu-002", model: "claude-3-opus", provider: "Anthropic", agentId: "openclaw-primary", promptTokens: 800, completionTokens: 320, totalTokens: 1120, costUsd: 0.0336, latencyMs: 2800, ts: "2026-02-12T11:50:00Z", taskId: "task-002" },
  { id: "mu-003", model: "gpt-4-turbo", provider: "OpenAI", agentId: "data-processor", promptTokens: 2000, completionTokens: 600, totalTokens: 2600, costUsd: 0.044, latencyMs: 4100, ts: "2026-02-12T11:45:00Z" },
  { id: "mu-004", model: "claude-3-sonnet", provider: "Anthropic", agentId: "openclaw-primary", promptTokens: 500, completionTokens: 200, totalTokens: 700, costUsd: 0.0063, latencyMs: 1500, ts: "2026-02-12T11:40:00Z" },
  { id: "mu-005", model: "gemini-1.5-pro", provider: "Google", agentId: "data-processor", promptTokens: 1500, completionTokens: 400, totalTokens: 1900, costUsd: 0.0171, latencyMs: 2200, ts: "2026-02-12T11:35:00Z" },
  { id: "mu-006", model: "gpt-3.5-turbo", provider: "OpenAI", agentId: "openclaw-primary", promptTokens: 600, completionTokens: 150, totalTokens: 750, costUsd: 0.0011, latencyMs: 800, ts: "2026-02-12T11:30:00Z" },
  { id: "mu-007", model: "claude-3-opus", provider: "Anthropic", agentId: "data-processor", promptTokens: 3000, completionTokens: 1200, totalTokens: 4200, costUsd: 0.126, latencyMs: 5500, ts: "2026-02-12T11:25:00Z", taskId: "task-001" },
  { id: "mu-008", model: "gemini-1.5-pro", provider: "Google", agentId: "openclaw-primary", promptTokens: 900, completionTokens: 350, totalTokens: 1250, costUsd: 0.0113, latencyMs: 1900, ts: "2026-02-12T11:20:00Z" },
  { id: "mu-009", model: "gpt-4-turbo", provider: "OpenAI", agentId: "openclaw-primary", promptTokens: 1800, completionTokens: 500, totalTokens: 2300, costUsd: 0.039, latencyMs: 3800, ts: "2026-02-12T11:15:00Z", taskId: "task-003" },
  { id: "mu-010", model: "claude-3-sonnet", provider: "Anthropic", agentId: "data-processor", promptTokens: 400, completionTokens: 180, totalTokens: 580, costUsd: 0.0052, latencyMs: 1200, ts: "2026-02-12T11:10:00Z" },
];

export const mockProviderSummaries: ProviderSummary[] = [
  {
    provider: "OpenAI",
    totalCalls: 142,
    totalTokens: 285000,
    totalCostUsd: 4.82,
    models: [
      { model: "gpt-4-turbo", calls: 98, avgLatencyMs: 3700, totalTokens: 245000, totalCostUsd: 4.16 },
      { model: "gpt-3.5-turbo", calls: 44, avgLatencyMs: 850, totalTokens: 40000, totalCostUsd: 0.66 },
    ],
  },
  {
    provider: "Anthropic",
    totalCalls: 89,
    totalTokens: 178000,
    totalCostUsd: 5.34,
    models: [
      { model: "claude-3-opus", calls: 35, avgLatencyMs: 4200, totalTokens: 112000, totalCostUsd: 4.48 },
      { model: "claude-3-sonnet", calls: 54, avgLatencyMs: 1400, totalTokens: 66000, totalCostUsd: 0.86 },
    ],
  },
  {
    provider: "Google",
    totalCalls: 63,
    totalTokens: 126000,
    totalCostUsd: 1.13,
    models: [
      { model: "gemini-1.5-pro", calls: 63, avgLatencyMs: 2050, totalTokens: 126000, totalCostUsd: 1.13 },
    ],
  },
];

export const mockEndpointUsage: EndpointUsage[] = [
  { path: "/api/agent", method: "GET", calls: 1240, avgResponseMs: 45, errorRate: 0.2, lastCalledAt: "2026-02-12T11:55:00Z" },
  { path: "/api/tasks", method: "GET", calls: 890, avgResponseMs: 62, errorRate: 0.5, lastCalledAt: "2026-02-12T11:54:00Z" },
  { path: "/api/tasks", method: "POST", calls: 156, avgResponseMs: 120, errorRate: 2.1, lastCalledAt: "2026-02-12T11:50:00Z" },
  { path: "/api/cron", method: "GET", calls: 430, avgResponseMs: 38, errorRate: 0.0, lastCalledAt: "2026-02-12T11:53:00Z" },
  { path: "/api/mailbox", method: "GET", calls: 320, avgResponseMs: 55, errorRate: 0.3, lastCalledAt: "2026-02-12T11:52:00Z" },
  { path: "/api/models", method: "GET", calls: 78, avgResponseMs: 85, errorRate: 1.3, lastCalledAt: "2026-02-12T11:55:00Z" },
];

export const mockDataSources: DataSource[] = [
  {
    id: "ds-001",
    name: "Pricing API",
    type: "api",
    status: "connected",
    config: {},
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ds-002",
    name: "Analytics DB",
    type: "database",
    status: "connected",
    config: {},
    createdAt: "2026-01-05T00:00:00Z",
  },
  {
    id: "ds-003",
    name: "Webhook Ingest",
    type: "webhook",
    status: "disconnected",
    config: {},
    createdAt: "2026-02-01T00:00:00Z",
  },
];
