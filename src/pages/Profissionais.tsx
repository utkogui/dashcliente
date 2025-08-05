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
import { Search, Add, Delete, Person } from '@mui/icons-material'
import { useData } from '../contexts/DataContext'
import { formatCurrency } from '../utils/formatters'
import { useNavigate } from 'react-router-dom'



const Profissionais = () => {
  const { profissionais, deleteProfissional, loading, error } = useData()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProfissionais, setFilteredProfissionais] = useState(profissionais)

  // Atualizar lista filtrada quando profissionais mudar
  useEffect(() => {
    setFilteredProfissionais(profissionais)
  }, [profissionais])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = profissionais.filter(
      p => p.nome.toLowerCase().includes(value.toLowerCase()) ||
           p.especialidade.toLowerCase().includes(value.toLowerCase()) ||
           p.email.toLowerCase().includes(value.toLowerCase()) ||
           p.tipoContrato.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredProfissionais(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success'
      case 'ferias': return 'warning'
      case 'inativo': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'ferias': return 'Férias'
      case 'inativo': return 'Inativo'
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

  const handleAddProfissional = () => {
    navigate('/cadastro-profissional')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.')) {
      try {
        await deleteProfissional(id)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar profissional'
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
          Profissionais ({profissionais.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProfissional}
        >
          Novo Profissional
        </Button>
      </Box>

      {/* Filtro de Busca */}
      <TextField
        fullWidth
        placeholder="Buscar por nome, especialidade, email ou tipo de contrato..."
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
              <TableCell>Profissional</TableCell>
              <TableCell>Especialidade</TableCell>
              <TableCell>Email</TableCell>

              <TableCell>Tipo Contrato</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Valor Pago</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data Admissão</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProfissionais.map((profissional) => (
              <TableRow key={profissional.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {profissional.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {profissional.id.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={profissional.especialidade}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>{profissional.email}</TableCell>

                <TableCell>
                  <Chip
                    label={getTipoContratoText(profissional.tipoContrato)}
                    color={getTipoContratoColor(profissional.tipoContrato)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {profissional.tipoContrato === 'hora' ? (
                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                      R$ {profissional.valorHora?.toFixed(2)}/h
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="secondary.main" fontWeight="bold">
                      R$ {profissional.valorFechado?.toFixed(2)}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {profissional.periodoFechado}
                      </Typography>
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    {formatCurrency(profissional.valorPago)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(profissional.status)}
                    color={getStatusColor(profissional.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(profissional.dataInicio).toLocaleDateString('pt-BR')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(profissional.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


    </Box>
  )
}

export default Profissionais 