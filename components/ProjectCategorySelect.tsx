"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions";

export default function ProjectCategorySelect({
  projectId,
  category,
}: {
  projectId: string;
  category: string | null;
}) {
  const [value, setValue] = useState(category ?? "");

  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Category
      </label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() =>
          value !== (category ?? "") && updateProject(projectId, { category: value })
        }
        placeholder="General"
        className="mt-1 block w-40 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
