@AGENTS.md

# FC Career Companion — convenções do projeto

- Leia `README.md` e `docs/architecture.md` antes de mudanças estruturais. Fase atual: 1 (protótipo).
- Camadas: regra de negócio em `src/domain` / `src/application` (sem React/Next — ESLint bloqueia). Componentes não decidem regras.
- UI: componha a partir de `src/components/ui`, `football` e `charts`; use os tokens de `src/app/globals.css` (nunca hex solto em componentes). Ver `docs/design-system.md` e `/design-system`.
- Para trabalho de interface, use as skills em `.claude/skills` (frontend-design, ui-ux-pro-max, web-design-guidelines, vercel-composition-patterns, accessibility-*).
- Textos da interface em pt-BR, voz ativa, sentence case.
- Antes de commitar: `npm run validate`; para mudanças de UI, também `npm run build && npm run test:e2e`.
- Commits em Conventional Commits, pequenos e por assunto.
