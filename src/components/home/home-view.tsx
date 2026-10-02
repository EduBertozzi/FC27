"use client";

import { CareerGate, PageContainer } from "@/components/layout/page";
import {
  LastResultCard,
  NewsPreviewCard,
  NextMatchCard,
  ObjectivesCard,
  RecentEventsCard,
} from "@/components/home/home-cards";
import { PlayerHero } from "@/components/home/player-hero";
import { useActiveCareer } from "@/state/career-store";
import { useCareerOverview } from "@/state/selectors";

function Home() {
  const career = useActiveCareer();
  const overview = useCareerOverview(career);
  return (
    <div className="flex flex-col gap-5">
      <PlayerHero
        career={career}
        season={overview.season}
        form={overview.form}
        today={overview.today}
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <NextMatchCard fixture={overview.next} club={career.currentClub} />
        <LastResultCard match={overview.lastMatch} club={career.currentClub} />
        <ObjectivesCard objectives={career.objectives} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <NewsPreviewCard career={career} />
        <RecentEventsCard career={career} />
      </div>
    </div>
  );
}

export function HomeView() {
  return (
    <PageContainer>
      <CareerGate>
        <Home />
      </CareerGate>
    </PageContainer>
  );
}
