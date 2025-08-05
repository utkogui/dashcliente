import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useData } from '../contexts/DataContext'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import RelatorioRentabilidade from '../components/RelatorioRentabilidade'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`relatorio-tabpanel-${index}`}
      aria-labelledby={`relatorio-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const Relatorios = () => {
  const { profissionais, clientes, contratos, loading } = useData()
  const [periodoSelecionado, setPeriodoSelecionado] = useState('6')
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Dados para gráficos
  const dadosMensais = Array.from({ length: 6 }, (_, i) => {
    const data = subMonths(new Date(), i)
    const mes = format(data, 'MMM', { locale: ptBR })
    const receita = Math.floor(Math.random() * 50000) + 20000
    const custo = Math.floor(receita * 0.7)
    const lucro = receita - custo
    
    return {
      mes,
      receita,
      custo,
      lucro,
      margem: ((lucro / receita) * 100).toFixed(1)
    }
  }).reverse()

  const dadosRentabilidadePorCliente = clientes.map(cliente => {
    const contratosCliente = contratos.filter(c => c.clienteId === cliente.id)
    const receitaTotal = contratosCliente.reduce((acc, c) => acc + c.valorRecebido, 0)
    const custoTotal = contratosCliente.reduce((acc, c) => acc + c.valorPago, 0)
    const lucro = receitaTotal - custoTotal
    
    return {
      cliente: cliente.empresa,
      receita: receitaTotal,
      custo: custoTotal,
      lucro,
      margem: receitaTotal > 0 ? ((lucro / receitaTotal) * 100).toFixed(1) : 0
    }
  })

  const dadosEspecialidades = profissionais.reduce((acc, prof) => {
    const especialidade = prof.especialidade
    if (acc[especialidade]) {
      acc[especialidade]++
    } else {
      acc[especialidade] = 1
    }
    return acc
  }, {} as Record<string, number>)

  const dadosPieEspecialidades = Object.entries(dadosEspecialidades).map(([especialidade, quantidade]) => ({
    name: especialidade,
    value: quantidade
  }))

  const cores = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0']

  // Estatísticas gerais
  const receitaTotal = contratos.reduce((acc, c) => acc + c.valorRecebido, 0)
  const custoTotal = contratos.reduce((acc, c) => acc + c.valorPago, 0)
  const lucroTotal = receitaTotal - custoTotal
  const margemMedia = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" color="text.primary">
          Relatórios
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={periodoSelecionado}
            label="Período"
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
          >
            <MenuItem value="3">Últimos 3 meses</MenuItem>
            <MenuItem value="6">Últimos 6 meses</MenuItem>
            <MenuItem value="12">Últimos 12 meses</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="relatórios tabs">
          <Tab label="Visão Geral" />
          <Tab label="Rentabilidade por Profissional" />
        </Tabs>
      </Box>

      {/* Tab 0: Visão Geral */}
      <TabPanel value={tabValue} index={0}>
        {/* Cards de Estatísticas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Receita Total
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                R$ {receitaTotal.toLocaleString('pt-BR')}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Custo Total
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                R$ {custoTotal.toLocaleString('pt-BR')}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Lucro Total
              </Typography>
              <Typography variant="h4" component="div" color={lucroTotal >= 0 ? 'success.main' : 'error.main'}>
                R$ {lucroTotal.toLocaleString('pt-BR')}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Margem Média
              </Typography>
              <Typography variant="h4" component="div" color={margemMedia >= 0 ? 'success.main' : 'error.main'}>
                {margemMedia.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Gráficos */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
          {/* Evolução Mensal */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolução Mensal
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosMensais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value?.toLocaleString('pt-BR')}`} />
                  <Line type="monotone" dataKey="receita" stroke="#4caf50" name="Receita" />
                  <Line type="monotone" dataKey="custo" stroke="#f44336" name="Custo" />
                  <Line type="monotone" dataKey="lucro" stroke="#2196f3" name="Lucro" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Especialidade */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição por Especialidade
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPieEspecialidades}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPieEspecialidades.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Rentabilidade por Cliente */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rentabilidade por Cliente
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosRentabilidadePorCliente}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cliente" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value?.toLocaleString('pt-BR')}`} />
                <Bar dataKey="receita" fill="#4caf50" name="Receita" />
                <Bar dataKey="custo" fill="#f44336" name="Custo" />
                <Bar dataKey="lucro" fill="#2196f3" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 1: Rentabilidade por Profissional */}
      <TabPanel value={tabValue} index={1}>
        <RelatorioRentabilidade
          profissionais={profissionais}
          contratos={contratos}
          clientes={clientes}
          loading={loading}
        />
      </TabPanel>
    </Box>
  )
}

export default Relatorios 