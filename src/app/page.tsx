import { AgentHeartbeat } from "@/components/dashboard/agent-heartbeat";
import { OpenClawConnection } from "@/components/dashboard/openclaw-connection";
import { CronJobsPanel } from "@/components/dashboard/cron-jobs-panel";
import { TaskActivity } from "@/components/dashboard/task-activity";
import { mockAgent, mockCronJobs, mockTasks } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        System overview and agent status.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <AgentHeartbeat agent={mockAgent} />
        <OpenClawConnection />
      </div>

      <hr className="my-8 border-zinc-800" />

      <div className="grid gap-8 lg:grid-cols-2">
        <CronJobsPanel jobs={mockCronJobs} />
        <TaskActivity tasks={mockTasks} />
      </div>
    </div>
  );
}
