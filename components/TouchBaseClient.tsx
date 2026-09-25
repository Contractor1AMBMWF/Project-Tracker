"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Trash2, Undo2 } from "lucide-react";
import { addTouchBaseNote, deleteTouchBaseNote, setTouchBaseNoteResolved } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export function PeriodPicker({
  value,
  options,
}: {
  value: string;
  options: { key: string; label: string }[];
}) {
  const router = useRouter();
  return (
    <select
      value={value}
      onChange={(e) => router.push(`/touch-base?key=${e.target.value}`)}
      className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 shadow-card focus:border-brand focus:outline-none"
    >
      {options.map((o, i) => (
        <option key={o.key} value={o.key}>
          {o.label}
          {i === 0 ? " (upcoming)" : ""}
        </option>
      ))}
    </select>
  );
}

export function NoteForm({
  periodKey,
  kind,
  placeholder,
  withAudience = false,
}: {
  periodKey: string;
  kind: "done" | "action" | "info";
  placeholder: string;
  withAudience?: boolean;
}) {
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("RJ");
  const [pending, startTransition] = useTransition();

  function submit() {
    const text = body.trim();
    if (!text) return;
    setBody("");
    startTransition(() => addTouchBaseNote({ periodKey, kind, body: text, audience: withAudience ? audience : null }));
  }

  return (
    <div className="mt-3 flex gap-2">
      {withAudience && (
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="rounded-lg border border-ink-300 bg-white px-2 text-sm text-ink-700 focus:border-brand focus:outline-none"
        >
          <option value="RJ">RJ</option>
          <option value="Matt">Matt</option>
          <option value="RJ and Matt">RJ and Matt</option>
        </select>
      )}
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg border border-ink-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <Button size="sm" onClick={submit} disabled={pending || !body.trim()} className="h-auto">
        Add
      </Button>
    </div>
  );
}

export function NoteRow({
  id,
  body,
  meta,
  resolved,
  resolvable = true,
}: {
  id: string;
  body: string;
  meta?: string;
  resolved: boolean;
  resolvable?: boolean;
}) {
  const [, startTransition] = useTransition();
  return (
    <div className="group flex items-start gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm">
      {resolvable && (
        <button
          onClick={() => startTransition(() => setTouchBaseNoteResolved(id, !resolved))}
          title={resolved ? "Mark as open" : "Mark as resolved"}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            resolved ? "border-accent-green bg-accent-green text-white" : "border-ink-300 bg-white hover:border-brand"
          }`}
        >
          {resolved && <Check size={11} />}
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className={`whitespace-pre-wrap ${resolved ? "text-ink-400 line-through" : "text-ink-700"}`}>{body}</p>
        {meta && <p className="text-xs text-ink-400">{meta}</p>}
      </div>
      {resolved && resolvable && (
        <button
          onClick={() => startTransition(() => setTouchBaseNoteResolved(id, false))}
          title="Reopen"
          className="rounded p-1 text-ink-300 opacity-0 transition hover:text-ink-600 group-hover:opacity-100"
        >
          <Undo2 size={13} />
        </button>
      )}
      <button
        onClick={() => {
          if (confirm("Delete this item?")) startTransition(() => deleteTouchBaseNote(id));
        }}
        title="Delete"
        className="rounded p-1 text-ink-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export function CopySummaryButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy summary"}
    </Button>
  );
}
