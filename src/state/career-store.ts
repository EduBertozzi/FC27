"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createCareer } from "@/application/create-career";
import { type RegisterMatchOutcome, registerMatch } from "@/application/register-match";
import { type UpdateOverallOutcome, updateOverall } from "@/application/update-overall";
import { type Career } from "@/domain/career/career";
import { createDemoCareer, DEMO_CAREER_ID, DEMO_TODAY } from "@/data/mock-career";
import { createId } from "@/lib/id";
import { logger } from "@/lib/logger";
import { type AppError, type Result } from "@/lib/result";

/**
 * Estado da Fase 1: carreiras persistidas no localStorage do navegador.
 * Toda regra de negócio vive nos casos de uso (`src/application`); a store só
 * orquestra e persiste. Na Fase 2 a persistência migra para a API/banco sem
 * mudar a interface pública desta store.
 */
interface CareerState {
  careers: Record<string, Career>;
  activeCareerId: string;
  setActiveCareer: (id: string) => void;
  registerMatch: (input: unknown) => Result<RegisterMatchOutcome, AppError>;
  createCareer: (input: unknown) => Result<Career, AppError>;
  updateOverall: (input: unknown) => Result<UpdateOverallOutcome, AppError>;
  resetDemo: () => void;
}

const STORAGE_KEY = "fccc:careers";
const STORAGE_VERSION = 1;

function initialCareers(): Pick<CareerState, "careers" | "activeCareerId"> {
  const demo = createDemoCareer();
  return { careers: { [demo.id]: demo }, activeCareerId: demo.id };
}

/** Data "de hoje" no mundo do jogo: a carreira demo vive em janeiro de 2027. */
export function gameToday(career: Career): string {
  if (career.id === DEMO_CAREER_ID) return DEMO_TODAY;
  const lastMatch = career.matches
    .map((m) => m.date)
    .sort()
    .at(-1);
  return lastMatch ?? career.createdAt;
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set, get) => ({
      ...initialCareers(),
      setActiveCareer: (id) => {
        if (get().careers[id]) set({ activeCareerId: id });
      },
      registerMatch: (input) => {
        const career = get().careers[get().activeCareerId];
        if (!career) throw new Error("Nenhuma carreira ativa");
        const result = registerMatch(career, input, createId);
        if (result.ok) {
          set((s) => ({ careers: { ...s.careers, [career.id]: result.value.career } }));
          logger.info("match.registered", { careerId: career.id, matchId: result.value.match.id });
        } else {
          logger.warn("match.validation_failed", result.error.details);
        }
        return result;
      },
      createCareer: (input) => {
        const today = new Date().toISOString().slice(0, 10);
        const result = createCareer(input, { today, createId });
        if (result.ok) {
          set((s) => ({
            careers: { ...s.careers, [result.value.id]: result.value },
            activeCareerId: result.value.id,
          }));
          logger.info("career.created", { careerId: result.value.id });
        }
        return result;
      },
      updateOverall: (input) => {
        const career = get().careers[get().activeCareerId];
        if (!career) throw new Error("Nenhuma carreira ativa");
        const result = updateOverall(career, input, createId);
        if (result.ok) {
          set((s) => ({ careers: { ...s.careers, [career.id]: result.value.career } }));
          logger.info("overall.updated", {
            careerId: career.id,
            overall: result.value.career.player.overall,
          });
        }
        return result;
      },
      resetDemo: () => set(initialCareers()),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ careers: s.careers, activeCareerId: s.activeCareerId }),
      skipHydration: true,
    },
  ),
);

export function useActiveCareer(): Career {
  const career = useCareerStore((s) => s.careers[s.activeCareerId]);
  // A carreira demo sempre existe após a inicialização; o fallback protege dados corrompidos.
  return career ?? createDemoCareer();
}

const subscribeHydration = (onChange: () => void) =>
  useCareerStore.persist.onFinishHydration(onChange);
const getHydrated = () => useCareerStore.persist.hasHydrated();
// No servidor não há localStorage (nem a API `persist`): o snapshot do servidor é sempre `false`,
// garantindo que o HTML do servidor e o primeiro render do cliente coincidam.
const getServerHydrated = () => false;

/** `true` depois que a store leu o localStorage — evita mostrar dados errados por um frame. */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, getHydrated, getServerHydrated);
}

/** Dispara a leitura do armazenamento local uma vez, no cliente. Montado pelo AppShell. */
export function StoreHydrator() {
  useEffect(() => {
    if (!useCareerStore.persist.hasHydrated()) void useCareerStore.persist.rehydrate();
  }, []);
  return null;
}
