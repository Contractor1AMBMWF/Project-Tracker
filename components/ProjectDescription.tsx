"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions";

export default function ProjectDescription({
  projectId,
  description,
}: {
  projectId: string;
  description: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(description ?? "");

  function save() {
    setEditing(false);
    updateProject(projectId, { description: value });
  }

  return (
    <div className="mt-2 max-w-2xl">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
        Project Description
      </span>
      {editing ? (
        <textarea
          autoFocus
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          placeholder="What is this project for?"
          className="mt-1 w-full resize-y rounded-lg border border-ink-300 px-3 py-2 text-sm text-ink-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      ) : (
        <p
          onClick={() => setEditing(true)}
          className={`mt-1 cursor-text whitespace-pre-wrap rounded-lg border border-transparent px-2 py-1.5 text-sm hover:border-ink-200 hover:bg-ink-50 ${
            value ? "text-ink-700" : "italic text-ink-400"
          }`}
          title="Click to edit description"
        >
          {value || "Click to add a description… (what is this project for?)"}
        </p>
      )}
    </div>
  );
}
