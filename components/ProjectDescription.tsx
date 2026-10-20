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
    <div className="max-w-3xl">
      <span className="text-label text-ink-400">Description</span>
      {editing ? (
        <textarea
          autoFocus
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          placeholder="What is this project for?"
          className="mt-1 w-full resize-y rounded-xl bg-ink-100 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand"
        />
      ) : (
        <p
          onClick={() => setEditing(true)}
          className={`-mx-2 mt-0.5 cursor-text whitespace-pre-wrap rounded-xl px-2 py-1 text-sm hover:bg-ink-100 ${
            value ? "text-ink-700" : "text-ink-400"
          }`}
          title="Click to edit description"
        >
          {value || "Add a description: what is this project for?"}
        </p>
      )}
    </div>
  );
}
