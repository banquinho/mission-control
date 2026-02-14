"use client";

import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import { taskStatusColor, relativeTime, formatDuration } from "@/lib/utils";
import type { Task } from "@/types";

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Duration</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/20"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <StatusDot color={taskStatusColor(task.status)} />
                  <span className="capitalize text-zinc-300">
                    {task.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="text-zinc-200">{task.name}</p>
                <p className="text-xs text-zinc-500">{task.id}</p>
              </td>
              <td className="px-4 py-3">
                <Badge
                  className={
                    task.priority === "critical"
                      ? "bg-red-900 text-red-300"
                      : task.priority === "high"
                        ? "bg-orange-900 text-orange-300"
                        : ""
                  }
                >
                  {task.priority}
                </Badge>
              </td>
              <td className="px-4 py-3 font-mono text-zinc-400">
                {task.result?.durationMs
                  ? formatDuration(task.result.durationMs)
                  : "—"}
              </td>
              <td className="px-4 py-3 text-zinc-500">
                {relativeTime(task.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {task.status === "failed" && (
                    <button className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100">
                      Retry
                    </button>
                  )}
                  {(task.status === "pending" ||
                    task.status === "running" ||
                    task.status === "queued") && (
                    <button className="rounded-md border border-red-800 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:border-red-700 hover:bg-red-950">
                      Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
