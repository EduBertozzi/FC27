/**
 * Formatação determinística em pt-BR. Datas usam timeZone UTC para que o HTML
 * do servidor e o do cliente sejam idênticos (sem erro de hidratação).
 */
const LOCALE = "pt-BR";

const dateFormatters = {
  short: new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "short", timeZone: "UTC" }),
  long: new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  monthYear: new Intl.DateTimeFormat(LOCALE, { month: "short", year: "numeric", timeZone: "UTC" }),
  weekday: new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }),
} as const;

export type DateStyle = keyof typeof dateFormatters;

export function formatDate(iso: string, style: DateStyle = "short"): string {
  return dateFormatters[style].format(new Date(iso)).replace(/\.$/, "").replace(" de ", " ");
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatRating(value: number | null): string {
  return value === null ? "–" : formatNumber(value, 1);
}

/** 42_500_000 → "€ 42,5 mi" */
export function formatMarketValue(eur: number): string {
  if (eur >= 1_000_000)
    return `€ ${formatNumber(eur / 1_000_000, eur % 1_000_000 === 0 ? 0 : 1)} mi`;
  if (eur >= 1_000) return `€ ${formatNumber(eur / 1_000)} mil`;
  return `€ ${formatNumber(eur)}`;
}

export function formatHeight(cm: number): string {
  return `${formatNumber(cm / 100, 2)} m`;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
