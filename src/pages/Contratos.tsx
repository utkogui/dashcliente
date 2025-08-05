import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Add, Edit, Delete, TrendingUp, AttachMoney, Receipt } from '@mui/icons-material'
import { useData } from '../contexts/DataContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '../utils/formatters'

// Tipos
interface Contrato {
  id: string
  nomeProjeto: string
  clienteId: string
  dataInicio: string
  dataFim: string | null
  tipoContrato: 'hora' | 'fechado'
  valorContrato: number
  valorImpostos: number
  status: 'ativo' | 'encerrado' | 'pendente'
  observacoes?: string
  profissionais: ContratoProfissional[]
  cliente: Cliente
}

interface ContratoProfissional {
  id: string
  contratoId: string
  profissionalId: string
  valorHora: number | null
  horasMensais: number | null
  valorFechado: number | null
  periodoFechado: string | null
  profissional: Profissional
}

const Contratos = () => {
  const navigate = useNavigate()
  const { contratos, deleteContrato, loading, error } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredContratos, setFilteredContratos] = useState(contratos)

  // Atualizar lista filtrada quando contratos mudar
  useEffect(() => {
    setFilteredContratos(contratos)
  }, [contratos])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = contratos.filter(c => {
      return (
        c.nomeProjeto.toLowerCase().includes(value.toLowerCase()) ||
        c.cliente?.nome.toLowerCase().includes(value.toLowerCase()) ||
        c.cliente?.empresa.toLowerCase().includes(value.toLowerCase()) ||
        c.observacoes?.toLowerCase().includes(value.toLowerCase()) ||
        c.tipoContrato.toLowerCase().includes(value.toLowerCase()) ||
        c.profissionais?.some(p => 
          p.profissional.nome.toLowerCase().includes(value.toLowerCase()) ||
          p.profissional.especialidade.toLowerCase().includes(value.toLowerCase())
        )
      )
    })
    setFilteredContratos(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success'
      case 'pendente': return 'warning'
      case 'encerrado': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'pendente': return 'Pendente'
      case 'encerrado': return 'Encerrado'
      default: return status
    }
  }

  const getTipoContratoColor = (tipo: string) => {
    switch (tipo) {
      case 'hora': return 'primary'
      case 'fechado': return 'secondary'
      default: return 'default'
    }
  }

  const getTipoContratoText = (tipo: string) => {
    switch (tipo) {
      case 'hora': return 'Por Hora'
      case 'fechado': return 'Valor Fechado'
      default: return tipo
    }
  }

  const handleOpen = (contrato?: Contrato) => {
    // Para edição, redirecionar para a página de cadastro
    if (contrato) {
      navigate(`/cadastro-contrato?id=${contrato.id}`)
    } else {
      navigate('/cadastro-contrato')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.')) {
      try {
        await deleteContrato(id)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar contrato'
        alert(errorMessage)
      }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" color="text.primary">
          Contratos ({contratos.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/cadastro-contrato')}
        >
          Novo Contrato
        </Button>
      </Box>

      {/* Filtro de Busca */}
      <TextField
        fullWidth
        placeholder="Buscar por projeto, cliente, profissionais, observações ou tipo de contrato..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Projeto</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Valor do Contrato</TableCell>
              <TableCell>Impostos</TableCell>
              <TableCell>Profissionais</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContratos.map((contrato) => {
              return (
                <TableRow key={contrato.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {contrato.nomeProjeto}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {contrato.cliente?.empresa}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contrato.cliente?.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(contrato.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contrato.dataFim ? `até ${format(new Date(contrato.dataFim), 'dd/MM/yyyy', { locale: ptBR })}` : 'Indeterminado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={contrato.tipoContrato === 'hora' ? <AttachMoney /> : <Receipt />}
                      label={getTipoContratoText(contrato.tipoContrato)}
                      color={getTipoContratoColor(contrato.tipoContrato)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(contrato.valorContrato)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="warning.main" fontWeight="bold">
                      {formatCurrency(contrato.valorImpostos)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="info.main" fontWeight="bold">
                      {contrato.profissionais?.length || 0} profissional(is)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contrato.profissionais?.map(p => p.profissional.nome).join(', ') || 'Nenhum'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(contrato.status)}
                      color={getStatusColor(contrato.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(contrato)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(contrato.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Contratos 