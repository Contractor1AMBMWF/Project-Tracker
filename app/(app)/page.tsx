import Link from "next/link";
import {
  AlertTriangle,
  Flame,
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
import NewProjectButton from "@/components/NewProjectButton";
import StatusBar from "@/components/StatusBar";
import { Card, FieldLabel, PageHeader } from "@/components/ui/Card";
import { Dot } from "@/components/ui/Badge";
import { STATUS_META, STATUS_ORDER, type ActivityEntry, type Project, type Task, type TaskStatus } from "@/lib/types";

const ACTION_META: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  completed: { icon: CheckCircle2, label: "completed", color: "text-emerald-500" },
  reopened: { icon: Undo2, label: "reopened", color: "text-amber-500" },
  status_changed: { icon: ArrowRightLeft, label: "moved", color: "text-accent-blue" },
  assigned: { icon: UserPlus, label: "assigned", color: "text-violet-500" },
  task_created: { icon: Plus, label: "created", color: "text-ink-400" },
  task_deleted: { icon: Trash2, label: "deleted", color: "text-red-400" },
  update_posted: { icon: MessageSquare, label: "posted an update on", color: "text-ink-400" },
  project_created: { icon: FolderPlus, label: "created project", color: "text-ink-400" },
  project_deleted: { icon: Trash2, label: "deleted project", color: "text-red-400" },
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
      .limit(200) as unknown as Promise<{ data: ActivityEntry[] | null }>,
  ]);

  const tasks = allTasks ?? [];
  const total = tasks.length;
  const countBy = (s: TaskStatus) => tasks.filter((t) => t.status === s).length;
  const done = countBy("done");
  const completion = total === 0 ? 0 : Math.round((done / total) * 100);

  const inProgress = tasks.filter((t) => t.status === "working_on_it").length;

  const projectById = new Map((projects ?? []).map((p) => [p.id, p]));
  const stuckTasks = tasks.filter((t) => t.status === "stuck");
  const urgentTasks = tasks.filter((t) => t.priority === "high" && t.status !== "done");

  const taskRow = (t: Task, tone: "stuck" | "urgent") => {
    const project = projectById.get(t.project_id ?? "");
    return (
      <div
        key={t.id}
        className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-150 hover:translate-x-0.5 hover:shadow-card ${
          tone === "stuck"
            ? "border-ink-200 bg-ink-50 hover:border-ink-300 hover:bg-white"
            : "border-red-200 bg-red-50 hover:border-red-300"
        }`}
      >
        {tone === "stuck" && <Dot color={STATUS_META.stuck.color} />}
        <Link href={`/tasks/${t.id}`} className="font-medium text-ink-700 hover:text-brand">
          {t.title}
        </Link>
        {project && (
          <Link href={`/projects/${project.id}`} className="text-xs text-brand hover:underline">
            {project.name}
          </Link>
        )}
        {t.assignee && <span className="ml-auto shrink-0 text-xs text-ink-400">{t.assignee}</span>}
      </div>
    );
  };

  return (
    <div className="px-8 py-6">
      <PageHeader
        title="Dashboard"
        description="Everything the team is working on, at a glance."
        actions={<NewProjectButton />}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Projects" value={projects?.length ?? 0} />
        <StatCard label="Total tasks" value={total} />
        <StatCard label="Completion" value={`${completion}%`} accent />
        <StatCard label="In progress" value={inProgress} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-title text-ink-900">Tasks by status</h2>
          <StatusBar counts={STATUS_ORDER.map((s) => ({ status: s, count: countBy(s) }))} total={total} />
          <div className="mt-4 flex flex-wrap gap-4">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm">
                <Dot color={STATUS_META[s].color} />
                <span className="text-ink-500">{STATUS_META[s].label}</span>
                <span className="font-semibold text-ink-900">{countBy(s)}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-ink-200 pt-4 md:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 font-display font-bold text-ink-900">
                <AlertTriangle size={16} className="text-brand" />
                Needs Attention
              </p>
              <p className="mb-2.5 text-xs text-ink-400">Tasks currently marked Stuck</p>
              {stuckTasks.length === 0 ? (
                <p className="text-xs italic text-ink-400">No stuck tasks right now.</p>
              ) : (
                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {stuckTasks.map((t) => taskRow(t, "stuck"))}
                </div>
              )}
            </div>

            <div>
              <p className="flex items-center gap-1.5 font-display font-bold text-ink-900">
                <Flame size={16} className="text-red-500" />
                Urgent
              </p>
              <p className="mb-2.5 text-xs text-ink-400">Open tasks tagged High priority</p>
              {urgentTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-ink-200 px-3 py-4 text-center text-xs text-ink-400">
                  No urgent tasks right now.
                </p>
              ) : (
                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {urgentTasks.map((t) => taskRow(t, "urgent"))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="lg:relative">
          <Card className="flex flex-col lg:absolute lg:inset-0">
            <h2 className="shrink-0 font-display text-title text-ink-900">Recent activity</h2>
            <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1 max-h-96 lg:max-h-none">
              {(activity ?? []).length === 0 && (
                <p className="text-xs text-ink-400">
                  No activity recorded yet. Every change (created, moved, completed, reassigned) will
                  appear here with who did it and when.
                </p>
              )}
              {(activity ?? []).slice(0, 30).map((a) => {
                const meta = ACTION_META[a.action] ?? { icon: Circle, label: a.action, color: "text-ink-400" };
                const ActionIcon = meta.icon;
                return (
                  <div key={a.id} className="flex gap-2 text-xs">
                    <ActionIcon size={13} className={`mt-0.5 shrink-0 ${meta.color}`} />
                    <div className="min-w-0">
                      <p className="text-ink-600">
                        <span className="font-semibold">{a.actor_name ?? "Someone"}</span> {meta.label}{" "}
                        {a.task_id ? (
                          <Link href={`/tasks/${a.task_id}`} className="font-medium text-brand hover:underline">
                            {a.task_title}
                          </Link>
                        ) : (
                          <span className="font-medium">{a.task_title ?? a.project_name ?? ""}</span>
                        )}
                      </p>
                      {a.detail && <p className="truncate text-ink-400">{a.detail}</p>}
                      <p className="text-[10px] text-ink-300">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {(() => {
        const all = projects ?? [];
        const renderCard = (p: Project) => {
          const pTasks = tasks.filter((t) => t.project_id === p.id);
          const pDone = pTasks.filter((t) => t.status === "done").length;
          const pPct = pTasks.length === 0 ? 0 : Math.round((pDone / pTasks.length) * 100);
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group rounded-card border border-ink-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-raised"
            >
              <h3 className="font-display text-lg font-bold text-ink-900 transition-colors group-hover:text-brand">
                {p.name}
              </h3>
              {p.description && <p className="mt-1 line-clamp-2 text-xs text-ink-500">{p.description}</p>}
              <p className="mt-1 text-xs text-ink-400">
                {pTasks.length} task{pTasks.length === 1 ? "" : "s"} · {pDone} done
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full origin-left animate-grow rounded-full bg-accent-green"
                  style={{ width: `${pPct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs font-medium text-ink-500">{pPct}%</p>
            </Link>
          );
        };

        return (
          <>
            <h2 className="mb-3 mt-8 font-display text-title text-ink-900">Projects</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {all.map(renderCard)}
              {all.length === 0 && (
                <div className="col-span-full rounded-card border border-dashed border-ink-300 bg-white p-10 text-center">
                  <p className="text-ink-500">No projects yet. Create your first one to get started!</p>
                  <div className="mt-4 flex justify-center">
                    <NewProjectButton />
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <Card>
      <FieldLabel>{label}</FieldLabel>
      <p
        className={`mt-1 font-display text-3xl font-extrabold tracking-tight ${
          danger ? "text-red-500" : accent ? "text-brand" : "text-ink-900"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
