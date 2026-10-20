"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createProject } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export default function NewProjectButton({ compact = false, tile = false }: { compact?: boolean; tile?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {tile ? (
        <button
          onClick={() => setOpen(true)}
          className="grid min-h-[180px] place-items-center rounded-[20px] border-2 border-dashed border-ink-300 text-sm font-bold text-ink-400 transition-colors hover:border-brand hover:text-brand-dark"
        >
          + New project
        </button>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          aria-label="New project"
          className={compact ? "max-md:w-10 max-md:px-0" : ""}
        >
          <Plus size={15} strokeWidth={2.4} />
          <span className={compact ? "max-md:hidden" : ""}>New project</span>
        </Button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-30 bg-ink-900/35" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="New project"
            className="fixed inset-x-0 bottom-0 z-[31] rounded-t-[22px] bg-white p-6 shadow-overlay md:inset-x-auto md:bottom-auto md:left-1/2 md:top-[18vh] md:w-full md:max-w-md md:-translate-x-1/2 md:rounded-[22px]"
          >
            <h3 className="text-[22px] font-extrabold tracking-tight text-ink-900">New project</h3>
            <p className="mt-1 text-sm text-ink-500">Give it a name. A starter group is added for you.</p>
            <form action={createProject} className="mt-4">
              <input
                name="name"
                autoFocus
                required
                placeholder="e.g. Website redesign"
                className="w-full rounded-xl bg-ink-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <div className="mt-5 flex gap-2 border-t border-ink-200 pt-4">
                <Button type="submit">Create</Button>
                <Button type="button" variant="ghost" className="bg-ink-100" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
