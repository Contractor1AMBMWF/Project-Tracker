"use client";

import { useState } from "react";
import { createProject } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export default function NewProjectButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New Project</Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-card bg-white p-6 shadow-overlay"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-title text-ink-900">New Project</h2>
            <p className="mt-1 text-sm text-ink-500">
              Give your project a name. We&apos;ll add a starter group for you.
            </p>
            <form action={createProject} className="mt-4">
              <input
                name="name"
                autoFocus
                required
                placeholder="e.g. Website Redesign"
                className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
