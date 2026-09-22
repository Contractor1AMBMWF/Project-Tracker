import Link from "next/link";
import { createReadClient } from "@/lib/supabase/read";
import NewProjectButton from "@/components/NewProjectButton";
import { STATUS_META, type ActivityEntry, type Project, type Task } from "@/lib/types";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ACTION_LABEL: Record<string, string> = {
  task_created: "created task",
  status_changed: "updated status on",
  completed: "completed",
  reopened: "reopened",
  assigned: "updated assignee on",
  task_deleted: "deleted task",
  update_posted: "commented on",
  project_created: "created project",
  project_deleted: "deleted project",
};

type TaskWithProject = Pick<Task, "id" | "status" | "priority" | "title" | "due_date" | "project_id">;

export default async function DashboardPage() {
  const supabase = createReadClient();

  const [{ data: projects }, { data: tasks }, { data: activity }] = await Promise.all([
    supabase.from("projects").select("id, name, category") as unknown as Promise<{
      data: Pick<Project, "id" | "name" | "category">[] | null;
    }>,
    supabase
      .from("tasks")
      .select("id, status, priority, title, due_date, project_id") as unknown as Promise<{
      data: TaskWithProject[] | null;
    }>,
    supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30) as unknown as Promise<{ data: ActivityEntry[] | null }>,
  ]);

  const taskList = tasks ?? [];
  const projectList = projects ?? [];
  const projectName = (id: string) => projectList.find((p) => p.id === id)?.name ?? "";

  const total = taskList.length;
  const done = taskList.filter((t) => t.status === "done").length;
  const overdue = taskList.filter(
    (t) => t.due_date && t.status !== "done" && new Date(t.due_date) < new Date(new Date().toDateString())
  ).length;
  const completionPct = total ? Math.round((done / total) * 100) : 0;

  const stuck = taskList.filter((t) => t.status === "stuck");
  const urgent = taskList.filter((t) => t.priority === "high" && t.status !== "done");

  const statusCounts = (["not_started", "working_on_it", "stuck", "done"] as const).map((s) => ({
    status: s,
    count: taskList.filter((t) => t.status === s).length,
  }));
  const maxCount = Math.max(1, ...statusCounts.map((s) => s.count));

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
          <p className="text-sm text-slate-500">Everything the team is working on, at a glance.</p>
        </div>
        <NewProjectButton variant="button" categories={Array.from(new Set(projectList.map((p) => p.category).filter((c): c is string => !!c)))} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Projects" value={projectList.length} />
        <StatCard label="Total tasks" value={total} />
        <StatCard label="Completion" value={`${completionPct}%`} />
        <StatCard label="Overdue" value={overdue} accent={overdue > 0} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Tasks by status</h2>
          <div className="mt-4 space-y-3">
            {statusCounts.map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-slate-500">
                  {STATUS_META[s.status].label}
                </span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(s.count / maxCount) * 100}%`,
                      background: STATUS_META[s.status].color,
                    }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs text-slate-500">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Recent activity</h2>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {(activity ?? []).map((a) => (
              <div key={a.id} className="text-sm">
                <span className="font-medium text-navy">{a.actor_name}</span>{" "}
                <span className="text-slate-500">{ACTION_LABEL[a.action] ?? a.action}</span>{" "}
                {a.task_title ? (
                  <span className="font-medium text-navy">{a.task_title}</span>
                ) : (
                  a.project_name && <span className="font-medium text-navy">{a.project_name}</span>
                )}
                {a.detail && <span className="text-slate-400"> — {a.detail}</span>}
                <div className="text-xs text-slate-400">{timeAgo(a.created_at)}</div>
              </div>
            ))}
            {(!activity || activity.length === 0) && (
              <p className="text-sm text-slate-400">No activity yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-navy">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Needs attention
          </h2>
          <p className="text-xs text-slate-400">Tasks currently marked Stuck</p>
          <div className="mt-3 space-y-2">
            {stuck.map((t) => (
              <Link
                key={t.id}
                href={`/tasks/${t.id}`}
                className="block rounded-md border border-slate-100 px-3 py-2 text-sm text-navy hover:border-red-300"
              >
                {t.title}
                <span className="ml-2 text-xs text-slate-400">{projectName(t.project_id)}</span>
              </Link>
            ))}
            {stuck.length === 0 && (
              <p className="rounded-md border border-dashed border-slate-200 px-3 py-3 text-center text-sm text-slate-400">
                No stuck tasks right now.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-navy">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Urgent
          </h2>
          <p className="text-xs text-slate-400">Open tasks tagged High priority</p>
          <div className="mt-3 space-y-2">
            {urgent.map((t) => (
              <Link
                key={t.id}
                href={`/tasks/${t.id}`}
                className="block rounded-md border border-slate-100 px-3 py-2 text-sm text-navy hover:border-amber-300"
              >
                {t.title}
                <span className="ml-2 text-xs text-slate-400">{projectName(t.project_id)}</span>
              </Link>
            ))}
            {urgent.length === 0 && (
              <p className="rounded-md border border-dashed border-slate-200 px-3 py-3 text-center text-sm text-slate-400">
                No urgent tasks right now.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-navy">Projects</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {projectList.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-navy transition hover:border-brand"
            >
              {p.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? "text-red-600" : "text-navy"}`}>
        {value}
      </p>
    </div>
  );
}
