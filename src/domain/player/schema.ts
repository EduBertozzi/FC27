import { z } from "zod";

import { findArchetype } from "./archetypes";
import { findNationality } from "./nationalities";
import { POSITION_CODES } from "./positions";

/** Esquemas por etapa do criador de carreira — a UI valida cada etapa isoladamente. */
export const identityStepSchema = z.object({
  firstName: z.string().trim().min(2, "Mínimo de 2 letras").max(30, "Máximo de 30 caracteres"),
  lastName: z.string().trim().min(2, "Mínimo de 2 letras").max(30, "Máximo de 30 caracteres"),
  nickname: z.string().trim().max(20, "Máximo de 20 caracteres").optional(),
  nationalityCode: z.string().refine((c) => !!findNationality(c), "Escolha uma nacionalidade"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de nascimento")
    .refine((d) => {
      const year = Number(d.slice(0, 4));
      return year >= 1980 && year <= 2012;
    }, "A idade deve ficar entre 15 e 45 anos"),
});

export const profileStepSchema = z.object({
  position: z.enum(POSITION_CODES, { message: "Escolha uma posição" }),
  preferredFoot: z.enum(["right", "left", "both"], { message: "Escolha o pé dominante" }),
  heightCm: z
    .number({ message: "Informe a altura" })
    .int()
    .min(150, "Mínimo de 1,50 m")
    .max(210, "Máximo de 2,10 m"),
  shirtNumber: z
    .number({ message: "Informe o número" })
    .int()
    .min(1, "Entre 1 e 99")
    .max(99, "Entre 1 e 99"),
});

export const clubStepSchema = z.object({
  club: z.string().trim().min(2, "Informe o clube inicial").max(40, "Máximo de 40 caracteres"),
  overall: z
    .number({ message: "Informe o overall" })
    .int()
    .min(40, "Mínimo 40")
    .max(99, "Máximo 99"),
  archetypeId: z.string().refine((id) => !!findArchetype(id), "Escolha um arquétipo"),
});

export const MAX_OBJECTIVES = 8;
export const MAX_OBJECTIVE_LENGTH = 120;

/**
 * Um texto pode conter vários objetivos, separados por vírgula, ponto e vírgula
 * ou quebra de linha. Cada parte vira um objetivo independente na carreira.
 */
export function splitObjectives(text: string): string[] {
  return text
    .split(/[\n;,]+/)
    .map((part) => part.trim().replace(/\.$/, ""))
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
}

export const goalStepSchema = z.object({
  objective: z
    .string()
    .trim()
    .min(4, "Descreva pelo menos um objetivo")
    .max(1000, "Texto longo demais — resuma os objetivos")
    .superRefine((text, ctx) => {
      const items = splitObjectives(text);
      if (items.length > MAX_OBJECTIVES) {
        ctx.addIssue({
          code: "custom",
          message: `Escolha até ${MAX_OBJECTIVES} objetivos (você listou ${items.length})`,
        });
      }
      const long = items.find((item) => item.length > MAX_OBJECTIVE_LENGTH);
      if (long) {
        ctx.addIssue({
          code: "custom",
          message: `Cada objetivo pode ter até ${MAX_OBJECTIVE_LENGTH} caracteres. Separe-os com vírgula: "${long.slice(0, 40)}…"`,
        });
      }
    }),
  challenge: z.string().trim().max(200, "Máximo de 200 caracteres").optional(),
});

export const newCareerSchema = identityStepSchema
  .merge(profileStepSchema)
  .merge(clubStepSchema)
  .merge(goalStepSchema);

export type NewCareerInput = z.infer<typeof newCareerSchema>;
