"use client";

import { STATUS_META, type TaskStatus } from "@/lib/types";
import { applyTaskPatch } from "@/app/actions";

export default function StatusPill({ taskId, status }: { taskId: string; status: TaskStatus }) {
  return (
    <select
      value={status}
      onChange={(e) => applyTaskPatch(taskId, { status: e.target.value as TaskStatus })}
      className="rounded-md px-2 py-1 text-xs font-medium text-white outline-none"
      style={{ background: STATUS_META[status].color }}
    >
      {Object.entries(STATUS_META).map(([key, meta]) => (
        <option key={key} value={key} className="bg-white text-navy">
          {meta.label}
        </option>
      ))}
    </select>
  );
}
