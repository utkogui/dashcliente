import React, { useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import InputMask from 'react-input-mask'
import { masks } from '../utils/masks'
import { validateEmail, validateRequired } from '../utils/validations'

const CadastroProfissional = () => {
  const navigate = useNavigate()
  const { addProfissional } = useData()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    if (!validateRequired(formData.valorPago)) {
      newErrors.valorPago = 'Valor pago é obrigatório'
    }

    if (formData.tipoContrato === 'hora' && !validateRequired(formData.valorHora)) {
      newErrors.valorHora = 'Valor por hora é obrigatório para contratos por hora'
    }

    if (formData.tipoContrato === 'fechado' && !validateRequired(formData.valorFechado)) {
      newErrors.valorFechado = 'Valor fechado é obrigatório para contratos fechados'
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

      await addProfissional(profissionalData)
      navigate('/profissionais')
    } catch (err) {
      setError('Erro ao cadastrar profissional. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profissionais')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Cadastrar Profissional
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Dados Pessoais */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Dados Pessoais
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                error={!!errors.nome}
                helperText={errors.nome}
                disabled={submitting}
              />
            </Grid>

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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.especialidade}>
                <InputLabel>Especialidade</InputLabel>
                <Select
                  value={formData.especialidade}
                  onChange={(e) => handleInputChange('especialidade', e.target.value)}
                  disabled={submitting}
                >
                  {especialidades.map((esp) => (
                    <MenuItem key={esp} value={esp}>
                      {esp}
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
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Tipo de Contrato */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Tipo de Contrato
              </Typography>
              <FormControl component="fieldset">
                <FormLabel component="legend">Selecione o tipo de contrato:</FormLabel>
                <RadioGroup
                  row
                  value={formData.tipoContrato}
                  onChange={(e) => handleInputChange('tipoContrato', e.target.value)}
                >
                  <FormControlLabel
                    value="hora"
                    control={<Radio />}
                    label="Por Hora"
                    disabled={submitting}
                  />
                  <FormControlLabel
                    value="fechado"
                    control={<Radio />}
                    label="Por Valor Fechado"
                    disabled={submitting}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Valores */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Valores
              </Typography>
            </Grid>

            {formData.tipoContrato === 'hora' ? (
              <Grid item xs={12} md={6}>
                <InputMask
                  mask={masks.valor}
                  value={formData.valorHora}
                  onChange={(e) => handleInputChange('valorHora', e.target.value)}
                  disabled={submitting}
                >
                  {(inputProps: any) => (
                    <TextField
                      {...inputProps}
                      fullWidth
                      label="Valor por Hora"
                      error={!!errors.valorHora}
                      helperText={errors.valorHora || 'Ex: R$ 100,00'}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  )}
                </InputMask>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <InputMask
                    mask={masks.valor}
                    value={formData.valorFechado}
                    onChange={(e) => handleInputChange('valorFechado', e.target.value)}
                    disabled={submitting}
                  >
                    {(inputProps: any) => (
                      <TextField
                        {...inputProps}
                        fullWidth
                        label="Valor Fechado"
                        error={!!errors.valorFechado}
                        helperText={errors.valorFechado || 'Ex: R$ 5.000,00'}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
                      />
                    )}
                  </InputMask>
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

            <Grid item xs={12} md={6}>
              <InputMask
                mask={masks.valor}
                value={formData.valorPago}
                onChange={(e) => handleInputChange('valorPago', e.target.value)}
                disabled={submitting}
              >
                {(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    label="Valor Bruto Pago ao Profissional"
                    error={!!errors.valorPago}
                    helperText={errors.valorPago || 'Ex: R$ 4.500,00'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                )}
              </InputMask>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
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
                  {submitting ? 'Salvando...' : 'Salvar Profissional'}
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

export default CadastroProfissional 