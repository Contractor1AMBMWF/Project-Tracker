"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createGroup } from "@/app/actions";

export default function AddGroupButton({ projectId }: { projectId: string }) {
  const [name, setName] = useState("");

  async function submit() {
    const n = name || "New group";
    setName("");
    await createGroup(projectId, n);
  }

  return (
    <form action={submit} className="flex h-fit w-72 shrink-0 items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-400">
      <Plus size={14} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add group"
        className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
      />
    </form>
  );
}
