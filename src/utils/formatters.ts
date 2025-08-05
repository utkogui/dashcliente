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