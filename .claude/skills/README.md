# Agent skills (third-party)

Skills de agente instaladas no projeto para orientar o desenvolvimento de UI/UX,
acessibilidade e arquitetura React. São carregadas automaticamente pelo Claude Code
quando o repositório é aberto. Todas têm licença permissiva; o arquivo de licença
original acompanha cada skill.

| Skill (pasta) | Origem | Commit | Licença |
| --- | --- | --- | --- |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | `8a1541c` | Apache-2.0 |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee9` | MIT |
| `vercel-react-best-practices` | vercel-labs/agent-skills | `063bee9` | MIT |
| `vercel-composition-patterns` | vercel-labs/agent-skills | `063bee9` | MIT |
| `vercel-react-native-skills` | vercel-labs/agent-skills | `063bee9` | MIT |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `09170ee` | MIT |
| `bencium-controlled-ux-designer`, `bencium-innovative-ux-designer` | [bencium/bencium-claude-code-design-skill](https://github.com/bencium/bencium-claude-code-design-skill) | `8b152ec` | MIT |
| `accessibility-{audit,scan,inspect,fix,diff}` + `shared/` | [accesslint/claude-marketplace](https://github.com/accesslint/claude-marketplace) | `2e9d733` | MIT |

## Notas

- `ui-ux-pro-max` exige Python 3 (sem dependências externas). Exemplo:
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "sports dashboard" --design-system`
- As skills AccessLint usam o servidor MCP `@accesslint/mcp`, declarado em `/.mcp.json`.
- Para atualizar: clonar o repositório de origem, copiar a pasta da skill e atualizar o commit acima.
