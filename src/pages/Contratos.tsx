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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { Search, Add, Edit, Delete, TrendingUp } from '@mui/icons-material'
import { useData } from '../contexts/DataContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Contratos = () => {
  const { contratos, profissionais, clientes, addContrato, updateContrato, deleteContrato, loading, error } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredContratos, setFilteredContratos] = useState(contratos)
  const [open, setOpen] = useState(false)
  const [editingContrato, setEditingContrato] = useState<any>(null)
  const [formData, setFormData] = useState({
    profissionalId: '',
    clienteId: '',
    dataInicio: '',
    dataFim: '',
    valorHora: '',
    horasMensais: '',
    status: 'ativo',
    observacoes: ''
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Atualizar lista filtrada quando contratos mudar
  useEffect(() => {
    setFilteredContratos(contratos)
  }, [contratos])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = contratos.filter(c => {
      const profissional = profissionais.find(p => p.id === c.profissionalId)
      const cliente = clientes.find(cl => cl.id === c.clienteId)
      return (
        profissional?.nome.toLowerCase().includes(value.toLowerCase()) ||
        cliente?.empresa.toLowerCase().includes(value.toLowerCase()) ||
        c.observacoes?.toLowerCase().includes(value.toLowerCase())
      )
    })
    setFilteredContratos(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success'
      case 'pendente': return 'warning'
      case 'encerrado': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'pendente': return 'Pendente'
      case 'encerrado': return 'Encerrado'
      default: return status
    }
  }

  const calcularMargem = (recebido: number, pago: number) => {
    return recebido > 0 ? ((recebido - pago) / recebido) * 100 : 0
  }

  const handleOpen = (contrato?: any) => {
    if (contrato) {
      setEditingContrato(contrato)
      setFormData({
        profissionalId: contrato.profissionalId,
        clienteId: contrato.clienteId,
        dataInicio: contrato.dataInicio,
        dataFim: contrato.dataFim,
        valorHora: contrato.valorHora.toString(),
        horasMensais: contrato.horasMensais.toString(),
        status: contrato.status,
        observacoes: contrato.observacoes || ''
      })
    } else {
      setEditingContrato(null)
      setFormData({
        profissionalId: '',
        clienteId: '',
        dataInicio: '',
        dataFim: '',
        valorHora: '',
        horasMensais: '',
        status: 'ativo',
        observacoes: ''
      })
    }
    setOpen(true)
    setFormError('')
  }

  const handleClose = () => {
    setOpen(false)
    setEditingContrato(null)
    setFormError('')
    setSubmitting(false)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setFormError('')

      // Validação básica
      if (!formData.profissionalId || !formData.clienteId || !formData.dataInicio || 
          !formData.dataFim || !formData.valorHora || !formData.horasMensais) {
        setFormError('Por favor, preencha todos os campos obrigatórios')
        return
      }

      if (isNaN(Number(formData.valorHora)) || Number(formData.valorHora) <= 0) {
        setFormError('Valor por hora deve ser um número positivo')
        return
      }

      if (isNaN(Number(formData.horasMensais)) || Number(formData.horasMensais) <= 0) {
        setFormError('Horas mensais deve ser um número positivo')
        return
      }

      const contratoData = {
        profissionalId: formData.profissionalId,
        clienteId: formData.clienteId,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        valorHora: Number(formData.valorHora),
        horasMensais: Number(formData.horasMensais),
        status: formData.status as 'ativo' | 'encerrado' | 'pendente',
        observacoes: formData.observacoes
      }

      if (editingContrato) {
        await updateContrato(editingContrato.id, contratoData)
      } else {
        await addContrato(contratoData)
      }

      handleClose()
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar contrato')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await deleteContrato(id)
      } catch (err: any) {
        alert(err.message || 'Erro ao deletar contrato')
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
          Contratos ({contratos.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Novo Contrato
        </Button>
      </Box>

      {/* Filtro de Busca */}
      <TextField
        fullWidth
        placeholder="Buscar por profissional, cliente ou observações..."
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
              <TableCell>Profissional</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Valor/Hora</TableCell>
              <TableCell>Horas/Mês</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Receita</TableCell>
              <TableCell>Custo</TableCell>
              <TableCell>Margem</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContratos.map((contrato) => {
              const profissional = profissionais.find(p => p.id === contrato.profissionalId)
              const cliente = clientes.find(c => c.id === contrato.clienteId)
              const margem = calcularMargem(contrato.valorRecebido, contrato.valorPago)
              
              return (
                <TableRow key={contrato.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{profissional?.nome}</TableCell>
                  <TableCell>{cliente?.empresa}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(contrato.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        até {format(new Date(contrato.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>R$ {contrato.valorHora}</TableCell>
                  <TableCell>{contrato.horasMensais}h</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(contrato.status)}
                      color={getStatusColor(contrato.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        R$ {contrato.valorRecebido.toLocaleString('pt-BR')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: R$ {contrato.valorTotal.toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        R$ {contrato.valorPago.toLocaleString('pt-BR')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Custo/hora: R$ {profissional?.valorHora}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUp sx={{ color: margem > 0 ? 'success.main' : 'error.main', fontSize: 16 }} />
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={margem > 0 ? 'success.main' : 'error.main'}
                      >
                        {margem.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(contrato)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(contrato.id)}
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContrato ? 'Editar Contrato' : 'Novo Contrato'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth disabled={submitting}>
              <InputLabel>Profissional *</InputLabel>
              <Select
                value={formData.profissionalId}
                label="Profissional *"
                onChange={(e) => handleInputChange('profissionalId', e.target.value)}
              >
                {profissionais.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.nome} - {p.especialidade}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={submitting}>
              <InputLabel>Cliente *</InputLabel>
              <Select
                value={formData.clienteId}
                label="Cliente *"
                onChange={(e) => handleInputChange('clienteId', e.target.value)}
              >
                {clientes.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.empresa} - {c.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Data Início *"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />

              <TextField
                label="Data Fim *"
                type="date"
                value={formData.dataFim}
                onChange={(e) => handleInputChange('dataFim', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Valor por Hora *"
                type="number"
                placeholder="180"
                value={formData.valorHora}
                onChange={(e) => handleInputChange('valorHora', e.target.value)}
                fullWidth
                disabled={submitting}
              />

              <TextField
                label="Horas Mensais *"
                type="number"
                placeholder="160"
                value={formData.horasMensais}
                onChange={(e) => handleInputChange('horasMensais', e.target.value)}
                fullWidth
                disabled={submitting}
              />
            </Box>

            <FormControl fullWidth disabled={submitting}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="encerrado">Encerrado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Observações"
              multiline
              rows={3}
              placeholder="Descrição do projeto ou observações..."
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
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
            {submitting ? 'Salvando...' : (editingContrato ? 'Salvar' : 'Adicionar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Contratos 