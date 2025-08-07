#!/bin/bash

# Script de build para Render
echo "🚀 Iniciando build para Render..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar Prisma client
echo "🗄️ Gerando Prisma client..."
npx prisma generate

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ -d "dist" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Conteúdo da pasta dist:"
    ls -la dist/
else
    echo "❌ Erro no build!"
    exit 1
fi
