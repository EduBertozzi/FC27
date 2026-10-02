import { type Metadata } from "next";

import { CreatorView } from "@/components/creator/creator-view";

export const metadata: Metadata = { title: "Nova carreira" };

export default function NewCareerPage() {
  return <CreatorView />;
}
