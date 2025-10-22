// Configuração da API
const getApiBaseUrl = () => {
  // Se há uma variável de ambiente definida, use ela
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('🔗 Usando VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Detectar ambiente baseado no hostname
  const hostname = window.location.hostname
  console.log('🌐 Hostname detectado:', hostname)
  
  // Se está na Vercel, usar a própria Vercel
  if (hostname.includes('vercel.app')) {
    console.log('✅ Detectado Vercel - usando /api')
    return '/api'
  }
  
  // Se está acessando via IP da rede (10.0.1.214), usar o IP do servidor
  if (hostname === '10.0.1.214') {
    console.log('✅ Detectado IP da rede - usando IP local')
    return 'http://10.0.1.214:3001/api'
  }
  
  // Para localhost, usar localhost
  console.log('✅ Localhost - usando localhost:3001')
  return 'http://localhost:3001/api'
}

const apiBaseUrl = getApiBaseUrl()
console.log('🔗 API Base URL:', apiBaseUrl)

export const API_CONFIG = {
  BASE_URL: apiBaseUrl,
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
