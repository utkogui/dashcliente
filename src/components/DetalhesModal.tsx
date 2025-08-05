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
import { formatCurrency } from '../utils/formatters'

interface ProfissionalData {
  id: string
  nome: string
  email: string
  especialidade: string
  valorHora: number | null
  status: 'ativo' | 'inativo' | 'ferias'
  dataInicio: string
  tipoContrato: 'hora' | 'fechado'
  valorFechado: number | null
  periodoFechado: string | null
  valorPago: number
}

interface ClienteData {
  id: string
  nome: string
  empresa: string
  email: string
  telefone?: string
  endereco?: string
  anoInicio: number
  segmento: string
  tamanho: string
}

interface ContratoData {
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
  profissionais: Array<{
    id: string
    profissionalId: string
    valorHora: number | null
    horasMensais: number | null
    valorFechado: number | null
    periodoFechado: string | null
    profissional: ProfissionalData
  }>
  cliente: ClienteData
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
                    primary="Data de Início"
                    secondary={new Date(prof.dataInicio).toLocaleDateString('pt-BR')}
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
              {con.nomeProjeto}
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
                Informações do Projeto
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
                    secondary={
                      con.dataFim 
                        ? `${new Date(con.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(con.dataFim).toLocaleDateString('pt-BR')}`
                        : `${new Date(con.dataInicio).toLocaleDateString('pt-BR')} - Indeterminado`
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profissionais"
                    secondary={`${con.profissionais?.length || 0} profissional(is)`}
                  />
                </ListItem>
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
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary="Valor do Contrato"
                    secondary={formatCurrency(con.valorContrato)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Receipt />
                  </ListItemIcon>
                  <ListItemText
                    primary="Impostos"
                    secondary={formatCurrency(con.valorImpostos)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Valor Líquido"
                    secondary={formatCurrency(con.valorContrato - con.valorImpostos)}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Lista de Profissionais */}
          {con.profissionais && con.profissionais.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Profissionais do Projeto
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Especialidade</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Período</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {con.profissionais.map((prof) => (
                        <TableRow key={prof.id}>
                          <TableCell>{prof.profissional.nome}</TableCell>
                          <TableCell>{prof.profissional.especialidade}</TableCell>
                          <TableCell>
                            <Chip
                              label={getTipoContratoText(prof.profissional.tipoContrato)}
                              color={getTipoContratoColor(prof.profissional.tipoContrato)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {prof.profissional.tipoContrato === 'hora' 
                              ? `${formatCurrency(prof.valorHora || 0)}/hora`
                              : formatCurrency(prof.valorFechado || 0)
                            }
                          </TableCell>
                          <TableCell>
                            {prof.profissional.tipoContrato === 'hora' 
                              ? `${prof.horasMensais || 0}h/mês`
                              : prof.periodoFechado || 'N/A'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}
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