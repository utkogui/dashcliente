import React, { useState, useEffect } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Alert
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

interface ClienteSistema {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
}

interface ClientSelectorProps {
  onClienteChange?: (clienteId: string | null) => void
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ onClienteChange }) => {
  const { usuario } = useAuth()
  const [clientes, setClientes] = useState<ClienteSistema[]>([])
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Só mostrar para administradores
  if (usuario?.tipo !== 'admin') {
    return null
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/clientes-sistema', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      } else {
        setError('Erro ao carregar clientes')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleClienteChange = (event: any) => {
    const clienteId = event.target.value
    setSelectedCliente(clienteId)
    onClienteChange?.(clienteId === 'all' ? null : clienteId)
  }

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando clientes...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Seletor de Cliente (Admin)
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth size="small">
        <InputLabel>Cliente</InputLabel>
        <Select
          value={selectedCliente || 'all'}
          onChange={handleClienteChange}
          label="Cliente"
        >
          <MenuItem value="all">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Todos os Clientes</Typography>
              <Chip 
                label="Admin" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </MenuItem>
          {clientes.map((cliente) => (
            <MenuItem key={cliente.id} value={cliente.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{cliente.nome}</Typography>
                {!cliente.ativo && (
                  <Chip 
                    label="Inativo" 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                )}
                {cliente.nome === 'Matilha' && (
                  <Chip 
                    label="Padrão" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedCliente && selectedCliente !== 'all' && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Visualizando dados do cliente: {clientes.find(c => c.id === selectedCliente)?.nome}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ClientSelector
