import {
  clubStepSchema,
  goalStepSchema,
  identityStepSchema,
  type NewCareerInput,
  profileStepSchema,
} from "@/domain/player/schema";

export type CreatorValues = {
  firstName: string;
  lastName: string;
  nickname: string;
  nationalityCode: string;
  birthDate: string;
  position: NewCareerInput["position"] | undefined;
  preferredFoot: NewCareerInput["preferredFoot"];
  heightCm: number;
  shirtNumber: number;
  club: string;
  overall: number;
  archetypeId: string;
  objective: string;
  challenge: string;
};

export const EMPTY_CREATOR: CreatorValues = {
  firstName: "",
  lastName: "",
  nickname: "",
  nationalityCode: "",
  birthDate: "",
  position: undefined,
  preferredFoot: "right",
  heightCm: 180,
  shirtNumber: 9,
  club: "",
  overall: 62,
  archetypeId: "",
  objective: "",
  challenge: "",
};

export const STEPS = [
  { id: "identity", title: "Identidade", schema: identityStepSchema },
  { id: "profile", title: "Perfil em campo", schema: profileStepSchema },
  { id: "club", title: "Clube e nível", schema: clubStepSchema },
  { id: "goal", title: "Objetivo", schema: goalStepSchema },
] as const;

export type StepErrors = Partial<Record<keyof CreatorValues, string>>;

export function validateStep(index: number, values: CreatorValues): StepErrors {
  const step = STEPS[index];
  if (!step) return {};
  const parsed = step.schema.safeParse({
    ...values,
    nickname: values.nickname || undefined,
    challenge: values.challenge || undefined,
  });
  if (parsed.success) return {};
  const errors: StepErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof CreatorValues;
    errors[key] ??= issue.message;
  }
  return errors;
}

export function toCareerInput(values: CreatorValues): Record<string, unknown> {
  return {
    ...values,
    nickname: values.nickname || undefined,
    challenge: values.challenge || undefined,
  };
}
