import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material'
import { TrendingUp, TrendingDown, People, Business, Assignment, Warning } from '@mui/icons-material'
import { useData } from '../contexts/DataContext'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const Dashboard = () => {
  const { profissionais, clientes, contratos, loading, error } = useData()

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

  // Cálculos das estatísticas
  const contratosAtivos = contratos.filter(c => c.status === 'ativo')
  const contratosPendentes = contratos.filter(c => c.status === 'pendente')
  const contratosEncerrados = contratos.filter(c => c.status === 'encerrado')
  
  const receitaTotal = contratos.reduce((acc, c) => acc + c.valorRecebido, 0)
  const custoTotal = contratos.reduce((acc, c) => acc + c.valorPago, 0)
  const lucroTotal = receitaTotal - custoTotal
  const margemLucro = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0

  // Contratos próximos do vencimento (30 dias)
  const hoje = new Date()
  const contratosVencendo = contratosAtivos.filter(c => {
    const dataFim = new Date(c.dataFim)
    const diasRestantes = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return diasRestantes <= 30 && diasRestantes > 0
  })

  // Dados para gráficos
  const dadosEvolucao = [
    { mes: 'Jan', receita: 45000, custo: 32000 },
    { mes: 'Fev', receita: 52000, custo: 38000 },
    { mes: 'Mar', receita: 48000, custo: 35000 },
    { mes: 'Abr', receita: 61000, custo: 42000 },
    { mes: 'Mai', receita: 55000, custo: 39000 },
    { mes: 'Jun', receita: 67000, custo: 45000 },
  ]

  const dadosEspecialidades = profissionais.reduce((acc, prof) => {
    const especialidade = prof.especialidade
    acc[especialidade] = (acc[especialidade] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dadosPie = Object.entries(dadosEspecialidades).map(([name, value]) => ({
    name,
    value
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" color="text.primary" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* Cards de Estatísticas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Profissionais
                </Typography>
                <Typography variant="h4" component="div">
                  {profissionais.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profissionais.filter(p => p.status === 'ativo').length} ativos
                </Typography>
              </Box>
              <People sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Clientes
                </Typography>
                <Typography variant="h4" component="div">
                  {clientes.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contratosAtivos.length} contratos ativos
                </Typography>
              </Box>
              <Business sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Receita Total
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  R$ {receitaTotal.toLocaleString('pt-BR')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main">
                    +{margemLucro.toFixed(1)}% margem
                  </Typography>
                </Box>
              </Box>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Contratos
                </Typography>
                <Typography variant="h4" component="div">
                  {contratos.length}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip label={`${contratosAtivos.length} ativos`} size="small" color="success" />
                  <Chip label={`${contratosPendentes.length} pendentes`} size="small" color="warning" />
                </Box>
              </Box>
              <Assignment sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Alertas */}
      {contratosVencendo.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Atenção!</AlertTitle>
          {contratosVencendo.length} contrato(s) vence(m) nos próximos 30 dias:
          <Box sx={{ mt: 1 }}>
            {contratosVencendo.slice(0, 3).map(contrato => {
              const profissional = profissionais.find(p => p.id === contrato.profissionalId)
              const cliente = clientes.find(c => c.id === contrato.clienteId)
              const diasRestantes = Math.ceil((new Date(contrato.dataFim).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <Box key={contrato.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Warning sx={{ fontSize: 16 }} />
                  <Typography variant="body2">
                    {profissional?.nome} → {cliente?.empresa} (vence em {diasRestantes} dias)
                  </Typography>
                </Box>
              )
            })}
            {contratosVencendo.length > 3 && (
              <Typography variant="body2" color="text.secondary">
                ... e mais {contratosVencendo.length - 3} contrato(s)
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {/* Gráficos */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3,
        mb: 3
      }}>
        {/* Gráfico de Evolução */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Evolução Mensal
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosEvolucao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value?.toLocaleString('pt-BR')}`} />
                <Line type="monotone" dataKey="receita" stroke="#8884d8" name="Receita" />
                <Line type="monotone" dataKey="custo" stroke="#82ca9d" name="Custo" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Especialidades */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribuição por Especialidade
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Métricas de Performance */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Métricas de Performance
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Taxa de Ocupação
              </Typography>
              <Typography variant="h5" color="primary">
                {profissionais.length > 0 ? ((contratosAtivos.length / profissionais.length) * 100).toFixed(1) : 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={profissionais.length > 0 ? (contratosAtivos.length / profissionais.length) * 100 : 0}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Receita por Profissional
              </Typography>
              <Typography variant="h5" color="success.main">
                R$ {profissionais.length > 0 ? (receitaTotal / profissionais.length).toLocaleString('pt-BR') : 0}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Contratos por Cliente
              </Typography>
              <Typography variant="h5" color="info.main">
                {clientes.length > 0 ? (contratos.length / clientes.length).toFixed(1) : 0}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Dashboard 