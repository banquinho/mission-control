import { DataSourcesPanel } from "@/components/datasources/datasources-panel";
import { mockDataSources } from "@/lib/mock-data";

export default function DataSourcesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Data Sources
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Connected data sources and their status.
      </p>

      <div className="mt-8">
        <DataSourcesPanel sources={mockDataSources} />
      </div>
    </div>
  );
}
