"use client";

import { Bot, RotateCcw, SendHorizontal } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { useActiveCareer } from "@/state/career-store";

import { PlayerShirt } from "../football/player-shirt";
import { CareerGate, PageContainer } from "../layout/page";
import { Badge } from "../ui/badge";
import { Button, IconButton } from "../ui/button";
import { InlineAlert } from "../ui/feedback";
import { useAssistantChat } from "./use-assistant-chat";

/** Renderiza **negrito** e quebras de parágrafo sem injetar HTML. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((paragraph, i) => (
        <p key={i} className="[&+p]:mt-2.5">
          {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="font-display text-lg font-semibold text-fg">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
        </p>
      ))}
    </>
  );
}

function Chat() {
  const career = useActiveCareer();
  const { messages, status, send, retry } = useAssistantChat(career);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, status]);

  const submit = (text: string) => {
    send(text);
    setDraft("");
  };

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col gap-4 lg:min-h-[calc(100dvh-6rem)]">
      <header className="flex items-center gap-3">
        <span
          className="grid size-11 place-items-center rounded-full bg-ai-soft text-ai"
          aria-hidden="true"
        >
          <Bot className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl leading-none font-bold">Assistente</h1>
          <p className="text-sm text-fg-3">Seu companion de carreira</p>
        </div>
        <Badge tone="ai">Demonstração</Badge>
      </header>

      <div
        className="flex flex-1 flex-col gap-4"
        role="log"
        aria-live="polite"
        aria-label="Conversa com o assistente"
      >
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
            {m.role === "assistant" ? (
              <span
                className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-ai-soft text-ai"
                aria-hidden="true"
              >
                <Bot className="size-4" />
              </span>
            ) : (
              <PlayerShirt
                number={career.player.shirtNumber}
                size="sm"
                className="mt-0.5 size-8 text-xs"
                label="Você"
              />
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-4 py-3 text-[0.9375rem] leading-relaxed sm:max-w-[70%]",
                m.role === "assistant"
                  ? "rounded-tl-xs border border-line bg-surface-1 text-fg-2"
                  : "rounded-tr-xs bg-accent text-on-accent",
              )}
            >
              <span className="sr-only">{m.role === "assistant" ? "Assistente: " : "Você: "}</span>
              <RichText text={m.content} />
            </div>
          </div>
        ))}
        {status === "thinking" ? (
          <div className="flex items-center gap-3" role="status">
            <span
              className="grid size-8 place-items-center rounded-full bg-ai-soft text-ai"
              aria-hidden="true"
            >
              <Bot className="size-4" />
            </span>
            <span
              className="flex gap-1 rounded-lg border border-line bg-surface-1 px-4 py-3.5"
              aria-hidden="true"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2 animate-bounce rounded-full bg-ai"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
            <span className="sr-only">Assistente pensando</span>
          </div>
        ) : null}
        {status === "error" ? (
          <InlineAlert tone="error" title="O assistente não respondeu">
            Verifique a conexão e tente de novo.
            <Button variant="secondary" size="sm" className="mt-2" onClick={retry}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Tentar de novo
            </Button>
          </InlineAlert>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="safe-bottom sticky bottom-16 -mx-4 flex flex-col gap-3 border-t border-line bg-bg/95 px-4 pt-3 pb-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-3 lg:bottom-4">
        {lastAssistant?.suggestions && status !== "thinking" ? (
          <div
            className="-mx-1 flex scrollbar-none gap-2 overflow-x-auto px-1"
            aria-label="Sugestões"
          >
            {lastAssistant.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="h-9 shrink-0 rounded-full border border-ai/30 bg-ai-soft px-3.5 text-sm text-ai transition-colors hover:border-ai/60"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(draft);
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor="chat-input" className="sr-only">
            Mensagem para o assistente
          </label>
          <textarea
            id="chat-input"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            placeholder="Pergunte sobre sua carreira…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-base text-fg placeholder:text-fg-3 focus-visible:border-ai focus-visible:ring-2 focus-visible:ring-ai/30 focus-visible:outline-none"
          />
          <IconButton
            type="submit"
            label="Enviar mensagem"
            variant="ai"
            disabled={!draft.trim() || status === "thinking"}
          >
            <SendHorizontal className="size-5" aria-hidden="true" />
          </IconButton>
        </form>
      </div>
    </div>
  );
}

export function AssistantView() {
  return (
    <PageContainer width="narrow">
      <CareerGate>
        <Chat />
      </CareerGate>
    </PageContainer>
  );
}
