#!/bin/bash
echo "🚀 Iniciando build do servidor..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Compilar TypeScript
echo "⚙️ Compilando TypeScript..."
npx tsc --project tsconfig.server.json

# Renomear para .mjs
echo "🔄 Renomeando para .mjs..."
mv server/index.js server/index.mjs

echo "✅ Build do servidor concluído!"
ls -la server/ 