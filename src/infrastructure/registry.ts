import { MockCareerAssistant } from "./ai/mock-assistant";
import { type CareerAssistant } from "./ai/types";
import { MockTranscriptionProvider } from "./voice/mock-transcription";
import { RuleBasedMatchExtractor } from "./voice/rule-based-extractor";
import { type MatchExtractor, type TranscriptionProvider } from "./voice/types";

export interface Services {
  assistant: CareerAssistant;
  transcription: TranscriptionProvider;
  matchExtractor: MatchExtractor;
}

/**
 * Composition root das integrações externas. Trocar de fornecedor (LLM,
 * transcrição, extração) é uma mudança apenas aqui, guiada por variáveis de
 * ambiente — ver `.env.example` e docs/adr/0003-ai-provider-ports.md.
 */
let services: Services | undefined;

export function getServices(): Services {
  services ??= {
    assistant: new MockCareerAssistant(),
    transcription: new MockTranscriptionProvider(),
    matchExtractor: new RuleBasedMatchExtractor(),
  };
  return services;
}
