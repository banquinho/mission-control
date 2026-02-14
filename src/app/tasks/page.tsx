import { TaskTable } from "@/components/tasks/task-table";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { mockTasks } from "@/lib/mock-data";

export default function TasksPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Task Queue
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Create, monitor, and manage tasks.
      </p>

      <div className="mt-8">
        <CreateTaskForm />
      </div>

      <hr className="my-8 border-zinc-800" />

      <TaskTable tasks={mockTasks} />
    </div>
  );
}
