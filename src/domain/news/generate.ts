import { hashString } from "@/lib/random";

import { type Match, resultOf } from "../match/match";
import { type NewsArticle, OUTLETS } from "./news";

interface Subject {
  name: string;
  club: string;
  positionName: string;
}

/**
 * Gera uma notícia fictícia a partir de uma partida registrada — somente com
 * fatos presentes no registro. Retorna `null` quando não há nada noticiável.
 * Na Fase 8 este gerador será substituído por um provedor de IA com a mesma assinatura.
 */
export function generateMatchNews(match: Match, subject: Subject, id: string): NewsArticle | null {
  const result = resultOf(match);
  const outlet = OUTLETS[hashString(match.id) % OUTLETS.length] ?? OUTLETS[0];
  const score = `${match.goalsFor} a ${match.goalsAgainst}`;
  const rating =
    match.rating !== null ? ` e recebeu nota ${match.rating.toFixed(1).replace(".", ",")}` : "";
  const base = {
    id,
    date: match.date,
    outlet,
    category: "match" as const,
    matchId: match.id,
    generated: true,
  };

  if (match.goals >= 3) {
    return {
      ...base,
      headline: `${subject.name} marca ${match.goals} vezes e leva a bola para casa`,
      standfirst: `${subject.positionName} do ${subject.club} decide contra o ${match.opponent} pela ${match.competition}.`,
      body: [
        `Em noite para guardar, ${subject.name} balançou as redes ${match.goals} vezes no ${result === "W" ? "triunfo" : "jogo"} por ${score} sobre o ${match.opponent}${rating}.`,
      ],
    };
  }
  if (match.goals === 2) {
    return {
      ...base,
      headline: `Dois gols de ${subject.name} ${result === "W" ? "garantem a vitória" : "não bastam"} contra o ${match.opponent}`,
      standfirst: `Placar final de ${score} pela ${match.competition}.`,
      body: [
        `${subject.name} anotou dois gols${match.assists > 0 ? ` e ainda deu ${match.assists} assistência${match.assists > 1 ? "s" : ""}` : ""}${rating}.`,
      ],
    };
  }
  if (match.goals === 1 || match.assists > 0) {
    const what = [
      match.goals === 1 ? "um gol" : null,
      match.assists > 0 ? `${match.assists} assistência${match.assists > 1 ? "s" : ""}` : null,
    ]
      .filter(Boolean)
      .join(" e ");
    return {
      ...base,
      headline: `${subject.name} participa com ${what} ${result === "L" ? "na derrota" : result === "D" ? "no empate" : "na vitória"} do ${subject.club}`,
      standfirst: `${subject.club} ${score} ${match.opponent}, pela ${match.competition}.`,
      body: [`Com ${what}${rating}, ${subject.name} esteve envolvido diretamente no resultado.`],
    };
  }
  if (match.rating !== null && match.rating >= 8) {
    return {
      ...base,
      headline: `Mesmo sem marcar, ${subject.name} é destaque contra o ${match.opponent}`,
      standfirst: `Atuação nota ${match.rating.toFixed(1).replace(".", ",")} pela ${match.competition}.`,
      body: [
        `${subject.name} não marcou nem deu assistência, mas foi um dos melhores em campo no ${score}.`,
      ],
    };
  }
  if (match.redCard) {
    return {
      ...base,
      headline: `${subject.name} é expulso contra o ${match.opponent}`,
      standfirst: `Cartão vermelho marca a partida pela ${match.competition}.`,
      body: [`O ${subject.club} terminou o jogo com placar de ${score}.`],
    };
  }
  return null;
}
