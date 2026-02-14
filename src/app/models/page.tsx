import { ProviderCards } from "@/components/models/provider-cards";
import { ModelBreakdownTable } from "@/components/models/model-breakdown-table";
import { UsageLog } from "@/components/models/usage-log";
import { EndpointStats } from "@/components/models/endpoint-stats";
import {
  mockModelUsage,
  mockProviderSummaries,
  mockEndpointUsage,
} from "@/lib/mock-data";

export default function ModelsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-100">Model Usage</h1>
      <ProviderCards providers={mockProviderSummaries} />
      <ModelBreakdownTable providers={mockProviderSummaries} />
      <div className="grid gap-6 lg:grid-cols-2">
        <UsageLog records={mockModelUsage} />
        <EndpointStats endpoints={mockEndpointUsage} />
      </div>
    </div>
  );
}
