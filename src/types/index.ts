export interface Profissional {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  especialidade: string;
  perfil?: string;
  especialidadeEspecifica?: string;
  dataInicio: string;
  tipoContrato: 'hora' | 'fechado';
  valorHora?: number;
  valorFechado?: number;
  periodoFechado?: string;
  valorPago: number;
  status: 'ativo' | 'inativo' | 'ferias';
  tags?: string;
  clienteId: string;
  contatoClienteEmail?: string;
  contatoClienteTeams?: string;
  contatoClienteTelefone?: string;
  contatoMatilhaEmail?: string;
  contatoMatilhaTeams?: string;
  contatoMatilhaTelefone?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  endereco: string;
  anoInicio: number;
  segmento: string;
  tamanho: string;
}

export interface Contrato {
  id: string;
  nomeProjeto: string;
  codigoContrato?: string;
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