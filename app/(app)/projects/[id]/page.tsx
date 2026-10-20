import Link from "next/link";
import { notFound } from "next/navigation";
import { Columns3, Globe, GitBranch } from "lucide-react";
import { createReadClient } from "@/lib/supabase/read";
import Board from "@/components/Board";
import ProjectTitle from "@/components/ProjectTitle";
import ProjectDescription from "@/components/ProjectDescription";
import ProjectLinkField from "@/components/ProjectLinkField";
import AddGroupButton from "@/components/AddGroupButton";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import { PageHeader } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { SegBar } from "@/components/ui/SegBar";
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
  const done = allTasks.filter((t) => t.status === "done").length;
  const stuck = allTasks.filter((t) => t.status === "stuck").length;
  const pct = allTasks.length === 0 ? 0 : Math.round((done / allTasks.length) * 100);

  return (
    <>
      <PageHeader
        eyebrow={`Project · ${groups?.length ?? 0} group${groups?.length === 1 ? "" : "s"}`}
        title={<ProjectTitle projectId={project.id} name={project.name} />}
        kpis={[
          { label: "Tasks", value: allTasks.length },
          { label: "Done", value: `${pct}%` },
          { label: "Stuck", value: stuck, warn: stuck > 0 },
        ]}
        actions={
          <Link href={`/board?project=${project.id}`} className={buttonClass("secondary")}>
            <Columns3 size={15} />
            Board view
          </Link>
        }
      />

      <div className="mb-5 rounded-card bg-white px-[18px] py-4">
        <ProjectDescription projectId={project.id} description={project.description} />
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <ProjectLinkField
            projectId={project.id}
            field="website_url"
            label="Website"
            icon={<Globe size={13} />}
            placeholder="https://example.com"
            value={project.website_url}
          />
          <ProjectLinkField
            projectId={project.id}
            field="repo_url"
            label="Repository"
            icon={<GitBranch size={13} />}
            placeholder="https://github.com/org/repo"
            value={project.repo_url}
          />
        </div>
        <SegBar tasks={allTasks} className="mt-4" />
      </div>

      <Board projectId={id} groups={groups ?? []} tasks={allTasks} />
      <div className="mt-4">
        <AddGroupButton projectId={id} />
      </div>

      <div className="mt-16 border-t border-ink-200 pt-6">
        <DeleteProjectButton projectId={project.id} />
      </div>
    </>
  );
}
