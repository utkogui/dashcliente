import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { Search, Add, Edit, Delete, Business } from '@mui/icons-material'
import { useData } from '../contexts/DataContext'

const Clientes = () => {
  const { clientes, contratos, addCliente, updateCliente, deleteCliente, loading, error } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredClientes, setFilteredClientes] = useState(clientes)
  const [open, setOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    endereco: ''
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Atualizar lista filtrada quando clientes mudar
  useEffect(() => {
    setFilteredClientes(clientes)
  }, [clientes])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = clientes.filter(
      c => c.nome.toLowerCase().includes(value.toLowerCase()) ||
           c.empresa.toLowerCase().includes(value.toLowerCase()) ||
           c.email.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredClientes(filtered)
  }

  const getContratosAtivos = (clienteId: string) => {
    return contratos.filter(c => c.clienteId === clienteId && c.status === 'ativo').length
  }

  const getValorTotalContratos = (clienteId: string) => {
    return contratos
      .filter(c => c.clienteId === clienteId)
      .reduce((acc, c) => acc + c.valorRecebido, 0)
  }

  const handleOpen = (cliente?: any) => {
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({
        nome: cliente.nome,
        empresa: cliente.empresa,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco
      })
    } else {
      setEditingCliente(null)
      setFormData({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        endereco: ''
      })
    }
    setOpen(true)
    setFormError('')
  }

  const handleClose = () => {
    setOpen(false)
    setEditingCliente(null)
    setFormError('')
    setSubmitting(false)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setFormError('')

      // Validação básica
      if (!formData.nome || !formData.empresa || !formData.email) {
        setFormError('Por favor, preencha todos os campos obrigatórios')
        return
      }

      const clienteData = {
        nome: formData.nome,
        empresa: formData.empresa,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco
      }

      if (editingCliente) {
        await updateCliente(editingCliente.id, clienteData)
      } else {
        await addCliente(clienteData)
      }

      handleClose()
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar cliente')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const contratosAtivos = getContratosAtivos(id)
    if (contratosAtivos > 0) {
      alert(`Não é possível excluir este cliente pois possui ${contratosAtivos} contrato(s) ativo(s)`)
      return
    }
    
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCliente(id)
      } catch (err: any) {
        alert(err.message || 'Erro ao deletar cliente')
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setFormError('')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" color="text.primary">
          Clientes ({clientes.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Novo Cliente
        </Button>
      </Box>

      {/* Filtro de Busca */}
      <TextField
        fullWidth
        placeholder="Buscar por nome, empresa ou email..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Empresa</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell>Contratos Ativos</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClientes.map((cliente) => {
              const contratosAtivos = getContratosAtivos(cliente.id)
              const valorTotal = getValorTotalContratos(cliente.id)
              
              return (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {cliente.empresa}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cliente.nome}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{cliente.nome}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                      {cliente.endereco}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${contratosAtivos} ativo(s)`}
                      color={contratosAtivos > 0 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      R$ {valorTotal.toLocaleString('pt-BR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(cliente)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Adicionar/Editar */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome do Contato *"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <TextField
              label="Empresa *"
              placeholder="Nome da empresa"
              value={formData.empresa}
              onChange={(e) => handleInputChange('empresa', e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <TextField
              label="Email *"
              type="email"
              placeholder="email@empresa.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <TextField
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <TextField
              label="Endereço"
              multiline
              rows={3}
              placeholder="Endereço completo"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              fullWidth
              disabled={submitting}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? 'Salvando...' : (editingCliente ? 'Salvar' : 'Adicionar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Clientes 