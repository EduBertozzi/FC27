import { cn } from "@/lib/cn";

const SIZES = {
  sm: { box: "h-10 w-9", num: "text-lg", label: "text-[0.55rem]" },
  md: { box: "h-16 w-14", num: "text-3xl", label: "text-[0.65rem]" },
  lg: { box: "h-24 w-20", num: "text-5xl", label: "text-xs" },
} as const;

/** Overall em selo dourado — o elemento de progressão mais reconhecível do app. */
export function OverallSeal({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 flex-col items-center justify-center text-on-accent",
        s.box,
        className,
      )}
      role="img"
      aria-label={`Overall ${value}`}
    >
      <svg
        viewBox="0 0 56 64"
        className="absolute inset-0 size-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path d="M28 1 54 10v26c0 14-11 23-26 27C13 59 2 50 2 36V10z" fill="var(--accent)" />
      </svg>
      <span
        className={cn("tabular relative font-display leading-none font-bold", s.num)}
        aria-hidden="true"
      >
        {value}
      </span>
      <span className={cn("relative font-semibold tracking-wider", s.label)} aria-hidden="true">
        OVR
      </span>
    </span>
  );
}
