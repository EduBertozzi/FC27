# ADR 0003 — Portas para IA, transcrição e extração

- **Status:** aceito
- **Contexto:** o produto terá agente de IA e entrada por voz; o fornecedor (LLM, speech-to-text) e o modelo devem ser trocáveis, e a IA não pode inventar dados.
- **Decisão:** três interfaces — `CareerAssistant`, `TranscriptionProvider`, `MatchExtractor` — resolvidas em `infrastructure/registry.ts`. Fase 1: `MockCareerAssistant`, `MockTranscriptionProvider` e `RuleBasedMatchExtractor` (implementação real, determinística, pt-BR). O contrato de extração separa `fields` (só o que foi dito), `missing` e `questions`.
- **Consequências:** UI e casos de uso não conhecem fornecedores. O extrator por regras serve de referência de comportamento e de fallback offline para o futuro extrator por LLM, e seus testes definem o contrato "nunca inventar". Adaptadores reais rodarão no servidor para proteger chaves.
