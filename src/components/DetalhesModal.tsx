import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material'
import {
  Person,
  Business,
  TrendingUp,
  Email,
  Phone,
  LocationOn,
  Schedule,
  AttachMoney,
  Receipt,
  Assignment,
  Close,
} from '@mui/icons-material'
import { formatCurrency, formatPercentual } from '../utils/formatters'

interface ProfissionalData {
  id: string
  nome: string
  email: string
  telefone: string
  especialidade: string
  valorHora: number | null
  status: 'ativo' | 'inativo' | 'ferias'
  dataAdmissao: string
  tipoContrato: 'hora' | 'fechado'
  valorFechado: number | null
  periodoFechado: string | null
  valorPago: number
  percentualImpostos: number
}

interface ClienteData {
  id: string
  nome: string
  empresa: string
  email: string
  telefone: string
  endereco: string
  anoInicio: number
  segmento: string
  tamanho: string
}

interface ContratoData {
  id: string
  profissionalId: string
  clienteId: string
  dataInicio: string
  dataFim: string
  tipoContrato: 'hora' | 'fechado'
  valorHora: number | null
  horasMensais: number | null
  valorFechado: number | null
  periodoFechado: string | null
  status: 'ativo' | 'encerrado' | 'pendente'
  valorTotal: number
  valorRecebido: number
  valorPago: number
  percentualImpostos: number
  valorImpostos: number
  margemLucro: number
  observacoes?: string
  profissional?: ProfissionalData
  cliente?: ClienteData
}

interface DetalhesModalProps {
  open: boolean
  onClose: () => void
  type: 'profissional' | 'cliente' | 'contrato'
  data: ProfissionalData | ClienteData | ContratoData | null
}

const DetalhesModal: React.FC<DetalhesModalProps> = ({
  open,
  onClose,
  type,
  data
}) => {
  if (!data) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'success'
      case 'pendente':
        return 'warning'
      case 'encerrado':
        return 'error'
      case 'ferias':
        return 'info'
      case 'inativo':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo'
      case 'pendente':
        return 'Pendente'
      case 'encerrado':
        return 'Encerrado'
      case 'ferias':
        return 'Férias'
      case 'inativo':
        return 'Inativo'
      default:
        return status
    }
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

  const renderProfissionalDetalhes = () => {
    const prof = data as ProfissionalData
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Person color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h2" fontWeight="bold">
              {prof.nome}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {prof.especialidade}
            </Typography>
          </Box>
          <Chip
            label={getStatusText(prof.status)}
            color={getStatusColor(prof.status)}
            size="large"
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={prof.email}
                  />
                </ListItem>
                {prof.telefone && (
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary="Telefone"
                      secondary={prof.telefone}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data de Admissão"
                    secondary={new Date(prof.dataAdmissao).toLocaleDateString('pt-BR')}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Configuração de Remuneração
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {prof.tipoContrato === 'hora' ? <AttachMoney /> : <Receipt />}
                  </ListItemIcon>
                  <ListItemText
                    primary="Tipo de Contrato"
                    secondary={
                      <Chip
                        label={getTipoContratoText(prof.tipoContrato)}
                        color={getTipoContratoColor(prof.tipoContrato)}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                {prof.tipoContrato === 'hora' ? (
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText
                      primary="Valor por Hora"
                      secondary={formatCurrency(prof.valorHora || 0)}
                    />
                  </ListItem>
                ) : (
                  <>
                    <ListItem>
                      <ListItemIcon>
                        <Receipt />
                      </ListItemIcon>
                      <ListItemText
                        primary="Valor Fechado"
                        secondary={formatCurrency(prof.valorFechado || 0)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText
                        primary="Período"
                        secondary={prof.periodoFechado}
                      />
                    </ListItem>
                  </>
                )}
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary="Valor Pago"
                    secondary={formatCurrency(prof.valorPago)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Percentual de Impostos"
                    secondary={formatPercentual(prof.percentualImpostos)}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  const renderClienteDetalhes = () => {
    const cli = data as ClienteData
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Business color="secondary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h2" fontWeight="bold">
              {cli.empresa}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {cli.nome}
            </Typography>
          </Box>
          <Chip
            label={cli.tamanho}
            color={cli.tamanho === 'Grande' ? 'error' : cli.tamanho === 'Média' ? 'warning' : 'success'}
            size="large"
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações de Contato
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={cli.email}
                  />
                </ListItem>
                {cli.telefone && (
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary="Telefone"
                      secondary={cli.telefone}
                    />
                  </ListItem>
                )}
                {cli.endereco && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Endereço"
                      secondary={cli.endereco}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações da Empresa
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary="Segmento"
                    secondary={
                      <Chip
                        label={cli.segmento}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ano de Início"
                    secondary={cli.anoInicio}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tamanho"
                    secondary={
                      <Chip
                        label={cli.tamanho}
                        color={cli.tamanho === 'Grande' ? 'error' : cli.tamanho === 'Média' ? 'warning' : 'success'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  const renderContratoDetalhes = () => {
    const con = data as ContratoData
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <TrendingUp color="success" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h2" fontWeight="bold">
              {con.profissional?.nome}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {con.cliente?.empresa}
            </Typography>
          </Box>
          <Chip
            label={getStatusText(con.status)}
            color={getStatusColor(con.status)}
            size="large"
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações do Contrato
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {con.tipoContrato === 'hora' ? <AttachMoney /> : <Receipt />}
                  </ListItemIcon>
                  <ListItemText
                    primary="Tipo de Contrato"
                    secondary={
                      <Chip
                        label={getTipoContratoText(con.tipoContrato)}
                        color={getTipoContratoColor(con.tipoContrato)}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Período"
                    secondary={`${new Date(con.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(con.dataFim).toLocaleDateString('pt-BR')}`}
                  />
                </ListItem>
                {con.tipoContrato === 'hora' ? (
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText
                      primary="Valor por Hora"
                      secondary={formatCurrency(con.valorHora || 0)}
                    />
                  </ListItem>
                ) : (
                  <ListItem>
                    <ListItemIcon>
                      <Receipt />
                    </ListItemIcon>
                    <ListItemText
                      primary="Valor Fechado"
                      secondary={`${formatCurrency(con.valorFechado || 0)} (${con.periodoFechado})`}
                    />
                  </ListItem>
                )}
                {con.observacoes && (
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Observações"
                      secondary={con.observacoes}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações Financeiras
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          Valor Recebido:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {formatCurrency(con.valorRecebido)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          Valor Pago:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="info.main" fontWeight="bold">
                          {formatCurrency(con.valorPago)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          Impostos:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="warning.main" fontWeight="bold">
                          {formatCurrency(con.valorImpostos)} ({formatPercentual(con.percentualImpostos)})
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          Rentabilidade:
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={con.margemLucro >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                          {formatCurrency(con.margemLucro)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  const renderDetalhes = () => {
    switch (type) {
      case 'profissional':
        return renderProfissionalDetalhes()
      case 'cliente':
        return renderClienteDetalhes()
      case 'contrato':
        return renderContratoDetalhes()
      default:
        return null
    }
  }

  const getModalTitle = () => {
    switch (type) {
      case 'profissional':
        return 'Detalhes do Profissional'
      case 'cliente':
        return 'Detalhes do Cliente'
      case 'contrato':
        return 'Detalhes do Contrato'
      default:
        return 'Detalhes'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h1">
            {getModalTitle()}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {renderDetalhes()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DetalhesModal 