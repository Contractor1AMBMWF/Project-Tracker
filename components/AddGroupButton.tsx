"use client";

import { createGroup } from "@/app/actions";

export default function AddGroupButton({ projectId }: { projectId: string }) {
  return (
    <button
      onClick={() => createGroup(projectId, "New Group")}
      className="rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-600 hover:border-brand hover:text-brand"
    >
      + Add group
    </button>
  );
}
