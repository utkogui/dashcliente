import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Timeline as TimelineIcon,
  FilterList,
  Refresh,
  ZoomIn,
  ZoomOut,
  Today,
  Person,
  Business,
} from '@mui/icons-material'
import { useData } from '../contexts/DataContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import GanttChart from '../components/GanttChart'

// Tipos para o Gantt
interface GanttTask {
  id: string
  text: string
  start_date: Date
  end_date: Date
  progress: number
  parent?: string
  type?: string
  color?: string
}

interface GanttLink {
  id: string
  source: string
  target: string
  type: string
}

const Timeline = () => {
  const { profissionais, contratos, clientes, loading, error } = useData()
  const [selectedProfissional, setSelectedProfissional] = useState<string>('all')
  const [selectedCliente, setSelectedCliente] = useState<string>('all')
  const [ganttData, setGanttData] = useState<{ tasks: GanttTask[], links: GanttLink[] }>({ tasks: [], links: [] })

  // Gerar dados do Gantt baseado nos contratos
  useEffect(() => {
    if (!contratos.length) return

    const tasks: GanttTask[] = []
    const links: GanttLink[] = []
    let linkId = 1

    contratos.forEach((contrato, index) => {
      // Filtrar por profissional se selecionado
      if (selectedProfissional !== 'all') {
        const hasProfissional = contrato.profissionais.some(p => p.profissionalId === selectedProfissional)
        if (!hasProfissional) return
      }

      // Filtrar por cliente se selecionado
      if (selectedCliente !== 'all' && contrato.clienteId !== selectedCliente) {
        return
      }

      // Criar task principal do contrato
      const contratoTask: GanttTask = {
        id: `contrato_${contrato.id}`,
        text: `${contrato.nomeProjeto} - ${contrato.cliente?.empresa || 'Cliente não encontrado'}`,
        start_date: new Date(contrato.dataInicio),
        end_date: contrato.dataFim ? new Date(contrato.dataFim) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano se indeterminado
        progress: contrato.status === 'encerrado' ? 100 : contrato.status === 'ativo' ? 50 : 0,
        type: 'project',
        color: contrato.status === 'ativo' ? '#4caf50' : contrato.status === 'encerrado' ? '#f44336' : '#ff9800'
      }
      tasks.push(contratoTask)

      // Criar tasks para cada profissional do contrato
      contrato.profissionais.forEach((prof, profIndex) => {
        const profissional = profissionais.find(p => p.id === prof.profissionalId)
        if (!profissional) return

        const profTask: GanttTask = {
          id: `prof_${contrato.id}_${prof.profissionalId}`,
          text: `${profissional.nome} (${profissional.especialidade})`,
          start_date: new Date(contrato.dataInicio),
          end_date: contrato.dataFim ? new Date(contrato.dataFim) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          progress: contrato.status === 'encerrado' ? 100 : contrato.status === 'ativo' ? 50 : 0,
          parent: `contrato_${contrato.id}`,
          type: 'task',
          color: profissional.status === 'ativo' ? '#2196f3' : profissional.status === 'ferias' ? '#ff9800' : '#9e9e9e'
        }
        tasks.push(profTask)

        // Criar link entre contrato e profissional
        links.push({
          id: `link_${linkId++}`,
          source: `contrato_${contrato.id}`,
          target: `prof_${contrato.id}_${prof.profissionalId}`,
          type: '0'
        })
      })
    })

    setGanttData({ tasks, links })
  }, [contratos, profissionais, selectedProfissional, selectedCliente])

  const handleRefresh = () => {
    setSelectedProfissional('all')
    setSelectedCliente('all')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success'
      case 'encerrado': return 'error'
      case 'pendente': return 'warning'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'encerrado': return 'Encerrado'
      case 'pendente': return 'Pendente'
      default: return status
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TimelineIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1" color="text.primary">
            Timeline dos Profissionais
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Limpar Filtros
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Profissional</InputLabel>
              <Select
                value={selectedProfissional}
                label="Profissional"
                onChange={(e) => setSelectedProfissional(e.target.value)}
              >
                <MenuItem value="all">Todos os Profissionais</MenuItem>
                {profissionais.map((prof) => (
                  <MenuItem key={prof.id} value={prof.id}>
                    {prof.nome} ({prof.especialidade})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={selectedCliente}
                label="Cliente"
                onChange={(e) => setSelectedCliente(e.target.value)}
              >
                <MenuItem value="all">Todos os Clientes</MenuItem>
                {clientes.map((cliente) => (
                  <MenuItem key={cliente.id} value={cliente.id}>
                    {cliente.empresa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Person color="primary" />
                <Box>
                  <Typography variant="h4">{ganttData.tasks.filter(t => t.type === 'task').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Profissionais Ativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business color="secondary" />
                <Box>
                  <Typography variant="h4">{ganttData.tasks.filter(t => t.type === 'project').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projetos Ativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimelineIcon color="success" />
                <Box>
                  <Typography variant="h4">
                    {contratos.filter(c => c.status === 'ativo').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contratos Ativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FilterList color="info" />
                <Box>
                  <Typography variant="h4">
                    {contratos.filter(c => c.dataFim && new Date(c.dataFim) > new Date()).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vencendo em 30 dias
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visualização Gantt */}
      <GanttChart tasks={ganttData.tasks} height={600} />
    </Box>
  )
}

export default Timeline 