import { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material'
import {
  Person,
  Search,
  PendingActions,
  CalendarToday,
  AccessTime,
  FilterList,
  Email,
  Chat,
  Close
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { calcularDiasRestantes, getCardStyle } from '../utils/formatters'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'

const VisaoCliente = () => {
  const navigate = useNavigate()
  const { profissionais, contratos, clientes } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterEspecialidade, setFilterEspecialidade] = useState('todas')
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string | null>(null)

  // Obter informações do profissional
  const getProfissionalInfo = (profissional: any) => {
    const contratosAtivos = contratos.filter(c => 
      c.status === 'ativo' && 
      c.profissionais.some(p => p.profissionalId === profissional.id)
    )

    if (contratosAtivos.length === 0) {
      return {
        status: 'aguardando',
        projetos: []
      }
    }

    const projetos = contratosAtivos.map(contrato => {
      const cliente = clientes.find(c => c.id === contrato.clienteId)
      
      return {
        nome: contrato.nomeProjeto,
        cliente: cliente?.empresa || 'Cliente não encontrado',
        dataInicio: contrato.dataInicio,
        dataFim: contrato.dataFim,
        status: contrato.status,
        contrato: contrato
      }
    })

    return {
      status: 'ativo',
      projetos
    }
  }

  // Filtrar e ordenar profissionais
  const filteredProfissionais = profissionais
    .filter(profissional => {
      const info = getProfissionalInfo(profissional)
      
      // Filtro por busca
      const matchesSearch = 
        profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profissional.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        info.projetos.some(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtro por status
      const matchesStatus = 
        filterStatus === 'todos' ||
        (filterStatus === 'ativo' && info.status === 'ativo') ||
        (filterStatus === 'aguardando' && info.status === 'aguardando')

      // Filtro por especialidade
      const matchesEspecialidade = 
        filterEspecialidade === 'todas' || 
        profissional.especialidade === filterEspecialidade

      return matchesSearch && matchesStatus && matchesEspecialidade
    })
    .sort((a, b) => {
      const infoA = getProfissionalInfo(a)
      const infoB = getProfissionalInfo(b)

      // Ativos sempre antes de aguardando
      if (infoA.status === 'ativo' && infoB.status !== 'ativo') return -1
      if (infoB.status === 'ativo' && infoA.status !== 'ativo') return 1

      // Ambos aguardando: ordenar por nome
      if (infoA.status !== 'ativo' && infoB.status !== 'ativo') {
        return a.nome.localeCompare(b.nome)
      }

      // Ambos ativos: ordenar por prazo (menor para maior)
      const projetoA = infoA.projetos[0]
      const projetoB = infoB.projetos[0]

      const diasA = projetoA ? calcularDiasRestantes(projetoA.contrato) : null
      const diasB = projetoB ? calcularDiasRestantes(projetoB.contrato) : null

      // Regras: vencidos (dias <= 0) primeiro, depois com menor dias, depois indeterminados (null)
      const rank = (dias: number | null) => {
        if (dias === null) return Number.POSITIVE_INFINITY // Indeterminado vai para o fim
        return dias // números menores (inclui negativos) vêm primeiro
      }

      return rank(diasA) - rank(diasB)
    })

  const especialidades = [...new Set(profissionais.map(p => p.especialidade))]

  const getDiasRestantes = (projeto: any) => {
    if (!projeto.dataFim) return null
    return calcularDiasRestantes(projeto.contrato)
  }

  const getDiasRestantesColor = (dias: number | null) => {
    if (dias === null) return '#22c55e' // Verde para indeterminado
    if (dias > 60) return '#22c55e' // Verde
    if (dias > 30) return '#fbbf24' // Amarelo
    if (dias > 0) return '#ef4444' // Vermelho
    return '#dc2626' // Vermelho escuro para vencido
  }

  const getDiasRestantesText = (dias: number | null) => {
    if (dias === null) return 'Indeterminado'
    if (dias > 0) return `${dias} dias`
    return 'Vencido'
  }

  // Estilo do modal: linha superior fixa e fundo igual ao card da frente
  const modalTopBarColor = '#22c55e'
  const selectedBgColor = useMemo(() => {
    const fallback = 'rgba(34, 197, 94, 0.08)'
    if (!selectedProfissionalId) return fallback
    const prof = profissionais.find(p => p.id === selectedProfissionalId)
    if (!prof) return fallback
    const info = getProfissionalInfo(prof)
    const proj = info.projetos[0]
    if (proj && proj.contrato) {
      const style = getCardStyle(proj.contrato) as any
      return (style && style.backgroundColor) || fallback
    }
    return fallback
  }, [selectedProfissionalId, profissionais, contratos, clientes])

  const selectedCardStyle = useMemo(() => {
    const fallback = {
      boxShadow: '0 4px 16px rgba(34, 197, 94, 0.25)',
      border: '2px solid rgba(34, 197, 94, 0.3)',
      backgroundColor: 'rgba(34, 197, 94, 0.08)'
    } as const
    if (!selectedProfissionalId) return fallback
    const prof = profissionais.find(p => p.id === selectedProfissionalId)
    if (!prof) return fallback
    const info = getProfissionalInfo(prof)
    const proj = info.projetos[0]
    if (proj && proj.contrato) {
      const style = getCardStyle(proj.contrato) as any
      return { ...fallback, ...style }
    }
    return fallback
  }, [selectedProfissionalId, profissionais, contratos, clientes])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header Fixo */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: 'rgb(0, 49, 188)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 8px',
        padding: 0,
        lineHeight: 'normal'
      }}>
        <Box
          component="img"
          src={logoFtdMatilha}
          alt="FTD Matilha"
          sx={{
            height: '50px',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
      </Box>

      {/* Conteúdo com padding-top para compensar o header fixo */}
      <Box sx={{ pt: '120px', pb: 3, px: 3 }}>

        {/* Filtros Elegantes */}
        <Paper sx={{ 
          p: 2, 
          mb: 6, 
          mt: 2,
          borderRadius: 3, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          bgcolor: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FilterList sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              Filtros
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar profissionais ou projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>,
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    '&.Mui-focused': { bgcolor: 'white' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    '&.Mui-focused': { bgcolor: 'white' }
                  }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="ativo">Ativos</MenuItem>
                  <MenuItem value="aguardando">Aguardando Contrato</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Especialidade</InputLabel>
                <Select
                  value={filterEspecialidade}
                  onChange={(e) => setFilterEspecialidade(e.target.value)}
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    '&.Mui-focused': { bgcolor: 'white' }
                  }}
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
          </Grid>
        </Paper>

        {/* Cards dos Profissionais */}
        {filteredProfissionais.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Nenhum profissional encontrado com os filtros aplicados.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredProfissionais.map((profissional) => {
              const info = getProfissionalInfo(profissional)
              const projetoAtivo = info.projetos[0] // Primeiro projeto ativo
              const diasRestantes = projetoAtivo ? getDiasRestantes(projetoAtivo) : null
              const diasColor = getDiasRestantesColor(diasRestantes)
              const emProjeto = info.status === 'ativo' && Boolean(projetoAtivo)
              const disponibilidadeCor = emProjeto ? '#22c55e' : '#ff9aa2'
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={profissional.id}>
                  <Card 
                    onClick={() => setSelectedProfissionalId(profissional.id)}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                      },
                      ...(info.status === 'ativo' && projetoAtivo ? getCardStyle(projetoAtivo.contrato) : {})
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
                        <>
                          {/* TOPO - 35% */}
                          <Box sx={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column' }}>
                            {/* Nome e Disponibilidade */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: disponibilidadeCor, boxShadow: `0 0 0 3px ${emProjeto ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)'}` }} />
                              <Typography variant="h6" component="h3" fontWeight="bold" noWrap title={profissional.nome}>
                                {profissional.nome}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color={emProjeto ? 'success.main' : 'error.main'} sx={{ fontWeight: 700 }}>
                              {emProjeto ? 'Em projeto' : 'Disponível'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {profissional.especialidade}
                            </Typography>
                            {profissional.tags && (
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                {profissional.tags.split(',').map((tag: string, index: number) => {
                                  const tagTrim = tag.trim()
                                  if (!tagTrim) return null
                                  let color = 'default'
                                  if (tagTrim.toLowerCase().includes('alocação') || tagTrim.toLowerCase().includes('alocacao')) {
                                    color = 'primary'
                                  } else if (tagTrim.toLowerCase().includes('projeto')) {
                                    color = 'success'
                                  } else if (tagTrim.toLowerCase().includes('bodyshop')) {
                                    color = 'warning'
                                  } else if (tagTrim.toLowerCase().includes('freelancer')) {
                                    color = 'info'
                                  } else if (tagTrim.toLowerCase().includes('clt')) {
                                    color = 'secondary'
                                  } else if (tagTrim.toLowerCase().includes('pj')) {
                                    color = 'error'
                                  }
                                  return (
                                    <Chip 
                                      key={index}
                                      label={tagTrim}
                                      size="small"
                                      variant="outlined"
                                      color={color as any}
                                      sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                                    />
                                  )
                                })}
                              </Box>
                            )}
                          </Box>

                          <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.08)' }} />

                          {/* BASE - 65% */}
                          <Box sx={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', justifyContent: info.status === 'aguardando' || !projetoAtivo ? 'center' : 'flex-start' }}>
                            {info.status === 'aguardando' ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2, border: '2px solid', borderColor: 'warning.200', textAlign: 'center' }}>
                                <PendingActions sx={{ color: 'warning.main', fontSize: 32, mb: 1 }} />
                                <Typography variant="body2" color="warning.dark" fontWeight="bold" sx={{ mb: 2 }}>
                                  Aguardando contrato
                                </Typography>
                                <Button variant="contained" color="primary" onClick={(e) => { e.stopPropagation(); navigate('/cadastro-contrato') }}>
                                  Alocar este profissional
                                </Button>
                              </Box>
                            ) : projetoAtivo ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="h6" component="h4" fontWeight="bold" gutterBottom noWrap title={projetoAtivo.nome}>
                                  {projetoAtivo.nome}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {projetoAtivo.cliente}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(projetoAtivo.dataInicio).toLocaleDateString('pt-BR')}
                                    {projetoAtivo.dataFim && ` - ${new Date(projetoAtivo.dataFim).toLocaleDateString('pt-BR')}`}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                  {(() => {
                                    const cliente = clientes.find(c => c.empresa === projetoAtivo.cliente)
                                    const contatoNome = cliente?.nome
                                    const contatoEmail = cliente?.email
                                    const teamsHref = contatoEmail ? `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(contatoEmail)}` : undefined
                                    return (
                                      <>
                                        {contatoNome && (
                                          <Chip icon={<Person />} label={`Contato: ${contatoNome}`} size="small" />
                                        )}
                                        {contatoEmail && (
                                          <Button component="a" size="small" variant="text" startIcon={<Chat />} href={teamsHref} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                            Teams
                                          </Button>
                                        )}
                                        {contatoEmail && (
                                          <Button component="a" size="small" variant="text" startIcon={<Email />} href={`mailto:${contatoEmail}`} onClick={(e) => e.stopPropagation()}>
                                            Email
                                          </Button>
                                        )}
                                      </>
                                    )
                                  })()}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, mt: 1, bgcolor: `${diasColor}10`, borderRadius: 2, border: `2px solid ${diasColor}30` }}>
                                  <AccessTime sx={{ color: diasColor, fontSize: 20 }} />
                                  <Typography variant="h6" fontWeight="bold" sx={{ color: diasColor }}>
                                    {getDiasRestantesText(diasRestantes)}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  Sem projeto ativo
                                </Typography>
                                <Button variant="contained" color="primary" onClick={(e) => { e.stopPropagation(); navigate('/cadastro-contrato') }}>
                                  Alocar este profissional
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>

      {/* Modal de detalhes (verso) */}
      <Dialog
        open={Boolean(selectedProfissionalId)}
        onClose={() => setSelectedProfissionalId(null)}
        fullWidth
        maxWidth="lg"
        BackdropProps={{ sx: { backdropFilter: 'blur(6px)' } }}
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            ...selectedCardStyle,
            borderTop: `6px solid ${modalTopBarColor}`,
            backgroundColor: '#fff',
            bgcolor: '#fff'
          } 
        }}
      >
        {(() => {
          const profissionalSel = profissionais.find(p => p.id === selectedProfissionalId)
          if (!profissionalSel) return null
          const infoSel = getProfissionalInfo(profissionalSel)
          const projetoSel = infoSel.projetos[0]
          const diasSel = projetoSel ? getDiasRestantes(projetoSel) : null
          const diasSelColor = getDiasRestantesColor(diasSel)
          return (
            <>
              <DialogTitle sx={{ pr: 5 }}>
                {profissionalSel.nome}
                <IconButton aria-label="close" onClick={() => setSelectedProfissionalId(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ bgcolor: '#fff' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Projeto atual
                      </Typography>
                      {projetoSel ? (
                        <>
                          <Typography variant="body2"><strong>Nome:</strong> {projetoSel.nome}</Typography>
                          <Typography variant="body2"><strong>Cliente:</strong> {projetoSel.cliente}</Typography>
                          <Typography variant="body2"><strong>Início:</strong> {new Date(projetoSel.dataInicio).toLocaleDateString('pt-BR')}</Typography>
                          <Typography variant="body2"><strong>Término:</strong> {projetoSel.dataFim ? new Date(projetoSel.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, mt: 1, bgcolor: `${diasSelColor}10`, borderRadius: 1, border: `1px solid ${diasSelColor}30` }}>
                            <AccessTime sx={{ color: diasSelColor, fontSize: 18 }} />
                            <Typography variant="body2" sx={{ color: diasSelColor }}>
                              {getDiasRestantesText(diasSel)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">Outras infos (mock): Squad Ecommerce, Regime Híbrido, 3 reuniões semanais</Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Sem alocação atual</Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Projetos futuros (previstos)
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2">• Portal Pedagógico - UX Review — Previsto: 01/09/2025</Typography>
                        <Typography variant="body2">• App Leitura FTD - Fase 2 — Previsto: 15/10/2025</Typography>
                        <Typography variant="body2">• Design System v2 — Previsto: 01/11/2025</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Informações Matilha
                      </Typography>
                      <Typography variant="body2"><strong>Gestor interno:</strong> Bruno Silva</Typography>
                      <Typography variant="body2"><strong>Tempo de casa:</strong> 1 ano e 3 meses</Typography>
                      <Typography variant="body2"><strong>Cargo:</strong> {profissionalSel.especialidade}</Typography>
                      <Typography variant="body2"><strong>Skills:</strong> {profissionalSel.tags || 'UX, UI, Prototipação'}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Notas (mock): Disponível para workshops; excelente comunicação</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Informações financeiras
                      </Typography>
                      <Typography variant="body2"><strong>Nº da vaga:</strong> FTD-2025-UX-123</Typography>
                      <Typography variant="body2"><strong>Código da vaga:</strong> CON-FTD-UX-9876</Typography>
                      <Typography variant="body2"><strong>Data emissão NF:</strong> 10/08/2025</Typography>
                      <Typography variant="caption" color="text.secondary">Dados mockados para layout</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
            </>
          )
        })()}
      </Dialog>
    </Box>
  )
}

export default VisaoCliente 