"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Flag,
  Home,
  type LucideIcon,
} from "lucide-react";
import Logo from "@/components/Logo";
import NewProjectButton from "@/components/NewProjectButton";
import { Avatar } from "@/components/ui/Marks";
import { useStoredFlag } from "@/lib/useStoredState";
import type { Project } from "@/lib/types";

const VIEWS: [string, string, LucideIcon][] = [
  ["/", "Dashboard", Home],
  ["/board", "Board", Columns3],
  ["/projects", "Projects", Flag],
  ["/touch-base", "Touch Base", CalendarCheck],
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/projects") return pathname.startsWith("/projects") || pathname.startsWith("/tasks");
  return pathname.startsWith(href);
}

export default function AppShell({
  projects,
  actorName,
  children,
}: {
  projects: Project[];
  actorName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useStoredFlag("ambtracker:dock");

  return (
    <div
      className={`min-h-screen px-3.5 pb-28 pt-2.5 transition-[padding] duration-200 md:pb-16 md:pr-5 md:pt-4 ${
        open ? "md:pl-[244px]" : "md:pl-[92px]"
      }`}
    >
      <header className="mx-auto mb-3.5 flex max-w-[1320px] items-center gap-4 md:mb-[22px]">
        <Link href="/" className="mr-2 flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand">
            <Logo className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <b className="block text-[15px] font-extrabold">My Projects Ambassador</b>
            <span className="block text-xs text-ink-400">Ambassador Mid-West Floor</span>
          </span>
        </Link>

        <nav aria-label="Views" className="hidden gap-0.5 rounded-full bg-white/75 p-1 shadow-card md:flex">
          {VIEWS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-4 py-[7px] text-[13.5px] font-semibold transition-colors ${
                isActive(pathname, href) ? "bg-brand text-white" : "text-ink-600 hover:text-ink-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <NewProjectButton compact />
          <span className="rounded-full ring-[3px] ring-brand-soft">
            <Avatar name={actorName} size={34} />
          </span>
        </div>
      </header>

      <nav
        aria-label="Navigation"
        className={`fixed inset-x-2.5 bottom-[calc(10px+env(safe-area-inset-bottom,0px))] z-20 flex justify-around rounded-[22px] bg-navy p-1.5 shadow-[0_10px_30px_rgba(0,0,0,.18)] md:inset-x-auto md:bottom-auto md:left-5 md:top-1/2 md:max-h-[calc(100vh-40px)] md:-translate-y-1/2 md:flex-col md:justify-start md:gap-0.5 md:p-2 md:transition-[width] md:duration-200 ${
          open ? "md:w-[204px] md:rounded-3xl" : "md:w-[54px] md:rounded-full"
        }`}
      >
        <DockButton
          label={open ? "Collapse" : "Expand"}
          icon={open ? ChevronsLeft : ChevronsRight}
          open={open}
          onClick={() => setOpen(!open)}
          className="hidden md:flex"
        />
        <i className="mx-2 my-1 hidden h-px bg-white/10 md:block" />
        {VIEWS.map(([href, label, Icon]) => (
          <DockButton key={href} href={href} label={label} icon={Icon} open={open} active={isActive(pathname, href)} />
        ))}

        {open && (
          <div className="mt-2 hidden min-h-0 flex-col overflow-y-auto border-t border-white/10 pt-2 md:flex">
            <span className="px-2.5 pb-1 text-xs font-semibold text-white/45">Projects</span>
            {projects.map((p) => {
              const active = pathname === `/projects/${p.id}`;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className={`truncate rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    active ? "bg-white text-navy" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {p.name}
                </Link>
              );
            })}
            {projects.length === 0 && <span className="px-2.5 py-1.5 text-[13px] text-white/45">No projects yet.</span>}
          </div>
        )}
      </nav>

      <main className="mx-auto min-w-0 max-w-[1320px]">{children}</main>
    </div>
  );
}

function DockButton({
  href,
  label,
  icon: Icon,
  open,
  active = false,
  onClick,
  className = "flex",
}: {
  href?: string;
  label: string;
  icon: LucideIcon;
  open: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `group relative h-[52px] flex-1 shrink-0 flex-col items-center justify-center gap-[3px] rounded-2xl text-[#cfd3dc] transition-colors md:h-[38px] md:flex-none md:flex-row md:justify-start md:gap-3 md:rounded-full md:px-2.5 ${
    active ? "bg-brand text-white hover:bg-brand-dark" : "hover:bg-white/10 hover:text-white"
  } ${className}`;
  const inner = (
    <>
      <Icon size={17} className="shrink-0" />
      <span className={`text-[10.5px] font-semibold md:text-[13.5px] ${open ? "md:inline" : "md:hidden"}`}>{label}</span>
      {!open && (
        <span className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-navy px-2.5 py-1.5 text-[12.5px] font-semibold text-white opacity-0 shadow-raised transition-opacity group-hover:opacity-100 md:block">
          {label}
        </span>
      )}
    </>
  );
  return href ? (
    <Link href={href} aria-label={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
