import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/read";
import Board from "@/components/Board";
import ProjectTitle from "@/components/ProjectTitle";
import ProjectDescription from "@/components/ProjectDescription";
import ProjectLinkField from "@/components/ProjectLinkField";
import AddGroupButton from "@/components/AddGroupButton";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import StatusBar from "@/components/StatusBar";
import { STATUS_ORDER, type TaskStatus } from "@/lib/types";
import type { Group, Project, Task } from "@/lib/types";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createReadClient();

  const [{ data: project }, { data: groups }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single() as unknown as Promise<{ data: Project | null }>,
    supabase.from("groups").select("*").eq("project_id", id).order("position") as unknown as Promise<{ data: Group[] | null }>,
    supabase.from("tasks").select("*").eq("project_id", id).order("position") as unknown as Promise<{ data: Task[] | null }>,
  ]);

  if (!project) notFound();

  const allTasks = tasks ?? [];
  const total = allTasks.length;
  const countBy = (s: TaskStatus) => allTasks.filter((t) => t.status === s).length;

  return (
    <div className="px-8 py-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <ProjectTitle projectId={project.id} name={project.name} />
          <ProjectDescription projectId={project.id} description={project.description} />
          <ProjectLinkField
            projectId={project.id}
            field="website_url"
            label="Website"
            icon="🌐"
            placeholder="https://example.com"
            value={project.website_url}
          />
          <ProjectLinkField
            projectId={project.id}
            field="repo_url"
            label="Repository"
            icon="🔗"
            placeholder="https://github.com/org/repo"
            value={project.repo_url}
          />
        </div>
        <div className="w-64 shrink-0 text-right">
          <StatusBar counts={STATUS_ORDER.map((s) => ({ status: s, count: countBy(s) }))} total={total} />
          <p className="mt-2 text-sm text-ink-500">
            {total} task{total === 1 ? "" : "s"} across {groups?.length ?? 0} group
            {groups?.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Board projectId={id} groups={groups ?? []} tasks={allTasks} />
        <div className="mt-4">
          <AddGroupButton projectId={id} />
        </div>
      </div>

      <div className="mt-16 border-t border-ink-200 pt-6">
        <DeleteProjectButton projectId={project.id} />
      </div>
    </div>
  );
}
