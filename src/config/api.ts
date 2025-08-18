// Configuração da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (
    process.env.NODE_ENV === 'production'
      ? 'https://dashcliente.onrender.com/api'
      : 'http://localhost:3001/api'
  ),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
}

// Função para fazer requisições à API
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  }

  return fetch(url, defaultOptions)
}

// Função específica para login
export const loginUser = async (email: string, senha: string) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Erro ao fazer login')
  }

  return response.json()
}

// Função para verificar autenticação
export const checkAuth = async (sessionId: string) => {
  const response = await apiRequest('/auth/me', {
    headers: {
      'Authorization': `Bearer ${sessionId}`,
    },
  })

  if (!response.ok) {
    throw new Error('Sessão inválida')
  }

  return response.json()
}
