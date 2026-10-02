# ADR 0001 — Stack: Next.js 16, React 19, TypeScript strict, Tailwind v4

- **Status:** aceito (Fase 1)
- **Contexto:** repositório vazio; produto web responsivo (desktop + mobile) que precisará de API, banco e chamadas server-side a provedores de IA com segredos.
- **Decisão:** Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4 com tokens em CSS; Radix para primitivas acessíveis; Zod para validação; Vitest/Playwright para testes.
- **Consequências:** um único projeto cobre UI, API (route handlers/server actions) e deploy com previews. Tailwind v4 lê tokens do CSS, então o Design System é a fonte da verdade. Next 16 tem APIs novas (params assíncronos, `PageProps`/`LayoutProps` gerados) — documentação local em `node_modules/next/dist/docs`.
- **Alternativas:** Vite SPA + backend separado (mais peças para operar); React Native/Expo (mobile nativo, mas atrasa o web e o protótipo).
