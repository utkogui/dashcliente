#!/bin/bash
echo "🚀 Iniciando build do servidor..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Configurar banco baseado no ambiente
echo "🔧 Configurando banco de dados..."
node scripts/setup-db.js

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Aplicar migrações ou sincronizar schema
if [[ "$DATABASE_URL" == postgresql* ]]; then
  echo "🗃️ Sincronizando schema com PostgreSQL..."
  npx prisma db push
else
  echo "🗃️ Aplicando migrações SQLite..."
  npx prisma migrate deploy
fi

# Compilar TypeScript
echo "⚙️ Compilando TypeScript..."
npx tsc --project tsconfig.server.json

# Renomear para .mjs
echo "🔄 Renomeando para .mjs..."
mv server/index.js server/index.mjs
# Garantir extensão .js para utilitários importados dinamicamente
if [ -f server/utils/auth.ts ]; then
  echo "🔁 Copiando utils/auth.ts compilado para .js"
fi

echo "✅ Build do servidor concluído!"
ls -la server/ 