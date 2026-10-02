"use client";

import { createContext, use, useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FieldContextValue {
  id: string;
  hintId?: string;
  errorId?: string;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function useField() {
  return use(FieldContext);
}

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
  /** Esconde o rótulo visualmente (continua acessível). */
  hideLabel?: boolean;
}

/** Rótulo visível, dica e erro conectados ao controle via aria-describedby. */
export function Field({
  label,
  hint,
  error,
  optional,
  className,
  children,
  hideLabel,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <FieldContext value={{ id, hintId, errorId, invalid: !!error }}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className={cn("text-sm font-medium text-fg-2", hideLabel && "sr-only")}>
          {label}
          {optional ? <span className="ml-1 font-normal text-fg-3">(opcional)</span> : null}
        </label>
        {children}
        {hint && !error ? (
          <p id={hintId} className="text-xs text-fg-3">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-xs font-medium text-loss" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext>
  );
}

export const controlClasses = cn(
  "w-full rounded-sm border border-line bg-surface-1 px-4 text-base text-fg placeholder:text-fg-3",
  "transition-colors hover:border-line-strong focus-visible:border-white/60 focus-visible:bg-surface-2 focus-visible:ring-4 focus-visible:ring-white/10 focus-visible:outline-none",
  "disabled:opacity-60 aria-[invalid=true]:border-loss",
);

function useControlProps(props: { id?: string; "aria-describedby"?: string }) {
  const field = useField();
  if (!field) return props;
  return {
    ...props,
    id: props.id ?? field.id,
    "aria-invalid": field.invalid || undefined,
    "aria-describedby":
      [props["aria-describedby"], field.errorId ?? field.hintId].filter(Boolean).join(" ") ||
      undefined,
  };
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, "h-11", className)} {...useControlProps(props)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlClasses, "min-h-24 py-2.5 leading-relaxed", className)}
      {...useControlProps(props)}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(controlClasses, "h-11 appearance-none pr-10", className)}
        {...useControlProps(props)}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-3"
      >
        <path
          d="M5 7.5 10 12.5 15 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
