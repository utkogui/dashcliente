## Relevant Files

- `src/pages/VisaoClienteAnt.tsx` - Página principal de cards e modal (UI/UX, filtros, ordenação, infinite loading).
- `src/contexts/DataContext.tsx` - Carregamento de dados, estados (loading/erro), integração com endpoints e retry.
- `src/utils/formatters.ts` - Cálculos de dias restantes, estilos/cores de risco por prazo.
- `src/utils/telemetry.ts` - Função utilitária para eventos (card_open, interest_click, filters_change).
- `server/index.ts` - Endpoints de interesse (POST), notas (POST), histórico de alocação (GET), auth e CORS.
- `prisma/schema.prisma` - Esquema (modelos ClienteInteresse/ClienteNota; campos de contato do profissional).
- `tasks/prd-visao-cliente-dashboard.md` - PRD de referência para este dashboard.

### Notes

- Evitar exibir quaisquer valores/custos ao cliente (requisito de privacidade).
- “Esperar” somente quando prazo ≤ 60 dias; “Renovar” sempre disponível no modal.
- Manter tipografia unificada e alinhamento idêntico entre cards; cores de risco aplicadas como faixa superior + leve background.
- Persistência de filtros e ordenação via URL (compartilhável).

## Tasks

- [ ] 1.0 UI dos Cards (frente)
  - [ ] 1.1 Implementar layout Ant Design com tipografia unificada e altura fixa/consistente
  - [ ] 1.2 Aplicar cores de risco por prazo (faixa superior + fundo leve): verde (>60), amarelo (60–30), vermelho (30–0), vencido (alerta)
  - [ ] 1.3 Exibir campos: nome; especialidade/perfil/nível; cliente + projeto; status com comunicação positiva; prazo restante; tags; ícones Teams/e‑mail
  - [ ] 1.4 Alinhamento idêntico dos conteúdos (grid, gaps, paddings) e foco/teclado acessível

- [ ] 2.0 Filtros, Ordenação e Estado em URL
  - [ ] 2.1 Busca por nome com debounce (≥300ms)
  - [ ] 2.2 Filtros: status, especialidade, prazo (<15/<30/<60/indeterminado), senioridade
  - [ ] 2.3 Ordenação: padrão por prazo (menor→maior) e alternativa “ativos primeiro”
  - [ ] 2.4 Botão “Limpar filtros” e persistência de estado na URL (querystring)

- [ ] 3.0 Modal (verso) com detalhes e ações
  - [ ] 3.1 Linha do tempo (início/fim; renovações se houver; indeterminado tratado visualmente como 12 meses)
  - [ ] 3.2 Canais de contato (Teams/e‑mail/telefone) do cliente e Matilha (quando informados)
  - [ ] 3.3 Histórico de alocação recente (GET /api/allocations/history)
  - [ ] 3.4 Anotações do cliente (POST /api/notes) com feedback de sucesso/erro
  - [ ] 3.5 Ações de interesse: Renovar (sempre) e Esperar (exibir somente se ≤60 dias) — POST /api/client-actions/interest

- [ ] 4.0 Backend/Integração e Segurança
  - [ ] 4.1 Validar endpoints existentes e auth por `clienteSistemaId` (somente dados do cliente logado)
  - [ ] 4.2 Ajustar validações de interesse no backend (opcional): aceitar apenas RENOVAR/ESPERAR para clientes
  - [ ] 4.3 Confirmar CORS e ambientes; migrar/seed se necessário (Prisma)

- [ ] 5.0 Estados de UI, Performance e Acessibilidade
  - [ ] 5.1 Skeleton loading e mensagens de vazio/erro com “Tentar novamente”
  - [ ] 5.2 Implementar carregamento infinito (infinite scrolling) com bom desempenho; fallback para paginação se preciso
  - [ ] 5.3 Acessibilidade (foco visível, navegação por teclado) e contraste AA
  - [ ] 5.4 Responsividade (desktop/tablet/mobile) e testes de layout longo

- [ ] 6.0 Telemetria (preparação)
  - [ ] 6.1 Disparar eventos: `card_open`, `interest_click`, `filters_change` (payload mínimo)
  - [ ] 6.2 Garantir que falhas de telemetria não impactem UX (try/catch)

- [ ] 7.0 QA e Documentação
  - [ ] 7.1 Validar critérios de aceite do PRD
  - [ ] 7.2 Atualizar release notes e marcar tarefas concluídas


