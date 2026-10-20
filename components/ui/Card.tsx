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
      className={`rounded-card bg-white shadow-card transition-all duration-200 ${
        interactive ? "hover:-translate-y-0.5 hover:shadow-raised" : ""
      } ${flush ? "" : "px-[18px] py-4"} ${className}`}
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
  return <span className={`text-label text-ink-400 ${className}`}>{children}</span>;
}

// Section heading inside a panel: title, optional count, optional hint line.
export function SectionHeader({
  title,
  count,
  hint,
  icon,
  actions,
}: {
  title: string;
  count?: number;
  hint?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-1.5 flex flex-wrap items-baseline gap-2">
      <h2 className="flex items-center gap-2 self-center text-title text-ink-900">
        {icon}
        {title}
      </h2>
      {count !== undefined && <span className="text-sm font-semibold tabular-nums text-ink-400">{count}</span>}
      {actions && <div className="ml-auto">{actions}</div>}
      {hint && <p className="basis-full text-[13px] text-ink-400">{hint}</p>}
    </header>
  );
}

// Page header: small accent eyebrow, big title, key numbers inline on the right.
export function PageHeader({
  title,
  eyebrow,
  description,
  kpis,
  actions,
}: {
  title: ReactNode;
  eyebrow?: string;
  description?: string;
  kpis?: { label: string; value: string | number; warn?: boolean }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-[22px] flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[13px] font-bold text-brand-dark">{eyebrow}</p>}
        <h1 className="text-display text-ink-900">{title}</h1>
        {description && <p className="mt-1.5 max-w-[62ch] text-ink-600">{description}</p>}
      </div>
      {(kpis || actions) && (
        <div className="flex flex-wrap items-end gap-x-7 gap-y-3">
          {kpis && (
            <dl className="m-0 grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto sm:gap-7">
              {kpis.map((k) => (
                <div key={k.label} className="min-w-0 rounded-2xl bg-white px-2.5 py-2 sm:rounded-none sm:bg-transparent sm:p-0">
                  <dt className="text-xs font-medium leading-tight text-ink-400">{k.label}</dt>
                  <dd className={`m-0 text-[22px] font-extrabold tabular-nums tracking-tight sm:text-[26px] ${k.warn ? "text-brand-dark" : "text-ink-900"}`}>
                    {k.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}
