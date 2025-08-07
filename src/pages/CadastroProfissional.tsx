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
  InputAdornment,
  Chip,
  Autocomplete
} from '@mui/material'
import { ArrowBack, Save, Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'

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
    status: 'ativo' as 'ativo' | 'inativo' | 'ferias',
    tags: [] as string[]
  })

  const [newTag, setNewTag] = useState('')

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

  const tagsSugeridas = [
    'Alocação',
    'Projetos',
    'Bodyshop',
    'Freelancer',
    'CLT',
    'PJ',
    'Remoto',
    'Presencial',
    'Híbrido',
    'Senior',
    'Pleno',
    'Junior',
    'Especialista',
    'Consultor',
    'Mentor'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddTag()
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
        status: formData.status,
        tags: formData.tags.join(',')
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
                <TextField
                  fullWidth
                  label="Valor por Hora"
                  type="number"
                  value={formData.valorHora}
                  onChange={(e) => handleInputChange('valorHora', e.target.value)}
                  error={!!errors.valorHora}
                  helperText={errors.valorHora || 'Ex: 100,00'}
                  placeholder="100,00"
                  disabled={submitting}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor Fechado"
                    type="number"
                    value={formData.valorFechado}
                    onChange={(e) => handleInputChange('valorFechado', e.target.value)}
                    error={!!errors.valorFechado}
                    helperText={errors.valorFechado || 'Ex: 5000,00'}
                    placeholder="5000,00"
                    disabled={submitting}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="periodo-label">Período</InputLabel>
                    <Select
                      labelId="periodo-label"
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
              <TextField
                fullWidth
                label="Valor Bruto Pago ao Profissional"
                type="number"
                value={formData.valorPago}
                onChange={(e) => handleInputChange('valorPago', e.target.value)}
                error={!!errors.valorPago}
                helperText={errors.valorPago || 'Ex: 4500,00'}
                placeholder="4500,00"
                disabled={submitting}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>

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

            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Tags
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Adicione tags para categorizar o profissional (ex: Alocação, Projetos, Bodyshop)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Digite uma tag e pressione Enter"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={submitting}
                    InputProps={{
                      endAdornment: (
                        <Button
                          onClick={handleAddTag}
                          disabled={!newTag.trim() || submitting}
                          size="small"
                          sx={{ minWidth: 'auto' }}
                        >
                          <Add />
                        </Button>
                      ),
                    }}
                  />
                </Box>
                
                {/* Tags Sugeridas */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Tags sugeridas:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {tagsSugeridas.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant={formData.tags.includes(tag) ? "filled" : "outlined"}
                        color={formData.tags.includes(tag) ? "primary" : "default"}
                        onClick={() => {
                          if (formData.tags.includes(tag)) {
                            handleRemoveTag(tag)
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag]
                            }))
                          }
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Tags Selecionadas */}
                {formData.tags.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Tags selecionadas:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {formData.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          color="primary"
                          onDelete={() => handleRemoveTag(tag)}
                          disabled={submitting}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
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