import Link from "next/link";
import { CheckCircle2, ChevronRight, ListTodo, HelpCircle } from "lucide-react";
import { createReadClient } from "@/lib/supabase/read";
import { Card, FieldLabel, PageHeader } from "@/components/ui/Card";
import { Dot } from "@/components/ui/Badge";
import { CopySummaryButton, NoteForm, NoteRow, PeriodPicker } from "@/components/TouchBaseClient";
import { currentPeriod, isMeetingKey, periodFor, recentPeriods } from "@/lib/touchbase";
import { STATUS_META, type ActivityEntry, type Group, type Project, type Task } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Note {
  id: string;
  period_key: string;
  kind: "done" | "action" | "info";
  body: string;
  audience: string | null;
  project_id: string | null;
  resolved: boolean;
  resolved_at: string | null;
  author: string | null;
  created_at: string;
}

export default async function TouchBasePage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const period = key && isMeetingKey(key) ? periodFor(key) : currentPeriod();
  const periods = recentPeriods(10);
  if (!periods.some((p) => p.key === period.key)) periods.push(period);

  const supabase = createReadClient();
  const [{ data: projects }, { data: groupsData }, { data: tasks }, { data: activity }, { data: notesData }] = await Promise.all([
    supabase.from("projects").select("*").order("position") as unknown as Promise<{ data: Project[] | null }>,
    supabase.from("groups").select("*").order("position") as unknown as Promise<{ data: Group[] | null }>,
    supabase.from("tasks").select("*") as unknown as Promise<{ data: Task[] | null }>,
    supabase
      .from("activity_log")
      .select("*")
      .gte("created_at", period.start.toISOString())
      .lt("created_at", period.end.toISOString())
      .order("created_at", { ascending: true }) as unknown as Promise<{ data: ActivityEntry[] | null }>,
    supabase.from("touch_base_notes").select("*").order("created_at") as unknown as Promise<{ data: Note[] | null }>,
  ]);

  const projectName = new Map((projects ?? []).map((p) => [p.id, p.name]));
  const groupById = new Map((groupsData ?? []).map((g) => [g.id, g]));
  // Sections within a project, in board order.
  const bySection = (list: Task[]) => {
    const map = new Map<string, Task[]>();
    for (const t of list) {
      if (!map.has(t.group_id)) map.set(t.group_id, []);
      map.get(t.group_id)!.push(t);
    }
    return [...map.entries()].sort(
      ([a], [b]) => (groupById.get(a)?.position ?? 0) - (groupById.get(b)?.position ?? 0)
    );
  };
  const taskById = new Map((tasks ?? []).map((t) => [t.id, t]));
  const notes = notesData ?? [];
  const log = activity ?? [];

  // Done: tasks completed inside the window that are still done now.
  const doneIds = new Set<string>();
  const doneTasks: Task[] = [];
  for (const a of log) {
    if (a.action !== "completed" || !a.task_id || doneIds.has(a.task_id)) continue;
    const t = taskById.get(a.task_id);
    if (t && t.status === "done") {
      doneIds.add(t.id);
      doneTasks.push(t);
    }
  }
  const createdCount = log.filter((a) => a.action === "task_created").length;
  const updatesCount = log.filter((a) => a.action === "update_posted").length;

  // Pending: everything open that is moving or blocked, plus anything due by this call or high priority.
  const cutoffDay = period.key;
  const pendingTasks = (tasks ?? []).filter(
    (t) =>
      t.status !== "done" &&
      (t.status === "working_on_it" ||
        t.status === "stuck" ||
        t.priority === "high" ||
        (t.due_date !== null && t.due_date <= cutoffDay))
  );

  const inWindow = (iso: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d >= period.start && d < period.end;
  };
  // Action and info items carry forward until resolved.
  const carried = (n: Note) => n.period_key <= period.key && (!n.resolved || inWindow(n.resolved_at));
  const doneNotes = notes.filter((n) => n.kind === "done" && n.period_key === period.key);
  const actionNotes = notes.filter((n) => n.kind === "action" && carried(n));
  const infoNotes = notes.filter((n) => n.kind === "info" && carried(n));

  const groupByProject = (list: Task[]) => {
    const map = new Map<string, Task[]>();
    for (const t of list) {
      const k = t.project_id;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return [...map.entries()];
  };

  // Notes grouped by project in sidebar order; untagged notes go last as "General".
  const notesByProject = (list: Note[]) => {
    const order = new Map((projects ?? []).map((p, i) => [p.id, i]));
    const map = new Map<string | null, Note[]>();
    for (const n of list) {
      if (!map.has(n.project_id)) map.set(n.project_id, []);
      map.get(n.project_id)!.push(n);
    }
    return [...map.entries()].sort(([a], [b]) => (a ? order.get(a) ?? 99 : 100) - (b ? order.get(b) ?? 99 : 100));
  };

  const lines: string[] = [];
  lines.push(`${period.label} (${period.range})`, "");
  lines.push("DONE");
  for (const [pid, list] of groupByProject(doneTasks)) {
    lines.push(`${projectName.get(pid) ?? "Project"}:`);
    for (const [gid, items] of bySection(list)) {
      lines.push(`  ${groupById.get(gid)?.name ?? "Tasks"}:`);
      items.forEach((t) => lines.push(`    - ${t.title}`));
    }
  }
  doneNotes.forEach((n) => lines.push(`- ${n.body}`));
  if (doneTasks.length === 0 && doneNotes.length === 0) lines.push("- Nothing logged yet");
  lines.push("", "PENDING ACTION ITEMS");
  for (const [pid, list] of groupByProject(pendingTasks)) {
    lines.push(`${projectName.get(pid) ?? "Project"}:`);
    list.forEach((t) =>
      lines.push(`  - ${t.title} (${STATUS_META[t.status].label}${t.assignee ? `, ${t.assignee}` : ""}${t.due_date ? `, due ${t.due_date}` : ""})`)
    );
  }
  actionNotes.filter((n) => !n.resolved).forEach((n) => lines.push(`- ${n.body}`));
  lines.push("", "INFO NEEDED");
  const openInfo = infoNotes.filter((n) => !n.resolved);
  for (const [pid, list] of notesByProject(openInfo)) {
    lines.push(`${pid ? projectName.get(pid) ?? "Project" : "General"}:`);
    list.forEach((n) => lines.push(`  - ${n.audience ? `[${n.audience}] ` : ""}${n.body}`));
  }
  if (openInfo.length === 0) lines.push("- None");

  return (
    <div className="px-8 py-6">
      <PageHeader
        title="Touch Base"
        description="What got done, what is pending, and what we need, for each Tuesday and Friday call with RJ and Matt."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodPicker value={period.key} options={periods.map((p) => ({ key: p.key, label: p.label }))} />
            <CopySummaryButton text={lines.join("\n")} />
          </div>
        }
      />

      <p className="mt-2 text-xs text-ink-400">Covers {period.range}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Tasks completed" value={doneTasks.length} accent />
        <Stat label="Tasks added" value={createdCount} />
        <Stat label="Updates posted" value={updatesCount} />
        <Stat label="Info needed" value={openInfo.length} danger={openInfo.length > 0} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={<CheckCircle2 size={17} className="text-accent-green" />} title="Done since last call" />
          {doneTasks.length === 0 && doneNotes.length === 0 && (
            <p className="mt-3 text-xs italic text-ink-400">No tasks completed in this period yet.</p>
          )}
          <div className="mt-3 space-y-2">
            {[...new Set<string | null>([...groupByProject(doneTasks).map(([pid]) => pid), ...notesByProject(doneNotes).map(([pid]) => pid)])].map((pid) => {
              const tasksHere = doneTasks.filter((t) => t.project_id === pid);
              const notesHere = doneNotes.filter((n) => n.project_id === pid);
              return (
                <ProjectFold key={pid ?? "general"} name={pid ? projectName.get(pid) ?? "Project" : "General"} count={tasksHere.length + notesHere.length}>
                  {bySection(tasksHere).map(([gid, items]) => (
                    <div key={gid} className="mt-2">
                      <FieldLabel>{groupById.get(gid)?.name ?? "Tasks"}</FieldLabel>
                      <ul className="mt-1 space-y-1">
                        {items.map((t) => (
                          <li key={t.id} className="flex items-start gap-2 text-sm text-ink-700">
                            <span className="mt-1.5">
                              <Dot color={STATUS_META.done.color} />
                            </span>
                            <Link href={`/tasks/${t.id}`} className="hover:text-brand">
                              {t.title}
                            </Link>
                            {t.assignee && <span className="ml-auto shrink-0 text-xs text-ink-400">{t.assignee}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {notesHere.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {tasksHere.length > 0 && <FieldLabel>Other work</FieldLabel>}
                      {notesHere.map((n) => (
                        <NoteRow key={n.id} id={n.id} body={n.body} meta={n.author ?? undefined} resolved={false} resolvable={false} />
                      ))}
                    </div>
                  )}
                </ProjectFold>
              );
            })}
          </div>
          <NoteForm periodKey={period.key} kind="done" placeholder="Add other work done (meetings, research, fixes outside the board)" />
        </Card>

        <Card>
          <SectionTitle icon={<HelpCircle size={17} className="text-brand" />} title="Info needed from RJ and Matt" />
          <p className="text-xs text-ink-400">Stays on every call until marked resolved.</p>
          <div className="mt-3 space-y-1.5">
            {infoNotes.length === 0 && <p className="text-xs italic text-ink-400">Nothing waiting on them right now.</p>}
            {notesByProject(infoNotes).map(([pid, list]) => (
              <ProjectFold key={pid ?? "general"} name={pid ? projectName.get(pid) ?? "Project" : "General"} count={list.filter((n) => !n.resolved).length}>
                <div className="mt-2 space-y-1.5">
                  {list.map((n) => (
                    <NoteRow
                      key={n.id}
                      id={n.id}
                      body={n.body}
                      meta={[n.audience ? `For ${n.audience}` : null, `added ${n.period_key}`].filter(Boolean).join(" · ")}
                      resolved={n.resolved}
                    />
                  ))}
                </div>
              </ProjectFold>
            ))}
          </div>
          <NoteForm periodKey={period.key} kind="info" placeholder="What do you need from them?" withAudience />
        </Card>
      </div>

      <Card className="mt-4">
        <SectionTitle icon={<ListTodo size={17} className="text-accent-blue" />} title="Pending action items" />
        <p className="text-xs text-ink-400">
          Open tasks that are in progress, stuck, high priority, or due by this call. Manual items carry forward until resolved.
        </p>

        {actionNotes.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {actionNotes.map((n) => (
              <NoteRow key={n.id} id={n.id} body={n.body} meta={`added ${n.period_key}`} resolved={n.resolved} />
            ))}
          </div>
        )}
        <NoteForm periodKey={period.key} kind="action" placeholder="Add an action item from the call" />

        <div className="mt-4 overflow-x-auto rounded-card border border-ink-200">
          <div className="flex min-w-max border-b border-ink-200 bg-ink-50 text-label uppercase text-ink-400">
            <div className="min-w-[260px] flex-1 px-4 py-2">Task</div>
            <div className="w-44 px-2 py-2">Project</div>
            <div className="w-32 px-2 py-2 text-center">Assignee</div>
            <div className="w-36 px-2 py-2 text-center">Status</div>
            <div className="w-28 px-2 py-2 text-center">Due</div>
          </div>
          {pendingTasks.length === 0 && <p className="px-4 py-3 text-sm text-ink-400">No open items right now.</p>}
          {pendingTasks.map((t) => {
            const overdue = t.due_date && t.due_date < new Date().toISOString().slice(0, 10);
            return (
              <div key={t.id} className="flex min-w-max items-center border-t border-ink-100 text-sm first:border-t-0">
                <div className="min-w-[260px] flex-1 px-4 py-2">
                  <Link href={`/tasks/${t.id}`} className="font-medium text-ink-800 hover:text-brand">
                    {t.title}
                  </Link>
                </div>
                <div className="w-44 truncate px-2 py-2 text-xs">
                  <Link href={`/projects/${t.project_id}`} className="text-brand hover:underline">
                    {projectName.get(t.project_id) ?? ""}
                  </Link>
                </div>
                <div className="w-32 px-2 py-2 text-center text-xs text-ink-600">{t.assignee || "-"}</div>
                <div className="w-36 px-2 py-2 text-center">
                  <span
                    className="inline-block w-full rounded px-2 py-1 text-xs font-semibold text-white"
                    style={{ background: STATUS_META[t.status].color }}
                  >
                    {STATUS_META[t.status].label}
                  </span>
                </div>
                <div className={`w-28 px-2 py-2 text-center text-xs ${overdue ? "font-semibold text-red-500" : "text-ink-600"}`}>
                  {t.due_date || "-"}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-title text-ink-900">
      {icon}
      {title}
    </h2>
  );
}

function Stat({ label, value, accent, danger }: { label: string; value: number; accent?: boolean; danger?: boolean }) {
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

// One project's items, folded away until opened so each call starts as a short list.
function ProjectFold({ name, count, children }: { name: string; count: number; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-ink-100 px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <ChevronRight size={15} className="text-ink-400 transition-transform group-open:rotate-90" />
        <span className="font-display text-sm font-bold text-ink-900">{name}</span>
        <span className="ml-auto text-xs text-ink-400">{count}</span>
      </summary>
      <div className="pb-1">{children}</div>
    </details>
  );
}
