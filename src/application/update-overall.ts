import { z } from "zod";

import { type Career } from "@/domain/career/career";
import { type TimelineEvent } from "@/domain/timeline/events";
import { type Result, AppError, err, ok } from "@/lib/result";

import { seasonLabelFor } from "./create-career";

export const overallUpdateSchema = z.object({
  overall: z
    .number({ message: "Informe o overall" })
    .int("Use um número inteiro")
    .min(40, "Mínimo 40")
    .max(99, "Máximo 99"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data"),
  /** Valor de mercado em euros, quando o jogo mostrar um novo. */
  marketValue: z
    .number()
    .int()
    .min(0, "Valor não pode ser negativo")
    .max(500_000_000, "Valor acima do limite")
    .optional(),
});

export type OverallUpdateInput = z.infer<typeof overallUpdateSchema>;

const HIGHLIGHT_MARKS = [70, 75, 80, 85, 90, 95];

export interface UpdateOverallOutcome {
  career: Career;
  previous: number;
  event: TimelineEvent | null;
}

/**
 * Caso de uso: o overall mudou no jogo. Atualiza o jogador, registra o ponto
 * no histórico (substitui se já houver um na mesma data) e cria um evento de
 * timeline quando o valor muda.
 */
export function updateOverall(
  career: Career,
  rawInput: unknown,
  createId: (prefix: string) => string,
): Result<UpdateOverallOutcome, AppError> {
  const parsed = overallUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return err(
      new AppError("VALIDATION", "Dados de overall inválidos", {
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      }),
    );
  }
  const { overall, date, marketValue } = parsed.data;
  const previous = career.player.overall;

  const history = [...career.overallHistory.filter((p) => p.date !== date), { date, overall }].sort(
    (a, b) => a.date.localeCompare(b.date),
  );

  let event: TimelineEvent | null = null;
  if (overall !== previous) {
    const up = overall > previous;
    const crossed = up && HIGHLIGHT_MARKS.some((mark) => previous < mark && overall >= mark);
    event = {
      id: createId("evt"),
      type: "milestone",
      date,
      season: seasonLabelFor(date),
      title: up ? `Overall sobe para ${overall}` : `Overall cai para ${overall}`,
      description: `De ${previous} para ${overall}.`,
      highlight: crossed,
    };
  }

  return ok({
    previous,
    event,
    career: {
      ...career,
      player: { ...career.player, overall },
      overallHistory: history,
      marketValue: marketValue ?? career.marketValue,
      events: event ? [...career.events, event] : career.events,
    },
  });
}
