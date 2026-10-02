/**
 * Normalização de fala transcrita em pt-BR: o reconhecimento de voz devolve
 * texto sem padrão ("três a um", "3x1", "nota oito vírgula cinco"). Aqui tudo
 * vira uma forma única, em minúsculas e sem acentos, para o extrator.
 */

/** Minúsculas, sem acentos, espaços simples. */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

const UNITS: Record<string, number> = {
  zero: 0,
  nenhum: 0,
  nenhuma: 0,
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  treze: 13,
  quatorze: 14,
  catorze: 14,
  quinze: 15,
  dezesseis: 16,
  dezessete: 17,
  dezoito: 18,
  dezenove: 19,
};

const TENS: Record<string, number> = {
  vinte: 20,
  trinta: 30,
  quarenta: 40,
  cinquenta: 50,
  sessenta: 60,
  setenta: 70,
  oitenta: 80,
  noventa: 90,
  cem: 100,
  cento: 100,
};

/** Converte números por extenso em dígitos ("noventa e cinco" → "95"). Espera texto já `fold`. */
export function wordsToDigits(folded: string): string {
  const tokens = folded.split(" ");
  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    const tens = TENS[token];
    if (tens !== undefined) {
      // "noventa e cinco", "cento e vinte", "cento e vinte e dois"
      let value = tens;
      let j = i;
      while (tokens[j + 1] === "e") {
        const next = tokens[j + 2] ?? "";
        const add = TENS[next] ?? UNITS[next];
        if (add === undefined || add >= value) break;
        value += add;
        j += 2;
      }
      out.push(String(value));
      i = j;
      continue;
    }
    const unit = UNITS[token];
    out.push(unit !== undefined ? String(unit) : token);
  }
  return out.join(" ");
}

/**
 * Forma canônica para extração: sem acentos, números em dígitos, decimais com
 * ponto ("8 virgula 5" → "8.5", "8 e meio" → "8.5") e placar como "3 a 1".
 */
export function normalizeSpoken(text: string): string {
  let t = fold(text)
    // pontuação vira espaço, mas preserva decimais "8,5" / "8.5" e "3x1" / "3-1"
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/(\d)\s*[x×]\s*(\d)/g, "$1 a $2")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 a $2")
    .replace(/[^\w\s.]|_/g, " ")
    .replace(/\.(?!\d)|(?<!\d)\./g, " ");
  t = wordsToDigits(t.replace(/\s+/g, " ").trim());
  return t
    .replace(/\b(\d+) (?:virgula|ponto) (\d)\b/g, "$1.$2")
    .replace(/\b(\d+) e meio\b/g, "$1.5")
    .replace(/\b(\d+) x (\d+)\b/g, "$1 a $2")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distância de edição (Levenshtein) — usada para tolerar erros do reconhecimento. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = temp;
    }
  }
  return prev[b.length]!;
}
