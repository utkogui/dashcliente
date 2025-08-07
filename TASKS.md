# Melhoria no Cadastro de Empresas e Profissionais - Implementação

Implementação das melhorias definidas no PRD para tornar o cadastro de empresas mais consistente e expandir o cadastro de profissionais com controle de valores fechados, impostos e remuneração.

## Completed Tasks

- [x] Criar PRD detalhado com requisitos funcionais
- [x] Definir arquitetura técnica (Backend API + Frontend React)
- [x] Configurar banco de dados SQLite com Prisma
- [x] Implementar sistema base de CRUD

## In Progress Tasks

- [ ] Atualizar schema do banco de dados para novos campos

## Future Tasks

### Fase 1: Banco de Dados e API
- [ ] Atualizar schema do Prisma para incluir novos campos de empresas
- [ ] Atualizar schema do Prisma para incluir novos campos de profissionais
- [ ] Criar migração do banco de dados
- [ ] Atualizar endpoints da API para empresas
- [ ] Atualizar endpoints da API para profissionais
- [ ] Implementar validações no backend
- [ ] Implementar cálculos automáticos de rentabilidade no servidor
- [ ] Testar endpoints da API

### Fase 2: Frontend - Cadastro de Empresas
- [ ] Atualizar interface de cadastro de empresas com novos campos
- [ ] Implementar validação de email e telefone
- [ ] Implementar padronização de endereços
- [ ] Adicionar dropdowns para segmento e tamanho da empresa
- [ ] Implementar validação de exclusão (contratos ativos)
- [ ] Testar formulário de empresas

### Fase 3: Frontend - Cadastro de Profissionais
- [ ] Implementar wizard de cadastro em etapas para profissionais
- [ ] Adicionar seleção de tipo de contrato (hora vs. valor fechado)
- [ ] Implementar campos condicionais baseados no tipo de contrato
- [ ] Adicionar campo de percentual de impostos
- [ ] Implementar cálculos automáticos no frontend
- [ ] Validar impedimento de contratos duplos
- [ ] Testar wizard de profissionais

### Fase 4: Frontend - Contratos
- [x] Atualizar interface de criação de contratos
- [x] Implementar seleção baseada no tipo de remuneração do profissional
- [x] Adicionar campo de percentual de impostos específico do contrato
- [x] Implementar recálculo automático de valores
- [x] Validar criação de contratos (tipo oposto)
- [x] Testar criação e edição de contratos
- [x] Adicionar campo "Código do Contrato" na página de cadastro
- [x] Exibir código do contrato no modal de detalhes do dashboard

### Fase 5: Dashboard e Relatórios
- [ ] Implementar cards clicáveis no dashboard
- [ ] Criar modal/drawer para detalhes expandidos
- [ ] Implementar relatório de rentabilidade por profissional
- [ ] Adicionar filtros nos relatórios
- [ ] Manter relatórios existentes funcionando
- [ ] Testar dashboard e relatórios

### Fase 6: Testes e Refinamentos
- [ ] Testes de integração end-to-end
- [ ] Validação de cálculos financeiros
- [ ] Testes de usabilidade
- [ ] Correção de bugs identificados
- [ ] Otimização de performance
- [ ] Documentação para usuários finais

## Implementation Plan

### Arquitetura Geral
- **Backend**: Express.js + Prisma + SQLite
- **Frontend**: React + Material-UI + TypeScript
- **Comunicação**: API REST entre frontend e backend
- **Estado**: React Context para gerenciamento de estado global

### Fluxo de Dados
1. **Cadastro de Empresas**: Formulário → Validação → API → Banco
2. **Cadastro de Profissionais**: Wizard → Validação → API → Banco
3. **Contratos**: Seleção → Cálculos → API → Banco
4. **Dashboard**: API → Dados → Cards → Detalhes

### Componentes Principais
- **Wizard de Profissionais**: Componente multi-step para cadastro
- **Cards do Dashboard**: Componentes clicáveis com hover effects
- **Formulários Validados**: Componentes com validação em tempo real
- **Relatórios**: Componentes de visualização de dados

## Relevant Files

### Backend (Server)
- `server/index.ts` - Servidor Express com endpoints da API
- `prisma/schema.prisma` - Schema do banco de dados (será atualizado)
- `prisma/migrations/` - Migrações do banco de dados

### Frontend (React)
- `src/contexts/DataContext.tsx` - Contexto de dados (será atualizado)
- `src/pages/Clientes.tsx` - Página de empresas (será atualizada)
- `src/pages/Profissionais.tsx` - Página de profissionais (será atualizada)
- `src/pages/Contratos.tsx` - Página de contratos (será atualizada)
- `src/pages/Dashboard.tsx` - Dashboard (será atualizado)
- `src/pages/Relatorios.tsx` - Relatórios (será atualizado)

### Novos Componentes (a serem criados)
- `src/components/ProfissionalWizard.tsx` - Wizard de cadastro de profissionais
- `src/components/DashboardCard.tsx` - Cards clicáveis do dashboard
- `src/components/DetalhesModal.tsx` - Modal com detalhes expandidos
- `src/components/RelatorioRentabilidade.tsx` - Relatório de rentabilidade

### Configuração
- `package.json` - Dependências do projeto
- `tsconfig.json` - Configuração TypeScript
- `vite.config.ts` - Configuração Vite

## Technical Considerations

### Banco de Dados
- **Migração**: Criar migração para novos campos sem perder dados existentes
- **Compatibilidade**: Manter compatibilidade com dados atuais
- **Performance**: Otimizar queries para cálculos automáticos

### API
- **Validação**: Implementar validação robusta no backend
- **Cálculos**: Centralizar cálculos financeiros no servidor
- **Erro Handling**: Melhorar tratamento de erros

### Frontend
- **Estado**: Gerenciar estado complexo do wizard
- **Validação**: Implementar validação em tempo real
- **UX**: Criar experiência fluida e intuitiva

## Success Criteria

- [ ] 90% dos cadastros de empresas com dados padronizados
- [ ] 100% dos profissionais podem ter contratos por hora ou valor fechado
- [ ] Cálculos de rentabilidade precisos com impostos
- [ ] Tempo de cadastro reduzido em 30% com wizard
- [ ] Feedback positivo dos usuários sobre nova interface

---

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Status**: Em Implementação 