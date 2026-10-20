"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/actions";
import { Button } from "@/components/ui/Button";

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
    <div className="flex items-center gap-2 border-t border-ink-200 px-3.5 py-1">
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
        className="flex-1 bg-transparent py-1.5 text-[13px] font-bold text-ink-900 placeholder-ink-400 focus:outline-none"
      />
      {isPending && <span className="text-xs text-ink-400">Adding…</span>}
      {title.trim() && (
        <Button size="sm" onClick={add}>
          Add
        </Button>
      )}
    </div>
  );
}
