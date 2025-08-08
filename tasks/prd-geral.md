# PRD Geral - Sistema de Gestão de Alocações e Rentabilidade

## 1. Introdução / Visão Geral
O sistema tem como objetivo permitir que:
- **Clientes** vejam quais profissionais da Matilha estão alocados nos seus projetos.
- **Admin (Matilha)** tenha visão de custos, lucros, margens, disponibilidade de profissionais e gestão de contratos.
- **Equipe interna** consiga cadastrar, editar e analisar dados de empresas, profissionais e contratos com precisão financeira.

O projeto já possui módulos de **login e controle de acesso** (com isolamento por cliente) e **melhoria nos cadastros** (empresas e profissionais).  
Agora, o foco é integrar esses módulos para garantir uma visão clara de alocação, rentabilidade e disponibilidade — sem gargalos técnicos ou funcionais.

---

## 2. Fluxo Atual

### Lado Cliente
1. Login
2. Painel com lista de profissionais e empresas (dados filtrados pelo cliente)
3. Visualização de informações básicas

### Lado Admin (Matilha)
1. Login
2. Painel com todos os clientes (via seletor)
3. Acesso a:
   - Cadastro de empresas
   - Cadastro de profissionais
   - Contratos
   - Dashboard e relatórios

---

## 3. Gargalos e Falhas Identificadas
- Integração parcial entre cadastro, contratos e relatórios.
- Possíveis lacunas no cálculo automático de rentabilidade.
- Ausência de visão rápida de **quem está livre** para alocação.
- Dependência manual para verificar margens e custos.
- Possíveis falhas de filtragem por `cliente_id` em algumas queries.
- Performance no dashboard pode degradar com grande volume de dados.

---

## 4. Objetivos
1. **Unificar visão** de alocação, custos, margens e disponibilidade.
2. **Garantir dados consistentes** em todas as telas e relatórios.
3. **Evitar sobreposição de contratos** ou dados conflitantes.
4. **Oferecer ao cliente** apenas as informações relevantes, mantendo sigilo de dados internos.
5. **Facilitar decisões de alocação** com base em informações financeiras e operacionais.

---

## 5. User Stories

### Cliente
- Como cliente, quero visualizar todos os profissionais alocados na minha empresa para saber quem está disponível.
- Como cliente, quero ter uma visão clara de quais contratos estão ativos e seu status.

### Admin (Matilha)
- Como admin, quero ver rapidamente quais profissionais estão livres para novos contratos.
- Como admin, quero calcular automaticamente custo, lucro e margem de cada contrato.
- Como admin, quero filtrar dados por cliente, contrato e período para tomar decisões estratégicas.
- Como admin, quero cadastrar profissionais com todos os dados necessários para melhor alocação (especialidade, tipo de contrato, valores, disponibilidade).

---

## 6. Requisitos Funcionais

### Para Cliente
1. Visualizar lista de profissionais alocados no seu contrato.
2. Ver status básico (ativo, pausado, encerrado) e nome da empresa.

### Para Admin
3. Listar todos os profissionais com status de alocação (livre, alocado, férias).
4. Calcular automaticamente rentabilidade: `valor recebido - impostos - valor pago`.
5. Filtrar por contrato, cliente, profissional e período.
6. Impedir criação de contratos com profissionais já alocados no mesmo período.
7. Permitir cadastro e edição de profissionais com dados completos (incluindo especialidade, tipo de contrato e valores).
8. Permitir cadastro e edição de empresas com campos padronizados.
9. Garantir filtragem por `cliente_id` em todas as queries e APIs.

---

## 7. O que Já Existe
- **Módulo de Login e Controle de Acesso** (PRD concluído e implementado) [oai_citation:4‡prd-modulo-login.md](file-service://file-1gSonfWVQoR3y9Qgq6sVeE).
- **Melhoria nos Cadastros** de empresas e profissionais (PRD e tasks finalizados) [oai_citation:5‡prd-melhoria-cadastros.md](file-service://file-H3Sz6XxqK3VEzimmYu588a) [oai_citation:6‡tasks-prd-melhoria-cadastros.md](file-service://file-MHReERdvy8rAH6Hrw3kxu2).
- **Dashboard e Relatórios** com cards clicáveis e relatório de rentabilidade inicial.

---

## 8. O que Falta / Ajustes Necessários
- Criar visão consolidada de **profissionais livres/alocados**.
- Melhorar cálculos de rentabilidade para casos de valores fechados e por hora.
- Garantir que todos os endpoints de listagem usem filtro por `cliente_id`.
- Otimizar queries do dashboard para evitar lentidão com muitos registros.
- Revisar tratamento de erros e mensagens para o usuário.
- Criar teste de ponta a ponta para fluxo de alocação e rentabilidade.

---

## 9. Dependências e Impactos
- Ajustes no **schema Prisma** (se necessário para disponibilidade).
- Atualizações em endpoints de **contratos e profissionais**.
- Ajustes no **DataContext** para incluir status de alocação.
- Revisão do **Dashboard** para incluir status de disponibilidade.

---

## 10. Métricas de Sucesso
1. 100% das consultas filtradas corretamente por `cliente_id`.
2. Dashboard com tempo de carregamento < 2 segundos para até 5.000 registros.
3. Cálculo de rentabilidade correto em 100% dos contratos testados.
4. Cliente consegue ver apenas dados do próprio contrato.
5. Admin consegue identificar rapidamente quem está livre para alocação.

---

## 11. Questões em Aberto
1. Qual o critério exato para “profissional livre” (sem contrato ativo? sem contrato futuro?)
2. O cliente verá o nome do profissional ou apenas função/posição?
3. Como será tratada a alteração de contrato no meio do período?
4. Há necessidade de exportar esses dados para Excel/PDF no MVP?

---

**Versão:** 1.0  
**Data:** Agosto 2025  
**Status:** Em elaboração para validação no Cursor