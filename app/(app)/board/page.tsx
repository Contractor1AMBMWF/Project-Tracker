import { createReadClient } from "@/lib/supabase/read";
import KanbanBoard, { DONE_WINDOW_DAYS } from "@/components/KanbanBoard";
import { daysAgoMs } from "@/lib/dates";
import type { Project, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  const supabase = createReadClient();
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").order("position") as unknown as Promise<{ data: Project[] | null }>,
    supabase.from("tasks").select("*").order("position") as unknown as Promise<{ data: Task[] | null }>,
  ]);

  return (
    <KanbanBoard
      projects={projects ?? []}
      tasks={tasks ?? []}
      initialProject={project ?? ""}
      doneCutoff={daysAgoMs(DONE_WINDOW_DAYS)}
    />
  );
}
