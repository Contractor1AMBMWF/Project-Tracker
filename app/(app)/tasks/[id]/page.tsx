import Link from "next/link";
import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/read";
import StatusPill from "@/components/StatusPill";
import PriorityPill from "@/components/PriorityPill";
import AddUpdateForm from "@/components/AddUpdateForm";
import type { Project, Task, TaskUpdate } from "@/lib/types";
import { applyTaskPatch } from "@/app/actions";

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

  async function renameTask(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "");
    if (title.trim() && task) await applyTaskPatch(task.id, { title: title.trim() });
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      {project && (
        <Link href={`/projects/${project.id}`} className="text-sm text-slate-500 hover:text-brand">
          &larr; {project.name}
        </Link>
      )}

      <form action={renameTask} className="mt-3">
        <input
          name="title"
          defaultValue={task!.title}
          onBlur={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-full bg-transparent text-2xl font-semibold text-navy outline-none"
        />
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusPill taskId={task!.id} status={task!.status} />
        <PriorityPill taskId={task!.id} priority={task!.priority} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <Field label="Assignee">
          <input
            defaultValue={task!.assignee ?? ""}
            onBlur={(e) => applyTaskPatch(task!.id, { assignee: e.target.value || null })}
            placeholder="Unassigned"
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand"
          />
        </Field>
        <Field label="Due date">
          <input
            type="date"
            defaultValue={task!.due_date ?? ""}
            onChange={(e) => applyTaskPatch(task!.id, { due_date: e.target.value || null })}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand"
          />
        </Field>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-navy">Updates</h2>
        <AddUpdateForm taskId={task!.id} projectId={task!.project_id} />

        <div className="mt-4 space-y-4">
          {(updates ?? []).map((u) => (
            <div key={u.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-navy">{u.author ?? "Someone"}</span>
                <span className="text-xs text-slate-400">
                  {new Date(u.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">{u.body}</p>
            </div>
          ))}
          {(!updates || updates.length === 0) && (
            <p className="text-sm text-slate-400">No updates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
