import { type Metadata } from "next";

import { MatchesView } from "@/components/match/matches-view";

export const metadata: Metadata = { title: "Partidas" };

export default function MatchesPage() {
  return <MatchesView />;
}
