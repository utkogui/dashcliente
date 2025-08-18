import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useAuth } from './AuthContext'

// Tipos
interface Profissional {
  id: string
  nome: string
  email: string
  especialidade: string
  perfil: string | null
  especialidadeEspecifica: string | null
  valorHora: number | null
  status: 'ativo' | 'inativo' | 'ferias'
  dataInicio: string
  tipoContrato: 'hora' | 'fechado'
  valorFechado: number | null
  periodoFechado: string | null
  valorPago: number
  tags: string | null
  // Canais de contato
  contatoClienteEmail?: string | null
  contatoClienteTeams?: string | null
  contatoClienteTelefone?: string | null
  contatoMatilhaEmail?: string | null
  contatoMatilhaTeams?: string | null
  contatoMatilhaTelefone?: string | null
  clienteId: string
  createdAt?: string
  updatedAt?: string
}

interface Cliente {
  id: string
  nome: string
  empresa: string
  email: string
  telefone?: string
  endereco?: string
  anoInicio: number
  segmento: string
  tamanho: string
}

interface DespesaAdicional {
  id: string
  contratoId: string
  descricao: string
  valor: number
}

interface Contrato {
  id: string
  nomeProjeto: string
  codigoContrato?: string
  clienteId: string
  dataInicio: string
  dataFim: string | null
  tipoContrato: 'hora' | 'fechado'
  valorContrato: number
  valorImpostos: number
  status: 'ativo' | 'encerrado' | 'pendente'
  observacoes?: string
  profissionais: ContratoProfissional[]
  despesasAdicionais: DespesaAdicional[]
}

interface ContratoProfissional {
  id: string
  contratoId: string
  profissionalId: string
  valorHora: number | null
  horasMensais: number | null
  valorFechado: number | null
  periodoFechado: string | null
  profissional: Profissional
}

// Tipos para criação/atualização de contrato (payload)
export interface NovoContratoProfissionalInput {
  profissionalId: string
  valorHora: number | null
  horasMensais: number | null
  valorFechado: number | null
  periodoFechado: string | null
}

export interface NovoContrato {
  nomeProjeto: string
  codigoContrato?: string | null
  clienteId: string
  dataInicio: string
  dataFim: string | null
  tipoContrato: 'hora' | 'fechado'
  valorContrato: number
  valorImpostos: number
  percentualImpostos: number
  status: 'ativo' | 'encerrado' | 'pendente'
  observacoes?: string | null
  profissionais: NovoContratoProfissionalInput[]
  despesasAdicionais?: Array<{ descricao: string; valor: number }>
}

interface DataContextType {
  // Profissionais
  profissionais: Profissional[]
  addProfissional: (profissional: Omit<Profissional, 'id'>) => Promise<void>
  updateProfissional: (id: string, profissional: Partial<Profissional>) => Promise<void>
  deleteProfissional: (id: string) => Promise<void>
  
  // Clientes
  clientes: Cliente[]
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
  
  // Contratos
  contratos: Contrato[]
  addContrato: (contrato: NovoContrato) => Promise<void>
  updateContrato: (id: string, contrato: Partial<NovoContrato>) => Promise<void>
  deleteContrato: (id: string) => Promise<void>

  // Estado de carregamento
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  // Interações (Visão do Cliente)
  listInteresses: (filtro?: { contratoId?: string; profissionalId?: string }) => Promise<any[]>
  listNotas: (filtro?: { contratoId?: string; profissionalId?: string }) => Promise<any[]>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: ReactNode
}

import { API_CONFIG } from '../config/api'

// Configuração da API
const API_BASE_URL = API_CONFIG.BASE_URL

// Funções auxiliares para chamadas da API
const apiCall = async (endpoint: string, options: RequestInit = {}, sessionId?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Adicionar token de autenticação se disponível
  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Erro na requisição: ${response.status}`)
  }

  return response.json()
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { sessionId } = useAuth()
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados iniciais e quando sessionId mudar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Só carregar dados se há uma sessão ativa
        if (!sessionId) {
          setProfissionais([])
          setClientes([])
          setContratos([])
          setLoading(false)
          return
        }
        
        // Carregar dados
        const [profData, cliData, conData] = await Promise.all([
          apiCall('/profissionais', {}, sessionId),
          apiCall('/clientes', {}, sessionId),
          apiCall('/contratos', {}, sessionId)
        ])
        
        setProfissionais(profData)
        setClientes(cliData)
        setContratos(conData)
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err)
        setError(err.message || 'Erro ao carregar dados do servidor')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sessionId])

  // Recarregar dados sob demanda (retry)
  const reload = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!sessionId) {
        setProfissionais([])
        setClientes([])
        setContratos([])
        return
      }
      const [profData, cliData, conData] = await Promise.all([
        apiCall('/profissionais', {}, sessionId),
        apiCall('/clientes', {}, sessionId),
        apiCall('/contratos', {}, sessionId)
      ])
      setProfissionais(profData)
      setClientes(cliData)
      setContratos(conData)
    } catch (err: any) {
      console.error('Erro ao recarregar dados:', err)
      setError(err.message || 'Erro ao recarregar dados do servidor')
    } finally {
      setLoading(false)
    }
  }

  // Interações: interesses e notas
  const listInteresses = async (filtro?: { contratoId?: string; profissionalId?: string }) => {
    const params = new URLSearchParams()
    if (filtro?.contratoId) params.set('contratoId', filtro.contratoId)
    if (filtro?.profissionalId) params.set('profissionalId', filtro.profissionalId)
    return apiCall(`/client-actions${params.toString() ? `?${params.toString()}` : ''}`, {}, sessionId)
  }

  const listNotas = async (filtro?: { contratoId?: string; profissionalId?: string }) => {
    const params = new URLSearchParams()
    if (filtro?.contratoId) params.set('contratoId', filtro.contratoId)
    if (filtro?.profissionalId) params.set('profissionalId', filtro.profissionalId)
    return apiCall(`/notes${params.toString() ? `?${params.toString()}` : ''}`, {}, sessionId)
  }

  // Funções para Profissionais
  const addProfissional = async (profissional: Omit<Profissional, 'id'>) => {
    try {
      const novoProfissional = await apiCall('/profissionais', {
        method: 'POST',
        body: JSON.stringify(profissional)
      }, sessionId)
      setProfissionais(prev => [...prev, novoProfissional])
    } catch (err: any) {
      console.error('Erro ao adicionar profissional:', err)
      throw new Error(err.message || 'Erro ao adicionar profissional')
    }
  }

  const updateProfissional = async (id: string, profissional: Partial<Profissional>) => {
    try {
      const profissionalAtualizado = await apiCall(`/profissionais/${id}`, {
        method: 'PUT',
        body: JSON.stringify(profissional)
      }, sessionId)
      setProfissionais(prev => 
        prev.map(p => p.id === id ? profissionalAtualizado : p)
      )
    } catch (err: any) {
      console.error('Erro ao atualizar profissional:', err)
      throw new Error(err.message || 'Erro ao atualizar profissional')
    }
  }

  const deleteProfissional = async (id: string) => {
    try {
      await apiCall(`/profissionais/${id}`, {
        method: 'DELETE'
      }, sessionId)
      setProfissionais(prev => prev.filter(p => p.id !== id))
      // Remove contratos que têm este profissional
      setContratos(prev => prev.filter(c => 
        !c.profissionais.some(p => p.profissionalId === id)
      ))
    } catch (err: any) {
      console.error('Erro ao deletar profissional:', err)
      throw new Error(err.message || 'Erro ao deletar profissional')
    }
  }

  // Funções para Clientes
  const addCliente = async (cliente: Omit<Cliente, 'id'>) => {
    try {
      const novoCliente = await apiCall('/clientes', {
        method: 'POST',
        body: JSON.stringify(cliente)
      }, sessionId)
      setClientes(prev => [...prev, novoCliente])
    } catch (err: any) {
      console.error('Erro ao adicionar cliente:', err)
      throw new Error(err.message || 'Erro ao adicionar cliente')
    }
  }

  const updateCliente = async (id: string, cliente: Partial<Cliente>) => {
    try {
      const clienteAtualizado = await apiCall(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cliente)
      }, sessionId)
      setClientes(prev => 
        prev.map(c => c.id === id ? clienteAtualizado : c)
      )
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err)
      throw new Error(err.message || 'Erro ao atualizar cliente')
    }
  }

  const deleteCliente = async (id: string) => {
    try {
      await apiCall(`/clientes/${id}`, {
        method: 'DELETE'
      }, sessionId)
      setClientes(prev => prev.filter(c => c.id !== id))
      // Remove contratos relacionados
      setContratos(prev => prev.filter(c => c.clienteId !== id))
    } catch (err: any) {
      console.error('Erro ao deletar cliente:', err)
      throw err // Re-throw para manter a mensagem de erro original
    }
  }

  // Funções para Contratos
  const addContrato = async (contrato: NovoContrato) => {
    try {
      const novoContrato = await apiCall('/contratos', {
        method: 'POST',
        body: JSON.stringify(contrato)
      }, sessionId)
      setContratos(prev => [...prev, novoContrato])
    } catch (err: any) {
      console.error('Erro ao adicionar contrato:', err)
      throw new Error(err.message || 'Erro ao adicionar contrato')
    }
  }

  const updateContrato = async (id: string, contrato: Partial<NovoContrato>) => {
    try {
      const contratoAtualizado = await apiCall(`/contratos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contrato)
      }, sessionId)
      setContratos(prev => 
        prev.map(c => c.id === id ? contratoAtualizado : c)
      )
    } catch (err: any) {
      console.error('Erro ao atualizar contrato:', err)
      throw new Error(err.message || 'Erro ao atualizar contrato')
    }
  }

  const deleteContrato = async (id: string) => {
    try {
      await apiCall(`/contratos/${id}`, {
        method: 'DELETE'
      }, sessionId)
      setContratos(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      console.error('Erro ao deletar contrato:', err)
      throw new Error(err.message || 'Erro ao deletar contrato')
    }
  }

  const value: DataContextType = {
    profissionais,
    addProfissional,
    updateProfissional,
    deleteProfissional,
    clientes,
    addCliente,
    updateCliente,
    deleteCliente,
    contratos,
    addContrato,
    updateContrato,
    deleteContrato,
    loading,
    error,
    reload,
    listInteresses,
    listNotas
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
} 