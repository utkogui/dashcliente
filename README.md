# Bodyshop Manager - Dashboard de Controle de Profissionais

Um dashboard completo para controle de profissionais alocados em bodyshop, desenvolvido com React, TypeScript e Chakra UI.

## 🚀 Funcionalidades

### 📊 Dashboard Principal
- **Visão Geral**: Cards com estatísticas em tempo real
- **Alertas**: Contratos vencendo nos próximos 30 dias
- **Gráficos**: Rentabilidade por profissional e status dos profissionais
- **Progresso**: Barra de progresso para contratos vencendo

### 👥 Gestão de Profissionais
- **Listagem**: Tabela completa com todos os profissionais
- **Busca**: Filtro por nome, especialidade ou email
- **CRUD**: Adicionar, editar e remover profissionais
- **Status**: Controle de status (Ativo, Férias, Inativo)

### 📋 Gestão de Contratos
- **Detalhamento**: Informações completas dos contratos
- **Rentabilidade**: Cálculo automático de margem de lucro
- **Períodos**: Controle de datas de início e fim
- **Valores**: Receita, custo e lucro por contrato

### 🏢 Gestão de Clientes
- **Cadastro**: Informações completas dos clientes
- **Contratos**: Número de contratos ativos por cliente
- **Valores**: Total de receita por cliente

### 📈 Relatórios
- **Evolução Mensal**: Gráfico de linha com receita, custo e lucro
- **Rentabilidade por Cliente**: Gráfico de barras
- **Distribuição por Especialidade**: Gráfico de pizza
- **Performance**: Análise individual por profissional

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Chakra UI** - Biblioteca de componentes
- **React Router** - Navegação
- **Recharts** - Gráficos e visualizações
- **Date-fns** - Manipulação de datas
- **Lucide React** - Ícones
- **Vite** - Build tool

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd dash_ftd
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:5173
```

## 🎯 Como Usar

### Dashboard Principal
- Visualize estatísticas gerais no topo
- Acompanhe contratos vencendo nos próximos 30 dias
- Analise gráficos de rentabilidade e distribuição

### Gestão de Profissionais
- Clique em "Novo Profissional" para adicionar
- Use a busca para filtrar profissionais
- Clique no ícone de edição para modificar dados
- Visualize status com badges coloridos

### Gestão de Contratos
- Monitore rentabilidade em tempo real
- Acompanhe margens de lucro por contrato
- Visualize períodos e valores
- Use filtros para encontrar contratos específicos

### Relatórios
- Selecione o período desejado
- Analise evolução mensal
- Compare performance entre clientes
- Visualize distribuição por especialidade

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🎨 Personalização

### Cores
As cores podem ser personalizadas no arquivo `src/main.tsx`:

```typescript
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      900: '#0d47a1',
    },
  },
})
```

### Dados
Os dados mock estão em `src/data/mockData.ts` e podem ser substituídos por:
- API REST
- Banco de dados
- Arquivo JSON
- LocalStorage

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 📊 Estrutura de Dados

### Profissional
```typescript
interface Profissional {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  valorHora: number;
  status: 'ativo' | 'inativo' | 'ferias';
  dataAdmissao: string;
}
```

### Contrato
```typescript
interface Contrato {
  id: string;
  profissionalId: string;
  clienteId: string;
  dataInicio: string;
  dataFim: string;
  valorHora: number;
  horasMensais: number;
  status: 'ativo' | 'encerrado' | 'pendente';
  valorTotal: number;
  valorRecebido: number;
  valorPago: number;
  margemLucro: number;
  observacoes?: string;
}
```

### Cliente
```typescript
interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  endereco: string;
}
```

## 🚀 Deploy

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run build
gh-pages -d dist
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no GitHub.

---

Desenvolvido com ❤️ para controle eficiente de profissionais em bodyshop.
