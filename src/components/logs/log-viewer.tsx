"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { logLevelColor, formatDate, cn } from "@/lib/utils";
import type { LogEntry, LogLevel } from "@/types";

const levels: LogLevel[] = ["debug", "info", "warn", "error"];

export function LogViewer({ logs }: { logs: LogEntry[] }) {
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-100">Logs</h2>
        <div className="flex gap-1">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </FilterButton>
          {levels.map((l) => (
            <FilterButton
              key={l}
              active={filter === l}
              onClick={() => setFilter(l)}
            >
              {l}
            </FilterButton>
          ))}
        </div>
      </div>
      <div className="mt-4 max-h-[600px] space-y-1 overflow-y-auto font-mono text-xs">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className="flex gap-3 rounded px-2 py-1.5 hover:bg-zinc-800/30"
          >
            <span className="shrink-0 text-zinc-600">
              {formatDate(entry.timestamp)}
            </span>
            <span
              className={cn(
                "w-12 shrink-0 text-right uppercase",
                logLevelColor(entry.level)
              )}
            >
              {entry.level}
            </span>
            <Badge variant="outline" className="shrink-0">
              {entry.source}
            </Badge>
            <span className="text-zinc-300">{entry.message}</span>
            {entry.taskId && (
              <span className="shrink-0 text-zinc-600">{entry.taskId}</span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-zinc-600">No logs found</p>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2 py-0.5 text-xs capitalize transition-colors",
        active
          ? "bg-zinc-700 text-zinc-200"
          : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      {children}
    </button>
  );
}
