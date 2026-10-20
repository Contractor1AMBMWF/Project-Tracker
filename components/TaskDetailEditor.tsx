"use client";

import { useState } from "react";
import { applyTaskPatch } from "@/app/actions";
import { Card, SectionHeader } from "@/components/ui/Card";
import { STATUS_META, STATUS_ORDER, PRIORITY_META, type Task, type TaskPriority, type TaskStatus } from "@/lib/types";

const fieldCls =
  "mt-1.5 w-full rounded-xl border-0 bg-ink-100 px-3 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand";

export default function TaskDetailEditor({ task }: { task: Task }) {
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<string>(task.priority ?? "");

  function patch(next: Partial<{ title: string; assignee: string | null; status: TaskStatus; priority: TaskPriority | null; due_date: string | null }>) {
    applyTaskPatch(task.id, next);
  }

  return (
    <Card className="mt-6">
      <SectionHeader title="Edit task" hint="Changes save when you leave a field." />

      <label className="mt-2 grid text-[12.5px] font-semibold text-ink-600">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== task.title && patch({ title: title.trim() })}
          className={fieldCls}
        />
      </label>

      <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="grid text-[12.5px] font-semibold text-ink-600">
          Owner
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            onBlur={() => patch({ assignee: assignee || null })}
            placeholder="No owner"
            className={fieldCls}
          />
        </label>
        <label className="grid text-[12.5px] font-semibold text-ink-600">
          Status
          <select
            value={status}
            onChange={(e) => {
              const next = e.target.value as TaskStatus;
              setStatus(next);
              patch({ status: next });
            }}
            className={`${fieldCls} cursor-pointer`}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid text-[12.5px] font-semibold text-ink-600">
          Priority
          <select
            value={priority}
            onChange={(e) => {
              const next = e.target.value;
              setPriority(next);
              patch({ priority: (next || null) as TaskPriority | null });
            }}
            className={`${fieldCls} cursor-pointer`}
          >
            <option value="">No priority</option>
            {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  );
}
