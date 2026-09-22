"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/app/actions";

export default function AddTaskRow({ projectId, groupId }: { projectId: string; groupId: string }) {
  const [value, setValue] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function submit() {
    if (!value.trim()) return;
    const title = value;
    setValue("");
    await createTask(projectId, groupId, title);
  }

  return (
    <form
      ref={formRef}
      action={submit}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400"
    >
      <Plus size={14} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a task"
        className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
      />
    </form>
  );
}
