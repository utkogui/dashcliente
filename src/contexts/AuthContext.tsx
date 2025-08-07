import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

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

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedSessionId}`
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUsuario(data.usuario)
        setSessionId(savedSessionId)
      } else {
        // Sessão inválida, limpar dados
        localStorage.removeItem('sessionId')
        setUsuario(null)
        setSessionId(null)
      }
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
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setUsuario(data.usuario)
        setSessionId(data.sessionId)
        localStorage.setItem('sessionId', data.sessionId)
      } else {
        console.error('Erro no login:', data.error)
        // Retornar mensagem de erro específica
        throw new Error(data.error || 'Erro ao fazer login')
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
        await fetch('http://localhost:3001/api/auth/logout', {
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
