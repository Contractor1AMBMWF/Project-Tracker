import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/read";
import Board from "@/components/Board";
import ProjectTitle from "@/components/ProjectTitle";
import ProjectDescription from "@/components/ProjectDescription";
import ProjectLeads from "@/components/ProjectLeads";
import ProjectLinkField from "@/components/ProjectLinkField";
import ProjectCategorySelect from "@/components/ProjectCategorySelect";
import DeleteProjectButton from "@/components/DeleteProjectButton";
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

  const taskList = tasks ?? [];
  const total = taskList.length;
  const done = taskList.filter((t) => t.status === "done").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="px-8 py-8">
      <div className="flex items-start justify-between gap-4">
        <ProjectTitle projectId={project.id} name={project.name} />
        <div className="flex shrink-0 items-center gap-3">
          <div className="w-32">
            <div className="h-1.5 rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-brand"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">
              {done}/{total} tasks · {pct}%
            </p>
          </div>
          <DeleteProjectButton projectId={project.id} />
        </div>
      </div>

      <ProjectDescription projectId={project.id} description={project.description} />

      <div className="mt-4 flex flex-wrap gap-6 rounded-lg border border-slate-200 bg-white p-4">
        <ProjectLeads
          projectId={project.id}
          leadName={project.lead_name}
          subleadName={project.sublead_name}
        />
        <ProjectCategorySelect projectId={project.id} category={project.category} />
        <ProjectLinkField
          projectId={project.id}
          field="repo_url"
          label="Repo"
          value={project.repo_url}
        />
        <ProjectLinkField
          projectId={project.id}
          field="website_url"
          label="Website"
          value={project.website_url}
        />
      </div>

      <div className="mt-6">
        <Board projectId={project.id} groups={groups ?? []} tasks={taskList} />
      </div>
    </div>
  );
}
