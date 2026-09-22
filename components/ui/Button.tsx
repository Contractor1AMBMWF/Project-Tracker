import type { ComponentProps, ElementType, ReactNode } from "react";

type Variant = "primary" | "secondary" | "navy" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-card hover:bg-brand-dark hover:shadow-raised active:bg-brand-dark",
  secondary:
    "bg-white text-ink-700 border border-ink-200 shadow-card hover:bg-ink-50 hover:border-ink-300",
  navy:
    "bg-navy text-white shadow-card hover:bg-navy-800 hover:shadow-raised active:bg-navy-800",
  ghost:
    "text-ink-500 hover:bg-ink-100 hover:text-ink-700",
  danger:
    "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs rounded-md",
  md: "h-10 gap-2 px-4 text-sm rounded-lg",
};

const BASE =
  "inline-flex items-center justify-center font-display font-bold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 " +
  "active:scale-[0.97] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 " +
  "disabled:pointer-events-none disabled:opacity-50";

export function buttonClass(variant: Variant = "primary", size: Size = "md", className = "") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & Omit<ComponentProps<T>, "as" | "children">;

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps<T>) {
  const Tag = (as ?? "button") as ElementType;
  return (
    <Tag className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Tag>
  );
}
