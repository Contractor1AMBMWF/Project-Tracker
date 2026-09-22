"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, type LucideIcon } from "lucide-react";
import type { Project } from "@/lib/types";

export default function SidebarNav({ projects }: { projects: Project[] }) {
  const pathname = usePathname();

  const navItem = (href: string, label: string, Icon: LucideIcon) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-display text-[15px] transition-all duration-150 ${
          active
            ? "bg-white/10 font-bold text-white shadow-card"
            : "font-semibold text-slate-400 hover:translate-x-0.5 hover:bg-white/5 hover:text-white"
        }`}
      >
        {active && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-brand" />}
        <Icon
          size={18}
          className={`shrink-0 transition-colors ${
            active ? "text-brand" : "text-slate-500 group-hover:text-brand"
          }`}
        />
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav className="space-y-0.5 px-3">{navItem("/", "Dashboard", LayoutDashboard)}</nav>

      <div className="mt-5 flex-1 overflow-y-auto px-3">
        <div className="mb-1.5 px-2 font-display text-label uppercase tracking-wider text-slate-500">
          Projects
        </div>
        <nav className="space-y-0.5">
          {projects.map((p) => {
            const active = pathname === `/projects/${p.id}`;
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className={`group relative flex items-center rounded-lg px-2.5 py-2 text-sm transition-all duration-150 ${
                  active
                    ? "bg-white/10 font-bold text-white"
                    : "font-medium text-slate-400 hover:translate-x-0.5 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" />}
                <span className="truncate">{p.name}</span>
              </Link>
            );
          })}
          {projects.length === 0 && (
            <p className="px-2.5 py-2 text-sm text-slate-500">No projects yet.</p>
          )}
        </nav>
      </div>
    </>
  );
}
