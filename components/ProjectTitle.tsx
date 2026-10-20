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
        className="-mx-2 w-full max-w-xl rounded-xl bg-white px-2 py-0.5 font-extrabold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand"
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className="-mx-2 cursor-text rounded-xl px-2 py-0.5 hover:bg-white/70"
      title="Click to rename project"
    >
      {value}
    </span>
  );
}
