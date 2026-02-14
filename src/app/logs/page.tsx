import { LogViewer } from "@/components/logs/log-viewer";
import { mockLogs } from "@/lib/mock-data";

export default function LogsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Logs & Results
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        View system and agent log output.
      </p>

      <div className="mt-8">
        <LogViewer logs={mockLogs} />
      </div>
    </div>
  );
}
