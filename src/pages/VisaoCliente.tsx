import { useMemo, useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Skeleton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Button,
  Pagination,
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
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { calcularDiasRestantes, getCardStyle } from '../utils/formatters'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'
import { track } from '../utils/telemetry'

const VisaoCliente = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profissionais, contratos, clientes, loading, error, reload } = useData()
  const { sessionId } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterEspecialidade, setFilterEspecialidade] = useState('todas')
  const [filterPrazo, setFilterPrazo] = useState<'todos' | '<15' | '<30' | '<60' | 'indeterminado'>('todos')
  const [filterSenioridade, setFilterSenioridade] = useState('todas')
  const [orderBy, setOrderBy] = useState<'prazo' | 'status'>('prazo')
  const [interestLoading, setInterestLoading] = useState(false)
  const [interestMessage, setInterestMessage] = useState<string | null>(null)
  const [interestError, setInterestError] = useState<string | null>(null)
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [noteSaved, setNoteSaved] = useState(false)
  // Debounce da busca
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(h)
  }, [searchTerm])

  // Paginação simples
  const [page, setPage] = useState(1)
  const pageSize = 12

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
      const searchLc = (debouncedSearch || '').toLowerCase()
      const nomeLc = (profissional.nome || '').toLowerCase()
      const espLc = (profissional.especialidade || '').toLowerCase()
      const matchesSearch = 
        nomeLc.includes(searchLc) ||
        espLc.includes(searchLc) ||
        info.projetos.some(p => (p.nome || '').toLowerCase().includes(searchLc))

      // Filtro por status
      const matchesStatus = 
        filterStatus === 'todos' ||
        (filterStatus === 'ativo' && info.status === 'ativo') ||
        (filterStatus === 'aguardando' && info.status === 'aguardando')

      // Filtro por especialidade
      const matchesEspecialidade = 
        filterEspecialidade === 'todas' || 
        profissional.especialidade === filterEspecialidade

      // Filtro por senioridade/nível (perfil)
      const matchesSenioridade =
        filterSenioridade === 'todas' ||
        (profissional.perfil || '') === filterSenioridade

      // Filtro por prazo
      const projeto = info.projetos[0]
      const dias = projeto ? calcularDiasRestantes(projeto.contrato) : null
      const matchesPrazo = (() => {
        if (filterPrazo === 'todos') return true
        if (filterPrazo === 'indeterminado') return dias === null
        if (dias === null) return false
        switch (filterPrazo) {
          case '<15': return dias < 15 && dias >= 0
          case '<30': return dias < 30 && dias >= 0
          case '<60': return dias < 60 && dias >= 0
          default: return true
        }
      })()

      return matchesSearch && matchesStatus && matchesEspecialidade && matchesSenioridade && matchesPrazo
    })
    .sort((a, b) => {
      const infoA = getProfissionalInfo(a)
      const infoB = getProfissionalInfo(b)

      if (orderBy === 'status') {
        if (infoA.status === 'ativo' && infoB.status !== 'ativo') return -1
        if (infoB.status === 'ativo' && infoA.status !== 'ativo') return 1
        return a.nome.localeCompare(b.nome)
      }

      // orderBy === 'prazo'
      if (infoA.status === 'ativo' && infoB.status !== 'ativo') return -1
      if (infoB.status === 'ativo' && infoA.status !== 'ativo') return 1
      const projetoA = infoA.projetos[0]
      const projetoB = infoB.projetos[0]
      const diasA = projetoA ? calcularDiasRestantes(projetoA.contrato) : null
      const diasB = projetoB ? calcularDiasRestantes(projetoB.contrato) : null
      const rank = (dias: number | null) => {
        if (dias === null) return Number.POSITIVE_INFINITY
        return dias
      }
      return rank(diasA) - rank(diasB)
    })

  // Ajustar página quando filtros mudarem
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterStatus, filterEspecialidade, filterPrazo, filterSenioridade, orderBy])

  const totalPages = Math.max(1, Math.ceil(filteredProfissionais.length / pageSize))
  const paginatedProfissionais = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProfissionais.slice(start, start + pageSize)
  }, [filteredProfissionais, page])

  const especialidades = [...new Set(profissionais.map(p => p.especialidade || '').filter(Boolean))] as string[]
  const senioridades = [...new Set(profissionais.map(p => p.perfil || '').filter(Boolean))] as string[]

  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (
    process.env.NODE_ENV === 'production'
      ? 'https://dashcliente.onrender.com/api'
      : 'http://localhost:3001/api'
  )

  // Inicializar filtros a partir da URL
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const st = searchParams.get('status') || 'todos'
    const esp = searchParams.get('esp') || 'todas'
    const prazo = (searchParams.get('prazo') as any) || 'todos'
    const sen = searchParams.get('sen') || 'todas'
    const ord = (searchParams.get('ord') as any) || 'prazo'
    setSearchTerm(q)
    setFilterStatus(st)
    setFilterEspecialidade(esp)
    setFilterPrazo(prazo)
    setFilterSenioridade(sen)
    setOrderBy(ord)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persistir filtros na URL
  useEffect(() => {
    const params: Record<string, string> = {}
    if (searchTerm) params.q = searchTerm
    if (filterStatus !== 'todos') params.status = filterStatus
    if (filterEspecialidade !== 'todas') params.esp = filterEspecialidade
    if (filterPrazo !== 'todos') params.prazo = filterPrazo
    if (filterSenioridade !== 'todas') params.sen = filterSenioridade
    if (orderBy !== 'prazo') params.ord = orderBy
    setSearchParams(params, { replace: true })
  }, [searchTerm, filterStatus, filterEspecialidade, filterPrazo, filterSenioridade, orderBy, setSearchParams])

  const getDiasRestantes = (projeto: any) => {
    if (!projeto.dataFim) return null
    return calcularDiasRestantes(projeto.contrato)
  }

  const getDiasRestantesColor = (dias: number | null) => {
    // Cores com melhor contraste AA em textos sobre fundo branco
    if (dias === null) return '#166534' // verde-800
    if (dias > 60) return '#166534'    // verde-800
    if (dias > 30) return '#92400e'    // amber-800
    if (dias > 0) return '#b91c1c'     // red-700
    return '#7f1d1d'                   // red-900 (vencido)
  }

  const getDiasRestantesText = (dias: number | null) => {
    if (dias === null) return 'Indeterminado'
    if (dias > 0) return `${dias} dias`
    return 'Vencido'
  }

  // Estilo do modal: linha superior fixa e fundo igual ao card da frente
  const modalTopBarColor = '#22c55e'
  // removido selectedBgColor não utilizado

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
                placeholder="🔍 Buscar profissionais, projetos ou especialidades..."
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
                <InputLabel>📊 Status do Profissional</InputLabel>
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
                <InputLabel>🎯 Área de Especialização</InputLabel>
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>⏰ Prazo do Contrato</InputLabel>
                <Select
                  value={filterPrazo}
                  onChange={(e) => setFilterPrazo(e.target.value as any)}
                  sx={{ borderRadius: 2, bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' }, '&.Mui-focused': { bgcolor: 'white' } }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="<60">Menos de 60 dias</MenuItem>
                  <MenuItem value="<30">Menos de 30 dias</MenuItem>
                  <MenuItem value="<15">Menos de 15 dias</MenuItem>
                  <MenuItem value="indeterminado">Indeterminado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>👨‍💼 Nível de Senioridade</InputLabel>
                <Select
                  value={filterSenioridade}
                  onChange={(e) => setFilterSenioridade(e.target.value)}
                  sx={{ borderRadius: 2, bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' }, '&.Mui-focused': { bgcolor: 'white' } }}
                >
                  <MenuItem value="todas">Todas</MenuItem>
                  {senioridades.map(level => (
                    <MenuItem key={level} value={level as string}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>🔄 Ordenação dos Resultados</InputLabel>
                <Select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value as any)}
                  sx={{ borderRadius: 2, bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' }, '&.Mui-focused': { bgcolor: 'white' } }}
                >
                  <MenuItem value="prazo">Prazo (menor→maior)</MenuItem>
                  <MenuItem value="status">Status (ativos primeiro)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('todos')
                    setFilterEspecialidade('todas')
                    setFilterPrazo('todos')
                    setFilterSenioridade('todas')
                    setOrderBy('prazo')
                  }}
                >
                  Limpar filtros
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Erro com retry */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}
            action={<Button color="inherit" size="small" onClick={() => reload()}>Tentar novamente</Button>}>
            {error}
          </Alert>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: pageSize }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={6} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={28} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                  <Skeleton variant="rectangular" height={180} sx={{ mt: 1 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : filteredProfissionais.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Nenhum profissional encontrado com os filtros aplicados.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {paginatedProfissionais.map((profissional) => {
              const info = getProfissionalInfo(profissional)
              const projetoAtivo = info.projetos[0] // Primeiro projeto ativo
              const diasRestantes = projetoAtivo ? getDiasRestantes(projetoAtivo) : null
              const diasColor = getDiasRestantesColor(diasRestantes)
              const emProjeto = info.status === 'ativo' && Boolean(projetoAtivo)
              const disponibilidadeCor = emProjeto ? '#22c55e' : '#ff9aa2'
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={profissional.id}>
                  <Card 
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedProfissionalId(profissional.id); track({ type: 'card_open', profissionalId: profissional.id }) } }}
                    onClick={() => { setSelectedProfissionalId(profissional.id); track({ type: 'card_open', profissionalId: profissional.id }) }}
                    sx={{ 
                      height: 380,
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      outline: '0px solid transparent',
                      '&:focus-visible': { outline: '3px solid rgba(25, 118, 210, 0.6)' },
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                      },
                      ...(info.status === 'ativo' && projetoAtivo ? getCardStyle(projetoAtivo.contrato) : {})
                    }}
                  >
                    {/* faixa de status no topo */}
                    <Box sx={{ height: 6, width: '100%', bgcolor: diasColor, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color={emProjeto ? 'success.main' : 'warning.main'} sx={{ fontWeight: 700 }}>
                                {emProjeto ? 'Em projeto' : 'Disponível'}
                              </Typography>
                              {info.projetos.length > 1 && (
                                <Chip size="small" label="Multi-projeto" color="info" sx={{ height: 18, fontSize: '0.65rem' }} />
                              )}
                            </Box>
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
                                    const contatoTelefone = (() => {
                                      // Busca telefone do próprio profissional quando disponível
                                      const prof = profissionais.find(p => p.id === profissional.id)
                                      return prof?.contatoClienteTelefone || cliente?.telefone || undefined
                                    })()
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
                                        {contatoTelefone && (
                                          <Chip label={contatoTelefone} size="small" />
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

        {/* Paginação */}
        {!loading && filteredProfissionais.length > pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
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

                  {/* Linha do tempo do contrato (UI simples) */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Linha do tempo do contrato
                      </Typography>
                      {projetoSel ? (
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Chip label={`Início: ${new Date(projetoSel.dataInicio).toLocaleDateString('pt-BR')}`} size="small" />
                          <Chip label={`Término: ${projetoSel.dataFim ? new Date(projetoSel.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}`} size="small" />
                          <Chip label="Renovações: 0 (mock)" size="small" color="default" />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Sem dados de contrato</Typography>
                      )}
                    </Paper>
                  </Grid>

                  {/* Ações de interesse do cliente (UI) */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Ações
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button variant="outlined" size="small" disabled={interestLoading}
                          onClick={async () => {
                            if (!projetoSel) return
                            try {
                              setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                              const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                                body: JSON.stringify({ interesse: 'RENOVAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id })
                              })
                              const data = await resp.json()
                              if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                              setInterestMessage('Interesse registrada: Renovar')
                              track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'RENOVAR' })
                            } catch (e: any) {
                              setInterestError(e.message)
                            } finally { setInterestLoading(false) }
                          }}
                        >Renovar</Button>
                        <Button variant="outlined" size="small" disabled={interestLoading}
                          onClick={async () => {
                            if (!projetoSel) return
                            try {
                              setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                              const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                                body: JSON.stringify({ interesse: 'REDUZIR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id })
                              })
                              const data = await resp.json()
                              if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                              setInterestMessage('Interesse registrada: Reduzir')
                              track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'REDUZIR' })
                            } catch (e: any) {
                              setInterestError(e.message)
                            } finally { setInterestLoading(false) }
                          }}
                        >Reduzir</Button>
                        <Button variant="outlined" size="small" disabled={interestLoading}
                          onClick={async () => {
                            if (!projetoSel) return
                            try {
                              setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                              const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                                body: JSON.stringify({ interesse: 'TROCAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id })
                              })
                              const data = await resp.json()
                              if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                              setInterestMessage('Interesse registrada: Trocar')
                              track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'TROCAR' })
                            } catch (e: any) {
                              setInterestError(e.message)
                            } finally { setInterestLoading(false) }
                          }}
                        >Trocar</Button>
                        {(diasSel !== null && diasSel <= 60) && (
                          <Button variant="outlined" size="small" color="warning" disabled={interestLoading}
                            onClick={async () => {
                              if (!projetoSel) return
                              try {
                                setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                                const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                                  body: JSON.stringify({ interesse: 'ESPERAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id })
                                })
                                const data = await resp.json()
                                if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                                setInterestMessage('Interesse registrada: Esperar')
                                track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'ESPERAR' })
                              } catch (e: any) {
                                setInterestError(e.message)
                              } finally { setInterestLoading(false) }
                            }}
                          >Esperar</Button>
                        )}
                        {interestLoading && <Typography variant="caption" color="text.secondary">Enviando...</Typography>}
                        {interestMessage && <Typography variant="caption" color="success.main">{interestMessage}</Typography>}
                        {interestError && <Typography variant="caption" color="error.main">{interestError}</Typography>}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        “Esperar” aparece apenas para contratos com ≤ 60 dias.
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Anotações do cliente (UI) */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Anotações do cliente
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Escreva uma anotação..."
                        multiline
                        minRows={3}
                        value={noteText}
                        onChange={(e) => { setNoteText(e.target.value); setNoteError(null); setNoteSaved(false) }}
                        error={Boolean(noteError)}
                        helperText={noteError || (noteSaved ? 'Anotação salva' : ' ')}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={async () => {
                            if (!noteText.trim()) { setNoteError('Digite uma anotação antes de salvar'); return }
                            if (!projetoSel) return
                            try {
                              const resp = await fetch(`${API_BASE_URL}/notes`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                                body: JSON.stringify({ contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id, texto: noteText.trim() })
                              })
                              const data = await resp.json()
                              if (!resp.ok) throw new Error(data.error || 'Falha ao salvar anotação')
                              setNoteSaved(true)
                              setNoteError(null)
                            } catch (e: any) {
                              setNoteError(e.message)
                              setNoteSaved(false)
                            }
                          }}
                        >
                          Salvar
                        </Button>
                      </Box>
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