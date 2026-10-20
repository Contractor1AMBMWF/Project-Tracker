import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/read";
import TaskDetailEditor from "@/components/TaskDetailEditor";
import AddUpdateForm from "@/components/AddUpdateForm";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Avatar, PriorityLabel, StatusLabel } from "@/components/ui/Marks";
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

  return (
    <div className="max-w-3xl">
      <Link
        href={`/projects/${task.project_id}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-dark hover:underline"
      >
        <ArrowLeft size={14} />
        {project?.name ?? "Back to project"}
      </Link>

      <h1 className="mt-2 text-display text-ink-900">{task.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <StatusLabel status={task.status} />
        <PriorityLabel priority={task.priority} />
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600">
          <Avatar name={task.assignee} size={22} />
          {task.assignee || "No owner"}
        </span>
      </div>

      <TaskDetailEditor task={task} />

      <Card className="mt-4">
        <SectionHeader title="Updates" count={updates?.length ?? 0} />
        <AddUpdateForm taskId={task.id} projectId={task.project_id} />

        <ul className="m-0 mt-3 list-none p-0">
          {(updates ?? []).map((u) => (
            <li key={u.id} className="flex gap-3 border-t border-ink-200 py-3 text-sm">
              <Avatar name={u.author ?? "Someone"} size={28} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-bold">{u.author ?? "Someone"}</span>
                  <time className="text-xs text-ink-400">
                    {new Date(u.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </time>
                </div>
                <p className="m-0 mt-0.5 whitespace-pre-wrap text-ink-700">{u.body}</p>
              </div>
            </li>
          ))}
          {(!updates || updates.length === 0) && <p className="mt-2 text-[13px] text-ink-400">No updates yet.</p>}
        </ul>
      </Card>
    </div>
  );
}
