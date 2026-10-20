import Link from "next/link";
import {
  CheckCircle2,
  Undo2,
  ArrowRightLeft,
  UserPlus,
  Plus,
  Trash2,
  MessageSquare,
  FolderPlus,
  Circle,
  type LucideIcon,
} from "lucide-react";
import { createReadClient } from "@/lib/supabase/read";
import { daysAgoMs } from "@/lib/dates";
import NewProjectButton from "@/components/NewProjectButton";
import ProjectCard from "@/components/ProjectCard";
import { Card, PageHeader, SectionHeader } from "@/components/ui/Card";
import { Avatar, PriorityLabel, StatusIcon } from "@/components/ui/Marks";
import type { ActivityEntry, Project, Task } from "@/lib/types";

const ACTION_META: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  completed: { icon: CheckCircle2, label: "completed", color: "text-emerald-600" },
  reopened: { icon: Undo2, label: "reopened", color: "text-amber-600" },
  status_changed: { icon: ArrowRightLeft, label: "moved", color: "text-accent-blue" },
  assigned: { icon: UserPlus, label: "assigned", color: "text-violet-500" },
  task_created: { icon: Plus, label: "created", color: "text-ink-400" },
  task_deleted: { icon: Trash2, label: "deleted", color: "text-late" },
  update_posted: { icon: MessageSquare, label: "posted an update on", color: "text-ink-400" },
  project_created: { icon: FolderPlus, label: "created project", color: "text-ink-400" },
  project_deleted: { icon: Trash2, label: "deleted project", color: "text-late" },
};

export default async function DashboardPage() {
  const supabase = createReadClient();

  const [{ data: projects }, { data: allTasks }, { data: activity }] = await Promise.all([
    supabase.from("projects").select("*").order("position") as unknown as Promise<{ data: Project[] | null }>,
    supabase.from("tasks").select("*") as unknown as Promise<{ data: Task[] | null }>,
    supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30) as unknown as Promise<{ data: ActivityEntry[] | null }>,
  ]);

  const tasks = allTasks ?? [];
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.length - open.length;
  const completion = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  const projectById = new Map((projects ?? []).map((p) => [p.id, p]));
  const stuckTasks = open.filter((t) => t.status === "stuck");
  const urgentTasks = open.filter((t) => t.priority === "high" && t.status !== "stuck");
  const unassigned = open.filter((t) => !t.assignee);

  const weekAgo = daysAgoMs(7);
  const doneWeek = tasks
    .filter((t) => t.status === "done" && t.completed_at && new Date(t.completed_at).getTime() >= weekAgo)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));

  // Open tasks per person, busiest first.
  const workload = [...Map.groupBy(open.filter((t) => t.assignee), (t) => t.assignee!.trim())]
    .map(([name, list]) => ({ name, open: list.length, stuck: list.filter((t) => t.status === "stuck").length }))
    .sort((a, b) => b.open - a.open);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const taskList = (list: Task[], empty: string) =>
    list.length === 0 ? (
      <p className="mt-1 text-[13px] text-ink-400">{empty}</p>
    ) : (
      <ul className="m-0 max-h-80 list-none overflow-y-auto p-0">
        {list.map((t) => (
          <li key={t.id} className="flex items-center gap-3 border-t border-ink-200 py-2.5 first:border-t-0">
            <StatusIcon status={t.status} />
            <div className="min-w-0 flex-1">
              <Link href={`/tasks/${t.id}`} className="block truncate font-semibold hover:text-brand-dark">
                {t.title}
              </Link>
              <small className="text-[12.5px] text-ink-400">{projectById.get(t.project_id)?.name ?? "No project"}</small>
            </div>
            <span className="hidden sm:inline">
              <PriorityLabel priority={t.priority} />
            </span>
            <Avatar name={t.assignee} />
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <PageHeader
        eyebrow={today}
        title="Dashboard"
        kpis={[
          { label: "Projects", value: projects?.length ?? 0 },
          { label: "Open tasks", value: open.length },
          { label: "Stuck", value: stuckTasks.length, warn: stuckTasks.length > 0 },
          { label: "Complete", value: `${completion}%` },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Card>
            <SectionHeader title="Stuck" count={stuckTasks.length} hint="Blocked work. Unblock these first." />
            {taskList(stuckTasks, "Nothing is stuck right now.")}
          </Card>
          <Card>
            <SectionHeader title="High priority" count={urgentTasks.length} hint="Open tasks marked High." />
            {taskList(urgentTasks, "No high-priority work open.")}
          </Card>
          {unassigned.length > 0 && (
            <Card>
              <SectionHeader title="No owner yet" count={unassigned.length} hint="Open tasks nobody has picked up." />
              {taskList(unassigned, "")}
            </Card>
          )}

          <div className="pt-2">
            <SectionHeader title="Projects" count={projects?.length ?? 0} />
            <div className="mt-2 grid grid-cols-1 gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))]">
              {(projects ?? []).map((p) => (
                <ProjectCard key={p.id} project={p} tasks={tasks.filter((t) => t.project_id === p.id)} />
              ))}
              <NewProjectButton tile />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <SectionHeader title="Workload" />
            {workload.length === 0 ? (
              <p className="text-[13px] text-ink-400">No one has open tasks.</p>
            ) : (
              <table className="w-full border-collapse text-[13px] tabular-nums">
                <thead>
                  <tr className="text-xs text-ink-400">
                    <th className="py-1 text-left font-semibold">Person</th>
                    <th className="py-1 text-right font-semibold">Open</th>
                    <th className="py-1 text-right font-semibold">Stuck</th>
                  </tr>
                </thead>
                <tbody>
                  {workload.map((w) => (
                    <tr key={w.name} className="border-t border-ink-200">
                      <td className="py-2">
                        <span className="flex items-center gap-2 font-semibold">
                          <Avatar name={w.name} size={22} />
                          {w.name}
                        </span>
                      </td>
                      <td className="py-2 text-right">{w.open}</td>
                      <td className={`py-2 text-right ${w.stuck ? "font-extrabold text-late" : ""}`}>{w.stuck}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card>
            <SectionHeader title="Done this week" count={doneWeek.length} />
            {doneWeek.length === 0 ? (
              <p className="text-[13px] text-ink-400">Nothing completed in the last 7 days.</p>
            ) : (
              <ul className="m-0 max-h-72 list-none overflow-y-auto p-0 text-[13px]">
                {doneWeek.map((t) => (
                  <li key={t.id} className="flex items-start gap-2 border-t border-ink-200 py-2 first:border-t-0">
                    <span className="mt-0.5">
                      <StatusIcon status="done" />
                    </span>
                    <Link href={`/tasks/${t.id}`} className="min-w-0 font-semibold hover:text-brand-dark">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeader title="Recent activity" />
            {(activity ?? []).length === 0 && (
              <p className="text-[13px] text-ink-400">Every change shows up here with who did it and when.</p>
            )}
            <ul className="m-0 max-h-[420px] list-none overflow-y-auto p-0">
              {(activity ?? []).map((a) => {
                const meta = ACTION_META[a.action] ?? { icon: Circle, label: a.action, color: "text-ink-400" };
                const ActionIcon = meta.icon;
                return (
                  <li key={a.id} className="flex gap-2 border-t border-ink-200 py-2 text-xs first:border-t-0">
                    <ActionIcon size={13} className={`mt-0.5 shrink-0 ${meta.color}`} />
                    <div className="min-w-0">
                      <p className="m-0 text-ink-600">
                        <span className="font-bold text-ink-900">{a.actor_name ?? "Someone"}</span> {meta.label}{" "}
                        {a.task_id ? (
                          <Link href={`/tasks/${a.task_id}`} className="font-semibold text-ink-900 underline decoration-ink-300 hover:text-brand-dark">
                            {a.task_title}
                          </Link>
                        ) : (
                          <span className="font-semibold">{a.task_title ?? a.project_name ?? ""}</span>
                        )}
                      </p>
                      {a.detail && <p className="m-0 truncate text-ink-400">{a.detail}</p>}
                      <time className="text-[11px] text-ink-400">
                        {new Date(a.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
