"use client";

import { useState } from "react";
import { applyTaskPatch } from "@/app/actions";
import { FieldLabel } from "@/components/ui/Card";
import { STATUS_META, STATUS_ORDER, PRIORITY_META, type Task, type TaskPriority, type TaskStatus } from "@/lib/types";

export default function TaskDetailEditor({ task }: { task: Task }) {
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<string>(task.priority ?? "");

  function patch(next: Partial<{ title: string; assignee: string | null; status: TaskStatus; priority: TaskPriority | null; due_date: string | null }>) {
    applyTaskPatch(task.id, next);
  }

  return (
    <div className="mt-4 rounded-xl border border-ink-200 bg-white p-5">
      <FieldLabel>Edit task</FieldLabel>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title.trim() && title !== task.title && patch({ title: title.trim() })}
        className="mt-2 w-full rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-navy focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />

      <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
        <div>
          <FieldLabel>Assignee</FieldLabel>
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            onBlur={() => patch({ assignee: assignee || null })}
            placeholder="Unassigned"
            className="mt-1 w-full rounded-lg border border-ink-300 px-3 py-1.5 text-ink-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <select
            value={status}
            onChange={(e) => {
              const next = e.target.value as TaskStatus;
              setStatus(next);
              patch({ status: next });
            }}
            className="mt-1 w-full cursor-pointer rounded-lg px-2 py-1.5 text-center text-xs font-semibold text-white focus:outline-none"
            style={{ background: STATUS_META[status].color }}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s} className="bg-white text-ink-800">
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Priority</FieldLabel>
          <select
            value={priority}
            onChange={(e) => {
              const next = e.target.value;
              setPriority(next);
              patch({ priority: (next || null) as TaskPriority | null });
            }}
            className="mt-1 w-full cursor-pointer rounded-lg px-2 py-1.5 text-center text-xs font-semibold focus:outline-none"
            style={priority ? { background: PRIORITY_META[priority as TaskPriority].color, color: "white" } : { color: "#9ca3af", border: "1px solid #c9cfda" }}
          >
            <option value="" className="bg-white text-ink-800">-</option>
            {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
              <option key={p} value={p} className="bg-white text-ink-800">
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
