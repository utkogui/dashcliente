## PRD — Dashboard “Visão do Cliente” (Cards + Modal)

### 1. Introdução/Visão Geral
Painel em cards para o cliente visualizar rapidamente profissionais alocados, status e prazo dos contratos, com modal para informações adicionais e ações essenciais. Objetivos principais: tomada rápida de decisão (renovar/esperar) e clareza de alocação/prazos (incluindo expiração próxima).

### 2. Metas (Goals)
1. Permitir decisão rápida entre Renovar e Esperar.
2. Exibir alocação atual, cliente/projeto e prazo restante com sinalização clara de risco.
3. Interface consistente, responsiva e acessível (AA), com tipografia unificada.
4. Carregamento suave (skeleton) e lista com carregamento infinito.

### 3. User Stories
- Como gestor/POC do cliente, quero ver cards com status e prazo para entender quem está alocado e quando o contrato expira.
- Como gestor/POC do cliente, quero abrir um modal para ver detalhes (linha do tempo, contatos, histórico recente) e registrar meu interesse (renovar/esperar).
- Como gestor/POC do cliente, quero filtrar por status, especialidade, prazo e senioridade para localizar perfis.

### 4. Requisitos Funcionais
4.1 Cards (frente)
1) Exibir: nome do profissional; especialidade/perfil/nível; cliente + projeto atual; status ("Em projeto"/"Disponível") com comunicação positiva; prazo restante (dias/indeterminado) com cor de risco; tags/skills; ícones de contato (Teams e e‑mail).
2) "Multi-projeto": NÃO exibir por padrão; se necessário futuramente, badge simples e discreto.
3) Ordenação visual dos cards: Ativos primeiro (quando escolhido), e por padrão por prazo (menor → maior), vencidos antes, indeterminados por último.
4) Cores de risco no card (fundo leve + faixa superior):
   - Verde: > 60 dias
   - Amarelo: 60 a 30 dias
   - Vermelho: 30 a 0 dias
   - Vencidos: vermelho escuro (bordas/texto de alerta)

4.2 Filtros/Ordenação
5) Filtros: busca por nome; status; especialidade; prazo (<15/<30/<60/indeterminado); senioridade/nível.
6) Ordenação: padrão por prazo (menor→maior) e alternativa "ativos primeiro".
7) Botão "Limpar filtros".
8) Persistir estado na URL (querystring).

4.3 Modal (verso)
9) Linha do tempo do contrato (início/fim; renovações se existirem; para indeterminado, tratar visualmente como 12 meses).
10) Canais de contato (Teams/e‑mail/telefone) do cliente e da Matilha (quando informados).
11) Histórico de alocação: exibir histórico recente.
12) Anotações do cliente com persistência (campo de texto + salvar).
13) Ações permitidas: Renovar e Esperar ("Esperar" apenas quando prazo ≤ 60 dias).

4.4 Restrições de Dados/Privacidade
14) Não exibir custos, valores de contrato nem remuneração do profissional.
15) LGPD: exibir apenas dados essenciais de contato e projeto.

4.5 Estados de UI e Performance
16) Skeleton loading para cards.
17) Mensagens de vazio/erro e ação "Tentar novamente".
18) Carregamento infinito (infinite scrolling). Se inviável, fallback para paginação.
19) Debounce (≥300ms) em filtros de texto.
20) Acessibilidade: contraste AA, foco visível, navegação por teclado.
21) Responsividade: grid adaptável (desktop/tablet/mobile) com altura de card consistente.

4.6 Telemetria (preparação)
22) Eventos: abertura de card/modal; cliques em ações (Renovar/Esperar); uso de filtros/ordenação (payload mínimo e simples).

4.7 Backend/Integrações
23) Endpoints (autenticados e filtrados por cliente logado):
   - POST /api/client-actions/interest (interesse: RENOVAR | ESPERAR)
   - POST /api/notes (anotações)
   - GET /api/allocations/history?profissionalId=...
   - POST /api/requests/new-professional (opcional, futuro)

### 5. Não-Objetivos (Out of Scope)
- Exibir custos/valores financeiros ao cliente.
- Ações Reduzir e Trocar (fora do escopo inicial).
- Gestão completa de solicitações no dashboard (apenas interesse básico).

### 6. Considerações de Design
1) Design System: Ant Design como base.
2) Tipografia: mesmo tamanho/fonte base nos cards para consistência; títulos com peso semi-bold, corpo com peso regular.
3) Consistência visual: alinhamento idêntico entre cards; mesma altura; margens e espaçamentos padronizados.
4) Cores de risco: aplicar faixa superior e leve background no card conforme regra (verde/amarelo/vermelho), mantendo legibilidade.
5) Ícones de contato (Teams/e‑mail) como ações discretas no rodapé do card.

### 7. Considerações Técnicas
1) Persistir filtros/ordem na URL usando `URLSearchParams`.
2) Carregamento infinito: observar performance; caso de listas grandes, considerar virtualização.
3) Autorização: middleware no backend garantindo `clienteSistemaId` do usuário.
4) Telemetria: função utilitária simples (ex.: `track(event)`) para futura integração.

### 8. Métricas de Sucesso
1) Uso da página (visitas/sessões; tempo médio).
2) Abertura de cards/modal e cliques em ações.
3) (Futuro) Tempo até ação de Renovar.

### 9. Edge Cases
1) Indeterminado: apresentar como "Indeterminado"; base visual equivalente a 12 meses para consistência de risco.
2) Vencidos: sinalizar claramente e manter na página.
3) Multi‑projeto: badge simples (opcional e discreto, apenas se necessário).
4) Dados faltantes (contato/cliente): ocultar seção/ícone quando ausente (não exibir placeholder incorreto).
5) API lenta/offline: skeleton + mensagem de erro e "Tentar novamente".

### 10. Aceite (Acceptance Criteria)
- Cards exibem os campos acordados, com cores de risco corretas por faixa de dias; sem informações financeiras.
- Filtros/ordenação funcionam e persistem via URL; botão "Limpar filtros" restaura o estado inicial.
- Modal abre com linha do tempo, contatos, histórico recente; permite salvar anotação; exibe apenas Renovar e Esperar (≤60d).
- Telemetria dispara eventos mínimos (card_open, interest_click, filters_change).
- Acessibilidade: navegação por teclado, foco visível; contraste AA em textos/cromas de risco.
- Lista suporta carregamento infinito sem degradação perceptível.


