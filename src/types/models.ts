export interface ModelUsageRecord {
  id: string;
  model: string;
  provider: string;
  agentId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  ts: string;
  taskId?: string;
}

export interface ModelSummary {
  model: string;
  calls: number;
  avgLatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
}

export interface ProviderSummary {
  provider: string;
  totalCalls: number;
  totalTokens: number;
  totalCostUsd: number;
  models: ModelSummary[];
}

export interface EndpointUsage {
  path: string;
  method: string;
  calls: number;
  avgResponseMs: number;
  errorRate: number;
  lastCalledAt: string;
}
