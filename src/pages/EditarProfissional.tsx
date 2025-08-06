import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'

import { validateEmail, validateRequired } from '../utils/validations'

const EditarProfissional = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { profissionais, updateProfissional } = useData()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    especialidade: '',
    dataInicio: '',
    tipoContrato: 'hora' as 'hora' | 'fechado',
    valorHora: '',
    valorFechado: '',
    periodoFechado: 'mensal',
    valorPago: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'ferias'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const especialidades = [
    'Desenvolvedor Full Stack',
    'Desenvolvedor Frontend',
    'Desenvolvedor Backend',
    'UX/UI Designer',
    'DevOps Engineer',
    'Product Manager',
    'Service Designer',
    'Content Ops',
    'QA Engineer',
    'Data Scientist'
  ]

  // Carregar dados do profissional
  useEffect(() => {
    if (id && profissionais.length > 0) {
      const profissional = profissionais.find(p => p.id === id)
      if (profissional) {
        setFormData({
          nome: profissional.nome || '',
          email: profissional.email || '',
          especialidade: profissional.especialidade || '',
          dataInicio: profissional.dataInicio || '',
          tipoContrato: profissional.tipoContrato || 'hora',
          valorHora: profissional.valorHora?.toString() || '',
          valorFechado: profissional.valorFechado?.toString() || '',
          periodoFechado: profissional.periodoFechado || 'mensal',
          valorPago: profissional.valorPago?.toString() || '',
          status: profissional.status || 'ativo'
        })
      } else {
        setError('Profissional não encontrado')
      }
      setLoading(false)
    }
  }, [id, profissionais])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!validateRequired(formData.nome)) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!validateRequired(formData.especialidade)) {
      newErrors.especialidade = 'Especialidade é obrigatória'
    }

    if (!validateRequired(formData.dataInicio)) {
      newErrors.dataInicio = 'Data de início é obrigatória'
    }

    if (formData.tipoContrato === 'hora') {
      if (!formData.valorHora || parseFloat(formData.valorHora) <= 0) {
        newErrors.valorHora = 'Valor por hora deve ser maior que zero'
      }
    } else {
      if (!formData.valorFechado || parseFloat(formData.valorFechado) <= 0) {
        newErrors.valorFechado = 'Valor fechado deve ser maior que zero'
      }
    }

    if (!formData.valorPago || parseFloat(formData.valorPago) <= 0) {
      newErrors.valorPago = 'Valor pago deve ser maior que zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const profissionalData = {
        nome: formData.nome,
        email: formData.email,
        especialidade: formData.especialidade,
        dataInicio: formData.dataInicio,
        tipoContrato: formData.tipoContrato,
        valorHora: formData.tipoContrato === 'hora' ? parseFloat(formData.valorHora) : null,
        valorFechado: formData.tipoContrato === 'fechado' ? parseFloat(formData.valorFechado) : null,
        periodoFechado: formData.tipoContrato === 'fechado' ? formData.periodoFechado : null,
        valorPago: parseFloat(formData.valorPago),
        status: formData.status
      }

      if (id) {
        await updateProfissional(id, profissionalData)
      }
      navigate('/profissionais')
    } catch (err) {
      setError('Erro ao atualizar profissional. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && error === 'Profissional não encontrado') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profissionais')}
        >
          Voltar para Profissionais
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profissionais')}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1" color="text.primary">
          Editar Profissional
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Nome */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                error={!!errors.nome}
                helperText={errors.nome}
                disabled={submitting}
                required
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={submitting}
                required
              />
            </Grid>

            {/* Especialidade */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.especialidade}>
                <InputLabel>Especialidade</InputLabel>
                <Select
                  value={formData.especialidade}
                  onChange={(e) => handleInputChange('especialidade', e.target.value)}
                  disabled={submitting}
                >
                  {especialidades.map((especialidade) => (
                    <MenuItem key={especialidade} value={especialidade}>
                      {especialidade}
                    </MenuItem>
                  ))}
                </Select>
                {errors.especialidade && (
                  <Typography variant="caption" color="error">
                    {errors.especialidade}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Data de Início */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Início"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                error={!!errors.dataInicio}
                helperText={errors.dataInicio}
                disabled={submitting}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Tipo de Contrato */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tipo de Contrato</FormLabel>
                <RadioGroup
                  row
                  value={formData.tipoContrato}
                  onChange={(e) => handleInputChange('tipoContrato', e.target.value)}
                >
                  <FormControlLabel
                    value="hora"
                    control={<Radio />}
                    label="Por Hora"
                  />
                  <FormControlLabel
                    value="fechado"
                    control={<Radio />}
                    label="Valor Fechado"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Valor por Hora */}
            {formData.tipoContrato === 'hora' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor por Hora"
                  type="number"
                  value={formData.valorHora}
                  onChange={(e) => handleInputChange('valorHora', e.target.value)}
                  error={!!errors.valorHora}
                  helperText={errors.valorHora}
                  disabled={submitting}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
            )}

            {/* Valor Fechado */}
            {formData.tipoContrato === 'fechado' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor Fechado"
                    type="number"
                    value={formData.valorFechado}
                    onChange={(e) => handleInputChange('valorFechado', e.target.value)}
                    error={!!errors.valorFechado}
                    helperText={errors.valorFechado}
                    disabled={submitting}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={formData.periodoFechado}
                      onChange={(e) => handleInputChange('periodoFechado', e.target.value)}
                      disabled={submitting}
                    >
                      <MenuItem value="mensal">Mensal</MenuItem>
                      <MenuItem value="trimestral">Trimestral</MenuItem>
                      <MenuItem value="semestral">Semestral</MenuItem>
                      <MenuItem value="anual">Anual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Valor Pago */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor Pago ao Profissional"
                type="number"
                value={formData.valorPago}
                onChange={(e) => handleInputChange('valorPago', e.target.value)}
                error={!!errors.valorPago}
                helperText={errors.valorPago}
                disabled={submitting}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                  <MenuItem value="ferias">Férias</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/profissionais')}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  )
}

export default EditarProfissional 