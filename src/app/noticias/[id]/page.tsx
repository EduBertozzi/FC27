import { type Metadata } from "next";

import { ArticleView } from "@/components/news/news-view";

export const metadata: Metadata = { title: "Notícia" };

export default async function ArticlePage({ params }: PageProps<"/noticias/[id]">) {
  const { id } = await params;
  return <ArticleView id={id} />;
}
