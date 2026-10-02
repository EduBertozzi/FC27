import { type Metadata } from "next";

import { CareerView } from "@/components/career/career-view";

export const metadata: Metadata = { title: "Painel da carreira" };

export default function CareerPage() {
  return <CareerView />;
}
