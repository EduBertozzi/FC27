import { cn } from "@/lib/cn";

/** Marca: braçadeira de capitão — "a carreira é sua". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect x="2" y="9" width="28" height="14" rx="3" fill="var(--accent)" />
      <path
        d="M2 12.5h28M2 19.5h28"
        stroke="var(--on-accent)"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <path
        d="M19.2 12.6a4.4 4.4 0 1 0 0 6.8"
        fill="none"
        stroke="var(--on-accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-xl leading-none font-bold tracking-wide text-fg">
        FC Career <span className="font-medium text-fg-2">Companion</span>
      </span>
    </span>
  );
}
