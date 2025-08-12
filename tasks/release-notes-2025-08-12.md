## Release 2025-08-12 — Visão do Cliente + Ajustes UI/UX

### Principais mudanças
- Visão do Cliente:
  - Ordenação: ativos primeiro e por prazo (menor → maior), vencidos antes, indeterminados por último.
  - Filtros: status, especialidade, prazos (<15/<30/<60/indeterminado), senioridade, busca por nome.
  - Ordenação selecionável (Prazo/Status), limpar filtros, persistência via URL.
  - Cartões com altura consistente e barra superior por status (cores com contraste AA).
  - Label “Multi-projeto” quando aplicável.
  - Modal (verso): linha do tempo, canais de contato, histórico de alocação, anotações do cliente (persistidas), ações de interesse (Renovar/Reduzir/Trocar/Esperar ≤60d), loaders/feedbacks.

- Backend/API:
  - CORS configurado para produção: `https://dashcliente-1.onrender.com` e `https://dashcliente.onrender.com`.
  - Endpoints:
    - POST `/api/client-actions/interest`
    - POST `/api/notes`
    - POST `/api/requests/new-professional`
    - GET `/api/allocations/history?profissionalId=...`
  - Autorização respeitando tipo de usuário e `clienteSistemaId`.

- Contratos:
  - Tabela com coluna “Resultado Mensal” (valor mensal − impostos mensais − custo mensal profissionais) com cores (positivo/negativo).
  - Cadastro de Contrato: reordenação de campos, cálculos mensais consistentes (impostos/líquido), botão OK calcula impostos sobre base mensal, custos diversos descontados do líquido mensal, remoção de “Status” e “Observações” do formulário principal.
  - Modal “Adicionar Profissional”: refatorado para Ant Design, layout responsivo, resumo dinâmico dos profissionais selecionados e correção para projetos por hora.

- Dashboard:
  - “Contratos Encerrados” ocultados na primeira dobra; visíveis apenas via ação explícita.
  - Altura dos cards padronizada.

- Profissionais:
  - Inclusão de especialidades “Pesquisador” e “UX Writer” (com aliases em `tabelaPrecos`).

### Banco de dados
- Novos modelos Prisma: `ClienteInteresse`, `ClienteNota`, `SolicitacaoProfissional`.
- Migração aplicada: `20250812190439_add_cliente_interacoes`.

### Variáveis de ambiente
- API (Render): `CORS_ORIGIN` = `https://dashcliente-1.onrender.com,https://dashcliente.onrender.com`.
- Frontend: `VITE_API_BASE_URL` = `https://dashcliente.onrender.com/api`.

### Validações/QA sugeridos
1) Login em produção (cliente e admin) — deve funcionar sem erro de CORS.
2) Visão do Cliente — verificar ordenação, filtros, persistência na URL e altura dos cards.
3) Modal — salvar anotações, registrar interesse (esperar somente ≤60 dias), ver histórico de alocação e feedbacks de loading/erro.
4) Contratos — conferir “Resultado Mensal” e cores; cadastro com cálculo mensal e custos diversos.
5) Dashboard — “Encerrados” fora da primeira dobra; botão para exibir seção.

### Observações
- Lint: ainda há itens de tipagem (`any`) e imports não usados em partes do código; não bloqueiam build. Planejar passe de limpeza.
- Tamanho do bundle front: acima de 500 kB; considerar split futuro.


