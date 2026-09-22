import { notFound } from "next/navigation";
import { createReadClient } from "@/lib/supabase/read";
import Board from "@/components/Board";
import ProjectTitle from "@/components/ProjectTitle";
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

  return (
    <div className="px-8 py-8">
      <div className="flex items-start justify-between gap-4">
        <ProjectTitle projectId={project.id} name={project.name} />
        <DeleteProjectButton projectId={project.id} />
      </div>

      <div className="mt-6">
        <Board projectId={project.id} groups={groups ?? []} tasks={tasks ?? []} />
      </div>
    </div>
  );
}
