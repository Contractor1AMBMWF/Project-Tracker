"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2, ArrowUpRight } from "lucide-react";
import { applyTaskPatch, deleteTask } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import {
  STATUS_META,
  STATUS_ORDER,
  PRIORITY_META,
  type TaskPriority,
  type Task,
  type TaskStatus,
} from "@/lib/types";

const COLS = { assignee: 144, status: 176, priority: 112, due_date: 144, actions: 80 };

function AutoTextarea({
  value,
  onChange,
  onEnter,
  className,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  className?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onEnter();
        }
      }}
      className={className}
      placeholder={placeholder}
      style={{ resize: "none", overflow: "hidden" }}
    />
  );
}

export default function TaskRow({
  task,
  projectId,
  accent,
}: {
  task: Task;
  projectId: string;
  accent: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [statusVal, setStatusVal] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<string>(task.priority ?? "");
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [deleted, setDeleted] = useState(false);

  const dirty =
    title.trim() !== task.title ||
    assignee !== (task.assignee ?? "") ||
    statusVal !== task.status ||
    priority !== (task.priority ?? "") ||
    dueDate !== (task.due_date ?? "");

  function saveAll() {
    if (!dirty) return;
    startTransition(() => {
      applyTaskPatch(task.id, {
        title: title.trim(),
        assignee: assignee || null,
        status: statusVal,
        priority: (priority || null) as TaskPriority | null,
        due_date: dueDate || null,
      });
    });
  }

  function remove() {
    setDeleted(true);
    startTransition(() => deleteTask(task.id, projectId));
  }

  if (deleted) return null;

  const editStatusMeta = STATUS_META[statusVal] ?? STATUS_META.not_started;

  return (
    <div style={{ borderLeft: `3px solid ${accent}` }}>
      <div className="flex items-start border-t border-ink-200 text-sm min-w-max">
        {/* Title */}
        <div className="flex-1 min-w-[200px] px-4 py-2.5">
          <AutoTextarea
            value={title}
            onChange={setTitle}
            onEnter={saveAll}
            className="w-full bg-transparent font-medium text-ink-800 focus:outline-none leading-snug"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Link
              href={`/tasks/${task.id}`}
              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand transition-colors hover:text-brand-dark hover:underline"
            >
              Details
              <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>

        {/* Assignee */}
        <div className="shrink-0 px-2 py-2 text-center" style={{ width: COLS.assignee }}>
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            onBlur={saveAll}
            placeholder="Unassigned"
            className="w-full cursor-text bg-transparent px-1 py-1 text-center text-xs text-ink-600 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div className="shrink-0 px-2 py-1" style={{ width: COLS.status }}>
          <select
            value={statusVal}
            onChange={(e) => {
              setStatusVal(e.target.value as TaskStatus);
            }}
            onBlur={saveAll}
            className="w-full cursor-pointer rounded px-2 py-1.5 text-center text-xs font-semibold text-white focus:outline-none"
            style={{ background: editStatusMeta.color }}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s} className="bg-white text-ink-800">
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="shrink-0 px-2 py-1" style={{ width: COLS.priority }}>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            onBlur={saveAll}
            className="w-full cursor-pointer rounded px-2 py-1.5 text-center text-xs font-semibold focus:outline-none"
            style={
              priority
                ? { background: PRIORITY_META[priority as TaskPriority].color, color: "white" }
                : { color: "#9ca3af" }
            }
          >
            <option value="" className="bg-white text-ink-800">
              -
            </option>
            {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
              <option key={p} value={p} className="bg-white text-ink-800">
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </div>

        {/* Due date */}
        <div className="shrink-0 px-2 py-1 text-center" style={{ width: COLS.due_date }}>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={saveAll}
            className="w-full cursor-pointer rounded bg-transparent px-1 py-1 text-xs text-ink-600 focus:outline-none"
          />
        </div>

        {/* Save + Delete */}
        <div className="shrink-0 flex items-center justify-end gap-1 px-2 py-2" style={{ width: COLS.actions }}>
          {dirty && (
            <Button size="sm" onClick={saveAll} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          )}
          <button
            onClick={remove}
            title="Delete task"
            className="rounded p-1 text-ink-300 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
