import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useData } from '../contexts/DataContext'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Relatorios = () => {
  const { profissionais, clientes, contratos } = useData()
  const [periodoSelecionado, setPeriodoSelecionado] = useState('6')

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

      {/* Cards de Estatísticas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Receita Total
            </Typography>
            <Typography variant="h3" component="div" color="success.main">
              R$ {receitaTotal.toLocaleString('pt-BR')}
            </Typography>
            <Typography variant="body2" color="success.main">
              ↑ 23.36%
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Custo Total
            </Typography>
            <Typography variant="h3" component="div" color="error.main">
              R$ {custoTotal.toLocaleString('pt-BR')}
            </Typography>
            <Typography variant="body2" color="error.main">
              ↓ 12.5%
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Lucro Total
            </Typography>
            <Typography variant="h3" component="div" color="info.main">
              R$ {lucroTotal.toLocaleString('pt-BR')}
            </Typography>
            <Typography variant="body2" color="info.main">
              ↑ 45.2%
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Margem Média
            </Typography>
            <Typography variant="h3" component="div" color="secondary.main">
              {margemMedia.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="secondary.main">
              ↑ 8.3%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Gráficos */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
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
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Line type="monotone" dataKey="receita" stroke="#4caf50" name="Receita" />
                <Line type="monotone" dataKey="custo" stroke="#f44336" name="Custo" />
                <Line type="monotone" dataKey="lucro" stroke="#2196f3" name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Bar dataKey="receita" fill="#4caf50" name="Receita" />
                <Bar dataKey="custo" fill="#f44336" name="Custo" />
                <Bar dataKey="lucro" fill="#2196f3" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Gráficos Adicionais */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
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
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance por Profissional
            </Typography>
            <Box>
              {profissionais.map((prof, index) => {
                const contratosProf = contratos.filter(c => c.profissionalId === prof.id)
                const receitaProf = contratosProf.reduce((acc, c) => acc + c.valorRecebido, 0)
                const custoProf = contratosProf.reduce((acc, c) => acc + c.valorPago, 0)
                const lucroProf = receitaProf - custoProf
                const margemProf = receitaProf > 0 ? (lucroProf / receitaProf) * 100 : 0
                
                return (
                  <Box key={prof.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {prof.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {prof.especialidade}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          R$ {receitaProf.toLocaleString('pt-BR')}
                        </Typography>
                        <Typography variant="body2" color={margemProf > 0 ? 'success.main' : 'error.main'}>
                          {margemProf.toFixed(1)}% margem
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default Relatorios 