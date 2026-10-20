import { createReadClient } from "@/lib/supabase/read";
import Roadmap from "@/components/Roadmap";
import type { Project, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const supabase = createReadClient();
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").order("position") as unknown as Promise<{ data: Project[] | null }>,
    supabase.from("tasks").select("project_id, status") as unknown as Promise<{ data: Pick<Task, "project_id" | "status">[] | null }>,
  ]);

  // Share of each project's tasks that are done, for the fill inside its bar.
  const progress: Record<string, number> = {};
  for (const p of projects ?? []) {
    const mine = (tasks ?? []).filter((t) => t.project_id === p.id);
    progress[p.id] = mine.length ? mine.filter((t) => t.status === "done").length / mine.length : 0;
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return <Roadmap projects={projects ?? []} progress={progress} today={today} />;
}
