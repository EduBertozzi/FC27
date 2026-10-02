import { z } from "zod";

import { findArchetype } from "./archetypes";
import { findNationality } from "./nationalities";
import { POSITION_CODES } from "./positions";

/** Esquemas por etapa do criador de carreira — a UI valida cada etapa isoladamente. */
export const identityStepSchema = z.object({
  firstName: z.string().trim().min(2, "Mínimo de 2 letras").max(30),
  lastName: z.string().trim().min(2, "Mínimo de 2 letras").max(30),
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
  preferredFoot: z.enum(["right", "left", "both"]),
  heightCm: z.number().int().min(150, "Mínimo de 1,50 m").max(210, "Máximo de 2,10 m"),
  shirtNumber: z.number().int().min(1, "Entre 1 e 99").max(99, "Entre 1 e 99"),
});

export const clubStepSchema = z.object({
  club: z.string().trim().min(2, "Informe o clube inicial").max(40),
  overall: z.number().int().min(40, "Mínimo 40").max(99, "Máximo 99"),
  archetypeId: z.string().refine((id) => !!findArchetype(id), "Escolha um arquétipo"),
});

export const goalStepSchema = z.object({
  objective: z.string().trim().min(4, "Descreva seu objetivo").max(120),
  challenge: z.string().trim().max(160).optional(),
});

export const newCareerSchema = identityStepSchema
  .merge(profileStepSchema)
  .merge(clubStepSchema)
  .merge(goalStepSchema);

export type NewCareerInput = z.infer<typeof newCareerSchema>;
