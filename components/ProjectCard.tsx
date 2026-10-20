import Link from "next/link";
import { Globe, GitBranch } from "lucide-react";
import { SegBar } from "@/components/ui/SegBar";
import type { Project, Task } from "@/lib/types";

export default function ProjectCard({ project, tasks }: { project: Project; tasks: Task[] }) {
  const done = tasks.filter((t) => t.status === "done").length;
  const stuck = tasks.filter((t) => t.status === "stuck").length;
  const pct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  return (
    <div className="group relative flex flex-col gap-2 rounded-[20px] bg-white p-[18px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised">
      <h3 className="m-0 text-[19px] font-extrabold leading-tight tracking-tight">
        <Link href={`/projects/${project.id}`} className="after:absolute after:inset-0 group-hover:text-brand-dark">
          {project.name}
        </Link>
      </h3>
      {project.description && <p className="m-0 line-clamp-2 text-[13px] text-ink-600">{project.description}</p>}

      <div className="mt-1 flex items-center gap-2.5 text-[12.5px] font-bold text-ink-600">
        <SegBar tasks={tasks} className="h-2 flex-1" />
        {pct}%
      </div>

      <dl className="mt-auto grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1 border-t border-ink-200 pt-2.5 text-[13px]">
        <dt className="text-ink-400">Tasks</dt>
        <dd className="m-0 font-semibold">
          {tasks.length} · {done} done
        </dd>
        {stuck > 0 && (
          <>
            <dt className="text-ink-400">Stuck</dt>
            <dd className="m-0 font-semibold text-late">{stuck}</dd>
          </>
        )}
      </dl>

      {(project.website_url || project.repo_url) && (
        <div className="relative z-10 flex flex-wrap gap-1.5">
          {project.website_url && <CardLink href={project.website_url} icon={<Globe size={12} />} label="Website" />}
          {project.repo_url && <CardLink href={project.repo_url} icon={<GitBranch size={12} />} label="Repo" />}
        </div>
      )}
    </div>
  );
}

function CardLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-900 transition-colors hover:bg-brand hover:text-white"
    >
      {icon}
      {label}
    </a>
  );
}
