# Configuração da Vercel

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente na Vercel:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_LvhHJDS3B1Rs@ep-nameless-firefly-a8nzhm1o.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. JWT_SECRET
```
sua-chave-secreta-super-segura-aqui
```

## Como Configurar

1. Acesse o dashboard da Vercel
2. Vá em Settings > Environment Variables
3. Adicione as variáveis acima
4. Faça o deploy

## Estrutura da API

- `/api/health` - Health check
- `/api/auth/login` - Login
- `/api/auth/me` - Verificar autenticação

## Funcionamento

- Frontend: Deployado na Vercel
- API: Serverless functions da Vercel
- Banco: PostgreSQL (Neon)
- Autenticação: JWT
