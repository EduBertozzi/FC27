"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { type RegisterMatchOutcome } from "@/application/register-match";
import { type Venue } from "@/domain/match/match";
import { useActiveCareer } from "@/state/career-store";
import { useCareerOverview } from "@/state/selectors";

import { CareerGate, PageContainer, PageHeader } from "../layout/page";
import { toast } from "../ui/toast";
import { MatchForm } from "./match-form";
import { type MatchFormValues } from "./match-form-state";
import { MatchSaved } from "./match-saved";

const VENUES: Venue[] = ["home", "away", "neutral"];

function NewMatch() {
  const career = useActiveCareer();
  const { today } = useCareerOverview(career);
  const params = useSearchParams();
  const [outcome, setOutcome] = useState<RegisterMatchOutcome | null>(null);
  const [formKey, setFormKey] = useState(0);

  const venue = params.get("mando") as Venue | null;
  const prefill: Partial<MatchFormValues> = {
    ...(params.get("adversario") ? { opponent: params.get("adversario") ?? "" } : {}),
    ...(params.get("competicao") ? { competition: params.get("competicao") ?? "" } : {}),
    ...(params.get("data") ? { date: params.get("data") ?? today } : {}),
    ...(venue && VENUES.includes(venue) ? { venue } : {}),
  };

  if (outcome) {
    return (
      <MatchSaved
        outcome={outcome}
        onAnother={() => {
          setOutcome(null);
          setFormKey((k) => k + 1);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Registrar partida"
        description={`${career.currentClub} · temporada ${career.currentSeason}. Leva menos de um minuto.`}
      />
      <MatchForm
        key={formKey}
        career={career}
        today={today}
        prefill={formKey === 0 ? prefill : undefined}
        startWithVoice={formKey === 0 && params.get("modo") === "voz"}
        onSaved={(o) => {
          setOutcome(o);
          toast("Partida registrada", `Estatísticas de ${career.currentSeason} atualizadas.`);
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
}

export function NewMatchView() {
  return (
    <PageContainer width="narrow">
      <CareerGate>
        <NewMatch />
      </CareerGate>
    </PageContainer>
  );
}
