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

export function joinResults(results: SpeechResultEvent["results"]): string {
  const parts: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const text = results[i]?.[0]?.transcript?.trim();
    if (text) parts.push(text);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Transcrição pelo reconhecimento de fala do navegador (Chrome, Edge, Safari).
 * Não grava nem envia áudio pelo app; o navegador pode usar o serviço de fala
 * do próprio fornecedor (ex.: Google no Chrome, Apple no Safari).
 */
export class WebSpeechTranscriber implements LiveTranscriber {
  readonly id = "web-speech";
  private recognition: SpeechRecognitionLike | null = null;
  private text = "";

  isSupported(): boolean {
    return !!getCtor();
  }

  start(handlers: LiveTranscriptionHandlers, options?: { language?: string }): void {
    const Ctor = getCtor();
    if (!Ctor) {
      handlers.onError("not-supported");
      return;
    }
    this.abort();
    this.text = "";
    const recognition = new Ctor();
    recognition.lang = options?.language ?? "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      this.text = joinResults(event.results);
      handlers.onText(this.text);
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      handlers.onError(ERROR_MAP[event.error] ?? "unknown");
    };
    recognition.onend = () => {
      this.recognition = null;
      handlers.onEnd(this.text);
    };
    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      handlers.onError("unknown");
    }
  }

  stop(): void {
    this.recognition?.stop();
  }

  abort(): void {
    if (!this.recognition) return;
    this.recognition.onend = null;
    this.recognition.abort();
    this.recognition = null;
  }
}
