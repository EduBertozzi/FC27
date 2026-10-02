import { currentSeasonMatches } from "@/domain/career/career";
import { suggestChallenges, generateCareerConcept } from "@/domain/ideas/generators";
import { sortByDateDesc } from "@/domain/match/match";
import { generateMatchNews } from "@/domain/news/generate";
import { displayName } from "@/domain/player/player";
import { POSITIONS } from "@/domain/player/positions";
import { aggregate, per90, recentForm } from "@/domain/stats/stats";
import { formatRating } from "@/lib/format";
import { createRng, hashString } from "@/lib/random";

import { type AssistantReply, type AssistantRequest, type CareerAssistant } from "./types";

const DEFAULT_SUGGESTIONS = [
  "Como está minha temporada?",
  "O que preciso melhorar?",
  "Crie um desafio para minha próxima temporada",
  "Crie uma notícia sobre minha última partida",
];

type Intent = "season" | "improve" | "challenge" | "idea" | "news" | "unknown";

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/(not[ií]cia|manchete|jornal)/.test(t)) return "news";
  if (/(desafio|challenge)/.test(t)) return "challenge";
  if (/(sem ideia|ideia|continuar)/.test(t)) return "idea";
  if (/(melhorar|evoluir|fraco|ponto)/.test(t)) return "improve";
  if (/(temporada|como estou|como est[áa]|resumo|desempenho)/.test(t)) return "season";
  return "unknown";
}

/**
 * Assistente simulado, determinístico e fundamentado nos dados da carreira.
 * Serve para validar a experiência de conversa antes da integração com um LLM.
 */
export class MockCareerAssistant implements CareerAssistant {
  readonly id = "mock";

  async reply({ messages, career }: AssistantRequest): Promise<AssistantReply> {
    const last = messages.at(-1)?.content ?? "";
    const matches = currentSeasonMatches(career);
    const line = aggregate(matches);
    const name = displayName(career.player);

    switch (detectIntent(last)) {
      case "season": {
        if (line.appearances === 0) {
          return {
            content: `Ainda não há partidas registradas na temporada ${career.currentSeason}. Registre o primeiro jogo e eu monto o panorama.`,
            suggestions: ["Crie um desafio para minha próxima temporada"],
          };
        }
        const form = recentForm(matches, 5)
          .map((f) => f.result)
          .join(" ");
        return {
          content: [
            `Temporada ${career.currentSeason} no ${career.currentClub}: ${line.appearances} jogos, ${line.goals} gols e ${line.assists} assistências, com nota média ${formatRating(line.averageRating)}.`,
            `Isso dá ${per90(line.goals + line.assists, line.minutes)
              .toFixed(2)
              .replace(".", ",")} participações em gol a cada 90 minutos. Forma recente: ${form}.`,
            line.goals >= 10
              ? `${name} já passou dos dois dígitos em gols — ritmo de artilheiro.`
              : `Mantendo o ritmo, a meta de gols da temporada continua ao alcance.`,
          ].join("\n\n"),
          suggestions: ["O que preciso melhorar?", "Crie uma notícia sobre minha última partida"],
        };
      }
      case "improve": {
        if (line.appearances === 0)
          return {
            content:
              "Preciso de pelo menos uma partida registrada para apontar pontos de melhoria com base em dados.",
            suggestions: DEFAULT_SUGGESTIONS,
          };
        const points: string[] = [];
        if (line.starts / line.appearances < 0.6)
          points.push(
            `Você foi titular em ${line.starts} de ${line.appearances} jogos. Boas notas como reserva costumam convencer o técnico.`,
          );
        if (line.assists < line.goals / 3)
          points.push(
            `Só ${line.assists} assistências para ${line.goals} gols: procurar mais o passe final aumenta sua nota média.`,
          );
        if (line.yellowCards >= 4)
          points.push(
            `${line.yellowCards} cartões amarelos. Mais um pendurado pode custar um clássico.`,
          );
        if (line.averageRating !== null && line.averageRating < 7)
          points.push(
            `Nota média de ${formatRating(line.averageRating)}: o foco agora é regularidade.`,
          );
        if (points.length === 0)
          points.push(
            "Os números estão equilibrados. O próximo passo é decidir jogos grandes: mire nos clássicos e nas fases eliminatórias.",
          );
        return {
          content: points.join("\n\n"),
          suggestions: ["Crie um desafio para minha próxima temporada"],
        };
      }
      case "challenge": {
        const [challenge] = suggestChallenges(createRng(hashString(last + messages.length)), 1);
        if (!challenge) return { content: "Não encontrei desafios disponíveis agora." };
        return {
          content: `Desafio "${challenge.title}" (${challenge.difficulty}): ${challenge.rule}`,
          suggestions: ["Me dê outro desafio", "Como está minha temporada?"],
        };
      }
      case "idea": {
        const c = generateCareerConcept(createRng(hashString(last + messages.length)));
        return {
          content: `Que tal um novo capítulo? ${c.story}\n\nDesafio sugerido: ${c.challenge.rule}`,
          suggestions: ["Me dê outra ideia", "Crie um desafio para minha próxima temporada"],
        };
      }
      case "news": {
        const lastMatch = sortByDateDesc(career.matches)[0];
        if (!lastMatch) return { content: "Registre uma partida e eu escrevo a matéria." };
        const article = generateMatchNews(
          lastMatch,
          {
            name,
            club: career.currentClub,
            positionName: POSITIONS[career.player.position].name.toLowerCase(),
          },
          "preview",
        );
        if (!article)
          return {
            content: `A partida contra o ${lastMatch.opponent} foi discreta demais para virar manchete — sem gols, assistências ou nota de destaque registrados.`,
          };
        return {
          content: `**${article.headline}**\n\n${article.standfirst} ${article.body.join(" ")}\n\n— ${article.outlet}`,
        };
      }
      case "unknown":
        return {
          content:
            "Ainda estou aprendendo. Por enquanto, posso analisar sua temporada, sugerir melhorias, criar desafios e escrever notícias sobre suas partidas.",
          suggestions: DEFAULT_SUGGESTIONS,
        };
    }
  }
}

export { DEFAULT_SUGGESTIONS };
