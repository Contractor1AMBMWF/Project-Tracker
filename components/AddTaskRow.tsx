"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/actions";

export default function AddTaskRow({ groupId, projectId }: { groupId: string; projectId: string }) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function add() {
    const t = title.trim();
    if (!t) return;
    setTitle("");
    inputRef.current?.focus();
    startTransition(() => {
      createTask(projectId, groupId, t);
    });
  }

  return (
    <div className="flex items-center border-t border-ink-100">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder="+ Add task"
        className="flex-1 bg-transparent px-4 py-2.5 text-sm text-ink-600 placeholder-ink-400 focus:outline-none"
      />
      {isPending && <span className="px-2 text-xs text-ink-400">Adding…</span>}
      {title.trim() && (
        <button
          onClick={add}
          className="mr-2 rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          Add
        </button>
      )}
    </div>
  );
}
