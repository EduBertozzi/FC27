import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface StatProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  emphasis?: boolean;
  className?: string;
}

/** Número em destaque com rótulo — o número é o gráfico. */
export function Stat({ label, value, sub, emphasis, className }: StatProps) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <dt className="order-2 truncate text-xs font-medium text-fg-3 sm:text-sm">{label}</dt>
      <dd
        className={cn(
          "tabular order-1 font-display leading-none font-semibold",
          emphasis ? "text-4xl text-accent" : "text-3xl text-fg",
        )}
      >
        {value}
      </dd>
      {sub ? <dd className="order-3 mt-0.5 truncate text-xs text-fg-3">{sub}</dd> : null}
    </div>
  );
}

export function StatGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <dl className={cn("grid gap-x-4 gap-y-5", className)}>{children}</dl>;
}
