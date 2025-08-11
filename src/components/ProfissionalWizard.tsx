import React, { useState } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material'
import {
  Person,
  AttachMoney,
  Receipt,
  CheckCircle,
} from '@mui/icons-material'
import InputMask from 'react-input-mask'
import { validateEmail, validateTelefone, validateRequired } from '../utils/validations'
import { masks, validateMask } from '../utils/masks'

interface ProfissionalWizardProps {
  open: boolean
  onClose: () => void
  onSubmit: (profissional: any) => Promise<void>
  editingProfissional?: any
}

interface FormData {
  // Step 1: Dados pessoais
  nome: string
  email: string
  telefone: string
  especialidade: string
  dataAdmissao: string
  
  // Step 2: Configuração de remuneração
  tipoContrato: 'hora' | 'fechado'
  
  // Step 3: Valores e impostos
  valorHora: number | null
  valorFechado: number | null
  periodoFechado: string
  valorPago: number
  percentualImpostos: number
}

const steps = [
  { label: 'Dados Pessoais', icon: <Person /> },
  { label: 'Tipo de Contrato', icon: <AttachMoney /> },
  { label: 'Valores e Impostos', icon: <Receipt /> },
  { label: 'Confirmação', icon: <CheckCircle /> }
]

const especialidades = [
  'Desenvolvedor Full Stack',
  'Desenvolvedor Frontend',
  'Desenvolvedor Backend',
  'UX/UI Designer',
  'Pesquisador',
  'UX Writer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'QA Engineer',
  'Tech Lead',
  'Arquiteto de Software',
  'Outros'
]

const periodosFechados = [
  'Mensal',
  'Trimestral',
  'Semestral',
  'Anual',
  'Por Projeto'
]

const ProfissionalWizard: React.FC<ProfissionalWizardProps> = ({
  open,
  onClose,
  onSubmit,
  editingProfissional
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    dataAdmissao: '',
    tipoContrato: 'hora',
    valorHora: null,
    valorFechado: null,
    periodoFechado: 'Mensal',
    valorPago: 0,
    percentualImpostos: 13.0
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)

  // Inicializar dados se estiver editando
  React.useEffect(() => {
    if (editingProfissional) {
      setFormData({
        nome: editingProfissional.nome || '',
        email: editingProfissional.email || '',
        telefone: editingProfissional.telefone || '',
        especialidade: editingProfissional.especialidade || '',
        dataAdmissao: editingProfissional.dataAdmissao || '',
        tipoContrato: editingProfissional.tipoContrato || 'hora',
        valorHora: editingProfissional.valorHora || null,
        valorFechado: editingProfissional.valorFechado || null,
        periodoFechado: editingProfissional.periodoFechado || 'Mensal',
        valorPago: editingProfissional.valorPago || 0,
        percentualImpostos: editingProfissional.percentualImpostos || 13.0
      })
    }
  }, [editingProfissional])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {}

    switch (step) {
      case 0: // Dados pessoais
        if (!validateRequired(formData.nome)) {
          newErrors.nome = 'Nome é obrigatório'
        }
        if (!validateRequired(formData.email)) {
          newErrors.email = 'Email é obrigatório'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Email inválido'
        }
        if (!validateRequired(formData.especialidade)) {
          newErrors.especialidade = 'Especialidade é obrigatória'
        }
        if (!validateRequired(formData.dataAdmissao)) {
          newErrors.dataAdmissao = 'Data de admissão é obrigatória'
        }
        if (formData.telefone && !validateMask.telefone(formData.telefone)) {
          newErrors.telefone = 'Telefone inválido (mínimo 10 dígitos)'
        }
        break

      case 1: // Tipo de contrato
        if (!formData.tipoContrato) {
          newErrors.tipoContrato = 'Tipo de contrato é obrigatório'
        }
        break

      case 2: // Valores e impostos
        if (formData.tipoContrato === 'hora') {
          if (!formData.valorHora || formData.valorHora <= 0) {
            newErrors.valorHora = 'Valor por hora deve ser maior que zero'
          }
        } else {
          if (!formData.valorFechado || formData.valorFechado <= 0) {
            newErrors.valorFechado = 'Valor fechado deve ser maior que zero'
          }
          if (!validateRequired(formData.periodoFechado)) {
            newErrors.periodoFechado = 'Período é obrigatório'
          }
        }
        if (!formData.valorPago || formData.valorPago <= 0) {
          newErrors.valorPago = 'Valor pago deve ser maior que zero'
        }
        if (formData.percentualImpostos < 0 || formData.percentualImpostos > 100) {
          newErrors.percentualImpostos = 'Percentual de impostos deve estar entre 0 e 100'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return

    try {
      setSubmitting(true)
      
      const profissionalData = {
        ...formData,
        status: 'ativo' as const
      }

      await onSubmit(profissionalData)
      handleClose()
    } catch (error: any) {
      console.error('Erro ao salvar profissional:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setActiveStep(0)
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      especialidade: '',
      dataAdmissao: '',
      tipoContrato: 'hora',
      valorHora: null,
      valorFechado: null,
      periodoFechado: 'Mensal',
      valorPago: 0,
      percentualImpostos: 13.0
    })
    setErrors({})
    setSubmitting(false)
    onClose()
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Dados Pessoais
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome Completo *"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  error={!!errors.nome}
                  helperText={errors.nome}
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputMask
                  mask={masks.telefone}
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  disabled={submitting}
                >
                  {(inputProps: any) => (
                    <TextField
                      {...inputProps}
                      fullWidth
                      label="Telefone"
                      error={!!errors.telefone}
                      helperText={errors.telefone || 'Ex: (11) 99999-9999'}
                      placeholder="(11) 99999-9999"
                    />
                  )}
                </InputMask>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Admissão *"
                  type="date"
                  value={formData.dataAdmissao}
                  onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
                  error={!!errors.dataAdmissao}
                  helperText={errors.dataAdmissao}
                  disabled={submitting}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.especialidade} disabled={submitting}>
                  <InputLabel>Especialidade *</InputLabel>
                  <Select
                    value={formData.especialidade}
                    label="Especialidade *"
                    onChange={(e) => handleInputChange('especialidade', e.target.value)}
                  >
                    {especialidades.map((esp) => (
                      <MenuItem key={esp} value={esp}>
                        {esp}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errors.especialidade && (
                  <Typography variant="caption" color="error">
                    {errors.especialidade}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )

      case 1:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tipo de Contrato
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Escolha o tipo de remuneração para este profissional
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.tipoContrato} disabled={submitting}>
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
                {errors.tipoContrato && (
                  <Typography variant="caption" color="error">
                    {errors.tipoContrato}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Por Hora:</strong> Remuneração baseada em horas trabalhadas
                    <br />
                    <strong>Valor Fechado:</strong> Remuneração fixa por período
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Valores e Impostos
            </Typography>
            
            <Grid container spacing={2}>
              {formData.tipoContrato === 'hora' ? (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor por Hora (R$) *"
                    type="number"
                    value={formData.valorHora?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      handleInputChange('valorHora', value ? parseFloat(value) : null)
                    }}
                    error={!!errors.valorHora}
                    helperText={errors.valorHora || 'Ex: 150,00'}
                    placeholder="150,00"
                    disabled={submitting}
                    InputProps={{
                      startAdornment: <Typography>R$</Typography>
                    }}
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Valor Fechado (R$) *"
                      type="number"
                      value={formData.valorFechado?.toString() || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        handleInputChange('valorFechado', value ? parseFloat(value) : null)
                      }}
                      error={!!errors.valorFechado}
                      helperText={errors.valorFechado || 'Ex: 5000,00'}
                      placeholder="5000,00"
                      disabled={submitting}
                      InputProps={{
                        startAdornment: <Typography>R$</Typography>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.periodoFechado} disabled={submitting}>
                      <InputLabel id="periodo-wizard-label">Período *</InputLabel>
                      <Select
                        labelId="periodo-wizard-label"
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
                    {errors.periodoFechado && (
                      <Typography variant="caption" color="error">
                        {errors.periodoFechado}
                      </Typography>
                    )}
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor Pago ao Profissional (R$) *"
                  type="number"
                  value={formData.valorPago.toString()}
                  onChange={(e) => {
                    const value = e.target.value
                    handleInputChange('valorPago', value ? parseFloat(value) : 0)
                  }}
                  error={!!errors.valorPago}
                  helperText={errors.valorPago || 'Ex: 4000,00'}
                  placeholder="4000,00"
                  disabled={submitting}
                  InputProps={{
                    startAdornment: <Typography>R$</Typography>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <InputMask
                  mask="99.99"
                  value={formData.percentualImpostos.toString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')
                    handleInputChange('percentualImpostos', value ? parseFloat(value) : 0)
                  }}
                  disabled={submitting}
                >
                  {(inputProps: any) => (
                    <TextField
                      {...inputProps}
                      fullWidth
                      label="Percentual de Impostos (%)"
                      error={!!errors.percentualImpostos}
                      helperText={errors.percentualImpostos || 'Padrão: 13%'}
                      placeholder="13,00"
                      InputProps={{
                        endAdornment: <Typography>%</Typography>
                      }}
                    />
                  )}
                </InputMask>
              </Grid>
            </Grid>
          </Box>
        )

      case 3:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Confirmação dos Dados
            </Typography>
            
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Dados Pessoais
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Nome:</Typography>
                  <Typography variant="body1">{formData.nome}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1">{formData.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Telefone:</Typography>
                  <Typography variant="body1">{formData.telefone || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Especialidade:</Typography>
                  <Typography variant="body1">{formData.especialidade}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Data de Admissão:</Typography>
                  <Typography variant="body1">{formData.dataAdmissao}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Configuração de Remuneração
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Tipo de Contrato:</Typography>
                  <Chip 
                    label={formData.tipoContrato === 'hora' ? 'Por Hora' : 'Valor Fechado'}
                    color={formData.tipoContrato === 'hora' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Grid>
                {formData.tipoContrato === 'hora' ? (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Valor por Hora:</Typography>
                    <Typography variant="body1">R$ {formData.valorHora?.toFixed(2)}</Typography>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Valor Fechado:</Typography>
                      <Typography variant="body1">R$ {formData.valorFechado?.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Período:</Typography>
                      <Typography variant="body1">{formData.periodoFechado}</Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Valor Pago:</Typography>
                  <Typography variant="body1">R$ {formData.valorPago.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Impostos:</Typography>
                  <Typography variant="body1">{formData.percentualImpostos}%</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel icon={step.icon}>
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 4 }}>
            {renderStepContent(activeStep)}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          disabled={activeStep === 0 || submitting}
          onClick={handleBack}
        >
          Anterior
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? 'Salvando...' : (editingProfissional ? 'Salvar' : 'Criar Profissional')}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={submitting}
          >
            Próximo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ProfissionalWizard 