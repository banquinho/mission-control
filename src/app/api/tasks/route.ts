import { isLiveMode, requireConnected } from "@/lib/live-mode";
import { listTasks, createTask } from "@/lib/openclaw";
import { ok, err } from "@/lib/api-response";
import { mockTasks } from "@/lib/mock-data";
import type { CreateTaskPayload } from "@/types";

export async function GET() {
  if (!isLiveMode()) return ok(mockTasks);

  try {
    requireConnected();
    return ok(await listTasks());
  } catch (e) {
    return err(e);
  }
}

export async function POST(request: Request) {
  let body: CreateTaskPayload;
  try {
    body = await request.json();
  } catch {
    return err(new Error("Invalid JSON body"), 400);
  }

  if (!body.name || !body.priority) {
    return err(new Error("name and priority are required"), 400);
  }

  if (!isLiveMode()) {
    const mock = {
      id: `task-${Date.now()}`,
      name: body.name,
      description: body.description ?? "",
      status: "pending" as const,
      priority: body.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
      metadata: body.metadata,
    };
    return ok(mock, 201);
  }

  try {
    requireConnected();
    return ok(await createTask(body), 201);
  } catch (e) {
    return err(e);
  }
}
