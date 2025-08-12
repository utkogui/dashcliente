## Relevant Files

- `src/pages/VisaoCliente.tsx` - Página principal a ser refinada (cards, ordenação, filtros, ações).
- `src/utils/formatters.ts` - Funções utilitárias (ex.: `calcularDiasRestantes`) usadas em ordenação/cores de status.
- `src/contexts/DataContext.tsx` - Integração de novos endpoints (anotações, interesses do cliente) e novos tipos.
- `src/components` (novo):
  - `src/components/cliente/ProfessionalCard.tsx` - (Opcional) Componente de card para padronizar layout/altura e reutilização.
  - `src/components/cliente/FiltersBar.tsx` - (Opcional) Barra de filtros/ordenação reutilizável com reset.
  - `src/components/cliente/InterestActions.tsx` - (Opcional) Botões/labels de interesse (Renovar/Reduzir/Trocar/Esperar) e formulário de anotação.
- `server/index.ts` - Backend Express: criação de endpoints para ações do cliente (interesse/solicitações/anotações) e histórico de alocação.
- `tasks/prd-visao-cliente-ux.md` - Documento de requisitos de referência.

### Notes

- Testes podem ser adicionados depois; o projeto não possui suíte configurada de testes de UI.
- Atenção à privacidade: não exibir custos/valores ao cliente.
- Manter acessibilidade (contraste e navegação por teclado) e responsividade.

## Tasks

- [ ] 1.0 Refinar UX dos cards na página “Visão do Cliente”
  - [x] 1.1 Padronizar layout/altura dos cards, usando faixas de cor/ícones discretos por status (verde/amarelo/vermelho/indeterminado/vencido)
  - [x] 1.2 Ajustar ordenação padrão: Ativos primeiro; dentro de ativos, por prazo (menor→maior), vencidos primeiro e indeterminados por último
  - [x] 1.3 Exibir no card (frente): nome, especialidade/nível, projeto+cliente, status (com comunicação positiva para “Disponível”), prazo restante, tags/skills
  - [x] 1.4 Exibir label “Multi-projeto” quando o profissional tiver mais de um projeto ativo
  - [x] 1.5 Aplicar hover/efeitos sutis e manter altura mínima consistente (grid responsivo)
  - [x] 1.6 Garantir contraste AA nas cores de status/risco

- [ ] 2.0 Filtros e ordenação controláveis
  - [x] 2.1 Implementar busca por nome
  - [x] 2.2 Filtros por status, especialidade e prazo (faixas <15/<30/<60/indeterminado)
  - [x] 2.3 Filtro por senioridade/nível
  - [x] 2.4 Controle de ordenação (padrão por prazo ou status) e botão “Limpar filtros”
  - [x] 2.5 Persistir estado de filtros/ordenação na URL (querystring) para compartilhamento/refresh

- [ ] 3.0 Modal (verso) com informações e ações
  - [x] 3.1 Linha do tempo (início/fim/renovações) e rituais/forma de trabalho (UI inicial)
  - [x] 3.2 Canais de contato (Teams/e-mail/telefone) do profissional no cliente e da Matilha
  - [x] 3.3 Histórico de alocação (quando existir) — derivado do backend
  - [x] 3.4 Área de anotações do cliente (UI + persistência backend)
  - [x] 3.5 Ações/labels de interesse (UI + persistência) com regra de “Esperar” ≤60d
  - [x] 3.6 Validações de formulário (anotação/comentário) e feedback de sucesso/erro
  - [x] 3.7 Acessibilidade do modal (focus trap por MUI, aria-labels nos controles)

- [ ] 4.0 Backend: endpoints para interações do cliente
  - [x] 4.1 POST /api/client-actions/interest — registrar interesse do cliente com comentário opcional
  - [x] 4.2 POST /api/requests/new-professional — solicitar novo profissional
  - [x] 4.3 POST /api/notes — registrar anotação do cliente ligada ao profissional/contrato
  - [x] 4.4 GET /api/allocations/history?profissionalId=... — obter histórico de alocação
  - [x] 4.5 Autorização: garantir que dados exibidos pertencem ao cliente autenticado
  - [x] 4.6 Modelagem de dados (Prisma): criar tabelas `cliente_interesses`, `cliente_notas`, `solicitacoes_profissional` com migrações
  - [x] 4.7 Ajustar CORS se necessário e validar no ambiente de produção

- [ ] 5.0 Estados de UI e desempenho
  - [x] 5.1 Skeleton para carregamento; mensagens de vazio/erro com “Tentar novamente”
  - [x] 5.2 Paginação/virtualização para listas longas mantendo filtros visíveis (implementada paginação)
  - [x] 5.3 Debounce em busca/filtros de texto para evitar excesso de renders (300ms)
  - [x] 5.4 Memoização de listas/seletores (useMemo/useCallback) onde aplicável

- [ ] 6.0 Acessibilidade e responsividade
  - [x] 6.1 Contraste mínimo (WCAG AA), foco visível e navegação por teclado (foco/teclado nos cards)
  - [x] 6.2 Grid responsivo (xs/sm/md/lg); tipografia/ícones adaptados
  - [x] 6.3 Estados de foco claros nos botões/CTAs de interesse

- [ ] 7.0 Telemetria (preparação)
  - [x] 7.1 Disparar eventos: abertura de card/modal, cliques de interesse, uso de filtros/ordenação
  - [x] 7.2 Definir nomenclatura de eventos e payload mínimo (profissionalId, contratoId, filtro aplicado)


