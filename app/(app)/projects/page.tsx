import { createReadClient } from "@/lib/supabase/read";
import NewProjectButton from "@/components/NewProjectButton";
import ProjectCard from "@/components/ProjectCard";
import { PageHeader } from "@/components/ui/Card";
import type { Project, Task } from "@/lib/types";

export default async function ProjectsPage() {
  const supabase = createReadClient();
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").order("position") as unknown as Promise<{ data: Project[] | null }>,
    supabase.from("tasks").select("*") as unknown as Promise<{ data: Task[] | null }>,
  ]);
  const all = tasks ?? [];

  return (
    <>
      <PageHeader
        eyebrow={`${projects?.length ?? 0} projects`}
        title="Projects"
        kpis={[
          { label: "Tasks", value: all.length },
          { label: "Done", value: all.filter((t) => t.status === "done").length },
        ]}
      />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))]">
        {(projects ?? []).map((p) => (
          <ProjectCard key={p.id} project={p} tasks={all.filter((t) => t.project_id === p.id)} />
        ))}
        <NewProjectButton tile />
      </div>
    </>
  );
}
