import { Slot } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "@/lib/cn";

const VARIANTS = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent font-semibold disabled:bg-surface-3 disabled:text-fg-3",
  secondary:
    "bg-surface-2 text-fg border border-line hover:bg-surface-3 hover:border-line-strong disabled:text-fg-3",
  ghost: "text-fg-2 hover:text-fg hover:bg-surface-2 disabled:text-fg-3",
  ai: "bg-ai-soft text-ai border border-ai/30 hover:bg-ai/20 disabled:text-fg-3",
  danger: "bg-loss-soft text-loss border border-loss/30 hover:bg-loss/20",
} as const;

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-sm",
  md: "h-11 px-4 text-base gap-2 rounded-sm",
  lg: "h-13 px-6 text-lg gap-2.5 rounded-md",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renderiza o filho (ex.: <Link>) com o estilo de botão. */
  asChild?: boolean;
}

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98]",
    "disabled:pointer-events-none [&_svg]:shrink-0",
    VARIANTS[variant],
    SIZES[size],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  asChild,
  className,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";
  return (
    <Component
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonClasses(variant, size), className)}
      {...props}
    />
  );
}

export interface IconButtonProps extends Omit<ComponentProps<"button">, "aria-label"> {
  /** Obrigatório: botões só com ícone precisam de nome acessível. */
  label: string;
  variant?: Exclude<ButtonVariant, "primary">;
  size?: "sm" | "md";
}

export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  className,
  type,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type ?? "button"}
      aria-label={label}
      title={label}
      className={cn(
        buttonClasses(variant, "sm"),
        "px-0",
        size === "md" ? "size-11" : "size-9",
        className,
      )}
      {...props}
    />
  );
}
