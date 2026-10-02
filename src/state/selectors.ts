"use client";

import { useMemo } from "react";

import { careerTotals } from "@/application/register-match";
import { type Career, currentSeasonMatches, nextFixture } from "@/domain/career/career";
import { sortByDateDesc } from "@/domain/match/match";
import { aggregate, recentForm } from "@/domain/stats/stats";

import { gameToday } from "./career-store";

/** Visão derivada da carreira para as telas — memoizada para evitar recomputar a cada render. */
export function useCareerOverview(career: Career) {
  return useMemo(() => {
    const today = gameToday(career);
    const seasonMatches = currentSeasonMatches(career);
    const ordered = sortByDateDesc(seasonMatches);
    return {
      today,
      seasonMatches,
      season: aggregate(seasonMatches),
      totals: careerTotals(career),
      form: recentForm(seasonMatches, 5).map((f) => f.result),
      lastMatch: ordered[0],
      next: nextFixture(career, today),
    };
  }, [career]);
}
