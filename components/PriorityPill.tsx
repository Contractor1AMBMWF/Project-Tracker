"use client";

import { PRIORITY_META, type TaskPriority } from "@/lib/types";
import { applyTaskPatch } from "@/app/actions";

export default function PriorityPill({
  taskId,
  priority,
}: {
  taskId: string;
  priority: TaskPriority | null;
}) {
  return (
    <select
      value={priority ?? ""}
      onChange={(e) =>
        applyTaskPatch(taskId, {
          priority: (e.target.value || null) as TaskPriority | null,
        })
      }
      className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium outline-none"
      style={{ color: priority ? PRIORITY_META[priority].color : "#94a3b8" }}
    >
      <option value="">No priority</option>
      {Object.entries(PRIORITY_META).map(([key, meta]) => (
        <option key={key} value={key} className="text-navy">
          {meta.label}
        </option>
      ))}
    </select>
  );
}
