import { StatusDot } from "@/components/ui/status-dot";
import { cronStatusColor, relativeTime } from "@/lib/utils";
import type { CronJob } from "@/types";

export function CronJobsPanel({ jobs }: { jobs: CronJob[] }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-100">Cron Jobs</h2>
        <span className="text-xs text-zinc-500">{jobs.length} jobs</span>
      </div>
      <div className="mt-4 space-y-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <StatusDot color={cronStatusColor(job.status)} />
              <div>
                <p className="text-sm text-zinc-200">{job.name}</p>
                <p className="font-mono text-xs text-zinc-500">
                  {job.schedule}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-zinc-500">
              {job.lastRunAt ? (
                <p>Last: {relativeTime(job.lastRunAt)}</p>
              ) : (
                <p>Never run</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
