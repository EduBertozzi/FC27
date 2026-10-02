# Design System — Glass

Catálogo vivo em **`/design-system`**. Tokens em `src/app/globals.css`; componentes em `src/components/ui`, `football`, `charts` e `motion`.

> Substitui a primeira versão ("Floodlit", Barlow + dourado), reprovada na avaliação do protótipo. A direção escolhida foi a **C · Vidro** do canvas de protótipos.

## Direção

Vidro fosco sobre luzes de estádio, com a linguagem visual da Apple: tipografia de sistema, cantos generosos, branco como ação principal e cor apenas onde carrega significado. A luz ambiente é tingida pela **cor do clube da carreira ativa**, então cada carreira tem a sua atmosfera.

## Cor

| Token                   | Valor                             | Uso                                                                             |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| `bg`                    | `#050b18`                         | Fundo sólido atrás da luz ambiente                                              |
| luz ambiente            | cor do clube + luz quente + azul  | `Backdrop` fixo; foto opcional por baixo (`src/lib/media.ts`)                   |
| `surface-1/2/3`         | branco 7% / 10% / 16%             | Vidro: cards / controles / hover-selecionado (`.glass` aplica desfoque e borda) |
| `sheet`                 | `#101626` a 88%                   | Modais, menus, toasts, barra de abas                                            |
| `fg`, `fg-2`, `fg-3`    | branco 100% / 80% / 70%           | Texto                                                                           |
| `accent`                | `#ffffff`                         | Ação principal, com texto `on-accent` (`#050b18`)                               |
| `gold`                  | `#ffd27a`                         | Conquistas e notas de destaque                                                  |
| `win` / `draw` / `loss` | `#4ade80` / `#c4c9d4` / `#ff7a7a` | Resultado, sempre com rótulo V/E/D                                              |
| `ai`                    | `#aab8ff`                         | Companion de IA e voz                                                           |
| `chart-1` / `chart-2`   | `#ffc24d` / `#8ea6ff`             | Gols / assistências                                                             |

Escudos: monograma circular nas cores tradicionais do clube (só cores, nenhum escudo oficial); a cor do texto é escolhida automaticamente pela luminância para manter contraste AA.

## Tipografia

Fonte de sistema da Apple (`-apple-system`, SF Pro) com **Inter** (SIL OFL) como reserva fora do ecossistema Apple. Escala baseada nos estilos dinâmicos do iOS: `xs 13 · sm 15 · base 17 · lg 20 · xl 22 · 2xl 28 · 3xl 34 · 4xl 44 · 5xl 56 · 6xl 80`. Títulos com tracking negativo; números com `tabular-nums`.

## Forma e profundidade

- Raio: `xs 8` · `sm 14` controles · `md 24` cards · `lg 32` herói/sheets; botões, chips e abas em pílula.
- Profundidade por vidro (translucidez + desfoque + borda de 1px com reflexo no topo); sombras só em camadas flutuantes.

## Movimento (`motion`)

| Padrão                            | Onde                                             |
| --------------------------------- | ------------------------------------------------ |
| Transição de tela (fade + subida) | `app/template.tsx`                               |
| Entrada em cascata                | `Reveal` / `RevealItem` (Início)                 |
| Números contando                  | `AnimatedNumber` (OVR, gols, assistências, nota) |
| Barras e linhas que se desenham   | `ProgressBar`, `Sparkline`                       |
| Indicador de aba deslizante       | barra de abas mobile e sidebar (`layoutId`)      |
| Orbe de voz pulsando              | registro de partida                              |

Com "reduzir movimento" ativo, as entradas aparecem prontas, sem animação (`MotionConfig reducedMotion="user"` + `useReducedMotion`).

## Fotos

O ambiente de desenvolvimento atual não tem acesso a bancos de imagem. Os pontos de foto já existem (`MEDIA.backdrop`, `MEDIA.heroPlayer` em `src/lib/media.ts`); basta colocar arquivos licenciados em `public/media/` e registrar em `public/media/CREDITS.md`.

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

Não é o desktop encolhido: barra de abas flutuante em vidro (Início, Carreira, ação central "Registrar", Timeline, Mais) com indicador deslizante, menu **Mais** em sheet, botão de salvar fixo acima da barra, modais viram sheets, áreas de toque ≥ 44px, `safe-area-inset` respeitado.

## Acessibilidade

WCAG 2.2 AA verificado com axe-core em todas as telas (E2E). Link "Pular para o conteúdo", foco visível branco, `aria-current` na navegação, resultados e forma com texto alternativo, gráficos com tabela de dados.
