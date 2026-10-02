"use client";

import { create } from "zustand";

import { type CareerConcept } from "@/domain/ideas/generators";
import { type NewCareerInput } from "@/domain/player/schema";

export type CareerDraft = Partial<NewCareerInput>;

interface DraftState {
  draft: CareerDraft | null;
  source: "surprise" | "ideas" | null;
  setDraft: (draft: CareerDraft, source: "surprise" | "ideas") => void;
  clear: () => void;
}

/** Rascunho efêmero que leva uma ideia gerada até o criador de carreira. */
export const useCareerDraft = create<DraftState>((set) => ({
  draft: null,
  source: null,
  setDraft: (draft, source) => set({ draft, source }),
  clear: () => set({ draft: null, source: null }),
}));

export function conceptToDraft(concept: CareerConcept, today = new Date()): CareerDraft {
  const birthYear = today.getUTCFullYear() - concept.age;
  return {
    firstName: concept.firstName,
    lastName: concept.lastName,
    nickname: concept.nickname,
    nationalityCode: concept.nationality.code,
    birthDate: `${birthYear}-03-01`,
    position: concept.position.code,
    preferredFoot: concept.preferredFoot,
    heightCm: concept.heightCm,
    club: concept.club.name,
    overall: concept.overall,
    archetypeId: concept.archetype.id,
    objective: concept.objective,
    challenge: concept.challenge.rule,
  };
}
