import { cn } from "@/lib/cn";

/** Marca: braçadeira de capitão — "a carreira é sua". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#ffffff" />
      <rect x="6" y="11" width="20" height="10" rx="2.5" fill="var(--bg)" />
      <path
        d="M18.4 13.6a3.3 3.3 0 1 0 0 4.8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-tight">
        <span className="text-[1.0625rem] font-semibold tracking-tight text-fg">
          Career Companion
        </span>
        <span className="text-xs text-fg-3">Modo Carreira de Atleta</span>
      </span>
    </span>
  );
}
