import Link from "next/link";
import { User } from "lucide-react";
import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/read";
import TaskDetailEditor from "@/components/TaskDetailEditor";
import AddUpdateForm from "@/components/AddUpdateForm";
import { STATUS_META, PRIORITY_META } from "@/lib/types";
import type { Project, Task, TaskUpdate } from "@/lib/types";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createReadClient();

  const { data: task } = (await supabase.from("tasks").select("*").eq("id", id).single()) as {
    data: Task | null;
  };
  if (!task) notFound();

  const [{ data: project }, { data: updates }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", task.project_id).single() as unknown as Promise<{
      data: Project | null;
    }>,
    supabase
      .from("task_updates")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: false }) as unknown as Promise<{ data: TaskUpdate[] | null }>,
  ]);

  const status = STATUS_META[task.status] ?? STATUS_META.not_started;

  return (
    <div className="px-8 py-6">
      <Link href={`/projects/${task.project_id}`} className="text-sm text-brand hover:underline">
        ← {project?.name ?? "Back to project"}
      </Link>

      <div className="mt-3 rounded-xl border border-ink-200 bg-white p-5">
        <h1 className="text-xl font-bold text-navy">{task.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded px-2 py-1 font-semibold text-white" style={{ background: status.color }}>
            {status.label}
          </span>
          {task.priority && (
            <span
              className="rounded px-2 py-1 font-semibold text-white"
              style={{ background: PRIORITY_META[task.priority].color }}
            >
              {PRIORITY_META[task.priority].label} priority
            </span>
          )}
          <span className="flex items-center gap-1 rounded bg-ink-100 px-2 py-1 text-ink-600">
            <User size={13} />
            {task.assignee || "Unassigned"}
          </span>
          <span className="rounded bg-ink-100 px-2 py-1 text-ink-600">
            📅 {task.due_date || "No due date"}
          </span>
        </div>
      </div>

      <TaskDetailEditor task={task} />

      <div className="mt-6 max-w-2xl">
        <h2 className="mb-3 font-display text-label uppercase text-ink-500">Updates &amp; history</h2>
        <AddUpdateForm taskId={task.id} projectId={task.project_id} />

        <div className="mt-4 space-y-3">
          {(updates ?? []).map((u) => (
            <div key={u.id} className="rounded-lg border border-ink-200 bg-white p-3 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-navy">{u.author ?? "Someone"}</span>
                <span className="text-xs text-ink-400">{new Date(u.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-ink-700">{u.body}</p>
            </div>
          ))}
          {(!updates || updates.length === 0) && (
            <p className="text-sm text-ink-400">No updates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
