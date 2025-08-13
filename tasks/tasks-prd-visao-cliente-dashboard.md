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
  - [x] 1.1 Implementar layout Ant Design com tipografia unificada e altura fixa/consistente
  - [x] 1.2 Aplicar cores de risco por prazo (faixa superior + fundo leve): verde (>60), amarelo (60–30), vermelho (30–0), vencido (alerta)
  - [x] 1.3 Exibir campos: nome; especialidade/perfil/nível; cliente + projeto; status com comunicação positiva; prazo restante; tags; ícones Teams/e‑mail
  - [x] 1.4 Alinhamento idêntico dos conteúdos (grid, gaps, paddings) e foco/teclado acessível
  - [x] 1.5 Criar util `getRiskColors(diasRestantes)` em `formatters.ts` (retorna {barBg, cardBg, text})
  - [x] 1.6 Extrair `ProfessionalCard` reutilizável (props: profissional, projeto, onOpenModal) para manter padrão visual
  - [x] 1.7 Ajustar tokens do AntD (typography/fontSize/fontWeight) para unificar pesos e tamanhos
  - [x] 1.8 Ícones de contato: `Teams` abre link, `Email` abre `mailto:`; renderizar somente se houver dado

- [ ] 2.0 Filtros, Ordenação e Estado em URL
  - [x] 2.1 Busca por nome com debounce (≥300ms)
  - [x] 2.2 Filtros: status, especialidade, prazo (<15/<30/<60/indeterminado), senioridade
  - [x] 2.3 Ordenação: padrão por prazo (menor→maior) e alternativa “ativos primeiro”
  - [x] 2.4 Botão “Limpar filtros” e persistência de estado na URL (querystring)
  - [x] 2.5 Implementar helper `syncUrlParams({q,status,esp,prazo,sen,ord})`
  - [x] 2.6 Restaurar estado a partir da URL no primeiro render (efeito idempotente)
  - [x] 2.7 Garantir que mudar filtros reseta paginação/scroll

- [ ] 3.0 Modal (verso) com detalhes e ações
  - [x] 3.1 Linha do tempo (início/fim; renovações se houver; indeterminado tratado visualmente como 12 meses)
  - [x] 3.2 Canais de contato (Teams/e‑mail/telefone) do cliente e Matilha (quando informados)
  - [x] 3.3 Histórico de alocação recente (GET /api/allocations/history)
  - [x] 3.4 Anotações do cliente (POST /api/notes) com feedback de sucesso/erro
  - [x] 3.5 Ações de interesse: Renovar (sempre) e Esperar (exibir somente se ≤60 dias) — POST /api/client-actions/interest
  - [x] 3.6 Buscar histórico ao abrir o modal (lazy); exibir skeleton local no painel
  - [x] 3.7 Desabilitar botão “Esperar” quando >60 dias; esconder quando não aplicável
  - [x] 3.8 Tratar e exibir erros de API (message.error) e estados de sucesso (message.success)
  - [x] 3.9 Disparar telemetria: `card_open` no abrir, `interest_click` ao confirmar
  - [x] 3.10 Remover conteúdos mockados (financeiro/extra info) do modal

- [ ] 4.0 Backend/Integração e Segurança
  - [x] 4.1 Validar endpoints existentes e auth por `clienteSistemaId` (somente dados do cliente logado)
  - [x] 4.2 Ajustar validações de interesse no backend (opcional): aceitar apenas RENOVAR/ESPERAR para clientes
  - [ ] 4.3 Confirmar CORS e ambientes; migrar/seed se necessário (Prisma)
  - [x] 4.4 Adicionar testes manuais de: login→listar→abrir modal→salvar anotação→enviar interesse
  - [x] 4.5 Logar erros no servidor com contexto (rota, clienteId, profissionalId) sem dados sensíveis

- [ ] 5.0 Estados de UI, Performance e Acessibilidade
  - [x] 5.1 Skeleton loading e mensagens de vazio/erro com “Tentar novamente”
  - [x] 5.2 Implementar carregamento infinito (infinite scrolling) com bom desempenho; fallback para paginação se preciso
  - [x] 5.3 Acessibilidade (foco visível, navegação por teclado) e contraste AA
  - [x] 5.4 Responsividade (desktop/tablet/mobile) e testes de layout longo
  - [x] 5.5 Infinite scroll com `IntersectionObserver` (sentinela no fim da grade)
  - [x] 5.6 Manter altura de card e colunas constantes entre breakpoints
  - [x] 5.7 Verificar navegação por teclado: Tab para cards; Enter abre modal; Escape fecha modal

- [ ] 6.0 Telemetria (preparação)
  - [x] 6.1 Disparar eventos: `card_open`, `interest_click`, `filters_change` (payload mínimo)
  - [x] 6.2 Garantir que falhas de telemetria não impactem UX (try/catch)
  - [x] 6.3 Normalizar payloads (ids, contratoId, filtro aplicado, timestamp)
  - [x] 6.4 Adicionar flag para desativar logs em produção caso necessário

- [ ] 7.0 QA e Documentação
  - [x] 7.1 Validar critérios de aceite do PRD
  - [x] 7.2 Atualizar release notes e marcar tarefas concluídas
  - [ ] 7.3 Cross‑browser (Chrome, Edge, Safari) e mobile (iPad width)
    - Arquivo: `tasks/qa-cross-browser-visao-cliente.md`
  - [x] 7.4 Verificar ausência de informações financeiras no UI (checagem visual)


