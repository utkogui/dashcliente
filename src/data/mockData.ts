// Definição dos tipos
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

interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  endereco: string;
}

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

export const profissionais: Profissional[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-1111',
    especialidade: 'Desenvolvedor Full Stack',
    valorHora: 120,
    status: 'ativo',
    dataAdmissao: '2023-01-15'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '(11) 99999-2222',
    especialidade: 'UX/UI Designer',
    valorHora: 100,
    status: 'ativo',
    dataAdmissao: '2023-03-20'
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    telefone: '(11) 99999-3333',
    especialidade: 'DevOps Engineer',
    valorHora: 150,
    status: 'ativo',
    dataAdmissao: '2023-02-10'
  },
  {
    id: '4',
    nome: 'Ana Oliveira',
    email: 'ana.oliveira@email.com',
    telefone: '(11) 99999-4444',
    especialidade: 'Product Manager',
    valorHora: 130,
    status: 'ferias',
    dataAdmissao: '2023-04-05'
  },
  {
    id: '5',
    nome: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    telefone: '(11) 99999-5555',
    especialidade: 'Data Scientist',
    valorHora: 140,
    status: 'ativo',
    dataAdmissao: '2023-05-12'
  }
];

export const clientes: Cliente[] = [
  {
    id: '1',
    nome: 'Roberto Almeida',
    empresa: 'TechCorp Solutions',
    email: 'roberto@techcorp.com',
    telefone: '(11) 88888-1111',
    endereco: 'Rua das Flores, 123 - São Paulo, SP'
  },
  {
    id: '2',
    nome: 'Fernanda Lima',
    empresa: 'Inovação Digital Ltda',
    email: 'fernanda@inovacao.com',
    telefone: '(11) 88888-2222',
    endereco: 'Av. Paulista, 1000 - São Paulo, SP'
  },
  {
    id: '3',
    nome: 'Marcelo Souza',
    empresa: 'StartupXYZ',
    email: 'marcelo@startupxyz.com',
    telefone: '(11) 88888-3333',
    endereco: 'Rua Augusta, 500 - São Paulo, SP'
  }
];

export const contratos: Contrato[] = [
  {
    id: '1',
    profissionalId: '1',
    clienteId: '1',
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31',
    valorHora: 180,
    horasMensais: 160,
    status: 'ativo',
    valorTotal: 345600,
    valorRecebido: 259200,
    valorPago: 230400,
    margemLucro: 115200,
    observacoes: 'Contrato de desenvolvimento de sistema ERP'
  },
  {
    id: '2',
    profissionalId: '2',
    clienteId: '1',
    dataInicio: '2024-02-01',
    dataFim: '2024-11-30',
    valorHora: 150,
    horasMensais: 120,
    status: 'ativo',
    valorTotal: 180000,
    valorRecebido: 135000,
    valorPago: 120000,
    margemLucro: 60000,
    observacoes: 'Design de interface mobile'
  },
  {
    id: '3',
    profissionalId: '3',
    clienteId: '2',
    dataInicio: '2024-01-15',
    dataFim: '2024-10-15',
    valorHora: 200,
    horasMensais: 140,
    status: 'ativo',
    valorTotal: 252000,
    valorRecebido: 189000,
    valorPago: 210000,
    margemLucro: 42000,
    observacoes: 'Infraestrutura cloud e CI/CD'
  },
  {
    id: '4',
    profissionalId: '4',
    clienteId: '2',
    dataInicio: '2024-03-01',
    dataFim: '2024-08-31',
    valorHora: 160,
    horasMensais: 100,
    status: 'ativo',
    valorTotal: 96000,
    valorRecebido: 72000,
    valorPago: 65000,
    margemLucro: 31000,
    observacoes: 'Gestão de produto digital'
  },
  {
    id: '5',
    profissionalId: '5',
    clienteId: '3',
    dataInicio: '2024-02-15',
    dataFim: '2024-09-15',
    valorHora: 170,
    horasMensais: 150,
    status: 'ativo',
    valorTotal: 178500,
    valorRecebido: 133875,
    valorPago: 157500,
    margemLucro: 21375,
    observacoes: 'Análise de dados e machine learning'
  },
  {
    id: '6',
    profissionalId: '1',
    clienteId: '3',
    dataInicio: '2023-12-01',
    dataFim: '2024-05-31',
    valorHora: 160,
    horasMensais: 120,
    status: 'ativo',
    valorTotal: 115200,
    valorRecebido: 86400,
    valorPago: 76800,
    margemLucro: 38400,
    observacoes: 'Desenvolvimento de API REST'
  }
]; 