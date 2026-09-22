"use client";

import { Trash2 } from "lucide-react";
import { deleteProject } from "@/app/actions";

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  return (
    <button
      onClick={() => {
        if (confirm("Delete this project and all its tasks? This cannot be undone.")) {
          deleteProject(projectId);
        }
      }}
      className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-500"
    >
      <Trash2 size={14} />
      Delete project
    </button>
  );
}
