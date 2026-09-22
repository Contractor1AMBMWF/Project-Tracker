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
  bare = false,
}: {
  projectId: string;
  field: "repo_url" | "website_url";
  label: string;
  icon: string;
  placeholder: string;
  value: string | null;
  bare?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");

  function save() {
    setEditing(false);
    updateProject(projectId, { [field]: val });
  }

  return (
    <div className={`flex items-center gap-2 ${bare ? "" : "mt-2"}`}>
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {label}
        </span>
      )}

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
          className={`max-w-full rounded-lg border border-ink-300 px-2 py-1 text-sm text-ink-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${
            bare ? "w-52" : "w-72"
          }`}
        />
      ) : val ? (
        <span className="flex items-center gap-2">
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-navy/5 px-2.5 py-1 text-sm font-medium text-navy hover:bg-navy/10"
          >
            <span aria-hidden>{icon}</span>
            <span className="max-w-xs truncate">{val.replace(/^https?:\/\//, "")}</span>
          </a>
          <button onClick={() => setEditing(true)} className="text-xs text-ink-400 hover:text-brand">
            edit
          </button>
        </span>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-dashed border-ink-300 px-2.5 py-1 text-sm italic text-ink-400 hover:border-brand hover:text-brand"
        >
          {label ? `No ${label.toLowerCase()} available` : "No link added"} - add link
        </button>
      )}
    </div>
  );
}
