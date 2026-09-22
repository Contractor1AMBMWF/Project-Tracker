"use client";

import { deleteProject } from "@/app/actions";

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
        Danger zone
      </p>
      <button
        onClick={() => {
          if (
            confirm(
              "Are you sure you want to delete this project?\n\nThis permanently removes the project and ALL its groups and tasks. This cannot be undone."
            )
          ) {
            deleteProject(projectId);
          }
        }}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:border-red-400 hover:bg-red-50"
      >
        Delete this project
      </button>
    </div>
  );
}
