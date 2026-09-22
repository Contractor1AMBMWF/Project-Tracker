import { STATUS_META, type TaskStatus } from "@/lib/types";

export default function StatusBar({
  counts,
  total,
}: {
  counts: { status: TaskStatus; count: number }[];
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="flex h-6 w-full items-center justify-center rounded-full bg-ink-100 text-xs text-ink-400">
        No tasks yet
      </div>
    );
  }

  return (
    <div className="flex h-6 w-full overflow-hidden rounded-full">
      {counts.map(({ status, count }) =>
        count === 0 ? null : (
          <div
            key={status}
            className="flex items-center justify-center text-[11px] font-semibold text-white"
            style={{
              width: `${(count / total) * 100}%`,
              background: (STATUS_META[status] ?? STATUS_META.not_started).color,
            }}
            title={`${(STATUS_META[status] ?? STATUS_META.not_started).label}: ${count}`}
          >
            {count}
          </div>
        )
      )}
    </div>
  );
}
