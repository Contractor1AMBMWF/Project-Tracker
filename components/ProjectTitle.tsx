"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions";

export default function ProjectTitle({ projectId, name }: { projectId: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  function save() {
    setEditing(false);
    const next = value.trim();
    if (!next || next === name) {
      setValue(name);
      return;
    }
    updateProject(projectId, { name: next });
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setValue(name);
            setEditing(false);
          }
        }}
        className="w-full max-w-xl rounded-lg border border-ink-300 px-2 py-1 text-2xl font-bold text-navy focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
    );
  }

  return (
    <h1
      onClick={() => setEditing(true)}
      className="cursor-text rounded-lg border border-transparent px-2 py-1 text-2xl font-bold text-navy hover:border-ink-200 hover:bg-ink-50"
      title="Click to rename project"
    >
      {value}
    </h1>
  );
}
