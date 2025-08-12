# Tasks - PRD Geral - Sistema de Gestão de Alocações e Rentabilidade

## Relevant Files

- `prisma/schema.prisma` - Schema do banco de dados (pode precisar de ajustes para disponibilidade)
- `src/utils/disponibilidade.ts` - Utilitários para cálculo de disponibilidade de profissionais
- `src/utils/disponibilidade.test.ts` - Testes para utilitários de disponibilidade
- `src/components/DisponibilidadeProfissionais.tsx` - Componente para visualizar profissionais livres/alocados
- `src/components/DisponibilidadeProfissionais.test.tsx` - Testes para componente de disponibilidade
- `src/pages/CadastroContrato.tsx` - Validação de sobreposição de contratos
- `src/pages/CadastroContrato.test.tsx` - Testes para validação de contratos
- `src/utils/validacaoContratos.ts` - Utilitários para validação de sobreposição
- `src/utils/validacaoContratos.test.ts` - Testes para validação de contratos
- `src/utils/formatters.ts` - Melhorar cálculos de rentabilidade para contratos fechados
- `src/utils/formatters.test.ts` - Testes para cálculos de rentabilidade
- `server/index.ts` - Otimizar queries e garantir filtros por cliente_id
- `server/index.test.ts` - Testes para endpoints da API
- `src/contexts/DataContext.tsx` - Adicionar status de alocação e otimizar carregamento
- `src/contexts/DataContext.test.tsx` - Testes para DataContext
- `src/pages/Dashboard.tsx` - Otimizar performance e adicionar status de disponibilidade
- `src/pages/Dashboard.test.tsx` - Testes para Dashboard
- `src/pages/Relatorios.tsx` - Implementar filtros por período
- `src/pages/Relatorios.test.tsx` - Testes para Relatórios
- `src/components/ErrorBoundary.tsx` - Componente para tratamento de erros
- `src/components/ErrorBoundary.test.tsx` - Testes para ErrorBoundary
- `src/utils/errorHandler.ts` - Utilitários para tratamento de erros
- `src/utils/errorHandler.test.ts` - Testes para tratamento de erros
- `tests/e2e/alocacao-rentabilidade.test.ts` - Testes end-to-end para fluxo completo

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Performance tests should be included for dashboard queries com mais de 5.000 registros.
- Validação de sobreposição deve considerar contratos ativos e futuros.
- Filtros por período devem suportar ranges customizados e períodos predefinidos.

## Tasks

- [ ] 1.0 Implementar Sistema de Disponibilidade de Profissionais
  - [ ] 1.1 Criar utilitários para cálculo de disponibilidade (`src/utils/disponibilidade.ts`)
  - [ ] 1.2 Implementar função para verificar contratos ativos por profissional
  - [ ] 1.3 Criar função para determinar status de disponibilidade (livre, alocado, férias)
  - [ ] 1.4 Criar componente `DisponibilidadeProfissionais` para visualização
  - [ ] 1.5 Adicionar filtros por status de disponibilidade no componente
  - [ ] 1.6 Integrar componente na página de Profissionais
  - [ ] 1.7 Adicionar indicadores visuais de disponibilidade no Dashboard
  - [ ] 1.8 Implementar testes unitários para utilitários de disponibilidade
  - [ ] 1.9 Implementar testes para componente de disponibilidade

- [ ] 2.0 Implementar Validação de Sobreposição de Contratos
  - [ ] 2.1 Criar utilitários para validação de sobreposição (`src/utils/validacaoContratos.ts`)
  - [ ] 2.2 Implementar função para verificar sobreposição de períodos
  - [ ] 2.3 Implementar função para validar disponibilidade do profissional
  - [ ] 2.4 Integrar validação no formulário de cadastro de contratos
  - [ ] 2.5 Adicionar feedback visual de erro para sobreposições
  - [ ] 2.6 Implementar validação em tempo real durante preenchimento
  - [ ] 2.7 Adicionar validação no backend (endpoint de criação de contratos)
  - [ ] 2.8 Implementar testes para validação de sobreposição
  - [ ] 2.9 Implementar testes para formulário de contratos

- [ ] 3.0 Otimizar Performance e Cálculos de Rentabilidade
  - [ ] 3.1 Melhorar função `calcularCustoMensal` para contratos fechados
  - [ ] 3.2 Otimizar função `calcularMargemMensal` para diferentes tipos de contrato
  - [ ] 3.3 Implementar cache de cálculos no DataContext
  - [ ] 3.4 Otimizar queries do dashboard movendo cálculos para o backend
  - [ ] 3.5 Implementar paginação para listagens com muitos registros
  - [ ] 3.6 Adicionar índices no banco de dados para melhorar performance
  - [ ] 3.7 Implementar lazy loading para componentes pesados
  - [ ] 3.8 Criar testes de performance para dashboard com 5.000+ registros
  - [ ] 3.9 Implementar testes para cálculos de rentabilidade

- [ ] 4.0 Implementar Filtros Avançados e Tratamento de Erros
  - [ ] 4.1 Criar componente de filtros por período (`src/components/FiltrosPeriodo.tsx`)
  - [ ] 4.2 Implementar filtros por período nos relatórios
  - [ ] 4.3 Adicionar filtros por período no Dashboard
  - [ ] 4.4 Criar componente ErrorBoundary para captura de erros
  - [ ] 4.5 Implementar utilitários para tratamento de erros (`src/utils/errorHandler.ts`)
  - [ ] 4.6 Padronizar mensagens de erro em todas as páginas
  - [ ] 4.7 Adicionar loading states e feedback visual
  - [ ] 4.8 Implementar retry automático para falhas de API
  - [ ] 4.9 Implementar testes para filtros e tratamento de erros

- [ ] 5.0 Criar Testes de Ponta a Ponta e Validação
  - [ ] 5.1 Configurar ambiente de testes end-to-end
  - [ ] 5.2 Criar teste para fluxo completo de alocação de profissional
  - [ ] 5.3 Criar teste para fluxo de criação de contrato com validação
  - [ ] 5.4 Criar teste para cálculos de rentabilidade
  - [ ] 5.5 Criar teste para filtros por período
  - [ ] 5.6 Criar teste para performance do dashboard
  - [ ] 5.7 Implementar testes de integração para APIs
  - [ ] 5.8 Criar testes de regressão para funcionalidades existentes
  - [ ] 5.9 Configurar CI/CD para execução automática de testes
