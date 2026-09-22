"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions";

export default function ProjectTitle({ projectId, name }: { projectId: string; name: string }) {
  const [value, setValue] = useState(name);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => value.trim() && value !== name && updateProject(projectId, { name: value })}
      className="w-full bg-transparent text-2xl font-semibold text-navy outline-none"
    />
  );
}
