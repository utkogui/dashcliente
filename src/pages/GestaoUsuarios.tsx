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
  Tooltip,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://dashcliente.onrender.com/api'
    : 'http://localhost:3001/api'
)

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
  tipo: string
  ativo: boolean
}

const GestaoUsuarios = () => {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<ClienteSistema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editingCliente, setEditingCliente] = useState<ClienteSistema | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    email: '',
    senha: ''
  })
  const [editFormData, setEditFormData] = useState({
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
      const response = await fetch(`${API_BASE_URL}/clientes-sistema`, {
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

  const impersonate = async (clienteId: string) => {
    try {
      const prevSession = localStorage.getItem('sessionId') || ''
      const response = await fetch(`${API_BASE_URL}/auth/impersonate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({ clienteId })
      })
      const raw = await response.text()
      let data: any = null
      try { data = raw ? JSON.parse(raw) : null } catch { /* resposta não-JSON (ex: HTML 404) */ }
      if (!response.ok) {
        const msg = (data && data.error) || `Falha ao impersonar (HTTP ${response.status})`
        throw new Error(msg)
      }
      // Salvar nova sessão de cliente e ir para visão do cliente
      if (prevSession) localStorage.setItem('adminSessionId', prevSession)
      localStorage.setItem('sessionId', data.sessionId)
      window.location.hash = '#/visao-cliente'
      window.location.reload()
    } catch (err) {
      setError((err as any).message || 'Erro na impersonação')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/clientes-sistema`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const novoCliente = await response.json()
        setOpenDialog(false)
        setFormData({ nome: '', descricao: '', email: '', senha: '' })
        carregarClientes()
        
        // Mostrar mensagem de sucesso com as credenciais
        alert(`Empresa criada com sucesso!\n\nCredenciais de acesso:\nEmail: ${formData.email}\nSenha: ${formData.senha}\n\nGuarde essas informações com segurança!`)
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar empresa')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCliente) return

    try {
      const response = await fetch(`${API_BASE_URL}/clientes-sistema/${editingCliente.id}/usuario`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify(editFormData)
      })

      if (response.ok) {
        setOpenEditDialog(false)
        setEditingCliente(null)
        setEditFormData({ email: '', senha: '' })
        carregarClientes()
        
        // Mostrar mensagem de sucesso
        alert('Credenciais atualizadas com sucesso!')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao atualizar credenciais')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const handleOpenDialog = () => {
    setFormData({ nome: '', descricao: '', email: '', senha: '' })
    setOpenDialog(true)
  }

  const handleOpenEditDialog = (cliente: ClienteSistema) => {
    setEditingCliente(cliente)
    const usuarioCliente = cliente.usuarios.find(u => u.tipo === 'cliente')
    setEditFormData({
      email: usuarioCliente?.email || '',
      senha: ''
    })
    setOpenEditDialog(true)
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
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestão de Empresas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie as empresas que têm acesso ao sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          size="large"
        >
          Nova Empresa
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
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      {cliente.nome}
                    </Typography>
                  </Box>
                  <Tooltip title="Editar credenciais">
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenEditDialog(cliente)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {cliente.descricao && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {cliente.descricao}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">
                    {cliente.usuarios.length} usuário(s)
                  </Typography>
                </Box>

                {cliente.usuarios.map((user) => (
                  <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                ))}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
                  <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Criado em: {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={cliente.ativo ? 'Ativo' : 'Inativo'}
                    color={cliente.ativo ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={cliente.nome === 'Matilha' ? 'Padrão' : 'Empresa'}
                    color={cliente.nome === 'Matilha' ? 'primary' : 'secondary'}
                    size="small"
                  />
                  <Button variant="outlined" size="small" onClick={() => impersonate(cliente.id)}>
                    Impersonar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para criar nova empresa */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Nova Empresa
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Crie uma nova empresa no sistema. Será gerado um usuário com as credenciais fornecidas.
            </Typography>
            
            <TextField
              fullWidth
              label="Nome da Empresa"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              margin="normal"
              required
              helperText="Nome da empresa que aparecerá no sistema"
            />
            
            <TextField
              fullWidth
              label="Descrição (opcional)"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              margin="normal"
              multiline
              rows={2}
              helperText="Descrição adicional sobre a empresa"
            />
            
            <TextField
              fullWidth
              label="Email do Administrador"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
              helperText="Email que será usado para fazer login no sistema"
            />
            
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              margin="normal"
              required
              helperText="Senha para acesso ao sistema (mínimo 6 caracteres)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Criar Empresa
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para editar credenciais */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Editar Credenciais - {editingCliente?.nome}
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Atualize as credenciais de acesso para esta empresa.
            </Typography>
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              margin="normal"
              required
              helperText="Novo email para acesso ao sistema"
            />
            
            <TextField
              fullWidth
              label="Nova Senha"
              type="password"
              value={editFormData.senha}
              onChange={(e) => setEditFormData({ ...editFormData, senha: e.target.value })}
              margin="normal"
              helperText="Deixe em branco para manter a senha atual (mínimo 6 caracteres se preenchido)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Atualizar Credenciais
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default GestaoUsuarios
