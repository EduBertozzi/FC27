import { type Metadata } from "next";

import { NewsView } from "@/components/news/news-view";

export const metadata: Metadata = { title: "Notícias" };

export default function NewsPage() {
  return <NewsView />;
}
