import AppShell from "@/components/AppShell";
import { createReadClient } from "@/lib/supabase/read";
import { getActorName } from "@/lib/auth";
import type { Project } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createReadClient();
  const [{ data: projects }, actorName] = await Promise.all([
    supabase.from("projects").select("*").order("position") as unknown as Promise<{ data: Project[] | null }>,
    getActorName(),
  ]);

  return (
    <AppShell projects={projects ?? []} actorName={actorName}>
      {children}
    </AppShell>
  );
}
