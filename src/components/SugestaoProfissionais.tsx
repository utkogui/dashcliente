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
  InputAdornment
} from '@mui/material'
import {
  Person,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Close,
  Lightbulb
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

  // Calcular orçamento disponível
  const valorLiquido = valorContrato - valorImpostos
  const valorTotal = isMensal ? valorLiquido * 12 : valorLiquido
  const orcamentoPorProfissional = valorTotal / quantidadeProfissionais

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
        const margem = orcamentoPorProfissional - custoTotal
        const percentualMargem = orcamentoPorProfissional > 0 ? (margem / orcamentoPorProfissional) * 100 : 0
        
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
      .slice(0, Math.max(quantidadeProfissionais * 2, 10)) // Top sugestões

    setSugestoes(sugestoesCalculadas)
    setLoading(false)
  }

  // Aplicar sugestão
  const aplicarSugestao = () => {
    const profissionaisSelecionadosData = sugestoes
      .filter(s => profissionaisSelecionados.includes(s.profissional.id))
      .map(s => ({
        profissionalId: s.profissional.id,
        valorHora: s.profissional.tipoContrato === 'hora' ? s.profissional.valorHora : null,
        horasMensais: s.profissional.tipoContrato === 'hora' ? 160 : null,
        valorFechado: s.profissional.tipoContrato === 'fechado' ? s.profissional.valorFechado : null,
        periodoFechado: s.profissional.tipoContrato === 'fechado' ? s.profissional.periodoFechado : null
      }))

    onAplicarSugestao(profissionaisSelecionadosData)
    onClose()
  }

  // Selecionar/deselecionar profissional
  const toggleProfissional = (profissionalId: string) => {
    setProfissionaisSelecionados(prev => {
      if (prev.includes(profissionalId)) {
        return prev.filter(id => id !== profissionalId)
      } else {
        if (prev.length < quantidadeProfissionais) {
          return [...prev, profissionalId]
        }
        return prev
      }
    })
  }

  // Gerar sugestões quando abrir o modal
  useEffect(() => {
    if (open) {
      gerarSugestoes()
      setProfissionaisSelecionados([])
    }
  }, [open, valorContrato, valorImpostos, quantidadeProfissionais, isMensal, filtroEspecialidade, margemDesejada])

  const especialidades = [...new Set(profissionais.map(p => p.especialidade))]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Lightbulb color="primary" />
          <Typography variant="h6">
            Sugestão de Profissionais
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
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
                  Orçamento por Profissional
                </Typography>
                <Typography variant="h6" color="info.main">
                  {formatCurrency(orcamentoPorProfissional)}
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
                label={`${quantidadeProfissionais} profissional(is)`} 
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
            </Grid>
          </Grid>
        </Box>

        {/* Lista de Sugestões */}
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
                label={`${profissionaisSelecionados.length}/${quantidadeProfissionais} selecionados`}
                color={profissionaisSelecionados.length === quantidadeProfissionais ? 'success' : 'warning'}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={aplicarSugestao}
          disabled={profissionaisSelecionados.length !== quantidadeProfissionais}
          startIcon={<CheckCircle />}
        >
          Aplicar Sugestão ({profissionaisSelecionados.length}/{quantidadeProfissionais})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SugestaoProfissionais 