import Link from "next/link";
import { CheckCircle2, ChevronRight, ListTodo, HelpCircle } from "lucide-react";
import { createReadClient } from "@/lib/supabase/read";
import { Card, FieldLabel, PageHeader, SectionHeader } from "@/components/ui/Card";
import { Avatar, StatusIcon, StatusLabel } from "@/components/ui/Marks";
import { CopySummaryButton, NoteForm, NoteRow, PeriodPicker } from "@/components/TouchBaseClient";
import { currentPeriod, isMeetingKey, periodFor, recentPeriods } from "@/lib/touchbase";
import { STATUS_META, type ActivityEntry, type Group, type Project, type Task } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Note {
  id: string;
  period_key: string;
  kind: "done" | "action" | "info" | "answer";
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

  // Pending: everything open that is moving or blocked, plus anything high priority.
  const pendingTasks = (tasks ?? []).filter(
    (t) =>
      t.status !== "done" &&
      (t.status === "working_on_it" ||
        t.status === "stuck" ||
        t.priority === "high")
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
  const answersFor = (id: string) =>
    notes
      .filter((n) => n.kind === "answer" && n.period_key === id)
      .map((n) => ({
        id: n.id,
        body: n.body,
        meta: [n.author, new Date(n.created_at).toLocaleDateString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric" })]
          .filter(Boolean)
          .join(" · "),
      }));

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
  doneNotes.forEach((n) => lines.push(`- ${n.body.replaceAll("**", "")}`));
  if (doneTasks.length === 0 && doneNotes.length === 0) lines.push("- Nothing logged yet");
  lines.push("", "PENDING ACTION ITEMS");
  for (const [pid, list] of groupByProject(pendingTasks)) {
    lines.push(`${projectName.get(pid) ?? "Project"}:`);
    list.forEach((t) =>
      lines.push(`  - ${t.title} (${STATUS_META[t.status].label}${t.assignee ? `, ${t.assignee}` : ""})`)
    );
  }
  actionNotes.filter((n) => !n.resolved).forEach((n) => lines.push(`- ${n.body.replaceAll("**", "")}`));
  lines.push("", "INFO NEEDED");
  const openInfo = infoNotes.filter((n) => !n.resolved);
  for (const [pid, list] of notesByProject(openInfo)) {
    lines.push(`${pid ? projectName.get(pid) ?? "Project" : "General"}:`);
    list.forEach((n) => {
      lines.push(`  - ${n.audience ? `[${n.audience}] ` : ""}${n.body.replaceAll("**", "")}`);
      answersFor(n.id).forEach((a) => lines.push(`      Answer (${a.meta}): ${a.body.replaceAll("**", "")}`));
    });
  }
  if (openInfo.length === 0) lines.push("- None");

  return (
    <>
      <PageHeader
        eyebrow={`Covers ${period.range}`}
        title="Touch Base"
        description="What got done, what is pending, and what we need, for each Tuesday and Friday call with RJ and Matt."
        kpis={[
          { label: "Completed", value: doneTasks.length },
          { label: "Added", value: createdCount },
          { label: "Updates", value: updatesCount },
          { label: "Info needed", value: openInfo.length, warn: openInfo.length > 0 },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <PeriodPicker value={period.key} options={periods.map((p) => ({ key: p.key, label: p.label }))} />
        <CopySummaryButton text={lines.join("\n")} />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader icon={<CheckCircle2 size={16} className="text-accent-green" />} title="Done since last call" count={doneTasks.length + doneNotes.length} />
          {doneTasks.length === 0 && doneNotes.length === 0 && (
            <p className="mt-1 text-[13px] text-ink-400">No tasks completed in this period yet.</p>
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
                            <span className="mt-0.5">
                              <StatusIcon status="done" />
                            </span>
                            <Link href={`/tasks/${t.id}`} className="font-semibold hover:text-brand-dark">
                              {t.title}
                            </Link>
                            {t.assignee && (
                              <span className="ml-auto shrink-0">
                                <Avatar name={t.assignee} size={20} />
                              </span>
                            )}
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
          <SectionHeader
            icon={<HelpCircle size={16} className="text-brand" />}
            title="Info needed from RJ and Matt"
            count={openInfo.length}
            hint="Stays on every call until marked resolved."
          />
          <div className="mt-3 space-y-2">
            {infoNotes.length === 0 && <p className="text-[13px] text-ink-400">Nothing waiting on them right now.</p>}
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
                      answers={answersFor(n.id)}
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
        <SectionHeader
          icon={<ListTodo size={16} className="text-accent-blue" />}
          title="Pending action items"
          count={pendingTasks.length + actionNotes.filter((n) => !n.resolved).length}
          hint="Open tasks that are in progress, stuck, or high priority. Manual items carry forward until resolved."
        />

        {actionNotes.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {actionNotes.map((n) => (
              <NoteRow key={n.id} id={n.id} body={n.body} meta={`added ${n.period_key}`} resolved={n.resolved} />
            ))}
          </div>
        )}
        <NoteForm periodKey={period.key} kind="action" placeholder="Add an action item from the call" />

        <div className="mt-4 overflow-x-auto">
          <div className="flex min-w-max text-xs font-semibold text-ink-400">
            <div className="min-w-[260px] flex-1 py-2">Task</div>
            <div className="w-44 px-2 py-2">Project</div>
            <div className="w-36 px-2 py-2">Owner</div>
            <div className="w-36 px-2 py-2">Status</div>
          </div>
          {pendingTasks.length === 0 && <p className="py-3 text-[13px] text-ink-400">No open items right now.</p>}
          {pendingTasks.map((t) => {
            return (
              <div key={t.id} className="flex min-w-max items-center border-t border-ink-200 text-[13.5px]">
                <div className="min-w-[260px] flex-1 py-2.5">
                  <Link href={`/tasks/${t.id}`} className="font-semibold text-ink-900 hover:text-brand-dark">
                    {t.title}
                  </Link>
                </div>
                <div className="w-44 truncate px-2 py-2.5 text-xs font-bold">
                  <Link href={`/projects/${t.project_id}`} className="text-ink-600 hover:text-brand-dark">
                    {projectName.get(t.project_id) ?? ""}
                  </Link>
                </div>
                <div className="flex w-36 items-center gap-2 px-2 py-2.5 text-[13px] font-semibold text-ink-600">
                  <Avatar name={t.assignee} size={22} />
                  {t.assignee || "No owner"}
                </div>
                <div className="w-36 px-2 py-2.5">
                  <StatusLabel status={t.status} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

// One project's items, folded away until opened so each call starts as a short list.
function ProjectFold({ name, count, children }: { name: string; count: number; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl bg-ink-50 px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <ChevronRight size={15} className="text-ink-400 transition-transform group-open:rotate-90" />
        <span className="text-sm font-extrabold text-ink-900">{name}</span>
        <span className="ml-auto text-[13px] font-semibold tabular-nums text-ink-400">{count}</span>
      </summary>
      <div className="pb-1">{children}</div>
    </details>
  );
}
