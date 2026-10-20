import type { ComponentProps, ElementType, ReactNode } from "react";

type Variant = "primary" | "secondary" | "navy" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-white text-ink-900 shadow-card hover:bg-ink-100",
  navy: "bg-navy text-white hover:bg-navy-800",
  ghost: "text-ink-600 hover:bg-white hover:text-ink-900",
  danger: "bg-white text-late hover:bg-red-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3.5 text-xs",
  md: "h-10 gap-2 px-4 text-[13.5px]",
};

const BASE =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-bold " +
  "transition-[background-color,color,transform] duration-150 active:scale-[0.97] " +
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
