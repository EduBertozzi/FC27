# Design System — Floodlit

Catálogo vivo em **`/design-system`**. Tokens em `src/app/globals.css`; componentes em `src/components/ui`, `football` e `charts`.

## Direção

Noite de jogo sob refletores. A carreira é o centro: um único acento dourado marca o que é **conquista e ação** (OVR, botão principal, gols, títulos). O resto é silencioso para que números e nomes falem.

Processo de definição: consultas à skill **UI/UX Pro Max** (par tipográfico Sports/Fitness — Barlow Condensed + Barlow; estilo data-dense para painéis), revisão contra os "defaults genéricos" da skill **frontend-design** (evitamos fundo quase-preto com verde-ácido, kit SaaS de cards idênticos, rótulos em caixa-alta), regras da **Bencium UX** (hierarquia por superfície e tipografia, não por sombra) e validação de cores de gráfico com a skill **dataviz**.

## Cor

| Token                   | Valor                             | Uso                                                                     |
| ----------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| `bg`                    | `#0e1930`                         | Fundo                                                                   |
| `surface-1/2/3`         | `#14223d` / `#1a2c4d` / `#22385f` | Card / controle / hover-selecionado                                     |
| `line`, `line-strong`   | `#2a4069`, `#3b5687`              | Bordas                                                                  |
| `fg`, `fg-2`, `fg-3`    | `#f1f4fa`, `#b4c0d6`, `#8e9fbf`   | Texto (14,4 / 8,6 / 5,9 : 1 sobre surface-1)                            |
| `accent`                | `#f6b940`                         | Ação principal, OVR, conquista (texto escuro sobre ele: 10,5:1)         |
| `win` / `draw` / `loss` | `#34c27f` / `#9aa8c2` / `#f4737c` | Resultado — sempre com letra V/E/D                                      |
| `ai`                    | `#8fa2ff`                         | Companion de IA e voz                                                   |
| `chart-1` / `chart-2`   | `#c07c0c` / `#6577e6`             | Séries de gols / assistências (validadas: CVD ΔE ≥ 27, contraste ≥ 3:1) |

Regras: `fg-3` não é usado sobre `surface-3`; cor nunca é o único portador de significado.

## Tipografia

Barlow Condensed (500–700) para display, placares e manchetes; Barlow (400–700) para texto. Escala 1,25 a partir de 16px: `xs 13 · sm 14 · base 16 · lg 20 · xl 25 · 2xl 31 · 3xl 39 · 4xl 49 · 5xl 61 · 6xl 95`. Números com `tabular-nums`. Rótulos em caixa normal.

## Espaço, raio, elevação, movimento

- Espaço: base 4px (4/8/12/16/24/32/48).
- Raio com hierarquia: `xs 4` badges · `sm 8` controles · `md 12` cards · `lg 20` herói/modais.
- Elevação: cards usam borda + mudança de superfície; sombra só em camadas flutuantes (`shadow-pop`, `shadow-overlay`).
- Movimento: 150–320ms, `ease-out-quint`. Um único momento coreografado (revelação do Surpreenda-me). `prefers-reduced-motion` zera animações.

## Componentes

| Grupo        | Componentes                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Ações        | `Button` (primary, secondary, ghost, ai, danger; sm/md/lg; `asChild`), `IconButton` (nome acessível obrigatório)                       |
| Formulário   | `Field` (rótulo, dica, erro ligados por ARIA), `Input`, `Select`, `Textarea`, `SegmentedControl`, `NumberStepper`                      |
| Estrutura    | `Card`/`CardHeader`/`CardBody`, `Tabs`, `PageHeader`, `PageContainer`                                                                  |
| Sobreposição | `Dialog` (modal no desktop, bottom sheet no mobile), `DropdownMenu`, `Tooltip`, `Toast`                                                |
| Dados        | `Stat`/`StatGrid`, `Badge`, `ResultBadge`, `ProgressBar`, gráficos (`RatingChart`, `ContributionsChart`, `OverallChart`, `ResultsBar`) |
| Estados      | `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`, `InlineAlert`                                                                       |
| Futebol      | `ClubCrest` (monograma ilustrativo), `PlayerShirt`, `OverallSeal`, `NationTag`, `FormGuide`, `PitchPositionPicker`, `MatchRow`         |

## Mobile

Não é o desktop encolhido: barra inferior com 4 destinos + ação central "Registrar partida", menu **Mais** em bottom sheet, barra de salvar fixa no formulário, modais viram sheets, áreas de toque ≥ 44px, `safe-area-inset` respeitado.

## Acessibilidade

WCAG 2.2 AA verificado com axe-core em todas as telas (E2E). Link "Pular para o conteúdo", foco visível dourado, `aria-current` na navegação, resultados e forma com texto alternativo, gráficos com tabela de dados.
