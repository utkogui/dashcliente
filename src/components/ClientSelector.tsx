import React, { useState, useEffect } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Alert,
  Card,
  CardContent
} from '@mui/material'
import { 
  PlayArrow as AtivoIcon,
  Pause as PausadoIcon,
  Stop as FinalizadoIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

// Configuração da API
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://dashcliente.onrender.com/api'
    : 'http://localhost:3001/api'
)

interface ClienteSistema {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
  usuarios: Usuario[]
}

interface Usuario {
  id: string
  email: string
  tipo: string
  ativo: boolean
}

const ClientSelector: React.FC = () => {
  const { usuario } = useAuth()
  const [clientes, setClientes] = useState<ClienteSistema[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (usuario?.tipo === 'admin') {
      carregarClientes()
    }
  }, [usuario])

  const carregarClientes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/clientes-sistema`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      } else {
        setError('Erro ao carregar empresas')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  // Só mostrar para administradores
  if (usuario?.tipo !== 'admin') {
    return null
  }

  // Calcular estatísticas
  const empresasAtivas = clientes.filter(cliente => cliente.ativo).length
  const empresasPausadas = clientes.filter(cliente => !cliente.ativo).length
  const empresasFinalizadas = 0 // Por enquanto não temos status de finalizado, mas pode ser implementado depois

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando estatísticas...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="white" sx={{ mb: 2, fontWeight: 'bold' }}>
        Estatísticas das Empresas
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Card Empresas Ativas */}
        <Card sx={{ 
          backgroundColor: 'rgba(76, 175, 80, 0.1)', 
          border: '1px solid rgba(76, 175, 80, 0.3)',
          borderRadius: 1
        }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AtivoIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Ativas
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {empresasAtivas}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Card Empresas Pausadas */}
        <Card sx={{ 
          backgroundColor: 'rgba(255, 152, 0, 0.1)', 
          border: '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: 1
        }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PausadoIcon sx={{ fontSize: 18, color: '#ff9800' }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Pausadas
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {empresasPausadas}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Card Empresas Finalizadas */}
        <Card sx={{ 
          backgroundColor: 'rgba(244, 67, 54, 0.1)', 
          border: '1px solid rgba(244, 67, 54, 0.3)',
          borderRadius: 1
        }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FinalizadoIcon sx={{ fontSize: 18, color: '#f44336' }} />
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Finalizadas
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                {empresasFinalizadas}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default ClientSelector
