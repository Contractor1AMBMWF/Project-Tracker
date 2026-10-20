"use client";

import { useRef } from "react";
import { addTaskUpdate } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export default function AddUpdateForm({ taskId, projectId }: { taskId: string; projectId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(formData: FormData) {
    const body = String(formData.get("body") ?? "");
    formRef.current?.reset();
    await addTaskUpdate(taskId, projectId, body);
  }

  return (
    <form ref={formRef} action={submit} className="mt-2 flex gap-2">
      <input
        name="body"
        required
        placeholder="Add an update…"
        className="min-w-0 flex-1 rounded-full bg-ink-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
      <Button type="submit">Post</Button>
    </form>
  );
}
