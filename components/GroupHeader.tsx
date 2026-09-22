"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteGroup, renameGroup } from "@/app/actions";

export default function GroupHeader({
  groupId,
  projectId,
  name,
  count,
}: {
  groupId: string;
  projectId: string;
  name: string;
  count: number;
}) {
  const [value, setValue] = useState(name);

  return (
    <div className="group flex items-center justify-between px-3 py-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => value.trim() && value !== name && renameGroup(groupId, projectId, value)}
        className="w-full bg-transparent text-sm font-semibold text-navy outline-none"
      />
      <span className="ml-2 shrink-0 text-xs text-slate-400">{count}</span>
      <button
        onClick={() => deleteGroup(groupId, projectId)}
        className="ml-2 shrink-0 text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
        aria-label="Delete group"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
