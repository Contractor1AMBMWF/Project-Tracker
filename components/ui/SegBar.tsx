import { STATUS_META, STATUS_ORDER, type Task } from "@/lib/types";

// Thin progress strip split by status, in workflow order.
export function SegBar({ tasks, className = "" }: { tasks: Task[]; className?: string }) {
  const total = tasks.length;
  return (
    <div className={`flex h-1.5 overflow-hidden rounded-full bg-ink-100 ${className}`}>
      {total > 0 &&
        STATUS_ORDER.map((s) => {
          const n = tasks.filter((t) => t.status === s).length;
          return n === 0 ? null : (
            <span
              key={s}
              title={`${STATUS_META[s].label}: ${n}`}
              className="min-w-1"
              style={{ width: `${(n / total) * 100}%`, background: STATUS_META[s].color }}
            />
          );
        })}
    </div>
  );
}
