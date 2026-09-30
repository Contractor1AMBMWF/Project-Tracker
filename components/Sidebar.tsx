import { createReadClient } from "@/lib/supabase/read";
import { getActorName } from "@/lib/auth";
import SidebarNav from "@/components/SidebarNav";
import Logo from "@/components/Logo";
import ResizableSidebar from "@/components/ResizableSidebar";
import type { Project } from "@/lib/types";

export default async function Sidebar() {
  const supabase = createReadClient();
  const [{ data: projects }, actorName] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .order("position", { ascending: true }) as unknown as Promise<{ data: Project[] | null }>,
    getActorName(),
  ]);

  return (
    <ResizableSidebar>
    <aside className="flex h-full w-full flex-col bg-gradient-to-b from-navy to-navy-800">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Logo className="h-8 w-8 shrink-0 text-white" />
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-display text-sm font-extrabold tracking-tight text-white">
            My Projects Ambassador
          </span>
          <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Ambassador Mid-West Floor
          </span>
        </span>
      </div>

      <SidebarNav projects={projects ?? []} />

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            {actorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{actorName}</p>
          </div>
        </div>
      </div>
    </aside>
    </ResizableSidebar>
  );
}
