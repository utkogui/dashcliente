import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material'
import { ExpandMore, Refresh } from '@mui/icons-material'
import { formatCurrency } from '../utils/formatters'

// Configuração da API
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://dashcliente.onrender.com/api'
    : 'http://localhost:3001/api'
)

interface DatabaseData {
  profissionais: {
    count: number
    data: any[]
  }
  clientes: {
    count: number
    data: any[]
  }
  contratos: {
    count: number
    data: any[]
  }
  contratoProfissionais: {
    count: number
    data: any[]
  }
}

const DatabaseViewer = () => {
  const [data, setData] = useState<DatabaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/database`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        }
      })
      if (!response.ok) {
        throw new Error('Erro ao buscar dados')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

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
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={carregarDados}>
            Tentar Novamente
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Nenhum dado encontrado</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Visualizador do Banco de Dados
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={carregarDados}
        >
          Atualizar
        </Button>
      </Box>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            Profissionais ({data.profissionais.count})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {data.profissionais.count > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Especialidade</TableCell>
                    <TableCell>Tipo Contrato</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Valor Pago</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data Início</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.profissionais.data.map((prof) => (
                    <TableRow key={prof.id}>
                      <TableCell>{prof.nome}</TableCell>
                      <TableCell>{prof.email}</TableCell>
                      <TableCell>{prof.especialidade}</TableCell>
                      <TableCell>
                        <Chip 
                          label={prof.tipoContrato === 'hora' ? 'Por Hora' : 'Fechado'} 
                          color={prof.tipoContrato === 'hora' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {prof.tipoContrato === 'hora' 
                          ? `R$ ${prof.valorHora?.toFixed(2)}/h`
                          : formatCurrency(prof.valorFechado || 0)
                        }
                      </TableCell>
                      <TableCell>{formatCurrency(prof.valorPago)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={prof.status} 
                          color={prof.status === 'ativo' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(prof.dataInicio).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Nenhum profissional cadastrado</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            Clientes ({data.clientes.count})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {data.clientes.count > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Ano Início</TableCell>
                    <TableCell>Segmento</TableCell>
                    <TableCell>Tamanho</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.clientes.data.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell>{cliente.empresa}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.telefone || '-'}</TableCell>
                      <TableCell>{cliente.anoInicio}</TableCell>
                      <TableCell>{cliente.segmento}</TableCell>
                      <TableCell>{cliente.tamanho}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Nenhum cliente cadastrado</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            Contratos ({data.contratos.count})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {data.contratos.count > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Projeto</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Data Início</TableCell>
                    <TableCell>Data Fim</TableCell>
                    <TableCell>Valor Contrato</TableCell>
                    <TableCell>Impostos</TableCell>
                    <TableCell>Profissionais</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.contratos.data.map((contrato) => (
                    <TableRow key={contrato.id}>
                      <TableCell>{contrato.nomeProjeto}</TableCell>
                      <TableCell>{contrato.cliente?.nome}</TableCell>
                      <TableCell>{new Date(contrato.dataInicio).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {contrato.dataFim 
                          ? new Date(contrato.dataFim).toLocaleDateString('pt-BR')
                          : 'Indeterminado'
                        }
                      </TableCell>
                      <TableCell>{formatCurrency(contrato.valorContrato)}</TableCell>
                      <TableCell>{formatCurrency(contrato.valorImpostos)}</TableCell>
                      <TableCell>
                        {contrato.profissionais?.length || 0} profissional(is)
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={contrato.status} 
                          color={contrato.status === 'ativo' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Nenhum contrato cadastrado</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            Relacionamentos Contrato-Profissional ({data.contratoProfissionais.count})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {data.contratoProfissionais.count > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contrato</TableCell>
                    <TableCell>Profissional</TableCell>
                    <TableCell>Valor/Hora</TableCell>
                    <TableCell>Horas/Mês</TableCell>
                    <TableCell>Valor Fechado</TableCell>
                    <TableCell>Período</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.contratoProfissionais.data.map((rel) => (
                    <TableRow key={rel.id}>
                      <TableCell>{rel.contrato?.nomeProjeto}</TableCell>
                      <TableCell>{rel.profissional?.nome}</TableCell>
                      <TableCell>
                        {rel.valorHora ? `R$ ${rel.valorHora.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>{rel.horasMensais || '-'}</TableCell>
                      <TableCell>
                        {rel.valorFechado ? formatCurrency(rel.valorFechado) : '-'}
                      </TableCell>
                      <TableCell>{rel.periodoFechado || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">Nenhum relacionamento encontrado</Alert>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default DatabaseViewer 