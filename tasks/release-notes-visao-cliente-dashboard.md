## Release Notes — Visão do Cliente (Dashboard)

Data: 2025-08-13

Resumo

- Cards padronizados (Ant Design) com altura fixa, tipografia unificada e cores de risco (faixa + fundo leve).
- Filtros com debounce, ordenação, “Limpar filtros” e persistência via URL.
- Infinite scroll com IntersectionObserver e fallback para paginação.
- Acessibilidade: foco visível, Tab navega e Enter abre modal; modal com suporte a teclado.
- Modal com: linha do tempo (inclui duração visual de 12 meses p/ indeterminados), canais de contato (cliente/Matilha), histórico de alocação (lazy + skeleton + tratamento de erros), anotações do cliente, e ações de interesse (Renovar/Esperar ≤60 dias).
- Telemetria básica: `card_open`, `filters_change`, `interest_click` com flag para desativar em produção.
- Backend: validações de interesse (cliente só RENOVAR/ESPERAR), histórico já retorna strings planas, logs de erro com contexto.

Critérios de aceite atendidos

- Cards com informações solicitadas (nome, especialidade/nível, cliente+projeto, status positivo, prazo, tags, ícones de contato condicionais).
- Ordenação padrão por prazo e alternativa ativos primeiro; filtros por status/especialidade/prazo/senioridade; estado em URL.
- Não exibir quaisquer custos ao cliente (checagem visual feita).
- Modal com linha do tempo, contatos, histórico, anotações e ações (Renovar/Esperar).

Observações

- Cross‑browser básico previsto; recomendamos validação manual final em Chrome/Edge/Safari (tarefa 7.3).
- Telemetria atualmente em console; integração futura com endpoint/analytics.


