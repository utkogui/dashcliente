import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material'
import {
  Person,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Close,
  Lightbulb,
  Add,
  Search
} from '@mui/icons-material'
import { useData } from '../contexts/DataContext'
import { formatCurrency } from '../utils/formatters'

interface SugestaoProfissional {
  profissional: any
  custoMensal: number
  margem: number
  percentualMargem: number
  score: number
  disponivel: boolean
  especialidade: string
}

interface SugestaoProfissionaisProps {
  open: boolean
  onClose: () => void
  valorContrato: number
  valorImpostos: number
  quantidadeProfissionais: number
  isMensal: boolean
  onAplicarSugestao: (profissionais: any[]) => void
}

const SugestaoProfissionais: React.FC<SugestaoProfissionaisProps> = ({
  open,
  onClose,
  valorContrato,
  valorImpostos,
  quantidadeProfissionais,
  isMensal,
  onAplicarSugestao
}) => {
  const { profissionais, contratos } = useData()
  const [sugestoes, setSugestoes] = useState<SugestaoProfissional[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todas')
  const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<string[]>([])
  const [margemDesejada, setMargemDesejada] = useState(20) // 20% de margem padrão
  const [tabAtiva, setTabAtiva] = useState(0) // 0 = Manual, 1 = Sugestões
  const [buscaManual, setBuscaManual] = useState('')

  // Calcular orçamento disponível
  const valorLiquido = valorContrato - valorImpostos
  const valorTotal = isMensal ? valorLiquido * 12 : valorLiquido
  const orcamentoDisponivel = valorTotal // Orçamento total disponível para todos os profissionais

  // Verificar disponibilidade dos profissionais
  const verificarDisponibilidade = (profissionalId: string) => {
    const contratosAtivos = contratos.filter(c => 
      c.status === 'ativo' && 
      c.profissionais.some(p => p.profissionalId === profissionalId)
    )
    
    // Considerar disponível se não está em mais de 2 projetos ativos
    return contratosAtivos.length < 2
  }

  // Calcular custo mensal do profissional
  const calcularCustoMensal = (profissional: any) => {
    if (profissional.tipoContrato === 'hora') {
      // Assumir 160h/mês (8h/dia * 20 dias)
      return (profissional.valorHora || 0) * 160
    } else {
      // Para valor fechado, usar o valor fechado
      return profissional.valorFechado || 0
    }
  }

  // Filtrar profissionais para seleção manual
  const profissionaisFiltrados = profissionais.filter(profissional => {
    const nomeMatch = profissional.nome.toLowerCase().includes(buscaManual.toLowerCase())
    const especialidadeMatch = filtroEspecialidade === 'todas' || profissional.especialidade === filtroEspecialidade
    return nomeMatch && especialidadeMatch
  })

  // Gerar sugestões
  const gerarSugestoes = () => {
    setLoading(true)
    
    const sugestoesCalculadas: SugestaoProfissional[] = profissionais
      .filter(profissional => {
        // Filtrar por especialidade se selecionado
        if (filtroEspecialidade !== 'todas' && profissional.especialidade !== filtroEspecialidade) {
          return false
        }
        return true
      })
      .map(profissional => {
        const custoMensal = calcularCustoMensal(profissional)
        const custoTotal = isMensal ? custoMensal * 12 : custoMensal
        const margem = orcamentoDisponivel - custoTotal
        const percentualMargem = orcamentoDisponivel > 0 ? (margem / orcamentoDisponivel) * 100 : 0
        
        // Score baseado em margem e disponibilidade
        const disponivel = verificarDisponibilidade(profissional.id)
        const score = disponivel ? percentualMargem : percentualMargem * 0.5 // Penalizar indisponíveis
        
        return {
          profissional,
          custoMensal,
          margem,
          percentualMargem,
          score,
          disponivel,
          especialidade: profissional.especialidade
        }
      })
      .filter(sugestao => sugestao.percentualMargem >= -margemDesejada) // Filtrar margem mínima
      .sort((a, b) => b.score - a.score) // Ordenar por score
      .slice(0, 20) // Top 20 sugestões

    setSugestoes(sugestoesCalculadas)
    setLoading(false)
  }

  // Aplicar sugestão
  const aplicarSugestao = () => {
    let profissionaisSelecionadosData: any[] = []

    if (tabAtiva === 0) {
      // Seleção manual
      const profissionaisManual = profissionaisFiltrados.filter(p => 
        profissionaisSelecionados.includes(p.id)
      )
      profissionaisSelecionadosData = profissionaisManual.map(p => ({
        profissionalId: p.id,
        valorHora: p.tipoContrato === 'hora' ? p.valorHora : null,
        horasMensais: p.tipoContrato === 'hora' ? 160 : null,
        valorFechado: p.tipoContrato === 'fechado' ? p.valorFechado : null,
        periodoFechado: p.tipoContrato === 'fechado' ? p.periodoFechado : null
      }))
    } else {
      // Sugestões automáticas
      const profissionaisSugestao = sugestoes
        .filter(s => profissionaisSelecionados.includes(s.profissional.id))
        .map(s => ({
          profissionalId: s.profissional.id,
          valorHora: s.profissional.tipoContrato === 'hora' ? s.profissional.valorHora : null,
          horasMensais: s.profissional.tipoContrato === 'hora' ? 160 : null,
          valorFechado: s.profissional.tipoContrato === 'fechado' ? s.profissional.valorFechado : null,
          periodoFechado: s.profissional.tipoContrato === 'fechado' ? s.profissional.periodoFechado : null
        }))
      profissionaisSelecionadosData = profissionaisSugestao
    }

    onAplicarSugestao(profissionaisSelecionadosData)
    onClose()
  }

  // Selecionar/deselecionar profissional
  const toggleProfissional = (profissionalId: string) => {
    setProfissionaisSelecionados(prev => {
      if (prev.includes(profissionalId)) {
        return prev.filter(id => id !== profissionalId)
      } else {
        return [...prev, profissionalId]
      }
    })
  }

  // Gerar sugestões quando abrir o modal ou mudar para aba de sugestões
  useEffect(() => {
    if (open && tabAtiva === 1) {
      gerarSugestoes()
    }
  }, [open, tabAtiva, valorContrato, valorImpostos, isMensal, filtroEspecialidade, margemDesejada])

  // Resetar seleções quando abrir o modal
  useEffect(() => {
    if (open) {
      setProfissionaisSelecionados([])
      setTabAtiva(0)
      setBuscaManual('')
    }
  }, [open])

  const especialidades = [...new Set(profissionais.map(p => p.especialidade))]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Add color="primary" />
          <Typography variant="h6">
            Adicionar Profissional
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Tabs para escolher entre Manual e Sugestões */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabAtiva} onChange={(e, newValue) => setTabAtiva(newValue)}>
            <Tab 
              icon={<Search />} 
              label="Seleção Manual" 
              iconPosition="start"
            />
            <Tab 
              icon={<Lightbulb />} 
              label="Sugestões Automáticas" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Resumo do Contrato */}
        <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resumo do Contrato
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Valor do Contrato
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(valorContrato)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Impostos
                </Typography>
                <Typography variant="h6" color="error">
                  {formatCurrency(valorImpostos)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Valor Líquido
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(valorLiquido)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Orçamento Disponível
                </Typography>
                <Typography variant="h6" color="info.main">
                  {formatCurrency(orcamentoDisponivel)}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={isMensal ? 'Contrato Mensal' : 'Contrato Único'} 
                color={isMensal ? 'primary' : 'secondary'}
                size="small"
              />
              <Chip 
                label="Múltiplos profissionais" 
                color="info"
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por Especialidade</InputLabel>
                <Select
                  value={filtroEspecialidade}
                  onChange={(e) => setFiltroEspecialidade(e.target.value)}
                >
                  <MenuItem value="todas">Todas as Especialidades</MenuItem>
                  {especialidades.map(especialidade => (
                    <MenuItem key={especialidade} value={especialidade}>
                      {especialidade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              {tabAtiva === 0 ? (
                <TextField
                  fullWidth
                  label="Buscar por Nome"
                  value={buscaManual}
                  onChange={(e) => setBuscaManual(e.target.value)}
                  placeholder="Digite o nome do profissional..."
                />
              ) : (
                <TextField
                  fullWidth
                  label="Margem Mínima (%)"
                  type="number"
                  value={margemDesejada}
                  onChange={(e) => setMargemDesejada(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Conteúdo baseado na aba ativa */}
        {tabAtiva === 0 ? (
          // Seleção Manual
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h6">
                Selecionar Profissional
              </Typography>
              <Chip 
                label={`${profissionaisSelecionados.length} selecionados`}
                color={profissionaisSelecionados.length > 0 ? 'success' : 'warning'}
                size="small"
              />
            </Box>

            <List>
              {profissionaisFiltrados.map((profissional, index) => {
                const disponivel = verificarDisponibilidade(profissional.id)
                const custoMensal = calcularCustoMensal(profissional)
                
                return (
                  <React.Fragment key={profissional.id}>
                    <ListItem 
                      button
                      selected={profissionaisSelecionados.includes(profissional.id)}
                      onClick={() => toggleProfissional(profissional.id)}
                      sx={{
                        border: profissionaisSelecionados.includes(profissional.id) ? 2 : 1,
                        borderColor: profissionaisSelecionados.includes(profissional.id) ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {profissional.nome}
                            </Typography>
                            {disponivel ? (
                              <Chip label="Disponível" color="success" size="small" />
                            ) : (
                              <Chip label="Ocupado" color="warning" size="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {profissional.especialidade}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Typography variant="body2">
                                Tipo: {profissional.tipoContrato === 'hora' ? 'Por Hora' : 'Valor Fechado'}
                              </Typography>
                              <Typography variant="body2">
                                Custo: {formatCurrency(custoMensal)}/mês
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        {profissionaisSelecionados.includes(profissional.id) && (
                          <CheckCircle color="primary" />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < profissionaisFiltrados.length - 1 && <Divider />}
                  </React.Fragment>
                )
              })}
            </List>

            {profissionaisFiltrados.length === 0 && (
              <Alert severity="info">
                Nenhum profissional encontrado com os filtros atuais.
              </Alert>
            )}
          </>
        ) : (
          // Sugestões Automáticas
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6">
                    Melhores Sugestões
                  </Typography>
                                <Chip 
                label={`${profissionaisSelecionados.length} selecionados`}
                color={profissionaisSelecionados.length > 0 ? 'success' : 'warning'}
                size="small"
              />
                </Box>

                <List>
                  {sugestoes.map((sugestao, index) => (
                    <React.Fragment key={sugestao.profissional.id}>
                      <ListItem 
                        button
                        selected={profissionaisSelecionados.includes(sugestao.profissional.id)}
                        onClick={() => toggleProfissional(sugestao.profissional.id)}
                        sx={{
                          border: profissionaisSelecionados.includes(sugestao.profissional.id) ? 2 : 1,
                          borderColor: profissionaisSelecionados.includes(sugestao.profissional.id) ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {sugestao.profissional.nome}
                              </Typography>
                              {sugestao.disponivel ? (
                                <Chip label="Disponível" color="success" size="small" />
                              ) : (
                                <Chip label="Ocupado" color="warning" size="small" />
                              )}
                              {index < quantidadeProfissionais && (
                                <Chip label="Top" color="primary" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {sugestao.especialidade}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Typography variant="body2">
                                  Custo: {formatCurrency(sugestao.custoMensal)}/mês
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color={sugestao.margem >= 0 ? 'success.main' : 'error.main'}
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  {sugestao.margem >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                                  Margem: {formatCurrency(sugestao.margem)} ({sugestao.percentualMargem.toFixed(1)}%)
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {profissionaisSelecionados.includes(sugestao.profissional.id) && (
                            <CheckCircle color="primary" />
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < sugestoes.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                {sugestoes.length === 0 && (
                  <Alert severity="warning">
                    Nenhuma sugestão encontrada com os critérios atuais. Tente ajustar os filtros ou a margem mínima.
                  </Alert>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={aplicarSugestao}
          disabled={profissionaisSelecionados.length === 0}
          startIcon={<CheckCircle />}
        >
          Adicionar Profissional ({profissionaisSelecionados.length})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SugestaoProfissionais 