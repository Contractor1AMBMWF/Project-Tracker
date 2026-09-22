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
  const [value, setValue] = useState(description ?? "");

  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() =>
        value !== (description ?? "") && updateProject(projectId, { description: value })
      }
      placeholder="What is this project about?"
      rows={2}
      className="mt-2 w-full resize-none rounded-md border border-transparent bg-transparent px-0 text-sm text-slate-600 outline-none hover:border-slate-200 hover:bg-white hover:px-2 hover:py-1 focus:border-brand focus:bg-white focus:px-2 focus:py-1"
    />
  );
}
