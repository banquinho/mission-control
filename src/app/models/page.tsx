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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Model Usage
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        LLM provider metrics and API endpoint stats.
      </p>

      <div className="mt-8">
        <ProviderCards providers={mockProviderSummaries} />
      </div>

      <hr className="my-8 border-zinc-800" />

      <ModelBreakdownTable providers={mockProviderSummaries} />

      <hr className="my-8 border-zinc-800" />

      <div className="grid gap-8 lg:grid-cols-2">
        <UsageLog records={mockModelUsage} />
        <EndpointStats endpoints={mockEndpointUsage} />
      </div>
    </div>
  );
}
