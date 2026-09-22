"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { renameGroup, deleteGroup } from "@/app/actions";
import type { Group } from "@/lib/types";

export default function GroupHeader({
  group,
  projectId,
  collapsed,
  onToggle,
  summary,
}: {
  group: Group;
  projectId: string;
  collapsed?: boolean;
  onToggle?: () => void;
  summary?: string;
}) {
  const [name, setName] = useState(group.name);
  const dirty = name.trim() !== "" && name.trim() !== group.name;

  function save() {
    if (!dirty) return;
    renameGroup(group.id, projectId, name.trim());
  }

  function remove() {
    if (!confirm(`Delete the group "${group.name}" and all its tasks?`)) return;
    deleteGroup(group.id, projectId);
  }

  return (
    <div className="mb-1 flex items-center gap-2">
      {onToggle && (
        <button
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
          className="rounded p-0.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
        </button>
      )}
      <span className="inline-block h-4 w-1.5 rounded-full" style={{ background: group.color }} />

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        size={Math.min(Math.max(name.length + 1, 12), 80)}
        className="max-w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-bold focus:border-ink-300 focus:bg-white focus:outline-none"
        style={{ color: group.color }}
      />
      {collapsed && summary && <span className="shrink-0 text-xs text-ink-400">{summary}</span>}
      {dirty && (
        <button
          onClick={save}
          className="rounded-md bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          Save
        </button>
      )}
      <button
        onClick={remove}
        className="ml-auto rounded p-1 text-ink-300 transition-colors hover:bg-red-50 hover:text-red-500"
        title="Delete group"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
