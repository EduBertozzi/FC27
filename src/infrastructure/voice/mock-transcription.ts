import { type Transcript, type TranscriptionProvider } from "./types";

export const SAMPLE_TRANSCRIPTS = [
  "Joguei contra o Arsenal, ganhamos de três a um, fiz dois gols e dei uma assistência. Tirei nota nove.",
  "Empatamos em um a um com o Benfica fora de casa pela Liga Portugal. Entrei no segundo tempo, joguei 30 minutos e levei amarelo.",
  "Perdemos de dois a zero para o Porto. Fui titular e joguei 90 minutos, nota seis e meio.",
] as const;

/** Transcrição simulada: ignora o áudio e devolve um roteiro de exemplo. */
export class MockTranscriptionProvider implements TranscriptionProvider {
  readonly id = "mock";
  private cursor = 0;

  async transcribe(_audio: Blob): Promise<Transcript> {
    const text =
      SAMPLE_TRANSCRIPTS[this.cursor % SAMPLE_TRANSCRIPTS.length] ?? SAMPLE_TRANSCRIPTS[0];
    this.cursor += 1;
    return { text, language: "pt-BR", confidence: 0.92 };
  }
}
