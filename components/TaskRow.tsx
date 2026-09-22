"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { applyTaskPatch, deleteTask } from "@/app/actions";
import StatusPill from "@/components/StatusPill";
import PriorityPill from "@/components/PriorityPill";
import type { Task } from "@/lib/types";

export default function TaskRow({ task, projectId }: { task: Task; projectId: string }) {
  return (
    <div className="group flex items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0">
      <Link
        href={`/tasks/${task.id}`}
        className="min-w-0 flex-1 truncate text-navy hover:underline"
      >
        {task.title}
      </Link>

      <input
        defaultValue={task.assignee ?? ""}
        placeholder="Assignee"
        onBlur={(e) => applyTaskPatch(task.id, { assignee: e.target.value || null })}
        className="w-28 shrink-0 rounded-md border border-transparent px-2 py-1 text-xs outline-none hover:border-slate-200 focus:border-brand"
      />

      <input
        type="date"
        defaultValue={task.due_date ?? ""}
        onChange={(e) => applyTaskPatch(task.id, { due_date: e.target.value || null })}
        className="w-32 shrink-0 rounded-md border border-transparent px-2 py-1 text-xs outline-none hover:border-slate-200 focus:border-brand"
      />

      <PriorityPill taskId={task.id} priority={task.priority} />
      <StatusPill taskId={task.id} status={task.status} />

      <button
        onClick={() => deleteTask(task.id, projectId)}
        className="shrink-0 text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
