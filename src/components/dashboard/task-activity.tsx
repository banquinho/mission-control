import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import { taskStatusColor, relativeTime } from "@/lib/utils";
import type { Task } from "@/types";

export function TaskActivity({ tasks }: { tasks: Task[] }) {
  const running = tasks.filter((t) => t.status === "running").length;
  const failed = tasks.filter((t) => t.status === "failed").length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-100">Task Activity</h2>
        <div className="flex gap-2">
          <span className="text-xs text-zinc-500">{running} running</span>
          {failed > 0 && (
            <span className="text-xs text-red-400">{failed} failed</span>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {tasks.slice(0, 5).map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <StatusDot color={taskStatusColor(task.status)} />
              <div>
                <p className="text-sm text-zinc-200">{task.name}</p>
                <p className="text-xs capitalize text-zinc-500">
                  {task.status}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              {relativeTime(task.updatedAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
