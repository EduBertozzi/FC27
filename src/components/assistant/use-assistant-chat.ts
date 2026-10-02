"use client";

import { useCallback, useRef, useState } from "react";

import { type Career } from "@/domain/career/career";
import { DEFAULT_SUGGESTIONS } from "@/infrastructure/ai/mock-assistant";
import { type ChatMessage } from "@/infrastructure/ai/types";
import { getServices } from "@/infrastructure/registry";
import { createId } from "@/lib/id";
import { logger } from "@/lib/logger";

const SIMULATED_LATENCY_MS = 650;

export type ChatStatus = "idle" | "thinking" | "error";

/** Conversa com o agente de carreira via porta `CareerAssistant` (mock na Fase 1). */
export function useAssistantChat(career: Career) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      createdAt: new Date(0).toISOString(),
      content: `Olá! Sou o companion da sua carreira. Conheço cada jogo de ${career.player.nickname ?? career.player.firstName} no ${career.currentClub}. Pergunte sobre a temporada, peça um desafio ou uma notícia.`,
      suggestions: DEFAULT_SUGGESTIONS,
    },
  ]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const lastPrompt = useRef<ChatMessage[] | null>(null);

  const run = useCallback(
    async (history: ChatMessage[]) => {
      lastPrompt.current = history;
      setStatus("thinking");
      try {
        const [reply] = await Promise.all([
          getServices().assistant.reply({ messages: history, career }),
          new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS)),
        ]);
        setMessages((m) => [
          ...m,
          {
            id: createId("msg"),
            role: "assistant",
            content: reply.content,
            suggestions: reply.suggestions,
            createdAt: new Date().toISOString(),
          },
        ]);
        setStatus("idle");
      } catch (error) {
        logger.error("assistant.reply_failed", error);
        setStatus("error");
      }
    },
    [career],
  );

  const send = useCallback(
    (content: string) => {
      const text = content.trim();
      if (!text || status === "thinking") return;
      const userMessage: ChatMessage = {
        id: createId("msg"),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      const history = [...messages, userMessage];
      setMessages(history);
      void run(history);
    },
    [messages, run, status],
  );

  const retry = useCallback(() => {
    if (lastPrompt.current) void run(lastPrompt.current);
  }, [run]);

  return { messages, status, send, retry };
}
