"use client";

import { useState } from "react";
import { updateProject } from "@/app/actions";

export default function ProjectLeads({
  projectId,
  leadName,
  subleadName,
}: {
  projectId: string;
  leadName: string | null;
  subleadName: string | null;
}) {
  const [lead, setLead] = useState(leadName ?? "");
  const [sublead, setSublead] = useState(subleadName ?? "");

  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Lead
        </label>
        <input
          value={lead}
          onChange={(e) => setLead(e.target.value)}
          onBlur={() => lead !== (leadName ?? "") && updateProject(projectId, { lead_name: lead })}
          placeholder="Unassigned"
          className="mt-1 block w-40 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Sub-lead
        </label>
        <input
          value={sublead}
          onChange={(e) => setSublead(e.target.value)}
          onBlur={() =>
            sublead !== (subleadName ?? "") && updateProject(projectId, { sublead_name: sublead })
          }
          placeholder="Unassigned"
          className="mt-1 block w-40 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}
