# Arquitetura

## Objetivos

1. Regras de negócio testáveis sem navegador.
2. UI composta a partir de um Design System, não de telas independentes.
3. Persistência, IA e transcrição trocáveis sem reescrever o app.
4. Pronta para observabilidade e para um backend real.

## Camadas

| Camada       | Pasta                         | Pode depender de                                    | Não pode depender de            |
| ------------ | ----------------------------- | --------------------------------------------------- | ------------------------------- |
| Rotas        | `src/app`                     | tudo                                                | —                               |
| Apresentação | `src/components`, `src/hooks` | `state`, `domain`, `lib`, `infrastructure/registry` | —                               |
| Estado de UI | `src/state`                   | `application`, `domain`, `lib`, `data`              | componentes                     |
| Casos de uso | `src/application`             | `domain`, `lib`                                     | React, Next, componentes, state |
| Domínio      | `src/domain`                  | `lib`                                               | React, Next, componentes, state |
| Integrações  | `src/infrastructure`          | `domain`, `lib`                                     | componentes                     |
| Transversal  | `src/lib`                     | —                                                   | camadas acima                   |

A restrição de `domain`/`application` é verificada pelo ESLint (`no-restricted-imports`).

## Fluxo: registrar uma partida

```
MatchForm (UI) ──toMatchInput──▶ useCareerStore.registerMatch
                                     │
                                     ▼
                      application/registerMatch(career, input, createId)
                        ├─ matchInputSchema.safeParse     (domain/match/schema)
                        ├─ deriveMilestones               (domain/timeline)
                        ├─ generateMatchNews              (domain/news)
                        └─ refreshObjectives / aggregate  (domain/stats)
                                     │  Result<{career, match, events, news}>
                                     ▼
                      store persiste a nova carreira → telas re-renderizam
```

O caso de uso é puro (sem I/O, sem data atual implícita, IDs injetados), então é testado em integração com a carreira demo em `register-match.test.ts`.

## Fluxo: voz → partida

```
VoiceCapture
  1. gravar            (Fase 1: simulado; Fase 9: MediaRecorder)
  2. transcrever       TranscriptionProvider.transcribe(blob)  → texto   [o Blob é descartado]
  3. interpretar       MatchExtractor.extract(texto, contexto) → { fields, missing, questions }
  4. prévia            "Entendi" × "Não foi dito — fica em branco"
  5. perguntas         ex.: "Você informou o adversário e o resultado, mas não informou a competição…"
  6. aplicar           applyExtraction() preenche SOMENTE campos ditos
  7. confirmar/salvar  usuário revisa o formulário e toca em "Salvar partida"
```

Garantias: o extrator nunca preenche campos não mencionados (coberto por testes); a nota não dita fica vazia (nunca 0); nada é persistido antes do passo 7.

## Portas de integração

```ts
interface CareerAssistant {
  reply(req: AssistantRequest): Promise<AssistantReply>;
}
interface TranscriptionProvider {
  transcribe(audio: Blob): Promise<Transcript>;
}
interface MatchExtractor {
  extract(text: string, ctx: ExtractionContext): Promise<ExtractionResult>;
}
```

`src/infrastructure/registry.ts` é o _composition root_. Na Fase 8/9, adaptadores reais (qualquer provedor de LLM ou de speech-to-text) rodam no servidor (route handlers/server actions) para que as chaves nunca cheguem ao navegador; o registry do cliente passa a chamar esses endpoints.

## Persistência

- **Fase 1:** Zustand `persist` → `localStorage` (`fccc:careers`, `version: 1`). `skipHydration` + `StoreHydrator` + `useSyncExternalStore` evitam divergência entre HTML do servidor e cliente; `CareerGate` mostra skeleton até a leitura.
- **Fase 2:** repositório `CareerRepository` sobre ORM + PostgreSQL. A store passa a chamar a API; os casos de uso continuam iguais.

## Erros e observabilidade

- `lib/result.ts`: `Result<T, AppError>` com códigos (`VALIDATION`, `NOT_FOUND`, `PROVIDER_UNAVAILABLE`, `UNKNOWN`) — erros esperados não são exceções.
- `lib/logger.ts`: logger estruturado com níveis e `addSink()`. Integrar Sentry/Datadog/OpenTelemetry = registrar um sink.
- `app/error.tsx`: fronteira de erro por rota que registra no logger e oferece "Tentar de novo".
- Eventos já instrumentados: `match.registered`, `match.validation_failed`, `career.created`, `voice.*_failed`, `assistant.reply_failed`, `route.error`.

## Segurança e privacidade

- Nenhum segredo no cliente nem no Git; `.env.example` documenta variáveis.
- Toda entrada passa por Zod antes de virar dado.
- Áudio não é armazenado; transcrição é o único dado mantido (e só se o usuário salvar).
- Sem `dangerouslySetInnerHTML` com conteúdo do usuário; o chat renderiza negrito sem HTML.
