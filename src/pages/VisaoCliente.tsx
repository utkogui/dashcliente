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
  AppBar,
  Toolbar
} from '@mui/material'
import {
  Person,
  Work,
  Search,
  Assignment,
  PendingActions,
  ArrowBack
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'

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
        status: contrato.status
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h1" color="text.primary">
                Visão do Cliente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visão geral de todos os profissionais e seus projetos ativos
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {profissionais.length} Profissionais
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contratos.filter(c => c.status === 'ativo').length} Projetos Ativos
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Conteúdo */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar profissionais ou projetos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="ativo">Ativos</MenuItem>
                  <MenuItem value="aguardando">Aguardando Contrato</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Especialidade</InputLabel>
                <Select
                  value={filterEspecialidade}
                  onChange={(e) => setFilterEspecialidade(e.target.value)}
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

        {/* Estatísticas */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{profissionais.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total de Profissionais
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <Work />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        {profissionais.filter(p => getProfissionalInfo(p).status === 'ativo').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Profissionais Ativos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <PendingActions />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        {profissionais.filter(p => getProfissionalInfo(p).status === 'aguardando').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aguardando Contrato
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Cards dos Profissionais */}
        {filteredProfissionais.length === 0 ? (
          <Alert severity="info">
            Nenhum profissional encontrado com os filtros aplicados.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredProfissionais.map((profissional) => {
              const info = getProfissionalInfo(profissional)
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={profissional.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header do Card */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                          <Person sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                            {profissional.nome}
                          </Typography>
                          <Chip 
                            label={profissional.especialidade}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>

                      {/* Status */}
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={getStatusText(info.status)}
                          color={getStatusColor(info.status)}
                          size="small"
                          icon={info.status === 'aguardando' ? <PendingActions /> : <Work />}
                        />
                      </Box>

                      

                      {/* Projetos */}
                      {info.status === 'aguardando' ? (
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'warning.50', 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'warning.200'
                        }}>
                          <Typography variant="body2" color="warning.dark" align="center">
                            Aguardando contrato
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Projetos Ativos ({info.projetos.length})
                          </Typography>
                          {info.projetos.map((projeto, index) => (
                            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight="bold" gutterBottom>
                                {projeto.nome}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {projeto.cliente}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip 
                                  label={`Início: ${new Date(projeto.dataInicio).toLocaleDateString('pt-BR')}`}
                                  size="small"
                                  variant="outlined"
                                />
                                {projeto.dataFim && (
                                  <Chip 
                                    label={`Fim: ${new Date(projeto.dataFim).toLocaleDateString('pt-BR')}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}

                      
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