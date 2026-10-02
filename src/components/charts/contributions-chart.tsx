"use client";

import { useState } from "react";

import { type MonthlyBucket } from "@/domain/stats/stats";
import { useElementWidth } from "@/hooks/use-element-width";

import { ChartFrame, ChartTooltip, DataTable } from "./chart-frame";

const HEIGHT = 200;
const PAD = { top: 12, right: 8, bottom: 24, left: 24 };
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function monthLabel(month: string) {
  return MONTHS[Number(month.slice(5, 7)) - 1] ?? month;
}

/** Gols e assistências por mês — barras agrupadas, cantos de 4px na ponta, 2px de respiro. */
export function ContributionsChart({ data }: { data: MonthlyBucket[] }) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(2, ...data.flatMap((d) => [d.goals, d.assists]));
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const band = innerW / Math.max(1, data.length);
  const barW = Math.min(18, (band - 10) / 2);
  const y = (v: number) => PAD.top + (1 - v / max) * innerH;
  const ticks = Array.from({ length: max + 1 }, (_, i) => i).filter((t) =>
    max > 6 ? t % 2 === 0 : true,
  );
  const activeBucket = active !== null ? data[active] : undefined;

  const bar = (cx: number, value: number, fill: string) => {
    if (value === 0) return null;
    const top = y(value);
    const h = HEIGHT - PAD.bottom - top;
    const r = Math.min(4, h);
    return (
      <path
        d={`M${cx},${HEIGHT - PAD.bottom} V${top + r} q0,-${r} ${r},-${r} h${barW - 2 * r} q${r},0 ${r},${r} V${HEIGHT - PAD.bottom} Z`}
        fill={fill}
      />
    );
  };

  return (
    <ChartFrame
      legend={[
        { label: "Gols", colorClass: "bg-chart-1" },
        { label: "Assistências", colorClass: "bg-chart-2" },
      ]}
      table={
        <DataTable
          head={["Mês", "Jogos", "Gols", "Assistências"]}
          rows={data.map((d) => [d.month, d.appearances, d.goals, d.assists])}
        />
      }
    >
      <div ref={ref} className="relative w-full min-w-0 overflow-hidden">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label="Gols e assistências por mês"
          className="block"
          onPointerLeave={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--chart-grid)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="tabular fill-fg-3 text-[11px]"
              >
                {t}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const center = PAD.left + band * i + band / 2;
            return (
              <g key={d.month} onPointerEnter={() => setActive(i)}>
                <rect
                  x={PAD.left + band * i}
                  y={PAD.top}
                  width={band}
                  height={innerH}
                  fill={active === i ? "rgb(255 255 255 / 0.04)" : "transparent"}
                />
                {bar(center - barW - 1, d.goals, "var(--chart-1)")}
                {bar(center + 1, d.assists, "var(--chart-2)")}
                <text
                  x={center}
                  y={HEIGHT - 6}
                  textAnchor="middle"
                  className="fill-fg-3 text-[11px]"
                >
                  {monthLabel(d.month)}
                </text>
              </g>
            );
          })}
        </svg>
        {activeBucket && active !== null ? (
          <ChartTooltip
            x={PAD.left + band * active + band / 2}
            y={y(Math.max(activeBucket.goals, activeBucket.assists))}
            width={width}
          >
            <span className="font-semibold capitalize">{monthLabel(activeBucket.month)}</span>
            <span className="text-fg-2">
              {" "}
              · {activeBucket.goals} G · {activeBucket.assists} A · {activeBucket.appearances} jogos
            </span>
          </ChartTooltip>
        ) : null}
      </div>
    </ChartFrame>
  );
}
