import { AlertTriangle, CheckCircle2, Info, RotateCcw } from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Button } from "./button";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-shimmer rounded-sm bg-[linear-gradient(90deg,var(--surface-2)_0%,var(--surface-3)_50%,var(--surface-2)_100%)] bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/** Estado vazio como convite à ação — explica o que aparece aqui e como começar. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <div
        className="grid size-14 place-items-center rounded-full border border-dashed border-line-strong text-fg-3 [&_svg]:size-6"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-fg">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-fg-3">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center px-6 py-10 text-center", className)}
    >
      <div
        className="grid size-14 place-items-center rounded-full bg-loss-soft text-loss"
        aria-hidden="true"
      >
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-fg">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-fg-3">{description}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Tentar de novo
        </Button>
      ) : null}
    </div>
  );
}

const ALERT_TONE = {
  info: { icon: Info, className: "border-ai/30 bg-ai-soft text-ai" },
  success: { icon: CheckCircle2, className: "border-win/30 bg-win-soft text-win" },
  warning: { icon: AlertTriangle, className: "border-accent/30 bg-accent-soft text-accent" },
  error: { icon: AlertTriangle, className: "border-loss/30 bg-loss-soft text-loss" },
} as const;

export function InlineAlert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof ALERT_TONE;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClass } = ALERT_TONE[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-sm border px-3.5 py-3 text-sm", toneClass, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 text-fg-2">
        {title ? <p className="font-semibold text-fg">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function Spinner({
  className,
  label = "Carregando",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5 animate-spin", className)}
      role="img"
      aria-label={label}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
