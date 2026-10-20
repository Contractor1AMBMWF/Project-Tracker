"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { renameGroup, deleteGroup } from "@/app/actions";
import { Button } from "@/components/ui/Button";
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
  const [sure, setSure] = useState(false);
  const dirty = name.trim() !== "" && name.trim() !== group.name;

  function save() {
    if (!dirty) return;
    renameGroup(group.id, projectId, name.trim());
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-3.5 pb-2">
      {onToggle && (
        <button
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
          className="rounded-full p-0.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
        </button>
      )}
      <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-[3px] ring-white" style={{ background: group.color }} />

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        size={Math.min(Math.max(name.length + 1, 12), 80)}
        className="max-w-full rounded-lg bg-transparent px-1 py-0.5 text-base font-extrabold text-ink-900 focus:bg-ink-100 focus:outline-none"
      />
      {summary && <span className="shrink-0 text-[13px] font-semibold text-ink-400">{summary}</span>}
      {dirty && (
        <Button size="sm" onClick={save}>
          Save
        </Button>
      )}
      <button
        onClick={() => (sure ? deleteGroup(group.id, projectId) : setSure(true))}
        onBlur={() => setSure(false)}
        className={`ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold transition-colors ${
          sure ? "bg-red-50 text-late" : "text-ink-300 hover:bg-red-50 hover:text-late"
        }`}
        title="Delete group"
      >
        <Trash2 size={14} />
        {sure && "Click again to delete group and its tasks"}
      </button>
    </div>
  );
}
