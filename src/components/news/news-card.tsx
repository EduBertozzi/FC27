import Link from "next/link";

import { NEWS_CATEGORY_LABEL, type NewsArticle } from "@/domain/news/news";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

import { Badge } from "../ui/badge";

/** Manchete: a voz de "imprensa" do app usa a tipografia condensada em tamanho grande. */
export function NewsCard({
  article,
  featured,
  className,
}: {
  article: NewsArticle;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("group relative", className)}>
      <div className="flex items-center gap-2 text-xs text-fg-3">
        <span className="font-semibold text-fg-2">{article.outlet}</span>
        <span aria-hidden="true">/</span>
        <time dateTime={article.date}>{formatDate(article.date, "long")}</time>
        {article.generated ? <Badge tone="ai">gerada</Badge> : null}
      </div>
      <h3
        className={cn(
          "mt-1.5 font-display leading-tight font-semibold text-fg group-hover:text-accent",
          featured ? "text-3xl" : "text-xl",
        )}
      >
        <Link href={`/noticias/${article.id}`} className="after:absolute after:inset-0">
          {article.headline}
        </Link>
      </h3>
      <p className={cn("mt-1.5 text-fg-2", featured ? "text-base" : "line-clamp-2 text-sm")}>
        {article.standfirst}
      </p>
      {featured ? (
        <Badge className="mt-3" tone="neutral">
          {NEWS_CATEGORY_LABEL[article.category]}
        </Badge>
      ) : null}
    </article>
  );
}
