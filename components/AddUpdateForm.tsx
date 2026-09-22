"use client";

import { useRef } from "react";
import { addTaskUpdate } from "@/app/actions";

export default function AddUpdateForm({ taskId, projectId }: { taskId: string; projectId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(formData: FormData) {
    const body = String(formData.get("body") ?? "");
    formRef.current?.reset();
    await addTaskUpdate(taskId, projectId, body);
  }

  return (
    <form ref={formRef} action={submit} className="mt-3 flex gap-2">
      <input
        name="body"
        required
        placeholder="Add an update..."
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
      />
      <button
        type="submit"
        className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Post
      </button>
    </form>
  );
}
