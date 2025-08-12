# Tasks - Módulo de Login e Controle de Acesso

## Relevant Files

- ✅ `prisma/schema.prisma` - Schema do banco de dados (atualizado com tabelas de usuários e clientes do sistema)
- ✅ `server/index.ts` - Servidor Express com APIs (atualizado com dados iniciais)
- ✅ `server/utils/auth.ts` - Utilitários de autenticação e criptografia (criado)
- ✅ `server/index.ts` - Servidor Express com APIs (rotas de autenticação adicionadas)
- `src/App.tsx` - Componente principal (precisa de proteção de rotas)
- `src/contexts/DataContext.tsx` - Contexto de dados (precisa de contexto de autenticação)
- ✅ `src/pages/Login.tsx` - Página de login com formulário (criada)
- ✅ `src/contexts/AuthContext.tsx` - Contexto de autenticação (criado)
- ✅ `src/components/Header.tsx` - Header atualizado com logout (modificado)
- ✅ `src/components/AuthGuard.tsx` - Componente de proteção de rotas (criado)
- ✅ `src/App.tsx` - App atualizado com AuthGuard e AuthProvider (modificado)
- ✅ `src/components/ClientSelector.tsx` - Seletor de cliente para admin (criado)
- ✅ `src/pages/GestaoUsuarios.tsx` - Página de gestão de usuários (criada)
- `src/types/index.ts` - Tipos TypeScript (precisa ser atualizado)

### Notes

- O sistema atual usa React + TypeScript + Material-UI no frontend
- Backend usa Express + Prisma + SQLite
- Não há sistema de autenticação atual
- Todas as rotas são públicas atualmente
- Dados não são isolados por cliente

## Tasks

- [x] 1.0 Configuração do Banco de Dados e Autenticação
  - [x] 1.1 Atualizar schema do Prisma com tabelas de usuários e clientes do sistema
  - [x] 1.2 Criar migração do banco de dados para as novas tabelas
  - [x] 1.3 Adicionar campo cliente_id nas tabelas existentes (contratos, profissionais, clientes)
  - [x] 1.4 Criar migração para adicionar campo cliente_id nas tabelas existentes
  - [x] 1.5 Implementar utilitários de criptografia de senha no servidor
  - [x] 1.6 Criar dados iniciais (admin padrão e clientes do sistema)

- [x] 2.0 Implementação do Sistema de Login
  - [x] 2.1 Criar página de login com formulário (email/senha)
  - [x] 2.2 Implementar rotas de autenticação no servidor (/api/auth/login, /api/auth/logout)
  - [x] 2.3 Criar contexto de autenticação (AuthContext) para gerenciar estado do usuário
  - [x] 2.4 Implementar validação de credenciais no frontend
  - [x] 2.5 Adicionar tratamento de erros e feedback visual no login
  - [x] 2.6 Implementar logout funcional

- [x] 3.0 Proteção de Rotas e Middleware
  - [x] 3.1 Criar componente AuthGuard para proteger rotas
  - [x] 3.2 Implementar middleware de autenticação no servidor
  - [x] 3.3 Atualizar App.tsx para usar AuthGuard em todas as rotas
  - [x] 3.4 Implementar redirecionamento automático para login quando não autenticado
  - [x] 3.5 Adicionar botão de logout no Header
  - [x] 3.6 Implementar proteção de rotas da API no servidor

- [x] 4.0 Isolamento de Dados por Cliente
  - [x] 4.1 Atualizar DataContext para incluir filtros por cliente_id
  - [x] 4.2 Modificar todas as APIs do servidor para filtrar por cliente
  - [x] 4.3 Atualizar queries do Prisma para incluir filtro automático
  - [x] 4.4 Implementar lógica de seleção de cliente para administradores
  - [x] 4.5 Criar componente ClientSelector para navegação entre clientes
  - [x] 4.6 Testar isolamento de dados entre diferentes clientes
  - [x] 4.7 Migrar dados existentes para cliente padrão (Matilha)

- [x] 5.0 Gestão de Usuários para Administradores
  - [x] 5.1 Criar página de gestão de usuários (GestaoUsuarios.tsx)
  - [x] 5.2 Implementar APIs para criar novos clientes do sistema
  - [x] 5.3 Implementar APIs para alterar senhas de usuários
  - [x] 5.4 Criar formulário para cadastro de novos clientes
  - [x] 5.5 Implementar geração automática de credenciais iniciais
  - [x] 5.6 Adicionar validações e tratamento de erros na gestão
  - [x] 5.7 Implementar listagem de clientes do sistema
  - [x] 5.8 Adicionar rota de gestão de usuários no App.tsx
