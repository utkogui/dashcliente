import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

interface ClienteSistema {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
  createdAt: string
  usuarios: Usuario[]
}

interface Usuario {
  id: string
  email: string
  tipo: 'admin' | 'cliente'
  ativo: boolean
  createdAt: string
}

const GestaoUsuarios = () => {
  const { usuario } = useAuth()
  const [clientes, setClientes] = useState<ClienteSistema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCliente, setEditingCliente] = useState<ClienteSistema | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    email: '',
    senha: ''
  })

  // Verificar se é superadmin
  if (usuario?.tipo !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Acesso negado. Apenas administradores podem acessar esta página.
        </Alert>
      </Box>
    )
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
        setError('Erro ao carregar clientes do sistema')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCliente 
        ? `http://localhost:3001/api/clientes-sistema/${editingCliente.id}`
        : 'http://localhost:3001/api/clientes-sistema'
      
      const method = editingCliente ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setOpenDialog(false)
        setEditingCliente(null)
        setFormData({ nome: '', descricao: '', email: '', senha: '' })
        carregarClientes()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao salvar cliente')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleEdit = (cliente: ClienteSistema) => {
    setEditingCliente(cliente)
    setFormData({
      nome: cliente.nome,
      descricao: cliente.descricao || '',
      email: '',
      senha: ''
    })
    setOpenDialog(true)
  }

  const handleDelete = async (clienteId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/clientes-sistema/${clienteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      })

      if (response.ok) {
        carregarClientes()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao excluir cliente')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleOpenDialog = () => {
    setEditingCliente(null)
    setFormData({ nome: '', descricao: '', email: '', senha: '' })
    setOpenDialog(true)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Clientes do Sistema
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Novo Cliente
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {clientes.map((cliente) => (
          <Grid item xs={12} md={6} lg={4} key={cliente.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      {cliente.nome}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEdit(cliente)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(cliente.id)}
                        disabled={cliente.nome === 'Matilha'} // Não permitir excluir Matilha
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {cliente.descricao && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {cliente.descricao}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">
                    {cliente.usuarios.length} usuário(s)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={cliente.ativo ? 'Ativo' : 'Inativo'}
                    color={cliente.ativo ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={cliente.nome === 'Matilha' ? 'Padrão' : 'Cliente'}
                    color={cliente.nome === 'Matilha' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Criado em: {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para criar/editar cliente */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nome do Cliente"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              margin="normal"
              required
              disabled={editingCliente?.nome === 'Matilha'} // Não permitir editar nome do Matilha
            />
            <TextField
              fullWidth
              label="Descrição (opcional)"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            {!editingCliente && (
              <>
                <TextField
                  fullWidth
                  label="Email do Usuário"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  margin="normal"
                  required
                  helperText="Email para o usuário administrador deste cliente"
                />
                <TextField
                  fullWidth
                  label="Senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  margin="normal"
                  required
                  helperText="Senha para o usuário administrador deste cliente"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingCliente ? 'Salvar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default GestaoUsuarios
