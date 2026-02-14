"use client";

import { useState } from "react";
import type { TaskPriority } from "@/types";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors hover:border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500";

export function CreateTaskForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Create task:", { name, description, priority });
    setName("");
    setDescription("");
    setPriority("normal");
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-100">Create Task</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          className={inputClass}
          placeholder="Task name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          className={inputClass}
          placeholder="Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <select
            className={inputClass + " w-auto"}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}
