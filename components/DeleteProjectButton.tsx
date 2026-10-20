"use client";

import { useState } from "react";
import { deleteProject } from "@/app/actions";

// Delete asks for a second click instead of a browser dialog.
export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [sure, setSure] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => (sure ? deleteProject(projectId) : setSure(true))}
        onBlur={() => setSure(false)}
        className="text-sm font-bold text-late hover:underline"
      >
        {sure ? "Click again to delete this project" : "Delete this project"}
      </button>
      {sure && (
        <span className="text-[13px] text-ink-400">Removes all its groups and tasks. This can&apos;t be undone.</span>
      )}
    </div>
  );
}
