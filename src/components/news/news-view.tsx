"use client";

import { ArrowLeft, Newspaper, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { NEWS_CATEGORY_LABEL, type NewsCategory } from "@/domain/news/news";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { useActiveCareer } from "@/state/career-store";

import { CareerGate, PageContainer, PageHeader } from "../layout/page";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EmptyState, InlineAlert } from "../ui/feedback";
import { NewsCard } from "./news-card";

function NewsList() {
  const career = useActiveCareer();
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const categories = [...new Set(career.news.map((n) => n.category))];
  const articles = [...career.news]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((n) => category === "all" || n.category === category);
  const [featured, ...rest] = articles;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notícias"
        description="O que a imprensa (fictícia) está dizendo sobre a sua carreira."
      />
      <InlineAlert tone="info">
        Protótipo: manchetes de exemplo e notícias geradas automaticamente a partir das partidas
        registradas. Na fase de IA, o assistente escreverá matérias completas.
      </InlineAlert>

      {career.news.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Newspaper />}
            title="Nenhuma manchete ainda"
            description="Gols, assistências e grandes atuações viram notícia quando você registra a partida."
            action={
              <Button asChild>
                <Link href="/partidas/nova">Registrar partida</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div
            className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
            role="group"
            aria-label="Filtrar por editoria"
          >
            {(["all", ...categories] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-4 text-sm font-medium",
                  category === c
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line text-fg-2 hover:border-line-strong hover:text-fg",
                )}
              >
                {c === "all" ? "Todas" : NEWS_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          {featured ? (
            <Card className="relative overflow-hidden p-5 sm:p-8">
              <div className="pitch-lines absolute inset-0 opacity-70" aria-hidden="true" />
              <NewsCard
                article={featured}
                featured
                className="relative max-w-3xl [&_h3]:text-4xl sm:[&_h3]:text-5xl"
              />
            </Card>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {rest.map((a) => (
              <Card key={a.id} className="p-5 transition-colors hover:border-line-strong">
                <NewsCard article={a} />
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function NewsView() {
  return (
    <PageContainer>
      <CareerGate>
        <NewsList />
      </CareerGate>
    </PageContainer>
  );
}

function Article({ id }: { id: string }) {
  const career = useActiveCareer();
  const article = career.news.find((n) => n.id === id);
  if (!article) {
    return (
      <Card>
        <EmptyState
          icon={<Newspaper />}
          title="Notícia não encontrada"
          description="Ela pode pertencer a outra carreira ou ter sido removida ao restaurar a demonstração."
          action={
            <Button asChild variant="secondary">
              <Link href="/noticias">Voltar para notícias</Link>
            </Button>
          }
        />
      </Card>
    );
  }
  return (
    <article className="flex flex-col gap-5">
      <Link
        href="/noticias"
        className="inline-flex h-9 items-center gap-1.5 self-start text-sm font-medium text-fg-2 hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Notícias
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-sm text-fg-3">
        <Badge>{NEWS_CATEGORY_LABEL[article.category]}</Badge>
        <span className="font-semibold text-fg-2">{article.outlet}</span>
        <span aria-hidden="true">/</span>
        <time dateTime={article.date}>{formatDate(article.date, "long")}</time>
      </div>
      <h1 className="font-display text-4xl leading-[1.05] font-bold text-balance sm:text-5xl">
        {article.headline}
      </h1>
      <p className="text-xl text-fg-2">{article.standfirst}</p>
      <div className="flex flex-col gap-4 border-t border-line pt-5 text-lg leading-relaxed text-fg">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {article.generated ? (
        <p className="flex items-center gap-2 text-sm text-ai">
          <Sparkles className="size-4" aria-hidden="true" />
          Gerada automaticamente a partir dos dados da partida. Nenhuma informação foi inventada.
        </p>
      ) : null}
    </article>
  );
}

export function ArticleView({ id }: { id: string }) {
  return (
    <PageContainer width="narrow">
      <CareerGate>
        <Article id={id} />
      </CareerGate>
    </PageContainer>
  );
}
