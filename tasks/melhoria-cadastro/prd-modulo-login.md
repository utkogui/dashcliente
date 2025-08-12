# PRD - Módulo de Login e Controle de Acesso

## 1. Introdução/Visão Geral

O sistema atual não possui controle de acesso, permitindo que qualquer pessoa acesse todos os dados. Com o crescimento do negócio e múltiplos clientes (Matilha, FTD, etc.), é necessário implementar um sistema de login que separe os ambientes para que cada cliente tenha acesso apenas aos seus próprios dados.

**Problema:** Falta de isolamento de dados entre diferentes clientes do sistema.
**Objetivo:** Implementar autenticação e controle de acesso para separar os dados de cada cliente.

## 2. Objetivos

1. **Isolamento de Dados:** Cada cliente deve ver apenas seus próprios dados (contratos, profissionais, clientes)
2. **Controle de Acesso:** Apenas usuários autenticados podem acessar o sistema
3. **Gestão de Usuários:** Administrador pode criar novos clientes com acesso independente
4. **Segurança Básica:** Proteção de dados financeiros e contratos através de autenticação
5. **Experiência Simples:** Login direto e intuitivo para os usuários

## 3. User Stories

### Como Administrador (Super Admin)
- **US1:** Como administrador, quero fazer login no sistema para acessar todos os dados de todos os clientes
- **US2:** Como administrador, quero criar novos clientes no sistema para que eles possam acessar seus próprios ambientes
- **US3:** Como administrador, quero navegar entre diferentes clientes para gerenciar múltiplos projetos
- **US4:** Como administrador, quero alterar senhas de clientes quando necessário

### Como Cliente
- **US5:** Como cliente, quero fazer login no sistema para acessar apenas meus dados
- **US6:** Como cliente, quero ver o painel completo (como é hoje) mas apenas com meus dados
- **US7:** Como cliente, quero que meus dados sejam isolados de outros clientes

## 4. Requisitos Funcionais

### 4.1 Autenticação
1. O sistema deve permitir login com email e senha
2. O sistema deve validar credenciais antes de permitir acesso
3. O sistema deve redirecionar usuários não autenticados para a página de login
4. O sistema deve permitir logout do usuário

### 4.2 Controle de Acesso
5. O sistema deve identificar o tipo de usuário (admin ou cliente)
6. O sistema deve filtrar dados baseado no cliente logado
7. O sistema deve permitir que administradores vejam dados de todos os clientes
8. O sistema deve restringir clientes a ver apenas seus próprios dados

### 4.3 Gestão de Usuários (Apenas Admin)
9. O sistema deve permitir que administradores criem novos clientes
10. O sistema deve permitir que administradores alterem senhas de clientes
11. O sistema deve gerar credenciais iniciais para novos clientes
12. O sistema deve permitir que administradores naveguem entre diferentes clientes

### 4.4 Isolamento de Dados
13. O sistema deve associar todos os dados (contratos, profissionais, clientes) a um cliente específico
14. O sistema deve filtrar automaticamente dados baseado no cliente logado
15. O sistema deve garantir que clientes não vejam dados de outros clientes

## 5. Não-Objetivos (Fora do Escopo)

- Recuperação de senha automática
- Registro público de usuários
- Login social (Google, Microsoft)
- Autenticação de dois fatores (2FA)
- Auditoria de logs de acesso
- Integração com sistemas externos
- Controle granular de permissões
- Perfil de usuário com dados pessoais
- Controle de sessão (lembrar login)
- JWT tokens ou OAuth 2.0

## 6. Considerações de Design

### 6.1 Interface de Login
- Página de login simples e limpa
- Campos: Email e Senha
- Botão de login
- Mensagens de erro claras para credenciais inválidas
- Design consistente com o resto do sistema

### 6.2 Navegação
- Administradores devem ter acesso a um seletor de cliente
- Clientes devem ver o painel atual sem modificações visuais
- Logout deve estar acessível em todas as páginas

### 6.3 Feedback ao Usuário
- Mensagens de erro claras para login inválido
- Confirmação de logout
- Indicador visual do cliente atualmente selecionado (para admin)

## 7. Considerações Técnicas

### 7.1 Banco de Dados
- Criar tabela `usuarios` com campos: id, email, senha, tipo (admin/cliente), cliente_id
- Adicionar campo `cliente_id` em todas as tabelas existentes (contratos, profissionais, clientes)
- Criar tabela `clientes_sistema` para gerenciar os clientes do sistema

### 7.2 Autenticação
- Implementar autenticação simples com sessões
- Criptografar senhas antes de salvar no banco
- Implementar middleware de autenticação para proteger rotas

### 7.3 Filtros de Dados
- Implementar filtros automáticos baseados no cliente logado
- Modificar todas as queries para incluir filtro por cliente_id
- Garantir que APIs retornem apenas dados do cliente correto

## 8. Métricas de Sucesso

1. **Funcionalidade:** Sistema de login implementado e funcionando
2. **Isolamento:** Dados de diferentes clientes completamente separados
3. **Segurança:** Apenas usuários autenticados podem acessar o sistema
4. **Usabilidade:** Login simples e intuitivo para todos os usuários
5. **Gestão:** Administrador consegue criar e gerenciar novos clientes

## 9. Questões em Aberto

1. **Credenciais Iniciais:** Como serão geradas e compartilhadas as credenciais iniciais dos novos clientes?
2. **Migração de Dados:** Como associar dados existentes aos clientes corretos?
3. **Nomenclatura:** Como diferenciar "clientes" do sistema (usuários) dos "clientes" do negócio?
4. **URLs:** Será necessário implementar subdomínios ou URLs específicas por cliente?
5. **Backup:** Como garantir backup e recuperação de dados por cliente?

## 10. Cronograma Sugerido

### Fase 1: Estrutura Base (1-2 semanas)
- Criar tabelas de usuários e clientes
- Implementar autenticação básica
- Criar página de login

### Fase 2: Isolamento de Dados (2-3 semanas)
- Adicionar campo cliente_id nas tabelas existentes
- Implementar filtros automáticos
- Testar isolamento de dados

### Fase 3: Gestão de Usuários (1-2 semanas)
- Interface para admin criar novos clientes
- Navegação entre clientes para admin
- Gestão de senhas

### Fase 4: Testes e Refinamentos (1 semana)
- Testes de segurança
- Ajustes de interface
- Documentação

---

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Status:** Em Análise
