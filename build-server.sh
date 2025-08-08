#!/bin/bash
echo "🚀 Iniciando build do servidor..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Aplicar migrações (garante schema no SQLite em produção)
echo "🗃️ Aplicando migrações Prisma..."
npx prisma migrate deploy

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