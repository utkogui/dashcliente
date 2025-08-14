// Funções de formatação para o sistema

/**
 * Formata endereço para exibição padronizada
 * @param endereco - Endereço a ser formatado
 * @returns Endereço formatado
 */
export const formatEndereco = (endereco: string): string => {
  if (!endereco) return ''
  
  // Remove espaços extras e quebras de linha
  let formatted = endereco.trim().replace(/\s+/g, ' ')
  
  // Capitaliza primeira letra de cada palavra
  formatted = formatted.replace(/\b\w/g, (char) => char.toUpperCase())
  
  // Padroniza abreviações comuns
  formatted = formatted
    .replace(/\bAv\.?\b/gi, 'Av.')
    .replace(/\bR\.?\b/gi, 'R.')
    .replace(/\bDr\.?\b/gi, 'Dr.')
    .replace(/\bSr\.?\b/gi, 'Sr.')
    .replace(/\bSra\.?\b/gi, 'Sra.')
    .replace(/\bNº\.?\b/gi, 'Nº')
    .replace(/\bN°\.?\b/gi, 'N°')
  
  return formatted
}

/**
 * Extrai CEP de um endereço
 * @param endereco - Endereço completo
 * @returns CEP encontrado ou null
 */
export const extractCEP = (endereco: string): string | null => {
  if (!endereco) return null
  
  // Padrão para CEP brasileiro: 00000-000 ou 00000000
  const cepRegex = /\b\d{5}-?\d{3}\b/
  const match = endereco.match(cepRegex)
  
  return match ? match[0] : null
}

/**
 * Formata CEP para exibição
 * @param cep - CEP a ser formatado
 * @returns CEP formatado (00000-000)
 */
export const formatCEP = (cep: string): string => {
  if (!cep) return ''
  
  // Remove caracteres não numéricos
  const numeros = cep.replace(/\D/g, '')
  
  // Verifica se tem 8 dígitos
  if (numeros.length !== 8) {
    return cep // Retorna original se não conseguir formatar
  }
  
  return `${numeros.substring(0, 5)}-${numeros.substring(5)}`
}

/**
 * Valida formato de CEP brasileiro
 * @param cep - CEP a ser validado
 * @returns true se o CEP é válido, false caso contrário
 */
export const validateCEP = (cep: string): boolean => {
  if (!cep) return false
  
  const numeros = cep.replace(/\D/g, '')
  return numeros.length === 8
}

/**
 * Formata valor monetário para exibição
 * @param valor - Valor a ser formatado
 * @returns Valor formatado como moeda brasileira
 */
export const formatCurrency = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

/**
 * Formata percentual para exibição
 * @param percentual - Percentual a ser formatado
 * @returns Percentual formatado
 */
export const formatPercentual = (percentual: number): string => {
  return `${percentual.toFixed(1)}%`
} 

// Funções para cálculos de valores dos contratos
export const calcularValorMensal = (contrato: any): number => {
  if (!contrato) return 0
  
  // Se não tem dataFim, é contrato indeterminado - valor mensal
  if (!contrato.dataFim) {
    return contrato.valorContrato / 12
  }
  
  // Se tem dataFim, calcular valor mensal baseado na duração
  const dataInicio = new Date(contrato.dataInicio)
  const dataFim = new Date(contrato.dataFim)
  const mesesDuracao = Math.max(1, (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + 
    (dataFim.getMonth() - dataInicio.getMonth()))
  
  return contrato.valorContrato / mesesDuracao
}

export const calcularImpostosMensais = (contrato: any): number => {
  if (!contrato) return 0
  
  const valorMensal = calcularValorMensal(contrato)
  const percentualImpostos = contrato.percentualImpostos || 13.0
  
  return valorMensal * (percentualImpostos / 100)
}

export const calcularCustoMensal = (contrato: any): number => {
  if (!contrato || !contrato.profissionais) return 0
  
  return contrato.profissionais.reduce((total: number, prof: any) => {
    if (prof.valorHora && prof.horasMensais) {
      return total + (prof.valorHora * prof.horasMensais)
    } else if (prof.valorFechado) {
      // Para contratos determinados, dividir o valor fechado pela duração
      if (contrato.dataFim) {
        const dataInicio = new Date(contrato.dataInicio)
        const dataFim = new Date(contrato.dataFim)
        const mesesDuracao = Math.max(1, (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + 
          (dataFim.getMonth() - dataInicio.getMonth()))
        return total + (prof.valorFechado / mesesDuracao)
      }
      // Para contratos indeterminados, o valor fechado já é mensal
      return total + prof.valorFechado
    }
    return total
  }, 0)
}

export const calcularMargemMensal = (contrato: any): number => {
  const valorMensal = calcularValorMensal(contrato)
  const impostosMensais = calcularImpostosMensais(contrato)
  const custoMensal = calcularCustoMensal(contrato)
  
  return valorMensal - impostosMensais - custoMensal
}

export const calcularPercentualMargem = (contrato: any): number => {
  const valorMensal = calcularValorMensal(contrato)
  const impostosMensais = calcularImpostosMensais(contrato)
  const valorLiquido = valorMensal - impostosMensais
  
  if (valorLiquido <= 0) return 0
  
  const margemMensal = calcularMargemMensal(contrato)
  return (margemMensal / valorLiquido) * 100
}

// Funções para cálculos agregados
export const calcularValoresAgregados = (contratos: any[]) => {
  const valoresMensais = contratos.reduce((acc, c) => acc + calcularValorMensal(c), 0)
  const valoresTotais = contratos.reduce((acc, c) => acc + (c.valorContrato || 0), 0)
  const custosTotais = contratos.reduce((acc, c) => acc + calcularCustoMensal(c), 0)
  const impostosTotais = contratos.reduce((acc, c) => acc + calcularImpostosMensais(c), 0)
  
  return {
    valoresMensais,
    valoresTotais,
    custosTotais,
    impostosTotais
  }
} 

// Funções para cores dos cards baseado no status e prazo
export const calcularDiasRestantes = (contrato: any): number | null => {
  if (!contrato || !contrato.dataFim) return null
  
  const hoje = new Date()
  const dataFim = new Date(contrato.dataFim)
  const diasRestantes = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  
  return diasRestantes
}

export const getCardStatus = (contrato: any): 'ativo' | 'vencendo' | 'vencendo_breve' | 'vencendo_urgente' | 'encerrado' => {
  if (contrato.status === 'encerrado') return 'encerrado'
  if (!contrato.dataFim) return 'ativo' // Contrato indeterminado
  
  const diasRestantes = calcularDiasRestantes(contrato)
  if (diasRestantes === null) return 'ativo'
  
  if (diasRestantes > 60) return 'ativo'
  if (diasRestantes > 30) return 'vencendo'
  if (diasRestantes > 0) return 'vencendo_breve'
  return 'vencendo_urgente'
}

export const getCardStyle = (contrato: any): React.CSSProperties => {
  const status = getCardStatus(contrato)
  
  switch (status) {
    case 'ativo':
      return {
        boxShadow: '0 4px 16px rgba(34, 197, 94, 0.25)',
        border: '2px solid rgba(34, 197, 94, 0.3)',
        backgroundColor: 'rgba(34, 197, 94, 0.08)'
      }
    case 'vencendo':
      return {
        boxShadow: '0 4px 16px rgba(251, 191, 36, 0.25)',
        border: '2px solid rgba(251, 191, 36, 0.3)',
        backgroundColor: 'rgba(251, 191, 36, 0.08)'
      }
    case 'vencendo_breve':
      return {
        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.08)'
      }
    case 'vencendo_urgente':
      return {
        boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
        border: '2px solid rgba(220, 38, 38, 0.4)',
        backgroundColor: 'rgba(220, 38, 38, 0.12)'
      }
    case 'encerrado':
      return {
        boxShadow: '0 4px 16px rgba(156, 163, 175, 0.25)',
        border: '2px solid rgba(156, 163, 175, 0.3)',
        backgroundColor: 'rgba(156, 163, 175, 0.08)',
        opacity: 0.7
      }
    default:
      return {}
  }
}

export const getStatusBadgeColor = (contrato: any): string => {
  const status = getCardStatus(contrato)
  
  switch (status) {
    case 'ativo':
      return '#22c55e' // verde
    case 'vencendo':
      return '#fbbf24' // amarelo
    case 'vencendo_breve':
      return '#ef4444' // vermelho
    case 'vencendo_urgente':
      return '#dc2626' // vermelho escuro
    case 'encerrado':
      return '#9ca3af' // cinza
    default:
      return '#6b7280'
  }
} 

// Novo helper para cores de risco unificadas (barra superior e fundo do card)
export const getRiskColors = (diasRestantes: number | null): { barBg: string; cardBg: string; text: string } => {
  // Cores mais vívidas e fundos ~15% mais fortes (aumentando a opacidade)
  if (diasRestantes === null) {
    // Indeterminado: verde mais vivo
    return { barBg: '#16a34a', cardBg: 'rgba(22, 163, 74, 0.08)', text: '#16a34a' }
  }
  if (diasRestantes > 60) {
    // > 60 dias: verde mais vivo
    return { barBg: '#16a34a', cardBg: 'rgba(22, 163, 74, 0.08)', text: '#16a34a' }
  }
  if (diasRestantes > 30) {
    // 31–60 dias: amarelo mais fiel (menos ocre)
    return { barBg: '#f59e0b', cardBg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b' }
  }
  if (diasRestantes > 0) {
    // 1–30 dias: vermelho mais vermelho
    return { barBg: '#ef4444', cardBg: 'rgba(239, 68, 68, 0.08)', text: '#ef4444' }
  }
  // Vencido: vermelho profundo
  return { barBg: '#b91c1c', cardBg: 'rgba(185, 28, 28, 0.10)', text: '#b91c1c' }
}