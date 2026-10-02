# ADR 0002 — Camadas e casos de uso puros

- **Status:** aceito
- **Contexto:** regras (estatísticas, marcos, objetivos, validação) precisam ser confiáveis e testáveis, e a persistência vai mudar na Fase 2.
- **Decisão:** separar `domain` (modelos/regras), `application` (casos de uso puros que recebem a carreira e devolvem `Result`), `infrastructure` (portas/adaptadores) e apresentação. ESLint impede `domain`/`application` de importar React/Next/componentes.
- **Consequências:** regras testadas sem DOM; a store só orquestra; trocar localStorage por API é implementar um repositório. Custo: um pouco mais de arquivos e mapeamento entre formulário e entrada do caso de uso.
