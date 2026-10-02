"use client";

import { useState } from "react";

import { type OverallPoint } from "@/domain/career/career";
import { useElementWidth } from "@/hooks/use-element-width";
import { formatDate } from "@/lib/format";

import { ChartFrame, ChartTooltip, DataTable } from "./chart-frame";

const HEIGHT = 180;
const PAD = { top: 22, right: 28, bottom: 24, left: 28 };

/** Evolução do overall em degraus — o overall muda em saltos, não continuamente. */
export function OverallChart({
  points,
  potential,
}: {
  points: OverallPoint[];
  potential?: number;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  if (points.length === 0) return null;

  const t0 = Date.parse(points[0]!.date);
  const t1 = Math.max(Date.parse(points.at(-1)!.date), t0 + 1);
  const values = points.map((p) => p.overall);
  const min = Math.floor((Math.min(...values) - 2) / 5) * 5;
  const max = Math.max(potential ?? 0, Math.max(...values) + 2);
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (date: string) => PAD.left + ((Date.parse(date) - t0) / (t1 - t0)) * innerW;
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * innerH;
  const path = points
    .map((p, i) => (i === 0 ? `M${x(p.date)},${y(p.overall)}` : `H${x(p.date)} V${y(p.overall)}`))
    .join(" ");
  const first = points[0]!;
  const last = points.at(-1)!;
  const activePoint = active !== null ? points[active] : undefined;

  return (
    <ChartFrame
      table={
        <DataTable
          head={["Data", "Overall"]}
          rows={points.map((p) => [formatDate(p.date, "monthYear"), p.overall])}
        />
      }
    >
      <div ref={ref} className="relative w-full min-w-0 overflow-hidden">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Overall de ${first.overall} para ${last.overall}`}
          className="block"
          onPointerLeave={() => setActive(null)}
        >
          {potential ? (
            <g>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(potential)}
                y2={y(potential)}
                stroke="var(--fg-3)"
                strokeDasharray="4 4"
              />
              <text x={PAD.left} y={y(potential) - 6} className="fill-fg-2 text-[11px] font-medium">
                potencial {potential}
              </text>
            </g>
          ) : null}
          <path
            d={`${path} V${HEIGHT - PAD.bottom} H${x(first.date)} Z`}
            fill="rgb(246 185 64 / 0.08)"
          />
          <path
            d={path}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <circle
              key={p.date}
              cx={x(p.date)}
              cy={y(p.overall)}
              r={active === i ? 5 : 3}
              fill="var(--accent)"
              stroke="var(--surface-1)"
              strokeWidth="2"
              onPointerEnter={() => setActive(i)}
            />
          ))}
          {points.map((p, i) => (
            <rect
              key={`hit-${p.date}`}
              x={x(p.date) - 12}
              y={PAD.top}
              width={24}
              height={innerH}
              fill="transparent"
              onPointerEnter={() => setActive(i)}
            />
          ))}
          <text
            x={x(first.date)}
            y={y(first.overall) - 10}
            textAnchor="start"
            className="fill-fg-2 font-display text-sm font-semibold"
          >
            {first.overall}
          </text>
          <text
            x={x(last.date)}
            y={y(last.overall) - 10}
            textAnchor="end"
            className="fill-accent font-display text-base font-bold"
          >
            {last.overall}
          </text>
          <text x={PAD.left} y={HEIGHT - 6} className="fill-fg-3 text-[11px]">
            {formatDate(first.date, "monthYear")}
          </text>
          <text
            x={width - PAD.right}
            y={HEIGHT - 6}
            textAnchor="end"
            className="fill-fg-3 text-[11px]"
          >
            {formatDate(last.date, "monthYear")}
          </text>
        </svg>
        {activePoint && active !== null ? (
          <ChartTooltip x={x(activePoint.date)} y={y(activePoint.overall)} width={width}>
            <span className="font-semibold">OVR {activePoint.overall}</span>
            <span className="text-fg-3"> · {formatDate(activePoint.date, "monthYear")}</span>
          </ChartTooltip>
        ) : null}
      </div>
    </ChartFrame>
  );
}
