## PRD: Melhoria de UX na página “Visão do Cliente”

### 1. Introdução / Visão Geral
A página “Visão do Cliente” é a página principal consumida pelos clientes para visualizar profissionais alocados, prazos dos contratos e informações relevantes para tomada de decisão (renovar, contratar novos, aguardar). O objetivo desta melhoria é concentrar as informações dispersas, dar maior clareza sobre alocação e prazos, e facilitar ações do cliente mantendo o foco em qualidade (sem exibir custos).

### 2. Objetivos
- Acelerar a tomada de decisão do cliente (renovar, contratar, aguardar) com uma visão clara e objetiva.
- Centralizar informações de alocação e prazos em um único lugar, com status e riscos visíveis.
- Aumentar o engajamento/interação na página (única vista para o cliente), reforçando a percepção de qualidade e rapidez no recrutamento.
- Destacar que os profissionais são qualificados e performam bem nos times do cliente.

### 3. Histórias de Usuário
1. Como Gestor/POC do cliente, quero ver todos os profissionais alocados e seus prazos, para decidir rapidamente renovar ou solicitar novos.
2. Como Gestor/POC, quero identificar facilmente os profissionais com contratos a vencer (≤60/≤30 dias), para sinalizar meu interesse de renovação.
3. Como Gestor/POC, quero filtrar por status, especialidade e prazo, para encontrar rapidamente perfis relevantes.
4. Como Gestor/POC, quero abrir um card/modal e ver a linha do tempo (início/fim/renovações), contatos (Teams/e-mail) e anotações, para contextualizar decisões.
5. Como Gestor/POC, quero sinalizar “renovar/reduzir/trocar” diretamente no card/modal, para que a equipe Matilha receba meu interesse.
6. Como Gestor/POC, quero solicitar um novo profissional através de um card/CTA dedicado, para iniciar a conversa comercial.

### 4. Requisitos Funcionais (numerados)
1) Cards (frente) devem exibir:
   - Nome do profissional (a)
   - Especialidade/perfil/nível (b)
   - Projeto atual + cliente (c)
   - Status (em projeto/disponível) com comunicação positiva para “disponível” (d)
   - Prazo restante (dias até término / Indeterminado), com cores por faixa (e, h)
   - Tags/skills e qualificações relevantes; possibilidade de nomes de cargos flexíveis (g)
   - Não exibir custos (f fora do escopo externo)

2) Cards (verso/modal ao clicar) devem incluir:
   - Linha do tempo do contrato (início/fim e renovações) (a)
   - Canais de contato (Teams/e-mail/telefone) tanto do profissional no cliente quanto da Matilha (b)
   - Histórico de alocação (pode ser único) (c)
   - Área de anotações do cliente (avaliar/feedback), registrada e exibida para Matilha (d)
   - Recomendações / labels de interesse do cliente: “Renovar”, “Reduzir”, “Trocar” (f)
   - Campos informativos de rituais/forma de trabalho (reuniões semanais/mensais etc.), preenchidos pela Matilha (g)
   - Não exibir custos/impacto no orçamento (e fora do escopo externo)

3) Ordenação e Agrupamento:
   - Ordenação padrão: Ativos primeiro; dentro de Ativos, por prazo (menor→maior). Permitir o cliente alternar para “ordenar por prazo” explicitamente (1,2)
   - Agrupamentos: por Status (Ativo/Aguardando) e por Especialidade (A,C). Por cliente/projeto não é necessário, pois cada cliente tem seu próprio painel (B explicado)

4) Filtros e Busca:
   - Busca por nome (a)
   - Filtro por status (b)
   - Filtro por especialidade (c)
   - Filtro por prazo (faixas: <15, <30, <60, indeterminado) (d)
   - Filtro por senioridade/nível (e)
   - Botão “Limpar filtros” que reseta todos os filtros e restaura ordenação padrão (g)

5) Ações do Cliente:
   - Solicitar renovação (card/modal; uma das features prioritárias) (a)
   - Solicitar novo profissional (card/CTA em branco acessível) (b)
   - Sinalizar interesse “Esperar” apenas em cards com risco (≤60/≤30 dias) (c)
   - Usar campo de anotação como canal de comunicação; opcionalmente unificar com “abrir chamado” (d)
   - Exportação não requerida nesta fase (e: fora por ora)

6) Alertas e Risco (gestão à vista):
   - Destacar cards com ≤60 dias (amarelo) e ≤30 dias (vermelho) e “Vencido”.
   - Exibir CTA para “Sinalizar interesse” diretamente no card/modal desses estados.

7) Estados de UI:
   - Loading: Skeleton mantendo estrutura do card.
   - Vazio: ícone simples + mensagem curta.
   - Erro: mensagem amigável + CTA “Tentar novamente”.

### 5. Não-Objetivos (Fora de Escopo)
- Exibir quaisquer custos/valores ao cliente (custo mensal, remuneração, orçamento) nesta página.
- Métricas internas de orçamento e margem.
- Exportação (PDF/Excel) nesta fase.

### 6. Considerações de Design (UI/UX)
- Manter look&feel atual (paleta e hierarquia de cores) com “ousadia controlada”.
- Cards em grid com colunas/altura padronizadas, responsivos (xs/sm/md/lg).
- Aplicar faixas de cor suaves/ícones com gradiente discreto para status/risco.
- Destaque por cores: verde (>60), amarelo (≤60), vermelho (≤30), cinza/variação para “vencido”.
- Acessibilidade (contraste AA) e navegação por teclado.
- Animações discretas: hover e fade-in.
- Componentes de filtragem e ordenação consistentes e sempre visíveis.

### 7. Considerações Técnicas
Dados e lógica:
- Ordenação: ativos primeiro; dentro dos ativos, por dias restantes ascendente; vencidos no topo; indeterminados ao final.
- Cálculo de dias: usar `calcularDiasRestantes(contrato)` com tratamento de null (indeterminado).
- Filtros: combinar client-side inicialmente; prever paginação/virtualização para listas longas.

Endpoints/Back-end (novos ou ajustes):
1) POST /api/client-actions/interest
   - Body: { profissionalId, contratoId, interesse: 'RENOVAR'|'REDUZIR'|'TROCAR'|'ESPERAR', comentario? }
   - Retorno: { ok: true, actionId }

2) POST /api/requests/new-professional
   - Body: { especialidade, senioridade, descricao? }
   - Retorno: { ok: true, requestId }

3) POST /api/notes
   - Body: { profissionalId, contratoId, texto }
   - Retorno: { ok: true, noteId }

4) GET /api/allocations/history?profissionalId=...
   - Retorno: [{ projeto, cliente, inicio, fim }]

5) Campos adicionais no cadastro interno do profissional: links de contato (Teams/e-mail/telefone), rituais/forma de trabalho.

Segurança/Privacidade:
- Não exibir custos/remunerações ao cliente.
- Garantir que dados exibidos pertençam ao cliente autenticado.
- LGPD: anotações do cliente são associadas à empresa, com retention padrão da plataforma.

Telemetria (futuro próximo):
- Eventos: abertura de card, clique em “Solicitar renovação”, “Solicitar novo profissional”, aplicação de filtros, ordenação alterada.

### 8. Métricas de Sucesso
- Tempo até ação (renovar/solicitar) – principal, observável ao longo do uso.
- Uso da página: nº de visitas/sessões e tempo médio por sessão.
- Engajamento: cliques em cards/modais e CTAs de interesse.
- Conversão: nº de solicitações de renovação e novos profissionais geradas pela página.
- Meta adicional: aumento de profissionais alocados pelo cliente via plataforma.

### 9. Casos Limite
- Contratos indeterminados: exibir “Indeterminado”, ordenar ao fim dos ativos.
- Vencidos: destacar e oferecer CTA para retomar negociação.
- Profissional em múltiplos projetos: exibir label “Multi-projeto”.
- Dados faltantes (contatos/cliente): placeholders consistentes; manutenção via painel interno.
- Listas longas: prever paginação/virtualização; manter filtros/ordenadores fixos.
- API lenta/offline: Skeleton e aviso de “Tentar novamente” após timeout razoável.

### 10. Perguntas em Aberto
1) Labels de interesse exigem aprovação/fluxo de revisão interno antes de virar atividade comercial?
2) Histórico de alocação virá de quais fontes/tabelas (granularidade de renovações)?
3) Taxonomia de “senioridade/nível” e “especialidade” deverá ser padronizada (dicionário central) para evitar ruídos?
4) Qual SLA/timeout para exibir o estado de erro e “Tentar novamente”?
5) Precisamos de controle de permissão por usuário do cliente (quem pode anotar vs. quem pode solicitar)?


