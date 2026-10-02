import { type Metadata } from "next";

import { IdeasView } from "@/components/ideas/ideas-view";

export const metadata: Metadata = { title: "Estou sem ideia" };

export default function IdeasPage() {
  return <IdeasView />;
}
