import {
  type LiveTranscriber,
  type LiveTranscriptionError,
  type LiveTranscriptionHandlers,
} from "./types";

/* Tipos mínimos da Web Speech API (não fazem parte do lib.dom padrão). */
interface SpeechAlternative {
  transcript: string;
}
interface SpeechResult {
  isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechAlternative;
}
interface SpeechResultEvent {
  results: { readonly length: number; [index: number]: SpeechResult };
}
interface SpeechErrorEvent {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const ERROR_MAP: Record<string, LiveTranscriptionError> = {
  "not-allowed": "permission-denied",
  "service-not-allowed": "permission-denied",
  "audio-capture": "no-microphone",
  "no-speech": "no-speech",
  network: "network",
};

type Ranker = (text: string) => number;

function fold(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Escolhe a melhor alternativa: a 1ª (mais confiável) salvo se outra soar bem mais como futebol. */
function bestAlternative(result: SpeechResult, rank?: Ranker): string {
  let best = result[0]?.transcript ?? "";
  if (!rank || result.length <= 1) return best.trim();
  let bestScore = rank(best);
  for (let i = 1; i < result.length; i++) {
    const text = result[i]?.transcript ?? "";
    const score = rank(text) - i * 0.5;
    if (score > bestScore) {
      best = text;
      bestScore = score;
    }
  }
  return best.trim();
}

/**
 * Junta os resultados de uma sessão. No Chrome para Android cada resultado
 * repete a frase inteira até ali ("joguei", "joguei contra", "joguei contra o
 * porto"); sem deduplicar, o texto vira uma bagunça repetida.
 */
export function joinResults(results: SpeechResultEvent["results"], rank?: Ranker): string {
  const parts: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (!result) continue;
    const text = bestAlternative(result, rank);
    if (!text) continue;
    const prev = parts.at(-1);
    if (prev !== undefined && fold(text).startsWith(fold(prev))) parts[parts.length - 1] = text;
    else if (prev !== undefined && fold(prev).startsWith(fold(text))) continue;
    else parts.push(text);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export interface WebSpeechOptions {
  /** Pontua alternativas de transcrição (ex.: vocabulário de futebol). */
  rankAlternative?: Ranker;
  /** Tempo máximo de escuta; o navegador encerra sozinho em pausas e reiniciamos até aqui. */
  maxListenMs?: number;
}

const FATAL: LiveTranscriptionError[] = ["permission-denied", "no-microphone", "network"];

/**
 * Transcrição pelo reconhecimento de fala do navegador (Chrome, Edge, Safari).
 * Não grava nem envia áudio pelo app; o navegador pode usar o serviço de fala
 * do próprio fornecedor (ex.: Google no Chrome, Apple no Safari).
 *
 * O navegador para de ouvir sozinho após uma pausa curta; enquanto o usuário
 * não tocar em "parar", a escuta é retomada e o texto continua acumulando.
 */
export class WebSpeechTranscriber implements LiveTranscriber {
  readonly id = "web-speech";
  private recognition: SpeechRecognitionLike | null = null;
  private committed = "";
  private text = "";
  private stopping = false;
  private startedAt = 0;

  constructor(private readonly options: WebSpeechOptions = {}) {}

  isSupported(): boolean {
    return !!getCtor();
  }

  start(handlers: LiveTranscriptionHandlers, options?: { language?: string }): void {
    if (!getCtor()) {
      handlers.onError("not-supported");
      return;
    }
    this.abort();
    this.committed = "";
    this.text = "";
    this.stopping = false;
    this.startedAt = Date.now();
    this.listen(handlers, options?.language ?? "pt-BR");
  }

  private listen(handlers: LiveTranscriptionHandlers, language: string): void {
    const Ctor = getCtor()!;
    const recognition = new Ctor();
    let fatal = false;
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = this.options.rankAlternative ? 5 : 1;
    recognition.onresult = (event) => {
      const session = joinResults(event.results, this.options.rankAlternative);
      this.text = [this.committed, session].filter(Boolean).join(" ");
      handlers.onText(this.text);
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      const error = ERROR_MAP[event.error] ?? "unknown";
      // Silêncio no meio do relato não é erro: a escuta é retomada no onend.
      if (error === "no-speech" && this.text && !this.stopping) return;
      fatal = FATAL.includes(error) || error === "no-speech" || error === "unknown";
      handlers.onError(error);
    };
    recognition.onend = () => {
      this.recognition = null;
      const maxMs = this.options.maxListenMs ?? 180_000;
      if (!this.stopping && !fatal && Date.now() - this.startedAt < maxMs) {
        this.committed = this.text;
        try {
          this.listen(handlers, language);
          return;
        } catch {
          // segue para encerrar com o que já foi ouvido
        }
      }
      handlers.onEnd(this.text);
    };
    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      this.recognition = null;
      handlers.onError("unknown");
    }
  }

  stop(): void {
    this.stopping = true;
    this.recognition?.stop();
  }

  abort(): void {
    this.stopping = true;
    if (!this.recognition) return;
    this.recognition.onend = null;
    this.recognition.abort();
    this.recognition = null;
  }
}
