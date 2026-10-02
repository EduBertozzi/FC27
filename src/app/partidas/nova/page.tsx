import { type Metadata } from "next";
import { Suspense } from "react";

import { NewMatchView } from "@/components/match/new-match-view";

export const metadata: Metadata = { title: "Registrar partida" };

export default function NewMatchPage() {
  return (
    <Suspense>
      <NewMatchView />
    </Suspense>
  );
}
