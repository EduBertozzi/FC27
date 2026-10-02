import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface LegendItem {
  label: string;
  colorClass: string;
}

/** Moldura comum: legenda (quando ≥2 séries), gráfico e tabela alternativa acessível. */
export function ChartFrame({
  legend,
  table,
  tableLabel = "Ver dados em tabela",
  children,
  className,
}: {
  legend?: LegendItem[];
  table?: ReactNode;
  tableLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("flex min-w-0 flex-col gap-3", className)}>
      {legend && legend.length > 1 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-2" aria-label="Legenda">
          {legend.map((item) => (
            <li key={item.label} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-[3px]", item.colorClass)} aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      {children}
      {table ? (
        <details className="group text-sm">
          <summary className="inline-flex min-h-9 items-center text-xs font-medium text-fg-3 hover:text-fg-2">
            {tableLabel}
          </summary>
          <div className="mt-2 max-h-64 overflow-auto rounded-sm border border-line">{table}</div>
        </details>
      ) : null}
    </figure>
  );
}

export function ChartTooltip({
  x,
  y,
  width,
  children,
}: {
  x: number;
  y: number;
  width: number;
  children: ReactNode;
}) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-sm bg-surface-3 px-2.5 py-1.5 text-xs whitespace-nowrap text-fg shadow-(--shadow-pop)"
      style={{ left, top: y - 10 }}
    >
      {children}
    </div>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="tabular w-full text-left text-xs">
      <thead className="sticky top-0 bg-surface-2 text-fg-3">
        <tr>
          {head.map((h) => (
            <th key={h} scope="col" className="px-3 py-2 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-fg-2">
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-line">
            {row.map((cell, j) => (
              <td key={j} className="px-3 py-1.5">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
