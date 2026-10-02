import { cn } from "@/lib/cn";

const SIZES = {
  sm: { box: "h-11 min-w-11 rounded-[12px] px-1.5", num: "text-lg", label: "text-[0.55rem]" },
  md: { box: "h-16 min-w-16 rounded-[18px] px-2", num: "text-3xl", label: "text-[0.65rem]" },
  lg: { box: "h-22 min-w-22 rounded-[24px] px-3", num: "text-5xl", label: "text-xs" },
} as const;

/** Overall em bloco branco — o número mais importante da carreira. */
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
      role="img"
      aria-label={`Overall ${value}`}
      className={cn(
        "inline-flex shrink-0 flex-col items-center justify-center bg-white text-on-accent shadow-[0_10px_30px_rgb(0_0_0/0.35)]",
        s.box,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("tabular leading-none font-bold tracking-tight", s.num)}
      >
        {value}
      </span>
      <span
        aria-hidden="true"
        className={cn("mt-0.5 font-semibold tracking-wider opacity-70", s.label)}
      >
        OVR
      </span>
    </span>
  );
}
