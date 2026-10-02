import { type Career } from "@/domain/career/career";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  /** Sugestões de próximas perguntas exibidas como atalhos. */
  suggestions?: string[];
}

export interface AssistantRequest {
  messages: ChatMessage[];
  /** Contexto da carreira ativa — o agente só pode afirmar fatos presentes aqui. */
  career: Career;
}

export interface AssistantReply {
  content: string;
  suggestions?: string[];
}

/**
 * Porta do agente de carreira. Implementações: `MockCareerAssistant` (Fase 1)
 * e, na Fase 8, um adaptador para o provedor de LLM escolhido. Nenhum código de
 * UI conhece o provedor concreto.
 */
export interface CareerAssistant {
  readonly id: string;
  reply(request: AssistantRequest): Promise<AssistantReply>;
}
