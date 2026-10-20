"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { setProjectDates } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader, SectionHeader } from "@/components/ui/Card";
import type { Project } from "@/lib/types";

const MONTHS = 12;

const toDate = (iso: string) => new Date(iso + "T00:00:00");
const fmt = (iso: string) => toDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const quarterStart = (iso: string) => {
  const d = toDate(iso);
  return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
};

// 12-month timeline of projects, with quarter markers and a today line.
// A project needs a start or end date to get a bar; the rest are listed below.
export default function Roadmap({
  projects,
  progress,
  today,
}: {
  projects: Project[];
  progress: Record<string, number>;
  today: string;
}) {
  const [start, setStart] = useState(() => quarterStart(today));
  const [editing, setEditing] = useState<Project | null>(null);

  const end = new Date(start.getFullYear(), start.getMonth() + MONTHS, 1);
  const span = end.getTime() - start.getTime();
  const months = Array.from({ length: MONTHS }, (_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1));
  const pct = (iso: string) => Math.min(100, Math.max(0, ((toDate(iso).getTime() - start.getTime()) / span) * 100));
  const todayPct = pct(today);
  const showToday = todayPct > 0 && todayPct < 100;

  const dated = projects
    .map((p) => ({ p, a: p.start_date ?? p.end_date, b: p.end_date ?? p.start_date }))
    .filter((r): r is { p: Project; a: string; b: string } => !!r.a && !!r.b)
    .sort((x, y) => x.a.localeCompare(y.a));
  const visible = dated.filter((r) => toDate(r.b) >= start && toDate(r.a) < end);
  const undated = projects.filter((p) => !p.start_date && !p.end_date);
  const live = dated.filter((r) => r.a <= today && r.b >= today).length;

  const range = `${months[0].toLocaleDateString("en-US", { month: "short", year: "numeric" })} – ${months[MONTHS - 1].toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
  const navBtn = "grid h-9 place-items-center rounded-full bg-white px-3 text-[13px] font-bold shadow-card hover:bg-ink-100";

  return (
    <>
      <PageHeader
        eyebrow={range}
        title="Roadmap"
        kpis={[
          { label: "On the roadmap", value: dated.length },
          { label: "Running now", value: live },
          { label: "No dates", value: undated.length, warn: undated.length > 0 },
        ]}
        actions={
          <div className="flex gap-1.5">
            <button aria-label="Earlier" className={navBtn} onClick={() => setStart(new Date(start.getFullYear(), start.getMonth() - 3, 1))}>
              <ChevronLeft size={16} />
            </button>
            <button className={navBtn} onClick={() => setStart(quarterStart(today))}>
              This quarter
            </button>
            <button aria-label="Later" className={navBtn} onClick={() => setStart(new Date(start.getFullYear(), start.getMonth() + 3, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-card bg-white py-1.5">
        <div className="overflow-x-auto">
          <div className="min-w-[760px] md:min-w-[980px]">
            <div className="sticky top-0 z-[2] grid grid-cols-[150px_1fr] border-b border-ink-200 bg-white md:grid-cols-[230px_1fr]">
              <div />
              <div className="grid" style={{ gridTemplateColumns: `repeat(${MONTHS}, 1fr)` }}>
                {months.map((m, i) => (
                  <span
                    key={i}
                    className={`border-l px-2 pb-2 pt-2.5 text-xs font-semibold text-ink-400 ${m.getMonth() % 3 === 0 ? "border-ink-300" : "border-ink-200"}`}
                  >
                    {m.getMonth() % 3 === 0 && <b className="block text-[11.5px] text-brand-dark">Q{m.getMonth() / 3 + 1}</b>}
                    {m.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                ))}
              </div>
            </div>

            {visible.length === 0 && (
              <p className="px-5 py-5 text-[13px] text-ink-400">
                Nothing on the roadmap for these months.
                {undated.length > 0 && " Give a project dates below to place it here."}
              </p>
            )}

            {visible.map(({ p, a, b }) => {
              const left = pct(a);
              const right = pct(new Date(toDate(b).getTime() + 864e5).toISOString().slice(0, 10));
              const w = Math.max(1.2, right - left);
              const short = w < 9;
              const done = Math.round((progress[p.id] ?? 0) * 100);
              return (
                <div key={p.id} className="grid grid-cols-[150px_1fr] hover:bg-ink-50 md:grid-cols-[230px_1fr]">
                  <div className="min-w-0 py-2 pl-3.5 pr-3 md:pl-5">
                    <Link href={`/projects/${p.id}`} className="block truncate text-[13.5px] font-bold hover:text-brand-dark">
                      {p.name}
                    </Link>
                    <span className="block text-xs text-ink-400">{done}% done</span>
                  </div>
                  <div className="relative grid" style={{ gridTemplateColumns: `repeat(${MONTHS}, 1fr)` }}>
                    {months.map((_, i) => (
                      <i key={i} className="border-l border-ink-100" />
                    ))}
                    {showToday && <em className="absolute inset-y-0 z-[1] w-0.5 bg-brand opacity-65" style={{ left: `${todayPct}%` }} />}
                    <button
                      onClick={() => setEditing(p)}
                      title={`${p.name}: ${fmt(a)} – ${fmt(b)} · ${done}% done. Click to change dates.`}
                      className={`absolute top-1/2 h-[30px] -translate-y-1/2 overflow-hidden whitespace-nowrap rounded-full text-left text-[12.5px] font-bold text-white shadow-card hover:brightness-110 ${
                        short ? "min-w-3 overflow-visible" : "px-3"
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${w}%`,
                        background: `linear-gradient(90deg, #4a6290 ${done}%, #1a2740 ${done}%)`,
                      }}
                    >
                      {short ? (
                        <span className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 font-semibold text-ink-600">{p.name}</span>
                      ) : (
                        <span className="relative">{p.name}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-ink-400">
        Bars run from start to end date; the lighter part shows how much is done. Click a bar to change its dates.
      </p>

      {undated.length > 0 && (
        <Card className="mt-5">
          <SectionHeader title="Not on the roadmap yet" count={undated.length} hint="These projects have no dates." />
          <ul className="m-0 list-none p-0">
            {undated.map((p) => (
              <li key={p.id} className="flex items-center gap-3 border-t border-ink-200 py-2.5 first:border-t-0">
                <Link href={`/projects/${p.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-brand-dark">
                  {p.name}
                </Link>
                <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                  <CalendarPlus size={13} />
                  Set dates
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {editing && <DatesDrawer key={editing.id} project={editing} today={today} onClose={() => setEditing(null)} />}
    </>
  );
}

function DatesDrawer({ project, today, onClose }: { project: Project; today: string; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(project.start_date ?? today);
  const [endDate, setEndDate] = useState(project.end_date ?? "");

  function save(a: string | null, b: string | null) {
    setError(null);
    startTransition(async () => {
      const err = await setProjectDates(project.id, a, b);
      if (err) return setError(err);
      onClose();
      router.refresh();
    });
  }

  const field = "w-full rounded-xl border-0 bg-ink-100 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand";

  return (
    <>
      <div className="fixed inset-0 z-30 bg-ink-900/35" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Project dates"
        className="fixed inset-x-0 bottom-0 z-[31] flex max-h-[92vh] flex-col rounded-t-[22px] bg-white shadow-overlay md:inset-y-3 md:left-auto md:right-3 md:w-[460px] md:rounded-[22px]"
      >
        <form
          className="grid flex-1 content-start gap-3.5 overflow-y-auto p-6"
          onSubmit={(e) => {
            e.preventDefault();
            save(startDate || null, endDate || null);
          }}
        >
          <h3 className="m-0 text-[22px] font-extrabold tracking-tight">{project.name}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12.5px] font-semibold text-ink-600">
              Start
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
            </label>
            <label className="grid gap-1.5 text-[12.5px] font-semibold text-ink-600">
              End
              <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className={field} />
            </label>
          </div>
          <p className="-mt-1.5 text-xs text-ink-400">Leave the end empty for a single milestone date.</p>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-late">{error}</p>}
          <button type="submit" hidden />
        </form>
        <div className="flex items-center gap-2 border-t border-ink-200 px-6 pb-[calc(18px+env(safe-area-inset-bottom,0px))] pt-3.5">
          <Button disabled={pending} onClick={() => save(startDate || null, endDate || null)}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button variant="ghost" className="bg-ink-100" onClick={onClose}>
            Cancel
          </Button>
          {(project.start_date || project.end_date) && (
            <button className="ml-auto text-sm font-bold text-late" disabled={pending} onClick={() => save(null, null)}>
              Remove from roadmap
            </button>
          )}
        </div>
      </div>
    </>
  );
}
