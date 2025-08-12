# Task List: Melhoria no Cadastro de Empresas e Profissionais

Implementação das melhorias definidas no PRD para tornar o cadastro de empresas mais consistente e expandir o cadastro de profissionais com controle de valores fechados, impostos e remuneração.

## Relevant Files

### Backend (Server)
- `prisma/schema.prisma` - Schema do banco de dados (será atualizado com novos campos)
- `prisma/migrations/` - Migrações do banco de dados (nova migração será criada)
- `server/index.ts` - Servidor Express com endpoints da API (será atualizado)

### Frontend (React)
- `src/contexts/DataContext.tsx` - Contexto de dados (será atualizado para novos campos)
- `src/pages/Clientes.tsx` - Página de empresas (será atualizada com novos campos)
- `src/pages/Profissionais.tsx` - Página de profissionais (será substituída por wizard)
- `src/pages/Contratos.tsx` - Página de contratos (será atualizada para valores fechados)
- `src/pages/Dashboard.tsx` - Dashboard (será atualizado com cards clicáveis)
- `src/pages/Relatorios.tsx` - Relatórios (será atualizado com relatório de rentabilidade)

### Novos Componentes (a serem criados)
- `src/components/ProfissionalWizard.tsx` - Wizard de cadastro de profissionais
- `src/components/ProfissionalWizard.test.tsx` - Testes do wizard
- `src/components/DashboardCard.tsx` - Cards clicáveis do dashboard
- `src/components/DashboardCard.test.tsx` - Testes dos cards
- `src/components/DetalhesModal.tsx` - Modal com detalhes expandidos
- `src/components/DetalhesModal.test.tsx` - Testes do modal
- `src/components/RelatorioRentabilidade.tsx` - Relatório de rentabilidade
- `src/components/RelatorioRentabilidade.test.tsx` - Testes do relatório

### Utilitários (a serem criados)
- `src/utils/validations.ts` - Funções de validação (email, telefone, endereço)
- `src/utils/validations.test.ts` - Testes das validações
- `src/utils/calculations.ts` - Funções de cálculo financeiro
- `src/utils/calculations.test.ts` - Testes dos cálculos
- `src/utils/formatters.ts` - Funções de formatação (endereço, valores)
- `src/utils/formatters.test.ts` - Testes das formatações

### Configuração
- `package.json` - Dependências do projeto (pode precisar de novas dependências)
- `tsconfig.json` - Configuração TypeScript
- `vite.config.ts` - Configuração Vite

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Atualizar Schema do Banco de Dados
  - [x] 1.1 Adicionar novos campos ao modelo Cliente (anoInicio, segmento, tamanho)
  - [x] 1.2 Adicionar novos campos ao modelo Profissional (tipoContrato, valorFechado, periodoFechado, valorPago, percentualImpostos)
  - [x] 1.3 Atualizar modelo Contrato para suportar valores fechados (remover horasMensais, adicionar tipoContrato)
  - [x] 1.4 Criar migração do banco de dados
  - [x] 1.5 Testar migração com dados existentes
  - [x] 1.6 Atualizar seed data para incluir novos campos

- [x] 2.0 Implementar Melhorias no Cadastro de Empresas
  - [x] 2.1 Atualizar interface de cadastro com novos campos obrigatórios
  - [x] 2.2 Implementar dropdown para segmento de atuação (Tecnologia, Saúde, Educação, etc.)
  - [x] 2.3 Implementar dropdown para tamanho da empresa (Pequena, Média, Grande)
  - [x] 2.4 Criar função de validação de email
  - [x] 2.5 Criar função de validação de telefone
  - [x] 2.6 Implementar padronização de endereços (CEP, cidade, estado)
  - [x] 2.7 Atualizar validação de exclusão (verificar contratos ativos)
  - [x] 2.8 Atualizar endpoints da API para novos campos
  - [x] 2.9 Testar formulário de empresas com novos campos

- [x] 3.0 Implementar Wizard de Cadastro de Profissionais
  - [x] 3.1 Criar componente ProfissionalWizard com estrutura multi-step
  - [x] 3.2 Implementar Step 1: Dados pessoais (nome, email, telefone, especialidade)
  - [x] 3.3 Implementar Step 2: Configuração de remuneração (tipo de contrato)
  - [x] 3.4 Implementar campos condicionais baseados no tipo de contrato
  - [x] 3.5 Implementar Step 3: Valores e impostos (valor pago, percentual impostos)
  - [x] 3.6 Implementar validação entre steps
  - [x] 3.7 Implementar navegação entre steps (anterior/próximo)
  - [x] 3.8 Implementar cálculos automáticos no wizard
  - [x] 3.9 Atualizar página de profissionais para usar o wizard
  - [x] 3.10 Testar wizard completo

- [x] 4.0 Atualizar Sistema de Contratos
  - [x] 4.1 Atualizar interface de criação de contratos
  - [x] 4.2 Implementar seleção baseada no tipo de remuneração do profissional
  - [x] 4.3 Adicionar campo de percentual de impostos específico do contrato
  - [x] 4.4 Implementar validação de contratos duplos (tipo oposto)
  - [x] 4.5 Implementar recálculo automático de valores
  - [x] 4.6 Atualizar endpoints da API para novos campos de contratos
  - [x] 4.7 Implementar validações no backend para contratos
  - [x] 4.8 Testar criação e edição de contratos

- [x] 5.0 Implementar Dashboard com Cards Clicáveis e Relatórios
  - [x] 5.1 Criar componente DashboardCard com hover effects
  - [x] 5.2 Implementar cards clicáveis no dashboard
  - [x] 5.3 Criar componente DetalhesModal para informações expandidas
  - [x] 5.4 Implementar exibição de detalhes completos no modal
  - [x] 5.5 Criar componente RelatorioRentabilidade
  - [x] 5.6 Implementar relatório de rentabilidade por profissional
  - [x] 5.7 Adicionar filtros ao relatório (período, profissional, empresa, tipo contrato)
  - [x] 5.8 Manter relatórios existentes funcionando
  - [x] 5.9 Atualizar página de relatórios para incluir novo relatório
  - [x] 5.10 Testar dashboard e relatórios

---

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Status**: Aguardando Implementação 