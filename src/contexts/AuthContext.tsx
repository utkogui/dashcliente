import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { loginUser, checkAuth, API_CONFIG } from '../config/api'

// Tipos
interface Usuario {
  id: string
  email: string
  tipo: 'admin' | 'cliente'
  clienteId?: string
  cliente?: {
    id: string
    nome: string
    descricao?: string
  }
}

interface AuthContextType {
  usuario: Usuario | null
  sessionId: string | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  verificarAutenticacao: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar se há sessão salva no localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId')
    if (savedSessionId) {
      setSessionId(savedSessionId)
      verificarAutenticacao()
    } else {
      setLoading(false)
    }
  }, [])

  const verificarAutenticacao = async () => {
    try {
      const savedSessionId = localStorage.getItem('sessionId')
      if (!savedSessionId) {
        setLoading(false)
        return
      }

      // Verificar se o token não expirou
      const tokenData = JSON.parse(atob(savedSessionId.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      if (tokenData.exp < currentTime) {
        console.log('Token expirado')
        localStorage.removeItem('sessionId')
        setUsuario(null)
        setSessionId(null)
        setLoading(false)
        return
      }

      const data = await checkAuth(savedSessionId)
      setUsuario(data.usuario)
      setSessionId(savedSessionId)
      // Se estiver logado como cliente e estiver em rota admin, poderíamos forçar navegação (opcional)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      localStorage.removeItem('sessionId')
      setUsuario(null)
      setSessionId(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, senha: string): Promise<void> => {
    try {
      const data = await loginUser(email, senha)
      
      setUsuario(data.usuario)
      setSessionId(data.sessionId)
      localStorage.setItem('sessionId', data.sessionId)
      
      // Redirecionar baseado no tipo de usuário
      if (data.usuario.tipo === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/visao-cliente')
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erro de conexão. Verifique se o servidor está rodando.')
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (sessionId) {
        await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionId}`
          },
          credentials: 'include'
        })
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      // Limpar dados locais
      localStorage.removeItem('sessionId')
      setUsuario(null)
      setSessionId(null)
      // Redirecionar para login
      navigate('/login')
    }
  }

  const value: AuthContextType = {
    usuario,
    sessionId,
    loading,
    login,
    logout,
    verificarAutenticacao
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
