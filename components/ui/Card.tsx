import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  flush = false,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-card border border-ink-200 bg-white shadow-card transition-all duration-200 ${
        interactive
          ? "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-raised"
          : ""
      } ${flush ? "" : "p-5"} ${className}`}
    >
      {children}
    </div>
  );
}

export function FieldLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-display text-label uppercase text-ink-400 ${className}`}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-display text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
