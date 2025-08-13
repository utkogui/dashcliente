## QA Cross‑Browser — Página Visão do Cliente

Data: ____/____/____
Responsável: ___________________

Escopo

- Validar UI/UX e acessibilidade dos cards e modal em navegadores Chromium (Chrome/Edge) e Safari.
- Validar responsividade (desktop/tablet/mobile) e infinite scroll.
- Checar ausência de informações financeiras no UI.

Pré‑requisitos

- Ambiente local rodando (frontend e backend) com usuário cliente logado.
- Flag de telemetria opcional (VITE_TELEMETRY_ENABLED) pode ficar desativada.

Matriz de teste (marque com X)

Navegadores: Chrome [ ]  Edge [ ]  Safari [ ]
Larguras: Desktop ≥1200px [ ]  Tablet 768–1024px [ ]  Mobile 375–480px [ ]

Checklist

- [ ] Carregamento inicial da página `#/visao-cliente` sem erros no console
- [ ] Filtros funcionam (status, especialidade, prazo, senioridade) e aplicam debounce em busca
- [ ] Estado dos filtros persiste na URL e é restaurado no refresh (q, status, esp, prazo, sen, ord)
- [ ] Botão “Limpar filtros” reseta filtros e volta para ordenação padrão (prazo)
- [ ] Infinite scroll carrega mais cards; fallback de paginação aparece se IO indisponível
- [ ] Cards: altura/espacamentos/tipografia consistentes; faixa superior + fundo leve conforme risco
- [ ] Acessibilidade: Tab percorre cards; foco visível; Enter abre modal; Esc fecha modal
- [ ] Modal abre e fecha sem recarregar a página; título correto do profissional
- [ ] Linha do tempo: início, término/indeterminado e duração visual (12 meses para indeterminado)
- [ ] Canais de contato: renderizam apenas quando houver dado; links de Teams/Email abrem corretamente
- [ ] Histórico de alocação: skeleton durante fetch; itens renderizados; lida com erro/sem dados
- [ ] Anotações: salvar com sucesso (mostra feedback); trata erro de API
- [ ] Interesse: “Renovar” sempre visível; “Esperar” apenas quando ≤60 dias; POST com sucesso
- [ ] Mensagens de erro/vazio exibidas com estilo consistente e botão de “Tentar novamente”
- [ ] Responsividade: grid mantém colunas/altura dos cards estáveis nos breakpoints (xs/sm/md/lg)
- [ ] Contraste: textos e indicadores (verde/amarelo/vermelho) atingem contraste mínimo AA
- [ ] Nenhuma informação financeira exposta ao cliente
- [ ] Performance: scroll fluido, sem travamentos
- [ ] Telemetria (opcional): logs de `card_open`, `filters_change`, `interest_click` no console

Observações/Issues encontradas

- Descrever aqui com passos para reproduzir e screenshots quando possível.


