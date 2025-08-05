import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  TableSortLabel,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  FilterList,
  Download,
  Person,
  Business,
  AttachMoney,
  Receipt,
} from '@mui/icons-material'
import { formatCurrency, formatPercentual } from '../utils/formatters'

interface RelatorioRentabilidadeProps {
  profissionais: any[]
  contratos: any[]
  clientes: any[]
  loading?: boolean
}

interface ProfissionalRentabilidade {
  id: string
  nome: string
  especialidade: string
  tipoContrato: string
  contratosAtivos: number
  valorTotalRecebido: number
  valorTotalPago: number
  valorTotalImpostos: number
  rentabilidadeTotal: number
  rentabilidadePercentual: number
  mediaPorContrato: number
}

const RelatorioRentabilidade: React.FC<RelatorioRentabilidadeProps> = ({
  profissionais,
  contratos,
  clientes,
  loading = false
}) => {
  const [filtroProfissional, setFiltroProfissional] = useState<string>('')
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('')
  const [filtroTipoContrato, setFiltroTipoContrato] = useState<string>('')
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('todos')
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof ProfissionalRentabilidade
    direcao: 'asc' | 'desc'
  }>({ campo: 'rentabilidadeTotal', direcao: 'desc' })

  const dadosRentabilidade = useMemo(() => {
    const dados: ProfissionalRentabilidade[] = profissionais.map(prof => {
      const contratosProfissional = contratos.filter(c => 
        c.profissionalId === prof.id && c.status === 'ativo'
      )

      const valorTotalRecebido = contratosProfissional.reduce((acc, c) => acc + c.valorRecebido, 0)
      const valorTotalPago = contratosProfissional.reduce((acc, c) => acc + c.valorPago, 0)
      const valorTotalImpostos = contratosProfissional.reduce((acc, c) => acc + c.valorImpostos, 0)
      const rentabilidadeTotal = valorTotalRecebido - valorTotalImpostos - valorTotalPago
      const rentabilidadePercentual = valorTotalRecebido > 0 ? (rentabilidadeTotal / valorTotalRecebido) * 100 : 0
      const mediaPorContrato = contratosProfissional.length > 0 ? rentabilidadeTotal / contratosProfissional.length : 0

      return {
        id: prof.id,
        nome: prof.nome,
        especialidade: prof.especialidade,
        tipoContrato: prof.tipoContrato,
        contratosAtivos: contratosProfissional.length,
        valorTotalRecebido,
        valorTotalPago,
        valorTotalImpostos,
        rentabilidadeTotal,
        rentabilidadePercentual,
        mediaPorContrato
      }
    })

    // Aplicar filtros
    let dadosFiltrados = dados

    if (filtroProfissional) {
      dadosFiltrados = dadosFiltrados.filter(d => 
        d.nome.toLowerCase().includes(filtroProfissional.toLowerCase()) ||
        d.especialidade.toLowerCase().includes(filtroProfissional.toLowerCase())
      )
    }

    if (filtroTipoContrato) {
      dadosFiltrados = dadosFiltrados.filter(d => d.tipoContrato === filtroTipoContrato)
    }

    if (filtroEmpresa) {
      // Filtrar por empresa (verificar contratos do profissional)
      dadosFiltrados = dadosFiltrados.filter(d => {
        const contratosProfissional = contratos.filter(c => c.profissionalId === d.id)
        return contratosProfissional.some(c => {
          const cliente = clientes.find(cl => cl.id === c.clienteId)
          return cliente?.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase())
        })
      })
    }

    // Aplicar ordenação
    dadosFiltrados.sort((a, b) => {
      const valorA = a[ordenacao.campo]
      const valorB = b[ordenacao.campo]
      
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return ordenacao.direcao === 'asc' 
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA)
      }
      
      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return ordenacao.direcao === 'asc' ? valorA - valorB : valorB - valorA
      }
      
      return 0
    })

    return dadosFiltrados
  }, [profissionais, contratos, clientes, filtroProfissional, filtroEmpresa, filtroTipoContrato, ordenacao])

  const handleOrdenacao = (campo: keyof ProfissionalRentabilidade) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getTipoContratoColor = (tipo: string) => {
    switch (tipo) {
      case 'hora':
        return 'primary'
      case 'fechado':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getTipoContratoText = (tipo: string) => {
    switch (tipo) {
      case 'hora':
        return 'Por Hora'
      case 'fechado':
        return 'Valor Fechado'
      default:
        return tipo
    }
  }

  const totalRecebido = dadosRentabilidade.reduce((acc, d) => acc + d.valorTotalRecebido, 0)
  const totalPago = dadosRentabilidade.reduce((acc, d) => acc + d.valorTotalPago, 0)
  const totalImpostos = dadosRentabilidade.reduce((acc, d) => acc + d.valorTotalImpostos, 0)
  const totalRentabilidade = dadosRentabilidade.reduce((acc, d) => acc + d.rentabilidadeTotal, 0)
  const rentabilidadeMedia = dadosRentabilidade.length > 0 ? totalRentabilidade / dadosRentabilidade.length : 0

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Relatório de Rentabilidade por Profissional
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar Profissional"
                value={filtroProfissional}
                onChange={(e) => setFiltroProfissional(e.target.value)}
                placeholder="Nome ou especialidade"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar Empresa"
                value={filtroEmpresa}
                onChange={(e) => setFiltroEmpresa(e.target.value)}
                placeholder="Nome da empresa"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Contrato</InputLabel>
                <Select
                  value={filtroTipoContrato}
                  label="Tipo de Contrato"
                  onChange={(e) => setFiltroTipoContrato(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="hora">Por Hora</MenuItem>
                  <MenuItem value="fechado">Valor Fechado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={filtroPeriodo}
                  label="Período"
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="mes">Último Mês</MenuItem>
                  <MenuItem value="trimestre">Último Trimestre</MenuItem>
                  <MenuItem value="ano">Último Ano</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Recebido
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                {formatCurrency(totalRecebido)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Pago
              </Typography>
              <Typography variant="h6" color="info.main" fontWeight="bold">
                {formatCurrency(totalPago)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Impostos
              </Typography>
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                {formatCurrency(totalImpostos)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Rentabilidade Total
              </Typography>
              <Typography variant="h6" color={totalRentabilidade >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                {formatCurrency(totalRentabilidade)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Média: {formatCurrency(rentabilidadeMedia)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={ordenacao.campo === 'nome'}
                  direction={ordenacao.campo === 'nome' ? ordenacao.direcao : 'asc'}
                  onClick={() => handleOrdenacao('nome')}
                >
                  Profissional
                </TableSortLabel>
              </TableCell>
              <TableCell>Especialidade</TableCell>
              <TableCell>Tipo Contrato</TableCell>
              <TableCell>Contratos Ativos</TableCell>
              <TableCell>
                <TableSortLabel
                  active={ordenacao.campo === 'valorTotalRecebido'}
                  direction={ordenacao.campo === 'valorTotalRecebido' ? ordenacao.direcao : 'asc'}
                  onClick={() => handleOrdenacao('valorTotalRecebido')}
                >
                  Total Recebido
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={ordenacao.campo === 'valorTotalPago'}
                  direction={ordenacao.campo === 'valorTotalPago' ? ordenacao.direcao : 'asc'}
                  onClick={() => handleOrdenacao('valorTotalPago')}
                >
                  Total Pago
                </TableSortLabel>
              </TableCell>
              <TableCell>Total Impostos</TableCell>
              <TableCell>
                <TableSortLabel
                  active={ordenacao.campo === 'rentabilidadeTotal'}
                  direction={ordenacao.campo === 'rentabilidadeTotal' ? ordenacao.direcao : 'asc'}
                  onClick={() => handleOrdenacao('rentabilidadeTotal')}
                >
                  Rentabilidade
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={ordenacao.campo === 'rentabilidadePercentual'}
                  direction={ordenacao.campo === 'rentabilidadePercentual' ? ordenacao.direcao : 'asc'}
                  onClick={() => handleOrdenacao('rentabilidadePercentual')}
                >
                  % Rentabilidade
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dadosRentabilidade.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {row.nome}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{row.especialidade}</TableCell>
                <TableCell>
                  <Chip
                    icon={row.tipoContrato === 'hora' ? <AttachMoney /> : <Receipt />}
                    label={getTipoContratoText(row.tipoContrato)}
                    color={getTipoContratoColor(row.tipoContrato)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.contratosAtivos}
                    color={row.contratosAtivos > 0 ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {formatCurrency(row.valorTotalRecebido)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="info.main" fontWeight="bold">
                    {formatCurrency(row.valorTotalPago)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="warning.main" fontWeight="bold">
                    {formatCurrency(row.valorTotalImpostos)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {row.rentabilidadeTotal >= 0 ? (
                      <TrendingUp color="success" sx={{ fontSize: 16 }} />
                    ) : (
                      <TrendingDown color="error" sx={{ fontSize: 16 }} />
                    )}
                    <Typography
                      variant="body2"
                      color={row.rentabilidadeTotal >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {formatCurrency(row.rentabilidadeTotal)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={row.rentabilidadePercentual >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {formatPercentual(row.rentabilidadePercentual)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {dadosRentabilidade.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum profissional encontrado com os filtros aplicados.
        </Alert>
      )}
    </Box>
  )
}

export default RelatorioRentabilidade 