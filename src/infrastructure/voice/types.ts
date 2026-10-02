import { type MatchInput } from "@/domain/match/schema";

export interface Transcript {
  text: string;
  language: string;
  /** Confiança 0–1 informada pelo provedor, quando disponível. */
  confidence?: number;
}

/**
 * Porta de transcrição de áudio. O áudio nunca é persistido pelo app: o
 * provedor recebe o Blob, devolve texto e o Blob é descartado.
 */
export interface TranscriptionProvider {
  readonly id: string;
  transcribe(audio: Blob, options?: { language?: string }): Promise<Transcript>;
}

export type ExtractableField = keyof MatchInput;

export interface ExtractionContext {
  /** Competições já usadas na carreira — ajudam a reconhecer nomes curtos. */
  knownCompetitions: readonly string[];
  /** Adversários já enfrentados ou agendados — grafia preferida para nomes de clubes. */
  knownOpponents?: readonly string[];
  /** Clube atual do jogador: nunca é o adversário e define o lado do placar. */
  ownClub?: string;
  /** Liga do clube atual: usada quando o jogador diz só "pela liga" ou "pelo campeonato". */
  league?: string;
  today: string;
}

export interface ExtractionResult {
  transcript: string;
  /** Somente campos explicitamente mencionados. Nada é inferido ou preenchido por padrão. */
  fields: Partial<MatchInput>;
  /** Campos obrigatórios ausentes que o usuário precisa confirmar. */
  missing: ExtractableField[];
  /** Perguntas de esclarecimento a exibir antes de salvar. */
  questions: string[];
}

/** Porta de interpretação: texto livre → dados estruturados de partida. */
export interface MatchExtractor {
  readonly id: string;
  extract(transcript: string, context: ExtractionContext): Promise<ExtractionResult>;
}

export type LiveTranscriptionError =
  "not-supported" | "permission-denied" | "no-microphone" | "no-speech" | "network" | "unknown";

export interface LiveTranscriptionHandlers {
  /** Texto acumulado até agora (finais + parcial atual). */
  onText: (text: string) => void;
  onError: (error: LiveTranscriptionError) => void;
  /** O reconhecimento terminou (usuário parou ou o navegador encerrou por silêncio). */
  onEnd: (finalText: string) => void;
}

/**
 * Porta de transcrição ao vivo (streaming), para quando a fala é convertida
 * enquanto o usuário fala. Implementação atual: Web Speech API do navegador.
 */
export interface LiveTranscriber {
  readonly id: string;
  isSupported(): boolean;
  start(handlers: LiveTranscriptionHandlers, options?: { language?: string }): void;
  stop(): void;
  abort(): void;
}
