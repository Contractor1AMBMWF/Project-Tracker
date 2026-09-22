import { createReadClient } from "@/lib/supabase/read";
import { getActorName } from "@/lib/auth";
import { signOut } from "@/app/actions";
import SidebarNav from "@/components/SidebarNav";
import Logo from "@/components/Logo";
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
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-navy to-navy-800">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/95 p-1">
          <Logo className="h-full w-full" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-display text-sm font-extrabold tracking-tight text-white">
            My Tracker Ambassador
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
            <form action={signOut}>
              <button className="text-xs text-slate-400 hover:text-white">Sign out</button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
