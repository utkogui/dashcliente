# PRD: Melhoria no Cadastro de Empresas e Profissionais

## 1. Introdução/Visão Geral

Este PRD descreve as melhorias necessárias no sistema de gestão de profissionais para tornar o cadastro de empresas mais consistente e expandir o cadastro de profissionais com controle de valores fechados, impostos e remuneração. O objetivo é melhorar a precisão dos dados financeiros e facilitar o controle de rentabilidade.

### Problema Atual
- Cadastro de empresas com dados inconsistentes
- Sistema limitado apenas a valores por hora
- Falta de controle de impostos e valores pagos aos profissionais
- Dificuldade em calcular rentabilidade real dos contratos

### Objetivo
Implementar um sistema mais robusto para controle financeiro e cadastral, permitindo melhor gestão de rentabilidade e dados mais consistentes.

## 2. Metas

1. **Padronizar cadastro de empresas** com campos essenciais e validações
2. **Expandir cadastro de profissionais** para suportar valores fechados e controle de impostos
3. **Melhorar cálculo de rentabilidade** com consideração de impostos e valores pagos
4. **Implementar relatórios de rentabilidade** por profissional
5. **Criar interface intuitiva** com cards clicáveis no dashboard

## 3. Histórias do Usuário

### Empresas
- **Como** gestor da Matilha, **quero** cadastrar empresas com dados padronizados **para** manter consistência nos registros
- **Como** gestor da Matilha, **quero** registrar o ano de início do relacionamento **para** acompanhar a evolução dos clientes
- **Como** gestor da Matilha, **quero** categorizar empresas por segmento e tamanho **para** melhor organização

### Profissionais
- **Como** gestor da Matilha, **quero** cadastrar profissionais com valores fechados **para** flexibilizar os tipos de contrato
- **Como** gestor da Matilha, **quero** controlar impostos por contrato **para** calcular rentabilidade real
- **Como** gestor da Matilha, **quero** visualizar relatórios de rentabilidade por profissional **para** tomar decisões estratégicas
- **Como** gestor da Matilha, **quero** alternar entre contratos por hora e valores fechados **para** atender diferentes necessidades

### Dashboard
- **Como** gestor da Matilha, **quero** ver cards com nome do profissional e empresa **para** identificação rápida
- **Como** gestor da Matilha, **quero** clicar nos cards **para** ver informações detalhadas
- **Como** gestor da Matilha, **quero** manter os relatórios atuais **para** continuar com as análises existentes

## 4. Requisitos Funcionais

### 4.1 Cadastro de Empresas

1. **O sistema deve** permitir cadastro de empresas com os seguintes campos obrigatórios:
   - Nome da empresa
   - Nome do contato principal
   - Email do contato principal
   - Telefone do contato principal
   - Endereço completo
   - Ano de início do relacionamento com a Matilha
   - Segmento de atuação (dropdown com opções predefinidas)
   - Tamanho da empresa (dropdown: Pequena, Média, Grande)

2. **O sistema deve** validar formato de email e telefone

3. **O sistema deve** padronizar endereços (CEP, cidade, estado)

4. **O sistema deve** permitir edição de todos os campos

5. **O sistema deve** impedir exclusão de empresas com contratos ativos

### 4.2 Cadastro de Profissionais

6. **O sistema deve** permitir cadastro de profissionais com os seguintes campos obrigatórios:
   - Nome completo
   - Email
   - Telefone
   - Especialidade
   - Status (ativo, inativo, férias)
   - Data de admissão

7. **O sistema deve** permitir configuração de remuneração:
   - Tipo de contrato: "Por Hora" ou "Valor Fechado"
   - Valor por hora (quando tipo = "Por Hora")
   - Valor fechado por período (quando tipo = "Valor Fechado")
   - Período do valor fechado (mensal, trimestral, semestral, anual)
   - Valor pago ao profissional
   - Percentual de impostos (padrão 13%, editável por contrato)

8. **O sistema deve** calcular automaticamente:
   - Valor total do contrato (hora × horas mensais ou valor fechado)
   - Valor dos impostos (percentual configurado × valor recebido)
   - Rentabilidade (valor recebido - impostos - valor pago ao profissional)

### 4.3 Contratos

9. **O sistema deve** permitir criação de contratos com:
   - Seleção de profissional (com tipo de remuneração já definido)
   - Seleção de empresa
   - Período do contrato (data início e fim)
   - Valores baseados na configuração do profissional
   - Percentual de impostos específico do contrato
   - Observações

10. **O sistema deve** impedir criação de contratos com profissionais que tenham contratos ativos do tipo oposto

11. **O sistema deve** recalcular valores quando alterado o percentual de impostos

### 4.4 Dashboard

12. **O sistema deve** exibir cards no dashboard com:
   - Nome do profissional
   - Nome da empresa
   - Status do contrato
   - Valor da rentabilidade

13. **O sistema deve** permitir clique nos cards para exibir:
   - Detalhes completos do profissional
   - Detalhes completos da empresa
   - Detalhes do contrato
   - Valores e rentabilidade

14. **O sistema deve** manter os relatórios existentes inalterados

### 4.5 Relatórios

15. **O sistema deve** gerar relatório de rentabilidade por profissional com:
   - Nome do profissional
   - Empresa
   - Tipo de contrato
   - Valor recebido
   - Impostos pagos
   - Valor pago ao profissional
   - Rentabilidade
   - Percentual de rentabilidade

16. **O sistema deve** permitir filtros por período, profissional, empresa e tipo de contrato

## 5. Não-Objetivos (Fora do Escopo)

- Validação de CNPJ via Receita Federal
- Integração com APIs de validação de empresas
- Controle de benefícios (vale refeição, plano de saúde)
- Gestão de férias e 13º salário
- Controle de horas extras
- Múltiplos contatos por empresa
- Dados bancários para pagamentos
- Relatórios fiscais para profissionais
- Cálculo automático de impostos baseado na legislação
- Integração com sistemas de folha de pagamento
- Geração automática de relatórios fiscais

## 6. Considerações de Design

### 6.1 Interface do Usuário
- Manter a estrutura atual do Material-UI
- Implementar wizard de cadastro em etapas para profissionais
- Cards clicáveis no dashboard com hover effects
- Formulários com validação em tempo real
- Mensagens de erro claras e específicas

### 6.2 Experiência do Usuário
- Fluxo intuitivo para alternar entre tipos de contrato
- Feedback visual durante cálculos automáticos
- Confirmações antes de ações destrutivas
- Loading states durante operações assíncronas

## 7. Considerações Técnicas

### 7.1 Banco de Dados
- Atualizar schema do Prisma para incluir novos campos
- Manter compatibilidade com dados existentes
- Implementar migrações para novos campos

### 7.2 API
- Atualizar endpoints existentes
- Adicionar validações no backend
- Implementar cálculos automáticos no servidor

### 7.3 Frontend
- Atualizar formulários existentes
- Implementar novos componentes para wizard
- Manter compatibilidade com dados existentes

## 8. Métricas de Sucesso

1. **Redução de inconsistências**: 90% dos cadastros de empresas com dados padronizados
2. **Flexibilidade de contratos**: 100% dos profissionais podem ter contratos por hora ou valor fechado
3. **Precisão financeira**: Cálculos de rentabilidade com consideração de impostos
4. **Usabilidade**: Tempo de cadastro reduzido em 30% com wizard
5. **Satisfação**: Feedback positivo dos usuários sobre a nova interface

## 9. Questões em Aberto

1. **Validação de dados**: Como validar formatos de endereço automaticamente?
2. **Performance**: Como otimizar cálculos automáticos com muitos contratos?
3. **Backup**: Como migrar dados existentes sem perda de informação?
4. **Testes**: Quais cenários de teste são críticos para garantir qualidade?
5. **Documentação**: Como documentar as mudanças para usuários finais?

---

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Autor**: Sistema de Gestão Matilha  
**Status**: Aguardando Aprovação 