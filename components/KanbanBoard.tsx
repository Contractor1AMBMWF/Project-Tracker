"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyTaskPatch } from "@/app/actions";
import { PageHeader } from "@/components/ui/Card";
import { Avatar, PriorityIcon } from "@/components/ui/Marks";
import { useStoredFlag } from "@/lib/useStoredState";
import { PRIORITY_META, STATUS_CARD, STATUS_META, STATUS_ORDER, type Project, type Task, type TaskStatus } from "@/lib/types";

export const DONE_WINDOW_DAYS = 30;

// One column per status. Dragging a card to another column changes its
// status straight away and puts it back if the save fails.
export default function KanbanBoard({
  projects,
  tasks,
  initialProject,
  doneCutoff,
}: {
  projects: Project[];
  tasks: Task[];
  initialProject: string;
  /** Done cards completed before this time (epoch ms) hide unless "All done" is on. */
  doneCutoff: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [projectFilter, setProjectFilter] = useState(initialProject);
  const [person, setPerson] = useState("");
  const [showAllDone, setShowAllDone] = useStoredFlag("ambtracker:board:alldone");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overLane, setOverLane] = useState<TaskStatus | null>(null);
  const [moved, setMoved] = useState<Record<string, TaskStatus>>({});
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);

  const projectName = new Map(projects.map((p) => [p.id, p.name]));
  const people = [...new Set(tasks.map((t) => t.assignee?.trim()).filter(Boolean) as string[])].sort();
  const statusOf = (t: Task) => moved[t.id] ?? t.status;

  const filtered = tasks.filter(
    (t) => (!projectFilter || t.project_id === projectFilter) && (!person || t.assignee?.trim() === person)
  );

  function flash(text: string, bad = false) {
    setToast({ text, bad });
    setTimeout(() => setToast(null), 2600);
  }

  function dropOn(status: TaskStatus) {
    const task = tasks.find((t) => t.id === dragId);
    setDragId(null);
    setOverLane(null);
    if (!task || statusOf(task) === status) return;
    setMoved((m) => ({ ...m, [task.id]: status }));
    startTransition(async () => {
      try {
        await applyTaskPatch(task.id, { status });
        flash(`Moved to ${STATUS_META[status].label}`);
        router.refresh();
      } catch {
        setMoved((m) => {
          const next = { ...m };
          delete next[task.id];
          return next;
        });
        flash("Couldn't move that card. Try again.", true);
      }
    });
  }

  const selectCls =
    "rounded-full border-0 bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-900 shadow-card focus:outline-none focus:ring-2 focus:ring-brand";

  return (
    <>
      <PageHeader
        eyebrow={`${filtered.length} tasks · drag cards between columns`}
        title="Board"
        actions={
          <div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 sm:w-auto">
            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                router.replace(e.target.value ? `/board?project=${e.target.value}` : "/board", { scroll: false });
              }}
              className={selectCls}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select value={person} onChange={(e) => setPerson(e.target.value)} className={selectCls}>
              <option value="">Everyone</option>
              {people.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-ink-600">
              <input
                type="checkbox"
                checked={showAllDone}
                onChange={(e) => setShowAllDone(e.target.checked)}
                className="accent-brand"
              />
              All done
            </label>
          </div>
        }
      />

      <div
        className={`-mx-3.5 grid snap-x snap-mandatory auto-cols-[82%] grid-flow-col items-start gap-3 overflow-x-auto px-3.5 pb-2.5 md:mx-0 md:auto-cols-auto md:grid-flow-row md:grid-cols-[repeat(4,minmax(232px,1fr))] md:px-0`}
      >
        {STATUS_ORDER.map((s) => {
          const list = filtered
            .filter(
              (t) =>
                statusOf(t) === s &&
                (s !== "done" || showAllDone || !t.completed_at || new Date(t.completed_at).getTime() >= doneCutoff)
            )
            .sort((a, b) => (s === "done" ? (b.completed_at ?? "").localeCompare(a.completed_at ?? "") : 0));
          const card = STATUS_CARD[s];
          return (
            <section
              key={s}
              className={`min-w-0 snap-start rounded-[20px] p-2.5 transition-[background,box-shadow] ${
                overLane === s ? "bg-white/90 shadow-[inset_0_0_0_2px_var(--color-brand)]" : "bg-white/55"
              }`}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overLane !== s) setOverLane(s);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverLane((o) => (o === s ? null : o));
              }}
              onDrop={(e) => {
                e.preventDefault();
                dropOn(s);
              }}
            >
              <header className="flex items-center gap-2 px-1.5 pb-2.5 pt-1">
                <span className="h-[9px] w-[9px] rounded-full" style={{ background: s === "not_started" ? "#a3a29d" : s === "done" ? "#1a2740" : card.bg }} />
                <b className="text-sm font-extrabold">{STATUS_META[s].label}</b>
                <span className="text-[13px] font-semibold tabular-nums text-ink-400">{list.length}</span>
              </header>

              {list.map((t) => (
                <article
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", t.id);
                    setDragId(t.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverLane(null);
                  }}
                  onClick={() => router.push(`/tasks/${t.id}`)}
                  className={`mb-2.5 cursor-grab rounded-2xl px-3.5 py-3 transition-transform hover:-translate-y-px active:cursor-grabbing ${
                    dragId === t.id ? "-rotate-[1.5deg] opacity-40" : ""
                  }`}
                  style={{ background: card.bg, color: card.fg }}
                >
                  <span className="mb-1 block text-[11.5px] font-semibold opacity-75">
                    {s === "done" && t.completed_at
                      ? `Completed ${new Date(t.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : projectName.get(t.project_id) ?? "No project"}
                  </span>
                  <div className="text-sm font-extrabold leading-snug">{t.title}</div>
                  {s === "done" && <div className="mt-0.5 text-xs opacity-75">{projectName.get(t.project_id)}</div>}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold opacity-85">
                      <PriorityIcon priority={t.priority} light={card.light} />
                      {t.priority ? PRIORITY_META[t.priority].label : "No priority"}
                    </span>
                    <span className="rounded-full" style={{ boxShadow: `0 0 0 2px ${card.bg}` }}>
                      <Avatar name={t.assignee} size={24} />
                    </span>
                  </div>
                </article>
              ))}

              {list.length === 0 && (
                <p
                  className={`m-1 mb-2 text-[12.5px] text-ink-400 ${
                    dragId ? "rounded-2xl border-2 border-dashed border-ink-300 px-2.5 py-4 text-center" : ""
                  }`}
                >
                  {dragId ? "Drop here" : s === "done" && !showAllDone ? `Nothing completed in the last ${DONE_WINDOW_DAYS} days` : "Nothing here"}
                </p>
              )}
            </section>
          );
        })}
      </div>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-[18px] py-[11px] text-[13.5px] font-bold text-white md:bottom-6 ${
            toast.bad ? "bg-late" : "bg-navy"
          }`}
        >
          {toast.text}
        </div>
      )}
    </>
  );
}
