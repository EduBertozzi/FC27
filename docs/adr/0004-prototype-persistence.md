# ADR 0004 — Persistência local no protótipo

- **Status:** aceito (temporário, até a Fase 2)
- **Contexto:** a Fase 1 deve ser navegável e permitir avaliar fluxos completos (criar carreira, registrar partida e ver tudo atualizar) sem backend.
- **Decisão:** Zustand com `persist` em `localStorage`, versão de schema `1`, hidratação manual (`skipHydration`) com `CareerGate` exibindo skeleton até a leitura para não mostrar a carreira errada.
- **Consequências:** dados ficam por navegador/dispositivo e não sincronizam. A versão do storage permite migrações enquanto a Fase 2 não chega. Ao introduzir o banco, a store passa a consumir a API; a carreira demo vira seed.
