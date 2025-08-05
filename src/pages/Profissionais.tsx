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
import { Search, Add, Edit, Delete } from '@mui/icons-material'
import { useData } from '../contexts/DataContext'

const Profissionais = () => {
  const { profissionais, addProfissional, updateProfissional, deleteProfissional, loading, error } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProfissionais, setFilteredProfissionais] = useState(profissionais)
  const [open, setOpen] = useState(false)
  const [editingProfissional, setEditingProfissional] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    valorHora: '',
    status: 'ativo',
    dataAdmissao: ''
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Atualizar lista filtrada quando profissionais mudar
  useEffect(() => {
    setFilteredProfissionais(profissionais)
  }, [profissionais])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = profissionais.filter(
      p => p.nome.toLowerCase().includes(value.toLowerCase()) ||
           p.especialidade.toLowerCase().includes(value.toLowerCase()) ||
           p.email.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredProfissionais(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success'
      case 'ferias': return 'warning'
      case 'inativo': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'ferias': return 'Férias'
      case 'inativo': return 'Inativo'
      default: return status
    }
  }

  const handleOpen = (profissional?: any) => {
    if (profissional) {
      setEditingProfissional(profissional)
      setFormData({
        nome: profissional.nome,
        email: profissional.email,
        telefone: profissional.telefone,
        especialidade: profissional.especialidade,
        valorHora: profissional.valorHora.toString(),
        status: profissional.status,
        dataAdmissao: profissional.dataAdmissao
      })
    } else {
      setEditingProfissional(null)
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        especialidade: '',
        valorHora: '',
        status: 'ativo',
        dataAdmissao: ''
      })
    }
    setOpen(true)
    setFormError('')
  }

  const handleClose = () => {
    setOpen(false)
    setEditingProfissional(null)
    setFormError('')
    setSubmitting(false)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setFormError('')

      // Validação básica
      if (!formData.nome || !formData.email || !formData.especialidade || !formData.valorHora) {
        setFormError('Por favor, preencha todos os campos obrigatórios')
        return
      }

      if (isNaN(Number(formData.valorHora)) || Number(formData.valorHora) <= 0) {
        setFormError('Valor por hora deve ser um número positivo')
        return
      }

      const profissionalData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        especialidade: formData.especialidade,
        valorHora: Number(formData.valorHora),
        status: formData.status as 'ativo' | 'inativo' | 'ferias',
        dataAdmissao: formData.dataAdmissao || new Date().toISOString().split('T')[0]
      }

      if (editingProfissional) {
        await updateProfissional(editingProfissional.id, profissionalData)
      } else {
        await addProfissional(profissionalData)
      }

      handleClose()
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar profissional')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      try {
        await deleteProfissional(id)
      } catch (err: any) {
        alert(err.message || 'Erro ao deletar profissional')
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
          Profissionais ({profissionais.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Novo Profissional
        </Button>
      </Box>

      {/* Filtro de Busca */}
      <TextField
        fullWidth
        placeholder="Buscar por nome, especialidade ou email..."
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
              <TableCell>Nome</TableCell>
              <TableCell>Especialidade</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Valor/Hora</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data Admissão</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProfissionais.map((profissional) => (
              <TableRow key={profissional.id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{profissional.nome}</TableCell>
                <TableCell>{profissional.especialidade}</TableCell>
                <TableCell>{profissional.email}</TableCell>
                <TableCell>{profissional.telefone}</TableCell>
                <TableCell>R$ {profissional.valorHora}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(profissional.status)}
                    color={getStatusColor(profissional.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(profissional.dataAdmissao).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpen(profissional)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(profissional.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Adicionar/Editar */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome *"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <TextField
              label="Email *"
              type="email"
              placeholder="email@exemplo.com"
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
              label="Especialidade *"
              placeholder="Ex: Desenvolvedor Full Stack"
              value={formData.especialidade}
              onChange={(e) => handleInputChange('especialidade', e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <TextField
              label="Valor por Hora *"
              type="number"
              placeholder="120"
              value={formData.valorHora}
              onChange={(e) => handleInputChange('valorHora', e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <FormControl fullWidth disabled={submitting}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="ferias">Férias</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Data de Admissão"
              type="date"
              value={formData.dataAdmissao}
              onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
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
            {submitting ? 'Salvando...' : (editingProfissional ? 'Salvar' : 'Adicionar')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Profissionais 