// Máscaras para campos de entrada
export const masks = {
  // Telefone: (11) 99999-9999
  telefone: '(99) 99999-9999',
  
  // Telefone fixo: (11) 3333-3333
  telefoneFixo: '(99) 9999-9999',
  
  // Celular: (11) 99999-9999
  celular: '(99) 99999-9999',
  
  // CEP: 99999-999
  cep: '99999-999',
  
  // CPF: 999.999.999-99
  cpf: '999.999.999-99',
  
  // CNPJ: 99.999.999/9999-99
  cnpj: '99.999.999/9999-99',
  
  // Data: 99/99/9999
  data: '99/99/9999',
  
  // Hora: 99:99
  hora: '99:99',
  
  // Valor monetário: 999.999,99 (sem R$ pois é adicionado via InputAdornment)
  valor: '999.999,99',
  
  // Percentual: 99,99%
  percentual: '99,99%',
  
  // Ano: 9999
  ano: '9999',
  
  // Número inteiro: 999999
  numero: '999999',
  
  // Decimal: 999.99
  decimal: '999.99'
}

// Funções para aplicar máscaras
export const applyMask = {
  // Remove caracteres não numéricos
  removeNonNumeric: (value: string): string => {
    return value.replace(/\D/g, '')
  },
  
  // Formata telefone
  formatTelefone: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  },
  
  // Formata CEP
  formatCEP: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  },
  
  // Formata CPF
  formatCPF: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },
  
  // Formata CNPJ
  formatCNPJ: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  },
  
  // Formata data
  formatData: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
  },
  
  // Formata valor monetário
  formatValor: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    const floatValue = parseFloat(numbers) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(floatValue)
  },
  
  // Formata percentual
  formatPercentual: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    const floatValue = parseFloat(numbers) / 100
    return `${floatValue.toFixed(2).replace('.', ',')}%`
  }
}

// Validações específicas
export const validateMask = {
  // Valida telefone (10 ou 11 dígitos)
  telefone: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '')
    return numbers.length >= 10 && numbers.length <= 11
  },
  
  // Valida CEP (8 dígitos)
  cep: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '')
    return numbers.length === 8
  },
  
  // Valida CPF (11 dígitos)
  cpf: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '')
    return numbers.length === 11
  },
  
  // Valida CNPJ (14 dígitos)
  cnpj: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '')
    return numbers.length === 14
  },
  
  // Valida data
  data: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length !== 8) return false
    
    const dia = parseInt(numbers.substring(0, 2))
    const mes = parseInt(numbers.substring(2, 4))
    const ano = parseInt(numbers.substring(4, 8))
    
    if (mes < 1 || mes > 12) return false
    if (dia < 1 || dia > 31) return false
    if (ano < 1900 || ano > 2100) return false
    
    return true
  }
} 