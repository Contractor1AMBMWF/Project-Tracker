"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createProject } from "@/app/actions";

export default function NewProjectButton() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
        aria-label="New project"
      >
        <Plus size={16} />
      </button>
    );
  }

  return (
    <form
      action={createProject}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-sm font-semibold text-navy">New project</h2>
        <input
          name="name"
          autoFocus
          required
          placeholder="Project name"
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Create
          </button>
        </div>
      </div>
    </form>
  );
}
