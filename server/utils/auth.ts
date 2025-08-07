import bcrypt from 'bcryptjs'

/**
 * Utilitários para autenticação e criptografia de senhas
 */

// Configuração do bcrypt
const SALT_ROUNDS = 12

/**
 * Criptografa uma senha usando bcrypt
 * @param senha - Senha em texto plano
 * @returns Promise<string> - Senha criptografada
 */
export const criptografarSenha = async (senha: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const senhaCriptografada = await bcrypt.hash(senha, salt)
    return senhaCriptografada
  } catch (error) {
    console.error('Erro ao criptografar senha:', error)
    throw new Error('Erro ao criptografar senha')
  }
}

/**
 * Verifica se uma senha corresponde à versão criptografada
 * @param senha - Senha em texto plano
 * @param senhaCriptografada - Senha criptografada do banco
 * @returns Promise<boolean> - true se as senhas correspondem
 */
export const verificarSenha = async (senha: string, senhaCriptografada: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(senha, senhaCriptografada)
  } catch (error) {
    console.error('Erro ao verificar senha:', error)
    return false
  }
}

/**
 * Gera uma senha aleatória para novos usuários
 * @param tamanho - Tamanho da senha (padrão: 8)
 * @returns string - Senha aleatória
 */
export const gerarSenhaAleatoria = (tamanho: number = 8): string => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let senha = ''
  
  for (let i = 0; i < tamanho; i++) {
    const indice = Math.floor(Math.random() * caracteres.length)
    senha += caracteres.charAt(indice)
  }
  
  return senha
}

/**
 * Valida formato de email
 * @param email - Email a ser validado
 * @returns boolean - true se o email é válido
 */
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida força da senha
 * @param senha - Senha a ser validada
 * @returns {valida: boolean, mensagem: string} - Resultado da validação
 */
export const validarSenha = (senha: string): { valida: boolean; mensagem: string } => {
  if (senha.length < 6) {
    return { valida: false, mensagem: 'Senha deve ter pelo menos 6 caracteres' }
  }
  
  if (senha.length > 50) {
    return { valida: false, mensagem: 'Senha deve ter no máximo 50 caracteres' }
  }
  
  return { valida: true, mensagem: 'Senha válida' }
}
