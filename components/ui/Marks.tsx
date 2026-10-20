import { STATUS_META, PRIORITY_META, type TaskPriority, type TaskStatus } from "@/lib/types";

// Status = small circular mark + plain text. No filled chips in lists.
export function StatusIcon({ status, size = 14 }: { status: TaskStatus; size?: number }) {
  const c = STATUS_META[status]?.color ?? STATUS_META.not_started.color;
  const r = 6;
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      {status === "not_started" ? (
        <circle cx="7" cy="7" r={r} fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="2.2 1.8" />
      ) : status === "done" ? (
        <>
          <circle cx="7" cy="7" r={r + 0.75} fill={c} />
          <path d="M4.3 7.2l1.8 1.8 3.6-3.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : status === "stuck" ? (
        <>
          <circle cx="7" cy="7" r={r + 0.75} fill={c} />
          <path d="M7 4v3.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="7" cy="9.9" r=".9" fill="#fff" />
        </>
      ) : (
        <>
          <circle cx="7" cy="7" r={r} fill="none" stroke={c} strokeWidth="1.5" />
          <path d="M7 7 L7 3.5 A3.5 3.5 0 0 1 7 10.5 Z" fill={c} />
        </>
      )}
    </svg>
  );
}

export function StatusLabel({ status }: { status: TaskStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-ink-600">
      <StatusIcon status={status} />
      {(STATUS_META[status] ?? STATUS_META.not_started).label}
    </span>
  );
}

// Priority = signal bars (1–3). High uses the accent.
export function PriorityIcon({ priority, light = false }: { priority: TaskPriority | null; light?: boolean }) {
  const n = priority === "high" ? 3 : priority === "medium" ? 2 : priority === "low" ? 1 : 0;
  const on = light ? "#fff" : priority === "high" ? "#E8520A" : "#4a4a48";
  const off = light ? "rgba(255,255,255,.3)" : "#dedcd6";
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1.5 + i * 4.2} y={9 - i * 3} width="2.8" height={4 + i * 3} rx=".8" fill={i < n ? on : off} />
      ))}
    </svg>
  );
}

export function PriorityLabel({ priority }: { priority: TaskPriority | null }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${priority ? "text-ink-600" : "text-ink-400"}`}>
      <PriorityIcon priority={priority} />
      {priority ? PRIORITY_META[priority].label : "No priority"}
    </span>
  );
}

// Initials avatar with a colour picked from the name, so people are easy to spot.
const AV_COLORS = ["#1a2740", "#2F5D50", "#E8520A", "#378ADD", "#8a5a00", "#6a4cff", "#b0306a"];

export function Avatar({ name, size = 26 }: { name: string | null; size?: number }) {
  if (!name) {
    return (
      <span
        title="Unassigned"
        className="grid shrink-0 place-items-center rounded-full border border-dashed border-ink-300 bg-white/60"
        style={{ width: size, height: size }}
      />
    );
  }
  const hash = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span
      title={name}
      className="grid shrink-0 place-items-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: AV_COLORS[hash % AV_COLORS.length], fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}
