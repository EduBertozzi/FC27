import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD");

/**
 * Validação do registro de partida. Regras de negócio que cruzam campos ficam
 * no `superRefine` para que a UI receba a mensagem no campo certo.
 */
export const matchInputSchema = z
  .object({
    date: isoDate,
    competition: z.string().trim().min(1, "Informe a competição").max(60),
    opponent: z.string().trim().min(1, "Informe o adversário").max(60),
    venue: z.enum(["home", "away", "neutral"]),
    goalsFor: z.number().int().min(0, "Placar não pode ser negativo").max(30),
    goalsAgainst: z.number().int().min(0, "Placar não pode ser negativo").max(30),
    role: z.enum(["starter", "substitute"]),
    minutes: z.number().int().min(1, "Mínimo de 1 minuto").max(130, "Máximo de 130 minutos"),
    goals: z.number().int().min(0).max(15),
    assists: z.number().int().min(0).max(15),
    rating: z.number().min(1, "Nota mínima 1,0").max(10, "Nota máxima 10,0").nullable(),
    yellowCards: z.number().int().min(0).max(2),
    redCard: z.boolean(),
    substitutionMinute: z.number().int().min(1).max(130).optional(),
    notes: z.string().trim().max(500, "Máximo de 500 caracteres").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.goals > value.goalsFor) {
      ctx.addIssue({
        code: "custom",
        path: ["goals"],
        message: `Seus gols (${value.goals}) não podem passar do placar do time (${value.goalsFor})`,
      });
    }
    // Ninguém dá assistência para o próprio gol: gols + assistências ≤ gols do time.
    if (value.goals <= value.goalsFor && value.goals + value.assists > value.goalsFor) {
      ctx.addIssue({
        code: "custom",
        path: ["assists"],
        message: `Gols + assistências (${value.goals + value.assists}) passam do placar do time (${value.goalsFor})`,
      });
    }
  });

export type MatchInput = z.infer<typeof matchInputSchema>;
