// Funções de validação para o sistema

/**
 * Valida formato de email
 * @param email - Email a ser validado
 * @returns true se o email é válido, false caso contrário
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida formato de telefone brasileiro
 * @param telefone - Telefone a ser validado
 * @returns true se o telefone é válido, false caso contrário
 */
export const validateTelefone = (telefone: string): boolean => {
  // Remove todos os caracteres não numéricos
  const numeros = telefone.replace(/\D/g, '')
  
  // Valida se tem 10 ou 11 dígitos (com DDD)
  if (numeros.length < 10 || numeros.length > 11) {
    return false
  }
  
  // Valida se começa com 9 (celular) ou 2-8 (fixo)
  const ddd = numeros.substring(0, 2)
  const numero = numeros.substring(2)
  
  // DDD válidos (todos os estados)
  const dddsValidos = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '21', '22', '24', '27', '28',
    '31', '32', '33', '34', '35', '37', '38',
    '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '51', '53', '54', '55',
    '61', '62', '63', '64', '65', '66', '67', '68', '69',
    '71', '73', '74', '75', '77', '79',
    '81', '82', '83', '84', '85', '86', '87', '88', '89',
    '91', '92', '93', '94', '95', '96', '97', '98', '99'
  ]
  
  if (!dddsValidos.includes(ddd)) {
    return false
  }
  
  // Para celular (9 dígitos), primeiro dígito deve ser 9
  if (numeros.length === 11 && numero.charAt(0) !== '9') {
    return false
  }
  
  // Para telefone fixo (8 dígitos), primeiro dígito deve ser 2-8
  if (numeros.length === 10 && !/^[2-8]/.test(numero)) {
    return false
  }
  
  return true
}

/**
 * Formata telefone para exibição
 * @param telefone - Telefone a ser formatado
 * @returns Telefone formatado ou string vazia se inválido
 */
export const formatTelefone = (telefone: string): string => {
  if (!telefone) return ''
  
  const numeros = telefone.replace(/\D/g, '')
  
  if (numeros.length === 11) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`
  } else if (numeros.length === 10) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`
  }
  
  return telefone
}

/**
 * Valida se um campo obrigatório está preenchido
 * @param value - Valor a ser validado
 * @returns true se o valor é válido, false caso contrário
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

/**
 * Valida ano de início (deve estar entre 2000 e ano atual + 1)
 * @param ano - Ano a ser validado
 * @returns true se o ano é válido, false caso contrário
 */
export const validateAnoInicio = (ano: number): boolean => {
  const anoAtual = new Date().getFullYear()
  return ano >= 2000 && ano <= anoAtual + 1
} 