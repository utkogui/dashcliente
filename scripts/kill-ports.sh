#!/bin/bash

# Script para liberar todas as portas do projeto
echo "🔧 Liberando portas do projeto..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para matar processo na porta
kill_port() {
    local port=$1
    local process_name=$2
    
    echo -e "${YELLOW}🔍 Verificando porta $port ($process_name)...${NC}"
    
    # Encontrar PID do processo na porta
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo -e "${RED}❌ Processo encontrado na porta $port (PID: $pid)${NC}"
        echo -e "${YELLOW}🔄 Matando processo...${NC}"
        
        # Tentar matar o processo
        kill -9 $pid 2>/dev/null
        
        # Verificar se foi morto
        sleep 1
        local new_pid=$(lsof -ti:$port 2>/dev/null)
        
        if [ -z "$new_pid" ]; then
            echo -e "${GREEN}✅ Porta $port liberada com sucesso!${NC}"
        else
            echo -e "${RED}❌ Falha ao liberar porta $port${NC}"
        fi
    else
        echo -e "${GREEN}✅ Porta $port já está livre${NC}"
    fi
}

# Função para matar processos por nome
kill_process() {
    local process_name=$1
    local pattern=$2
    
    echo -e "${YELLOW}🔍 Verificando processos $process_name...${NC}"
    
    # Encontrar PIDs dos processos
    local pids=$(pgrep -f "$pattern" 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "${RED}❌ Processos $process_name encontrados (PIDs: $pids)${NC}"
        echo -e "${YELLOW}🔄 Matando processos...${NC}"
        
        # Matar todos os processos
        echo $pids | xargs kill -9 2>/dev/null
        
        # Verificar se foram mortos
        sleep 1
        local new_pids=$(pgrep -f "$pattern" 2>/dev/null)
        
        if [ -z "$new_pids" ]; then
            echo -e "${GREEN}✅ Processos $process_name mortos com sucesso!${NC}"
        else
            echo -e "${RED}❌ Falha ao matar alguns processos $process_name${NC}"
        fi
    else
        echo -e "${GREEN}✅ Nenhum processo $process_name rodando${NC}"
    fi
}

echo -e "${YELLOW}🚀 Iniciando limpeza de portas e processos...${NC}"
echo ""

# Liberar portas específicas do projeto
kill_port 3001 "Backend API"
kill_port 5173 "Frontend Vite"
kill_port 3000 "Frontend alternativo"

echo ""
echo -e "${YELLOW}🔍 Verificando processos do projeto...${NC}"

# Matar processos específicos do projeto
kill_process "tsx server/index.ts" "tsx server/index.ts"
kill_process "vite" "vite"
kill_process "concurrently" "concurrently"
kill_process "npm run" "npm run"

echo ""
echo -e "${YELLOW}🔍 Verificando processos Node.js...${NC}"

# Matar todos os processos Node.js (cuidado!)
read -p "⚠️  Deseja matar TODOS os processos Node.js? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kill_process "Node.js" "node"
else
    echo -e "${GREEN}✅ Mantendo processos Node.js ativos${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Limpeza concluída!${NC}"
echo -e "${YELLOW}💡 Dica: Use 'npm run dev:full' para iniciar o projeto novamente${NC}"
