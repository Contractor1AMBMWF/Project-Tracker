"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { updateProject } from "@/app/actions";

export default function ProjectLinkField({
  projectId,
  field,
  label,
  value,
}: {
  projectId: string;
  field: "repo_url" | "website_url";
  label: string;
  value: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  if (!editing) {
    return (
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </label>
        <div className="mt-1">
          {value ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-brand hover:underline"
            >
              <ExternalLink size={12} />
              {value.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-slate-400 hover:text-brand"
            >
              Add link
            </button>
          )}
          {value && (
            <button
              onClick={() => setEditing(true)}
              className="ml-2 text-xs text-slate-400 hover:text-brand"
            >
              edit
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== (value ?? "")) updateProject(projectId, { [field]: draft });
        }}
        placeholder="https://..."
        className="mt-1 block w-56 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
