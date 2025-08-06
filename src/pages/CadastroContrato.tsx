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
  InputAdornment,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox
} from '@mui/material'
import { ArrowBack, Save, Add, Delete, Lightbulb } from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import SugestaoProfissionais from '../components/SugestaoProfissionais'

import { validateRequired } from '../utils/validations'

const CadastroContrato = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addContrato, updateContrato, contratos, profissionais, clientes } = useData()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [contratoId, setContratoId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nomeProjeto: '',
    clienteId: '',
    dataInicio: '',
    dataFim: '',
    tipoContrato: 'hora' as 'hora' | 'fechado',
    valorContrato: '',
    valorContratoMensal: false,
    percentualImpostos: '',
    valorImpostos: '',
    status: 'ativo' as 'ativo' | 'encerrado' | 'pendente',
    observacoes: '',
    contratoIndeterminado: false,
    quantidadeProfissionais: '1'
  })

  const [showSugestao, setShowSugestao] = useState(false)

  const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<Array<{
    profissionalId: string
    valorHora: string
    horasMensais: string
    valorFechado: string
    periodoFechado: string
  }>>([])

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar dados do contrato se estiver editando
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const contrato = contratos.find(c => c.id === id)
      if (contrato) {
        setIsEditing(true)
        setContratoId(id)
        
        // Preencher formulário com dados do contrato
        setFormData({
          nomeProjeto: contrato.nomeProjeto,
          clienteId: contrato.clienteId,
          dataInicio: contrato.dataInicio,
          dataFim: contrato.dataFim || '',
          tipoContrato: contrato.tipoContrato,
          valorContrato: contrato.valorContrato.toString(),
          valorContratoMensal: false, // Será calculado baseado no valor
          percentualImpostos: contrato.valorImpostos > 0 ? 
            ((contrato.valorImpostos / contrato.valorContrato) * 100).toFixed(2) : '',
          valorImpostos: contrato.valorImpostos.toString(),
          status: contrato.status,
          observacoes: contrato.observacoes || '',
          contratoIndeterminado: !contrato.dataFim
        })

        // Preencher profissionais selecionados
        if (contrato.profissionais && contrato.profissionais.length > 0) {
          setProfissionaisSelecionados(contrato.profissionais.map(p => ({
            profissionalId: p.profissionalId,
            valorHora: p.valorHora?.toString() || '',
            horasMensais: p.horasMensais?.toString() || '',
            valorFechado: p.valorFechado?.toString() || '',
            periodoFechado: p.periodoFechado || 'mensal'
          })))
        }
      }
    }
  }, [searchParams, contratos])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Calcular impostos automaticamente quando valor do contrato ou percentual mudar
      if (field === 'valorContrato' || field === 'percentualImpostos') {
        const valorContrato = field === 'valorContrato' ? value as string : prev.valorContrato
        const percentual = field === 'percentualImpostos' ? value as string : prev.percentualImpostos
        newData.valorImpostos = calcularImpostos(valorContrato, percentual)
      }
      
      return newData
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddProfissional = () => {
    setProfissionaisSelecionados(prev => [...prev, {
      profissionalId: '',
      valorHora: '',
      horasMensais: '',
      valorFechado: '',
      periodoFechado: 'mensal'
    }])
  }

  // Função para preencher automaticamente os campos do profissional baseado no tipo de contrato
  const preencherCamposProfissional = (profissionalId: string, index: number) => {
    const profissional = profissionais.find(p => p.id === profissionalId)
    if (!profissional) return

    setProfissionaisSelecionados(prev => prev.map((item, i) => {
      if (i === index) {
        if (profissional.tipoContrato === 'hora') {
          return {
            ...item,
            profissionalId,
            valorHora: profissional.valorHora?.toString() || '',
            horasMensais: '',
            valorFechado: '',
            periodoFechado: 'mensal'
          }
        } else {
          return {
            ...item,
            profissionalId,
            valorHora: '',
            horasMensais: '',
            valorFechado: profissional.valorFechado?.toString() || '',
            periodoFechado: profissional.periodoFechado || 'mensal'
          }
        }
      }
      return item
    }))
  }

  const handleRemoveProfissional = (index: number) => {
    setProfissionaisSelecionados(prev => prev.filter((_, i) => i !== index))
  }

  const handleAplicarSugestao = (profissionaisSugeridos: any[]) => {
    setProfissionaisSelecionados(profissionaisSugeridos)
  }

  const handleProfissionalChange = (index: number, field: string, value: string) => {
    // Se estiver selecionando um profissional, preencher automaticamente os campos
    if (field === 'profissionalId') {
      preencherCamposProfissional(value, index)
    } else {
      setProfissionaisSelecionados(prev => prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ))
    }
  }

  // Calcular impostos automaticamente
  const calcularImpostos = (valorContrato: string, percentual: string) => {
    if (!valorContrato || !percentual) return ''
    const valor = parseFloat(valorContrato)
    const percent = parseFloat(percentual)
    if (isNaN(valor) || isNaN(percent)) return ''
    return ((valor * percent) / 100).toFixed(2)
  }

  // Calcular valor total do contrato (considerando mensalidade)
  const calcularValorTotal = (valorContrato: string, mensal: boolean, indeterminado: boolean) => {
    if (!valorContrato) return ''
    const valor = parseFloat(valorContrato)
    if (isNaN(valor)) return ''
    
    if (mensal && indeterminado) {
      return (valor * 12).toFixed(2)
    }
    return valor.toFixed(2)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!validateRequired(formData.nomeProjeto)) {
      newErrors.nomeProjeto = 'Nome do projeto é obrigatório'
    }

    if (!validateRequired(formData.clienteId)) {
      newErrors.clienteId = 'Cliente é obrigatório'
    }

    if (!validateRequired(formData.dataInicio)) {
      newErrors.dataInicio = 'Data de início é obrigatória'
    }

    if (!formData.contratoIndeterminado && !validateRequired(formData.dataFim)) {
      newErrors.dataFim = 'Data de fim é obrigatória'
    }

    if (!validateRequired(formData.valorContrato)) {
      newErrors.valorContrato = 'Valor do contrato é obrigatório'
    }

    if (!validateRequired(formData.percentualImpostos)) {
      newErrors.percentualImpostos = 'Percentual de impostos é obrigatório'
    }

    if (!validateRequired(formData.valorImpostos)) {
      newErrors.valorImpostos = 'Valor dos impostos é obrigatório'
    }

    if (profissionaisSelecionados.length === 0) {
      newErrors.profissionais = 'Adicione pelo menos um profissional'
    }

    // Validar profissionais selecionados
    profissionaisSelecionados.forEach((prof, index) => {
      if (!validateRequired(prof.profissionalId)) {
        newErrors[`profissional_${index}`] = 'Selecione um profissional'
      }

      // Verificar o tipo de contrato do profissional selecionado
      const profissionalSelecionado = profissionais.find(p => p.id === prof.profissionalId)
      const tipoContratoProfissional = profissionalSelecionado?.tipoContrato || 'hora'

      if (tipoContratoProfissional === 'hora') {
        if (!validateRequired(prof.valorHora)) {
          newErrors[`valorHora_${index}`] = 'Valor por hora é obrigatório'
        }
        if (!validateRequired(prof.horasMensais)) {
          newErrors[`horasMensais_${index}`] = 'Horas mensais é obrigatório'
        }
      } else {
        if (!validateRequired(prof.valorFechado)) {
          newErrors[`valorFechado_${index}`] = 'Valor fechado é obrigatório'
        }
      }
    })

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
      // Calcular valor total do contrato
      let valorContratoFinal = parseFloat(formData.valorContrato)
      if (formData.valorContratoMensal && formData.contratoIndeterminado) {
        valorContratoFinal = valorContratoFinal * 12
      }

      const contratoData = {
        nomeProjeto: formData.nomeProjeto,
        clienteId: formData.clienteId,
        dataInicio: formData.dataInicio,
        dataFim: formData.contratoIndeterminado ? null : formData.dataFim,
        tipoContrato: formData.tipoContrato,
        valorContrato: valorContratoFinal,
        valorImpostos: parseFloat(formData.valorImpostos),
        status: formData.status,
        observacoes: formData.observacoes || null,
        profissionais: profissionaisSelecionados.map(prof => {
          const profissionalSelecionado = profissionais.find(p => p.id === prof.profissionalId)
          const tipoContratoProfissional = profissionalSelecionado?.tipoContrato || 'hora'
          
          return {
            profissionalId: prof.profissionalId,
            valorHora: tipoContratoProfissional === 'hora' ? parseFloat(prof.valorHora) : null,
            horasMensais: tipoContratoProfissional === 'hora' ? parseInt(prof.horasMensais) : null,
            valorFechado: tipoContratoProfissional === 'fechado' ? parseFloat(prof.valorFechado) : null,
            periodoFechado: tipoContratoProfissional === 'fechado' ? prof.periodoFechado : null
          }
        })
      }

      if (isEditing && contratoId) {
        await updateContrato(contratoId, contratoData)
      } else {
        await addContrato(contratoData)
      }
      navigate('/contratos')
    } catch (err) {
      setError('Erro ao cadastrar contrato. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/contratos')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Editar Contrato' : 'Cadastrar Contrato'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Dados do Projeto */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Dados do Projeto
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Projeto"
                value={formData.nomeProjeto}
                onChange={(e) => handleInputChange('nomeProjeto', e.target.value)}
                error={!!errors.nomeProjeto}
                helperText={errors.nomeProjeto}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.clienteId}>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={formData.clienteId}
                  onChange={(e) => handleInputChange('clienteId', e.target.value)}
                  disabled={submitting}
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {cliente.empresa} - {cliente.nome}
                    </MenuItem>
                  ))}
                </Select>
                {errors.clienteId && (
                  <Typography variant="caption" color="error">
                    {errors.clienteId}
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Fim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => handleInputChange('dataFim', e.target.value)}
                error={!!errors.dataFim}
                helperText={errors.dataFim || 'Deixe vazio para contrato indeterminado'}
                disabled={submitting || formData.contratoIndeterminado}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    checked={formData.contratoIndeterminado}
                    onChange={(e) => handleInputChange('contratoIndeterminado', e.target.checked)}
                    disabled={submitting}
                  />
                }
                label="Contrato Indeterminado"
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
                    label="Por Horas"
                    disabled={submitting}
                  />
                  <FormControlLabel
                    value="fechado"
                    control={<Radio />}
                    label="Valor Negociado"
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor do Contrato"
                type="number"
                value={formData.valorContrato}
                onChange={(e) => handleInputChange('valorContrato', e.target.value)}
                error={!!errors.valorContrato}
                helperText={errors.valorContrato || 'Ex: 50000,00'}
                placeholder="50000,00"
                disabled={submitting}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.valorContratoMensal}
                    onChange={(e) => handleInputChange('valorContratoMensal', e.target.checked)}
                    disabled={submitting}
                  />
                }
                label="Valor é mensal"
              />
            </Grid>

            {formData.valorContratoMensal && formData.contratoIndeterminado && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Contrato mensal indeterminado - será considerado 12 meses para cálculos
                  </Typography>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Percentual de Impostos (%)"
                type="number"
                value={formData.percentualImpostos}
                onChange={(e) => handleInputChange('percentualImpostos', e.target.value)}
                error={!!errors.percentualImpostos}
                helperText={errors.percentualImpostos || 'Ex: 13,00'}
                placeholder="13,00"
                disabled={submitting}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor dos Impostos (Calculado)"
                type="number"
                value={formData.valorImpostos}
                error={!!errors.valorImpostos}
                helperText={errors.valorImpostos || 'Calculado automaticamente'}
                disabled={true}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>

            {/* Profissionais */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary.main">
                  Profissionais
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Quantidade de Profissionais"
                    type="number"
                    value={formData.quantidadeProfissionais}
                    onChange={(e) => handleInputChange('quantidadeProfissionais', e.target.value)}
                    disabled={submitting}
                    sx={{ width: 200 }}
                    InputProps={{
                      inputProps: { min: 1, max: 10 }
                    }}
                  />
                  <Button
                    startIcon={<Lightbulb />}
                    variant="outlined"
                    onClick={() => setShowSugestao(true)}
                    disabled={submitting || !formData.valorContrato || !formData.quantidadeProfissionais}
                  >
                    Sugerir Profissionais
                  </Button>
                  <Button
                    startIcon={<Add />}
                    onClick={handleAddProfissional}
                    disabled={submitting}
                  >
                    Adicionar Profissional
                  </Button>
                </Box>
              </Box>

              {errors.profissionais && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.profissionais}
                </Alert>
              )}

              <List>
                {profissionaisSelecionados.map((prof, index) => (
                  <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth error={!!errors[`profissional_${index}`]}>
                              <InputLabel>Profissional</InputLabel>
                              <Select
                                value={prof.profissionalId}
                                onChange={(e) => handleProfissionalChange(index, 'profissionalId', e.target.value)}
                                disabled={submitting}
                              >
                                {profissionais.map((p) => (
                                  <MenuItem key={p.id} value={p.id}>
                                    {p.nome} - {p.especialidade}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors[`profissional_${index}`] && (
                                <Typography variant="caption" color="error">
                                  {errors[`profissional_${index}`]}
                                </Typography>
                              )}
                            </FormControl>
                          </Grid>

                          {(() => {
                            const profissionalSelecionado = profissionais.find(p => p.id === prof.profissionalId)
                            const tipoContratoProfissional = profissionalSelecionado?.tipoContrato || 'hora'
                            
                            if (tipoContratoProfissional === 'hora') {
                              return (
                                <>
                                  <Grid item xs={12} md={3}>
                                    <TextField
                                      fullWidth
                                      label="Valor/Hora (Preenchido)"
                                      type="number"
                                      value={prof.valorHora}
                                      onChange={(e) => handleProfissionalChange(index, 'valorHora', e.target.value)}
                                      error={!!errors[`valorHora_${index}`]}
                                      helperText={errors[`valorHora_${index}`] || 'Preenchido automaticamente'}
                                      placeholder="150,00"
                                      disabled={submitting}
                                      InputProps={{
                                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <TextField
                                      fullWidth
                                      label="Horas/Mês"
                                      type="number"
                                      value={prof.horasMensais}
                                      onChange={(e) => handleProfissionalChange(index, 'horasMensais', e.target.value)}
                                      error={!!errors[`horasMensais_${index}`]}
                                      helperText={errors[`horasMensais_${index}`]}
                                      disabled={submitting}
                                    />
                                  </Grid>
                                </>
                              )
                            } else {
                              return (
                                <>
                                  <Grid item xs={12} md={4}>
                                    <TextField
                                      fullWidth
                                      label="Valor Fechado (Preenchido)"
                                      type="number"
                                      value={prof.valorFechado}
                                      onChange={(e) => handleProfissionalChange(index, 'valorFechado', e.target.value)}
                                      error={!!errors[`valorFechado_${index}`]}
                                      helperText={errors[`valorFechado_${index}`] || 'Preenchido automaticamente'}
                                      placeholder="5000,00"
                                      disabled={submitting}
                                      InputProps={{
                                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                      <InputLabel>Período</InputLabel>
                                      <Select
                                        value={prof.periodoFechado}
                                        onChange={(e) => handleProfissionalChange(index, 'periodoFechado', e.target.value)}
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
                              )
                            }
                          })()}
                        </Grid>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveProfissional(index)}
                        disabled={submitting}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="encerrado">Encerrado</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                disabled={submitting}
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/contratos')}
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
                  {submitting ? 'Salvando...' : 'Salvar Contrato'}
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

      {/* Modal de Sugestão de Profissionais */}
      <SugestaoProfissionais
        open={showSugestao}
        onClose={() => setShowSugestao(false)}
        valorContrato={parseFloat(formData.valorContrato) || 0}
        valorImpostos={parseFloat(formData.valorImpostos) || 0}
        quantidadeProfissionais={parseInt(formData.quantidadeProfissionais) || 1}
        isMensal={formData.valorContratoMensal}
        onAplicarSugestao={handleAplicarSugestao}
      />
    </Box>
  )
}

export default CadastroContrato 