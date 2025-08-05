export interface Profissional {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  valorHora: number;
  status: 'ativo' | 'inativo' | 'ferias';
  dataAdmissao: string;
}

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface Contrato {
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

export interface DashboardStats {
  totalProfissionais: number;
  profissionaisAtivos: number;
  contratosAtivos: number;
  contratosVencendo: number;
  receitaTotal: number;
  custoTotal: number;
  lucroTotal: number;
  margemMedia: number;
} 