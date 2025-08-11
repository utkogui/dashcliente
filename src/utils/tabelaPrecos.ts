// Tabela de preços por hora baseada no arquivo perfilhoras.csv
export interface TabelaPrecos {
  [perfil: string]: {
    [especialidade: string]: number;
  };
}

export const TABELA_PRECOS: TabelaPrecos = {
  'JUNIOR': {
    'Service Designer': 112.98,
    'Research': 112.98,
    'UX/UI Designer': 112.98,
  },
  'PLENO': {
    'Service Designer': 127.62,
    'Research': 127.62,
    'UX Writer': 127.62,
    'UX/UI Designer': 127.62,
    'Front end Developer': 137.04,
    'Back end Developer': 150.64,
  },
  'SENIOR': {
    'Service Designer': 150.64,
    'Research': 150.64,
    'UX Writer': 150.64,
    'UX/UI Designer': 150.64,
    'Front end Developer': 160.05,
    'Back end Developer': 174.70,
  },
  'Especialista': {
    'Service Designer': 165.70,
    'Research': 165.70,
    'UX Writer': 165.70,
    'UX/UI Designer': 165.70,
    'Front end Developer': 176.06,
    'Back end Developer': 192.17,
  },
};

// Aliases para especialidades (sinônimos e variações comuns)
const ESPECIALIDADE_ALIASES: Record<string, string> = {
  'PESQUISADOR': 'RESEARCH',
  'UX WRITTER': 'UX WRITER',
};

// Função para obter valor por hora baseado no perfil e especialidade
export const obterValorHora = (perfil: string, especialidade: string): number | null => {
  const perfilUpper = perfil.toUpperCase();
  const especialidadeUpper = especialidade.toUpperCase();
  const especialidadeNormalizada = ESPECIALIDADE_ALIASES[especialidadeUpper] || especialidadeUpper;
  
  // Busca exata
  if (TABELA_PRECOS[perfilUpper] && TABELA_PRECOS[perfilUpper][especialidadeNormalizada]) {
    return TABELA_PRECOS[perfilUpper][especialidadeNormalizada];
  }
  
  // Busca por similaridade na especialidade
  for (const [perfilKey, especialidades] of Object.entries(TABELA_PRECOS)) {
    if (perfilKey === perfilUpper) {
      for (const [espKey, valor] of Object.entries(especialidades)) {
        if (espKey.includes(especialidadeNormalizada) || especialidadeNormalizada.includes(espKey)) {
          return valor;
        }
      }
    }
  }
  
  return null;
};

// Função para obter todas as especialidades disponíveis
export const obterEspecialidadesDisponiveis = (): string[] => {
  const especialidades = new Set<string>();
  
  Object.values(TABELA_PRECOS).forEach(perfil => {
    Object.keys(perfil).forEach(especialidade => {
      especialidades.add(especialidade);
    });
  });
  
  return Array.from(especialidades).sort();
};

// Função para obter todos os perfis disponíveis
export const obterPerfisDisponiveis = (): string[] => {
  return Object.keys(TABELA_PRECOS);
};

// Função para obter especialidades disponíveis para um perfil específico
export const obterEspecialidadesPorPerfil = (perfil: string): string[] => {
  const perfilUpper = perfil.toUpperCase();
  return TABELA_PRECOS[perfilUpper] ? Object.keys(TABELA_PRECOS[perfilUpper]) : [];
};
