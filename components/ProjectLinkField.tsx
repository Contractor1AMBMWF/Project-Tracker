"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions";

export default function ProjectLinkField({
  projectId,
  field,
  label,
  icon,
  placeholder,
  value,
}: {
  projectId: string;
  field: "repo_url" | "website_url";
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");

  function save() {
    setEditing(false);
    updateProject(projectId, { [field]: val });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-label text-ink-400">{label}</span>

      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setVal(value ?? "");
              setEditing(false);
            }
          }}
          placeholder={placeholder}
          className="w-72 max-w-full rounded-xl bg-ink-100 px-2.5 py-1 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand"
        />
      ) : val ? (
        <span className="flex items-center gap-2">
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-900 transition-colors hover:bg-brand hover:text-white"
          >
            {icon}
            <span className="max-w-xs truncate">{val.replace(/^https?:\/\//, "")}</span>
          </a>
          <button onClick={() => setEditing(true)} className="text-xs font-semibold text-ink-400 hover:text-ink-900">
            Edit
          </button>
        </span>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="rounded-full border border-dashed border-ink-300 px-2.5 py-0.5 text-xs font-semibold text-ink-400 hover:border-brand hover:text-brand-dark"
        >
          + Add link
        </button>
      )}
    </div>
  );
}
