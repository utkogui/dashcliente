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
  Grid,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { Search, Add, Edit, Delete, TrendingUp, AttachMoney, Receipt } from '@mui/icons-material'
import { useData } from '../contexts/DataContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency, formatPercentual } from '../utils/formatters'

// Tipos
interface Contrato {
  id: string
  profissionalId: string
  clienteId: string
  dataInicio: string
  dataFim: string
  tipoContrato: 'hora' | 'fechado'
  valorHora: number | null
  horasMensais: number | null
  valorFechado: number | null
  periodoFechado: string | null
  status: 'ativo' | 'encerrado' | 'pendente'
  valorTotal: number
  valorRecebido: number
  valorPago: number
  percentualImpostos: number
  valorImpostos: number
  margemLucro: number
  observacoes?: string
}

const Contratos = () => {
  const { contratos, profissionais, clientes, addContrato, updateContrato, deleteContrato, loading, error } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredContratos, setFilteredContratos] = useState(contratos)
  const [open, setOpen] = useState(false)
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null)
  const [formData, setFormData] = useState({
    profissionalId: '',
    clienteId: '',
    dataInicio: '',
    dataFim: '',
    tipoContrato: 'hora' as 'hora' | 'fechado',
    valorHora: '',
    horasMensais: '',
    valorFechado: '',
    periodoFechado: 'Mensal',
    status: 'ativo' as 'ativo' | 'encerrado' | 'pendente',
    valorRecebido: '',
    valorPago: '',
    percentualImpostos: '13.0',
    observacoes: ''
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const periodosFechados = [
    'Mensal',
    'Trimestral',
    'Semestral',
    'Anual',
    'Por Projeto'
  ]

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
        c.observacoes?.toLowerCase().includes(value.toLowerCase()) ||
        c.tipoContrato.toLowerCase().includes(value.toLowerCase())
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

  const getTipoContratoColor = (tipo: string) => {
    switch (tipo) {
      case 'hora': return 'primary'
      case 'fechado': return 'secondary'
      default: return 'default'
    }
  }

  const getTipoContratoText = (tipo: string) => {
    switch (tipo) {
      case 'hora': return 'Por Hora'
      case 'fechado': return 'Valor Fechado'
      default: return tipo
    }
  }

  const calcularMargem = (recebido: number, pago: number) => {
    return recebido > 0 ? ((recebido - pago) / recebido) * 100 : 0
  }

  const handleOpen = (contrato?: Contrato) => {
    if (contrato) {
      setEditingContrato(contrato)
      setFormData({
        profissionalId: contrato.profissionalId,
        clienteId: contrato.clienteId,
        dataInicio: contrato.dataInicio,
        dataFim: contrato.dataFim,
        tipoContrato: contrato.tipoContrato,
        valorHora: contrato.valorHora?.toString() || '',
        horasMensais: contrato.horasMensais?.toString() || '',
        valorFechado: contrato.valorFechado?.toString() || '',
        periodoFechado: contrato.periodoFechado || 'Mensal',
        status: contrato.status,
        valorRecebido: contrato.valorRecebido.toString(),
        valorPago: contrato.valorPago.toString(),
        percentualImpostos: contrato.percentualImpostos.toString(),
        observacoes: contrato.observacoes || ''
      })
    } else {
      setEditingContrato(null)
      setFormData({
        profissionalId: '',
        clienteId: '',
        dataInicio: '',
        dataFim: '',
        tipoContrato: 'hora',
        valorHora: '',
        horasMensais: '',
        valorFechado: '',
        periodoFechado: 'Mensal',
        status: 'ativo',
        valorRecebido: '',
        valorPago: '',
        percentualImpostos: '13.0',
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
          !formData.dataFim || !formData.valorRecebido || !formData.valorPago) {
        setFormError('Por favor, preencha todos os campos obrigatórios')
        return
      }

      // Validação específica por tipo de contrato
      if (formData.tipoContrato === 'hora') {
        if (!formData.valorHora || isNaN(Number(formData.valorHora)) || Number(formData.valorHora) <= 0) {
          setFormError('Valor por hora deve ser um número positivo')
          return
        }
        if (!formData.horasMensais || isNaN(Number(formData.horasMensais)) || Number(formData.horasMensais) <= 0) {
          setFormError('Horas mensais deve ser um número positivo')
          return
        }
      } else {
        if (!formData.valorFechado || isNaN(Number(formData.valorFechado)) || Number(formData.valorFechado) <= 0) {
          setFormError('Valor fechado deve ser um número positivo')
          return
        }
      }

      const valorRecebido = Number(formData.valorRecebido)
      const valorPago = Number(formData.valorPago)
      const percentualImpostos = Number(formData.percentualImpostos)
      const valorImpostos = (valorRecebido * percentualImpostos) / 100
      const margemLucro = valorRecebido - valorImpostos - valorPago

      const contratoData = {
        profissionalId: formData.profissionalId,
        clienteId: formData.clienteId,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        tipoContrato: formData.tipoContrato,
        valorHora: formData.tipoContrato === 'hora' ? Number(formData.valorHora) : null,
        horasMensais: formData.tipoContrato === 'hora' ? Number(formData.horasMensais) : null,
        valorFechado: formData.tipoContrato === 'fechado' ? Number(formData.valorFechado) : null,
        periodoFechado: formData.tipoContrato === 'fechado' ? formData.periodoFechado : null,
        status: formData.status,
        valorTotal: valorRecebido,
        valorRecebido: valorRecebido,
        valorPago: valorPago,
        percentualImpostos: percentualImpostos,
        valorImpostos: valorImpostos,
        margemLucro: margemLucro,
        observacoes: formData.observacoes
      }

      if (editingContrato) {
        await updateContrato(editingContrato.id, contratoData)
      } else {
        await addContrato(contratoData)
      }

      handleClose()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar contrato'
      setFormError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.')) {
      try {
        await deleteContrato(id)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar contrato'
        alert(errorMessage)
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
        placeholder="Buscar por profissional, cliente, observações ou tipo de contrato..."
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
              <TableCell>Tipo</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Recebido</TableCell>
              <TableCell>Pago</TableCell>
              <TableCell>Impostos</TableCell>
              <TableCell>Rentabilidade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContratos.map((contrato) => {
              const profissional = profissionais.find(p => p.id === contrato.profissionalId)
              const cliente = clientes.find(c => c.id === contrato.clienteId)
              
              return (
                <TableRow key={contrato.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {profissional?.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profissional?.especialidade}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {cliente?.empresa}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cliente?.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(contrato.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      até {format(new Date(contrato.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={contrato.tipoContrato === 'hora' ? <AttachMoney /> : <Receipt />}
                      label={getTipoContratoText(contrato.tipoContrato)}
                      color={getTipoContratoColor(contrato.tipoContrato)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {contrato.tipoContrato === 'hora' ? (
                      <Typography variant="body2" color="primary.main" fontWeight="bold">
                        R$ {contrato.valorHora?.toFixed(2)}/h
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {contrato.horasMensais}h/mês
                        </Typography>
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="secondary.main" fontWeight="bold">
                        {formatCurrency(contrato.valorFechado || 0)}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {contrato.periodoFechado}
                        </Typography>
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(contrato.valorRecebido)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="info.main" fontWeight="bold">
                      {formatCurrency(contrato.valorPago)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="warning.main" fontWeight="bold">
                      {formatCurrency(contrato.valorImpostos)}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatPercentual(contrato.percentualImpostos)}
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={contrato.margemLucro >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                      {formatCurrency(contrato.margemLucro)}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatPercentual(calcularMargem(contrato.valorRecebido, contrato.valorPago))}
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(contrato.status)}
                      color={getStatusColor(contrato.status)}
                      size="small"
                    />
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={submitting}>
                  <InputLabel>Profissional *</InputLabel>
                  <Select
                    value={formData.profissionalId}
                    label="Profissional *"
                    onChange={(e) => handleInputChange('profissionalId', e.target.value)}
                  >
                    {profissionais.map((prof) => (
                      <MenuItem key={prof.id} value={prof.id}>
                        {prof.nome} - {prof.especialidade}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={submitting}>
                  <InputLabel>Cliente *</InputLabel>
                  <Select
                    value={formData.clienteId}
                    label="Cliente *"
                    onChange={(e) => handleInputChange('clienteId', e.target.value)}
                  >
                    {clientes.map((cli) => (
                      <MenuItem key={cli.id} value={cli.id}>
                        {cli.empresa} - {cli.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Início *"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Fim *"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => handleInputChange('dataFim', e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={submitting}>
                  <InputLabel>Tipo de Contrato *</InputLabel>
                  <Select
                    value={formData.tipoContrato}
                    label="Tipo de Contrato *"
                    onChange={(e) => handleInputChange('tipoContrato', e.target.value)}
                  >
                    <MenuItem value="hora">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney />
                        Por Hora
                      </Box>
                    </MenuItem>
                    <MenuItem value="fechado">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt />
                        Valor Fechado
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
            </Grid>

            {formData.tipoContrato === 'hora' ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor por Hora (R$) *"
                    type="number"
                    value={formData.valorHora}
                    onChange={(e) => handleInputChange('valorHora', e.target.value)}
                    disabled={submitting}
                    InputProps={{
                      startAdornment: <Typography>R$</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Horas Mensais *"
                    type="number"
                    value={formData.horasMensais}
                    onChange={(e) => handleInputChange('horasMensais', e.target.value)}
                    disabled={submitting}
                    InputProps={{
                      endAdornment: <Typography>h/mês</Typography>
                    }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor Fechado (R$) *"
                    type="number"
                    value={formData.valorFechado}
                    onChange={(e) => handleInputChange('valorFechado', e.target.value)}
                    disabled={submitting}
                    InputProps={{
                      startAdornment: <Typography>R$</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={submitting}>
                    <InputLabel>Período *</InputLabel>
                    <Select
                      value={formData.periodoFechado}
                      label="Período *"
                      onChange={(e) => handleInputChange('periodoFechado', e.target.value)}
                    >
                      {periodosFechados.map((periodo) => (
                        <MenuItem key={periodo} value={periodo}>
                          {periodo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Valor Recebido (R$) *"
                  type="number"
                  value={formData.valorRecebido}
                  onChange={(e) => handleInputChange('valorRecebido', e.target.value)}
                  disabled={submitting}
                  InputProps={{
                    startAdornment: <Typography>R$</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Valor Pago (R$) *"
                  type="number"
                  value={formData.valorPago}
                  onChange={(e) => handleInputChange('valorPago', e.target.value)}
                  disabled={submitting}
                  InputProps={{
                    startAdornment: <Typography>R$</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Percentual Impostos (%)"
                  type="number"
                  value={formData.percentualImpostos}
                  onChange={(e) => handleInputChange('percentualImpostos', e.target.value)}
                  disabled={submitting}
                  InputProps={{
                    endAdornment: <Typography>%</Typography>
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Observações"
              multiline
              rows={3}
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              disabled={submitting}
              fullWidth
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