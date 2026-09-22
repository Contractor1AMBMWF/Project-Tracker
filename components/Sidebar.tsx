import Link from "next/link";
import { createReadClient } from "@/lib/supabase/read";
import { getActorName } from "@/lib/auth";
import { signOut } from "@/app/actions";
import NewProjectButton from "@/components/NewProjectButton";
import type { Project } from "@/lib/types";

export default async function Sidebar() {
  const supabase = createReadClient();
  const [{ data: projects }, actorName] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name")
      .order("position", { ascending: true }) as unknown as Promise<{ data: Pick<Project, "id" | "name">[] | null }>,
    getActorName(),
  ]);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-navy text-white">
      <div className="px-5 py-5">
        <Link href="/" className="text-lg font-semibold">
          Ambassador Tracker
        </Link>
      </div>

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
        <NewProjectButton />
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-3">
        {(projects ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="block truncate rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {p.name}
          </Link>
        ))}
        {(!projects || projects.length === 0) && (
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
