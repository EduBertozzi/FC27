"use client";

import { useState } from "react";

import { type RatingPoint } from "@/domain/stats/stats";
import { useElementWidth } from "@/hooks/use-element-width";
import { formatDate, formatRating } from "@/lib/format";

import { ChartFrame, ChartTooltip, DataTable } from "./chart-frame";

const HEIGHT = 200;
const PAD = { top: 22, right: 12, bottom: 24, left: 28 };

/** Nota por partida com linha de média. Uma série → sem legenda; o título nomeia. */
export function RatingChart({
  points,
  average,
}: {
  points: RatingPoint[];
  average: number | null;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const min = Math.min(5, ...points.map((p) => Math.floor(p.rating)));
  const max = 10;
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * innerH;
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i).filter((t) =>
    max - min > 5 ? t % 2 === 0 : true,
  );
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.rating).toFixed(1)}`)
    .join(" ");
  const activePoint = active !== null ? points[active] : undefined;

  return (
    <ChartFrame
      table={
        <DataTable
          head={["Data", "Adversário", "Nota"]}
          rows={points.map((p) => [formatDate(p.date), p.opponent, formatRating(p.rating)])}
        />
      }
    >
      <div ref={ref} className="relative w-full min-w-0 overflow-hidden">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Nota por partida: ${points.length} jogos, média ${formatRating(average)}`}
          onPointerLeave={() => setActive(null)}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const px = e.clientX - rect.left - PAD.left;
            const i = Math.round((px / innerW) * (points.length - 1));
            setActive(Math.min(points.length - 1, Math.max(0, i)));
          }}
          className="block touch-pan-y"
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
          {average !== null ? (
            <g>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(average)}
                y2={y(average)}
                stroke="var(--fg-3)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={width - PAD.right}
                y={10}
                textAnchor="end"
                className="fill-fg-2 text-[11px] font-medium"
              >
                - - média {formatRating(average)}
              </text>
            </g>
          ) : null}
          <path
            d={path}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {activePoint && active !== null ? (
            <g>
              <line
                x1={x(active)}
                x2={x(active)}
                y1={PAD.top}
                y2={HEIGHT - PAD.bottom}
                stroke="var(--line-strong)"
                strokeWidth="1"
              />
              <circle
                cx={x(active)}
                cy={y(activePoint.rating)}
                r="5"
                fill="var(--accent)"
                stroke="var(--bg)"
                strokeWidth="2"
              />
            </g>
          ) : points.length > 0 ? (
            <circle
              cx={x(points.length - 1)}
              cy={y(points.at(-1)!.rating)}
              r="4"
              fill="var(--accent)"
              stroke="var(--bg)"
              strokeWidth="2"
            />
          ) : null}
          {points.length > 0 ? (
            <>
              <text x={PAD.left} y={HEIGHT - 6} className="fill-fg-3 text-[11px]">
                {formatDate(points[0]!.date)}
              </text>
              <text
                x={width - PAD.right}
                y={HEIGHT - 6}
                textAnchor="end"
                className="fill-fg-3 text-[11px]"
              >
                {formatDate(points.at(-1)!.date)}
              </text>
            </>
          ) : null}
        </svg>
        {activePoint && active !== null ? (
          <ChartTooltip x={x(active)} y={y(activePoint.rating)} width={width}>
            <span className="font-semibold">{formatRating(activePoint.rating)}</span>
            <span className="text-fg-3">
              {" "}
              vs {activePoint.opponent} · {formatDate(activePoint.date)}
            </span>
          </ChartTooltip>
        ) : null}
      </div>
    </ChartFrame>
  );
}
