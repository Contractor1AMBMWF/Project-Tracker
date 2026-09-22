import Link from "next/link";
import { createReadClient } from "@/lib/supabase/read";
import { getActorName } from "@/lib/auth";
import { signOut } from "@/app/actions";
import NewProjectButton from "@/components/NewProjectButton";
import Logo from "@/components/Logo";
import type { Project } from "@/lib/types";

export default async function Sidebar() {
  const supabase = createReadClient();
  const [{ data: projects }, actorName] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, category")
      .order("position", { ascending: true }) as unknown as Promise<{
      data: Pick<Project, "id" | "name" | "category">[] | null;
    }>,
    getActorName(),
  ]);

  const list = projects ?? [];
  const categories = Array.from(
    new Set(list.map((p) => p.category).filter((c): c is string => !!c))
  ).sort();

  const groups: { label: string; projects: typeof list }[] = [
    ...categories.map((c) => ({ label: c, projects: list.filter((p) => p.category === c) })),
    { label: "General", projects: list.filter((p) => !p.category) },
  ].filter((g) => g.projects.length > 0);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-navy text-white">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
        <Logo className="h-7 w-7 shrink-0" color="#E8520A" />
        <span className="leading-tight">
          <span className="block text-base font-semibold text-white">My Tracker</span>
          <span className="block text-xs text-white/50">Ambassador</span>
        </span>
      </Link>

      <nav className="px-3">
        <Link
          href="/"
          className="block rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Dashboard
        </Link>
      </nav>

      <div className="mt-6 flex items-center justify-between px-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
          Projects
        </span>
        <NewProjectButton categories={categories} />
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-3 pb-3">
        {groups.map((group) => (
          <div key={group.label} className="mt-3 first:mt-0">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">
              {group.label}
            </p>
            {group.projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="block truncate rounded-md px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {p.name}
              </Link>
            ))}
          </div>
        ))}
        {list.length === 0 && (
          <p className="px-3 py-2 text-sm text-white/40">No projects yet.</p>
        )}
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-sm text-white/80">{actorName}</p>
        <form action={signOut}>
          <button className="mt-1 text-xs text-white/50 hover:text-white/80">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
