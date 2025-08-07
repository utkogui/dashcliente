import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider
} from '@mui/material'
import {
  Person,
  Work,
  Search,
  Assignment,
  PendingActions,
  CalendarToday,
  AccessTime,
  FilterList
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { calcularDiasRestantes, getCardStyle, getStatusBadgeColor } from '../utils/formatters'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'

const VisaoCliente = () => {
  const navigate = useNavigate()
  const { profissionais, contratos, clientes } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterEspecialidade, setFilterEspecialidade] = useState('todas')

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
      
      // Primeiro os ativos, depois os aguardando
      if (infoA.status === 'ativo' && infoB.status === 'aguardando') return -1
      if (infoA.status === 'aguardando' && infoB.status === 'ativo') return 1
      
      // Se ambos têm o mesmo status, ordenar por nome
      return a.nome.localeCompare(b.nome)
    })

  const especialidades = [...new Set(profissionais.map(p => p.especialidade))]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success'
      case 'aguardando': return 'warning'
      case 'inativo': return 'error'
      case 'ferias': return 'info'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'aguardando': return 'Aguardando Contrato'
      case 'inativo': return 'Inativo'
      case 'ferias': return 'Férias'
      default: return status
    }
  }

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
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={profissional.id}>
                  <Card 
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
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* PARTE SUPERIOR - INFORMAÇÕES DO PROFISSIONAL */}
                      <Box sx={{ mb: 3 }}>
                        {/* Nome e Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: info.status === 'ativo' ? 'success.main' : 'warning.main',
                              width: 48, 
                              height: 48,
                              boxShadow: `0 0 0 3px ${info.status === 'ativo' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`
                            }}
                          >
                            <Person sx={{ fontSize: 24 }} />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                              {profissional.nome}
                            </Typography>
                            <Chip 
                              label={getStatusText(info.status)}
                              color={getStatusColor(info.status)}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                        </Box>

                        {/* Expertise */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {profissional.especialidade}
                        </Typography>

                        {/* Tags */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label="Alocação" 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              fontWeight: 'bold'
                            }}
                          />
                          <Chip 
                            label="Projetos" 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: 'success.main',
                              color: 'success.main',
                              fontWeight: 'bold'
                            }}
                          />
                          <Chip 
                            label="Bodyshop" 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: 'warning.main',
                              color: 'warning.main',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.08)' }} />

                      {/* PARTE INFERIOR - INFORMAÇÕES DO PROJETO */}
                      <Box>
                        {info.status === 'aguardando' ? (
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: 'warning.50', 
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: 'warning.200',
                            textAlign: 'center'
                          }}>
                            <PendingActions sx={{ color: 'warning.main', fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" color="warning.dark" fontWeight="bold">
                              Aguardando contrato
                            </Typography>
                          </Box>
                        ) : projetoAtivo ? (
                          <Box>
                            {/* Nome do Projeto */}
                            <Typography variant="h6" component="h4" fontWeight="bold" gutterBottom>
                              {projetoAtivo.nome}
                            </Typography>

                            {/* Cliente */}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {projetoAtivo.cliente}
                            </Typography>

                            {/* Datas */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(projetoAtivo.dataInicio).toLocaleDateString('pt-BR')}
                                {projetoAtivo.dataFim && ` - ${new Date(projetoAtivo.dataFim).toLocaleDateString('pt-BR')}`}
                              </Typography>
                            </Box>

                            {/* Dias Restantes */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              p: 2,
                              bgcolor: `${diasColor}10`,
                              borderRadius: 2,
                              border: `2px solid ${diasColor}30`
                            }}>
                              <AccessTime sx={{ color: diasColor, fontSize: 20 }} />
                              <Typography 
                                variant="h6" 
                                fontWeight="bold"
                                sx={{ color: diasColor }}
                              >
                                {getDiasRestantesText(diasRestantes)}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: 'grey.50', 
                            borderRadius: 2,
                            textAlign: 'center'
                          }}>
                            <Typography variant="body2" color="text.secondary">
                              Sem projeto ativo
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default VisaoCliente 