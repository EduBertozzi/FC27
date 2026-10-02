import { cn } from "@/lib/cn";

/** Parte-do-todo de V/E/D em barra única: rótulo + número em cada segmento. */
export function ResultsBar({
  wins,
  draws,
  losses,
  className,
}: {
  wins: number;
  draws: number;
  losses: number;
  className?: string;
}) {
  const total = wins + draws + losses;
  if (total === 0) return null;
  const segments = [
    { key: "V", label: "Vitórias", value: wins, cls: "bg-win" },
    { key: "E", label: "Empates", value: draws, cls: "bg-draw" },
    { key: "D", label: "Derrotas", value: losses, cls: "bg-loss" },
  ];
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className="flex h-3 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={`${wins} vitórias, ${draws} empates, ${losses} derrotas`}
      >
        {segments.map((s) =>
          s.value > 0 ? (
            <span
              key={s.key}
              className={cn("h-full first:rounded-l-full last:rounded-r-full", s.cls)}
              style={{ flexGrow: s.value }}
            />
          ) : null,
        )}
      </div>
      <dl className="flex justify-between text-xs" aria-hidden="true">
        {segments.map((s) => (
          <div key={s.key} className="flex items-baseline gap-1.5">
            <dt className="text-fg-3">{s.label}</dt>
            <dd className="tabular font-display text-base font-semibold text-fg">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
