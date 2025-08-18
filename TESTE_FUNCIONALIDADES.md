# 🧪 Guia de Teste de Funcionalidades

## ✅ Status Atual
- **Servidor**: ✅ Rodando com CORS corrigido e JWT implementado
- **Frontend**: ✅ Rodando
- **Login**: ✅ Funcionando com JWT
- **Criação de Clientes**: ✅ Funcionando perfeitamente
- **Sessões**: ✅ Estáveis com JWT (não expiram entre requisições)
- **Banco de Dados**: ✅ Funcionando

## 🔐 Teste de Login

### 1. Acesse o sistema
- **URL**: http://localhost:5173
- **Usuário Admin**: `admin@matilha.com` / `admin123`
- **Usuário Cliente**: `cliente@teste.com` / `cliente123`

### 2. Verifique o redirecionamento
- **Admin**: Deve ir para `/dashboard`
- **Cliente**: Deve ir para `/visao-cliente`

## 👥 Teste de Clientes

### 1. Acesse a página de Clientes
- Navegue para `/clientes` (apenas admin)
- Verifique se a lista de clientes carrega

### 2. Adicione um novo cliente
- Clique no botão "Adicionar Cliente" (+)
- Preencha os campos:
  - **Nome**: Nome do contato
  - **Empresa**: Nome da empresa
  - **Email**: Email válido
  - **Telefone**: (opcional)
  - **Endereço**: (opcional)
  - **Ano de Início**: Ano atual
  - **Segmento**: Escolha da lista
  - **Tamanho**: Pequena/Média/Grande

### 3. Verifique a criação
- O cliente deve aparecer na lista
- Verifique se todos os campos estão corretos

### 4. Edite um cliente
- Clique no ícone de editar (lápis)
- Modifique algum campo
- Salve e verifique se a mudança foi aplicada

### 5. Delete um cliente
- Clique no ícone de deletar (lixeira)
- Confirme a exclusão
- Verifique se foi removido da lista

## 👨‍💼 Teste de Profissionais

### 1. Acesse a página de Profissionais
- Navegue para `/profissionais`
- Verifique se a lista carrega

### 2. Adicione um novo profissional
- Clique em "Adicionar Profissional"
- Preencha os campos obrigatórios
- Verifique se aparece na lista

### 3. Edite um profissional
- Modifique dados existentes
- Verifique se as mudanças são salvas

## 📋 Teste de Contratos

### 1. Acesse a página de Contratos
- Navegue para `/contratos`
- Verifique se a lista carrega

### 2. Crie um novo contrato
- Clique em "Adicionar Contrato"
- Preencha os dados do projeto
- Adicione profissionais ao contrato
- Verifique se é criado corretamente

## 📊 Teste do Dashboard

### 1. Acesse o Dashboard
- Navegue para `/dashboard`
- Verifique se os cards carregam
- Verifique se as estatísticas estão corretas

## 👁️ Teste da Visão do Cliente

### 1. Acesse como usuário cliente
- Faça login com `cliente@teste.com`
- Verifique se vai para `/visao-cliente`

### 2. Verifique os cards
- Cards de profissionais alocados
- Cards de contratos ativos
- Sugestões de profissionais

### 3. Teste as interações
- Adicione notas
- Marque interesses
- Verifique se as ações são salvas

## 🔧 Solução de Problemas

### Se algo não funcionar:

1. **Verifique o console do navegador** (F12 → Console)
2. **Verifique os logs do servidor** no terminal
3. **Teste a API diretamente** com curl
4. **Verifique se o servidor está rodando**

### 🔐 Sistema JWT Implementado

O sistema agora usa **JWT (JSON Web Tokens)** em vez de sessões em memória:
- **Vantagens**: Sessões estáveis, não expiram entre requisições
- **Duração**: Tokens válidos por 24 horas
- **Segurança**: Tokens criptografados e verificados a cada requisição
- **Compatibilidade**: Mantém a mesma interface do frontend

### Comandos úteis:

```bash
# Verificar status do servidor
ps aux | grep "node.*server"

# Verificar status do frontend
ps aux | grep "vite"

# Testar API de login (gera JWT)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@matilha.com","senha":"admin123"}'

# Testar verificação de JWT
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer SEU_JWT_TOKEN"

# Testar criação de cliente com JWT
curl -X POST http://localhost:3001/api/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d '{"nome":"Teste","empresa":"Teste","email":"teste@teste.com","anoInicio":2024,"segmento":"Tecnologia","tamanho":"Média"}'

# Decodificar JWT (para debug)
echo "SEU_JWT_TOKEN" | cut -d. -f2 | base64 -d | jq .
```

## 📝 Checklist de Testes

- [ ] Login como admin
- [ ] Login como cliente
- [ ] Criação de cliente
- [ ] Edição de cliente
- [ ] Exclusão de cliente
- [ ] Criação de profissional
- [ ] Edição de profissional
- [ ] Criação de contrato
- [ ] Dashboard funcionando
- [ ] Visão do cliente funcionando
- [ ] Cards carregando corretamente
- [ ] Modal de detalhes funcionando

## 🚀 Próximos Passos

Após testar todas as funcionalidades:
1. Reporte qualquer problema encontrado
2. Verifique se há inconsistências na interface
3. Teste em diferentes navegadores se necessário
4. Verifique a responsividade em dispositivos móveis
