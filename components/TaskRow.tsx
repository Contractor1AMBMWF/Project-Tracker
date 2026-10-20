"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2, ArrowUpRight } from "lucide-react";
import { applyTaskPatch, deleteTask } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { PriorityIcon, StatusIcon } from "@/components/ui/Marks";
import {
  STATUS_META,
  STATUS_ORDER,
  PRIORITY_META,
  type TaskPriority,
  type Task,
  type TaskStatus,
} from "@/lib/types";

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
}: {
  task: Task;
  projectId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [statusVal, setStatusVal] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<string>(task.priority ?? "");
  const [deleted, setDeleted] = useState(false);

  const dirty =
    title.trim() !== task.title ||
    assignee !== (task.assignee ?? "") ||
    statusVal !== task.status ||
    priority !== (task.priority ?? "");

  function saveAll() {
    if (!dirty) return;
    startTransition(() => {
      applyTaskPatch(task.id, {
        title: title.trim(),
        assignee: assignee || null,
        status: statusVal,
        priority: (priority || null) as TaskPriority | null,
      });
    });
  }

  function remove() {
    setDeleted(true);
    startTransition(() => deleteTask(task.id, projectId));
  }

  if (deleted) return null;

  const selectCls =
    "w-full cursor-pointer appearance-none rounded-lg bg-transparent py-1.5 pl-7 pr-2 text-[13px] font-semibold text-ink-600 hover:bg-ink-100 focus:bg-ink-100 focus:outline-none";

  return (
    <div
      className={`grid grid-cols-[1fr_auto] items-start gap-x-2 border-t border-ink-200 px-3.5 py-2 text-[13.5px] hover:bg-ink-50 md:flex md:min-w-max md:gap-0 md:px-0 md:py-0 ${
        statusVal === "done" ? "text-ink-400" : ""
      }`}
    >
      {/* Title */}
      <div className="col-span-2 min-w-0 md:min-w-[260px] md:flex-1 md:px-3.5 md:py-2.5">
        <AutoTextarea
          value={title}
          onChange={setTitle}
          onEnter={saveAll}
          className={`w-full bg-transparent font-semibold leading-snug focus:outline-none ${
            statusVal === "done" ? "text-ink-400 line-through" : "text-ink-900"
          }`}
        />
        <Link
          href={`/tasks/${task.id}`}
          className="inline-flex items-center gap-0.5 text-[11.5px] font-bold text-ink-400 transition-colors hover:text-brand-dark"
        >
          Details
          <ArrowUpRight size={11} />
        </Link>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-x-1 md:contents">
        {/* Owner */}
        <div className="w-32 shrink-0 md:w-36 md:px-2 md:py-2">
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            onBlur={saveAll}
            placeholder="No owner"
            className="w-full cursor-text rounded-lg bg-transparent px-1.5 py-1.5 text-[13px] font-semibold text-ink-600 placeholder:font-normal placeholder:text-ink-400 hover:bg-ink-100 focus:bg-ink-100 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div className="relative w-40 shrink-0 md:px-2 md:py-2">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 md:left-4">
            <StatusIcon status={statusVal} />
          </span>
          <select
            value={statusVal}
            onChange={(e) => setStatusVal(e.target.value as TaskStatus)}
            onBlur={saveAll}
            className={selectCls}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="relative w-32 shrink-0 md:px-2 md:py-2">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 md:left-4">
            <PriorityIcon priority={(priority || null) as TaskPriority | null} />
          </span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            onBlur={saveAll}
            className={`${selectCls} ${priority ? "" : "text-ink-400"}`}
          >
            <option value="">No priority</option>
            {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Save + Delete */}
      <div className="row-start-2 flex shrink-0 items-center justify-end gap-1 md:w-24 md:px-2 md:py-2">
        {dirty && (
          <Button size="sm" onClick={saveAll} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        )}
        <button
          onClick={remove}
          title="Delete task"
          className="rounded-full p-1.5 text-ink-300 transition-colors hover:bg-red-50 hover:text-late"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
