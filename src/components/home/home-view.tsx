"use client";

import { type Objective } from "@/domain/career/career";
import { useActiveCareer } from "@/state/career-store";
import { useCareerOverview } from "@/state/selectors";

import { CareerGate, PageContainer } from "../layout/page";
import { Reveal } from "../motion/reveal";
import {
  FormWidget,
  LastResultCard,
  NewsPreviewCard,
  NextMatchCard,
  ObjectivesCard,
  RecentEventsCard,
  StatWidget,
} from "./home-cards";
import { PlayerHero } from "./player-hero";

function goalFor(objectives: Objective[], metric: Objective["metric"]) {
  return objectives.find((o) => o.metric === metric && o.status !== "failed");
}

function Home() {
  const career = useActiveCareer();
  const { season, form, lastMatch, next, today } = useCareerOverview(career);
  return (
    <Reveal className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12">
      <PlayerHero career={career} today={today} />
      <div className="col-span-2 grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7 lg:row-span-2">
        <StatWidget
          label="Gols"
          value={season.goals}
          goal={goalFor(career.objectives, "season-goals")}
          sub={`${season.appearances} jogos`}
        />
        <StatWidget
          label="Assistências"
          value={season.assists}
          goal={goalFor(career.objectives, "season-assists")}
          sub={`${season.appearances} jogos`}
        />
        <StatWidget
          label="Nota média"
          value={season.averageRating}
          decimals={1}
          sub={`${season.appearances} jogos · ${season.starts} como titular`}
        />
        <FormWidget results={form} />
      </div>
      <NextMatchCard
        fixture={next}
        club={career.currentClub}
        today={today}
        className="col-span-2 lg:col-span-6"
      />
      <LastResultCard
        match={lastMatch}
        club={career.currentClub}
        className="col-span-2 lg:col-span-6"
      />
      <NewsPreviewCard career={career} className="col-span-2 lg:col-span-7" />
      <ObjectivesCard objectives={career.objectives} className="col-span-2 lg:col-span-5" />
      <RecentEventsCard career={career} className="col-span-2 lg:col-span-12" />
    </Reveal>
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
