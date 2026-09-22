import type { ReactNode } from "react";

export function Badge({
  children,
  color,
  tone = "neutral",
  solid = false,
  className = "",
}: {
  children: ReactNode;
  color?: string;
  tone?: "neutral" | "brand";
  solid?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5";

  if (color) {
    return (
      <span
        className={`${base} ${className}`}
        style={
          solid
            ? { background: color, color: "#fff" }
            : { background: `${color}1a`, color }
        }
      >
        {children}
      </span>
    );
  }

  const tones = {
    neutral: "bg-ink-100 text-ink-600",
    brand: "bg-brand-soft text-brand",
  };

  return <span className={`${base} ${tones[tone]} ${className}`}>{children}</span>;
}

export function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: color }}
    />
  );
}
