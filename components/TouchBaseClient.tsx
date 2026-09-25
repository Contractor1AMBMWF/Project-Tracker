"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, MessageSquare, Trash2, Undo2 } from "lucide-react";
import { addTouchBaseAnswer, addTouchBaseNote, deleteTouchBaseNote, setTouchBaseNoteResolved } from "@/app/actions";
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
  answers,
}: {
  id: string;
  body: string;
  meta?: string;
  resolved: boolean;
  resolvable?: boolean;
  answers?: { id: string; body: string; meta: string }[];
}) {
  const [, startTransition] = useTransition();
  const [answering, setAnswering] = useState(false);
  const [reply, setReply] = useState("");
  function saveReply() {
    const text = reply.trim();
    if (!text) return;
    setReply("");
    setAnswering(false);
    startTransition(() => addTouchBaseAnswer(id, text));
  }
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50">
    <div className="group flex items-start gap-2 px-3 py-2 text-sm">
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
        <p className={`whitespace-pre-wrap ${resolved ? "text-ink-400 line-through" : "text-ink-700"}`}>
          <Rich text={body} />
        </p>
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
    {answers && (
      <div className="space-y-1.5 px-3 pb-2 pl-9">
        {answers.map((a) => (
          <div key={a.id} className="group flex items-start gap-2 rounded-md border-l-2 border-brand bg-white px-2.5 py-1.5 text-sm">
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-wrap text-ink-700">
                <Rich text={a.body} />
              </p>
              <p className="text-xs text-ink-400">{a.meta}</p>
            </div>
            <button
              onClick={() => {
                if (confirm("Delete this answer?")) startTransition(() => deleteTouchBaseNote(a.id));
              }}
              title="Delete answer"
              className="rounded p-1 text-ink-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {answering ? (
          <div className="space-y-1.5">
            <textarea
              autoFocus
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveReply();
                if (e.key === "Escape") setAnswering(false);
              }}
              rows={3}
              placeholder="Type the answer"
              className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveReply} disabled={!reply.trim()}>
                Save answer
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setAnswering(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAnswering(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-brand"
          >
            <MessageSquare size={13} />
            Answer
          </button>
        )}
      </div>
    )}
    </div>
  );
}

// Notes are plain text; **double asterisks** mark the part to read first.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-ink-900">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
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
