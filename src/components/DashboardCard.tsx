import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  Person,
  Business,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  ExpandLess,
  AttachMoney,
  Receipt,
  Schedule,
  LocationOn,
  Email,
  Phone,
} from '@mui/icons-material'
import { formatCurrency, formatPercentual, calcularValorMensal, calcularCustoMensal, calcularImpostosMensais, calcularMargemMensal, getCardStyle, getStatusBadgeColor, calcularDiasRestantes } from '../utils/formatters'

interface DashboardCardProps {
  type: 'profissional' | 'cliente' | 'contrato'
  data: any
  onClick?: () => void
  showDetails?: boolean
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  type,
  data,
  onClick,
  showDetails = false
}) => {
  const [expanded, setExpanded] = useState(false)

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const getCardColor = () => {
    switch (type) {
      case 'profissional':
        return 'primary.main'
      case 'cliente':
        return 'secondary.main'
      case 'contrato':
        return 'success.main'
      default:
        return 'grey.500'
    }
  }

  const getCardIcon = () => {
    switch (type) {
      case 'profissional':
        return <Person />
      case 'cliente':
        return <Business />
      case 'contrato':
        return <TrendingUp />
      default:
        return <Person />
    }
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

  const renderProfissionalCard = () => (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          backgroundColor: 'action.hover'
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            <Typography variant="h6" component="h3" fontWeight="bold">
              {data.nome}
            </Typography>
          </Box>
          <Chip
            label={getStatusText(data.status)}
            color={getStatusColor(data.status)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {data.especialidade}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Email fontSize="small" color="action" />
          <Typography variant="body2">{data.email}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            icon={data.tipoContrato === 'hora' ? <AttachMoney /> : <Receipt />}
            label={getTipoContratoText(data.tipoContrato)}
            color={getTipoContratoColor(data.tipoContrato)}
            size="small"
            variant="outlined"
          />
        </Box>

        {data.tipoContrato === 'hora' ? (
          <Typography variant="body2" color="primary.main" fontWeight="bold">
            R$ {data.valorHora?.toFixed(2)}/h
          </Typography>
        ) : (
          <Typography variant="body2" color="secondary.main" fontWeight="bold">
            {formatCurrency(data.valorFechado || 0)} ({data.periodoFechado})
          </Typography>
        )}

        <Typography variant="body2" color="success.main" fontWeight="bold">
          Recebe: {formatCurrency(data.valorPago)}
        </Typography>

        {/* Calcular quanto nós recebemos vs quanto pagamos */}
        {(() => {
          // Para profissionais por hora, assumir 160h/mês (8h/dia * 20 dias)
          // Para profissionais com valor fechado, usar o valor fechado
          const valorQueRecebemos = data.tipoContrato === 'hora' 
            ? (data.valorHora || 0) * 160 // 160h/mês
            : (data.valorFechado || 0)
          
          const diferenca = valorQueRecebemos - data.valorPago
          const percentualDiferenca = valorQueRecebemos > 0 ? (diferenca / valorQueRecebemos) * 100 : 0
          
          return (
            <Typography variant="body2" color={diferenca >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
              Nós Recebemos: {formatCurrency(valorQueRecebemos)} ({percentualDiferenca.toFixed(1)}% margem)
            </Typography>
          )
        })()}

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Data de Início:
              </Typography>
              <Typography variant="body2">
                {new Date(data.dataInicio).toLocaleDateString('pt-BR')}
              </Typography>
            </Grid>

          </Grid>
        </Collapse>
      </CardContent>

      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
        <IconButton
          size="small"
          onClick={handleExpandClick}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
    </Card>
  )

  const renderClienteCard = () => (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          backgroundColor: 'action.hover'
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="secondary" />
            <Typography variant="h6" component="h3" fontWeight="bold">
              {data.empresa}
            </Typography>
          </Box>
          <Chip
            label={data.tamanho}
            color={data.tamanho === 'Grande' ? 'error' : data.tamanho === 'Média' ? 'warning' : 'success'}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {data.nome}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Email fontSize="small" color="action" />
          <Typography variant="body2">{data.email}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label={data.segmento}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Ano Início:
              </Typography>
              <Typography variant="body2">
                {data.anoInicio}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Segmento:
              </Typography>
              <Typography variant="body2">
                {data.segmento}
              </Typography>
            </Grid>
            {data.endereco && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {data.endereco}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>

      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
        <IconButton
          size="small"
          onClick={handleExpandClick}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
    </Card>
  )

  const renderContratoCard = () => {
    const cardStyle = getCardStyle(data)
    const statusColor = getStatusBadgeColor(data)
    
    return (
      <Card
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
            backgroundColor: 'action.hover'
          },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...cardStyle
        }}
        onClick={handleCardClick}
      >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="success" />
            <Typography variant="h6" component="h3" fontWeight="bold">
              {data.nomeProjeto}
            </Typography>
          </Box>
          <Chip
            label={getStatusText(data.status)}
            color={getStatusColor(data.status)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {data.cliente?.empresa}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            icon={data.tipoContrato === 'hora' ? <AttachMoney /> : <Receipt />}
            label={getTipoContratoText(data.tipoContrato)}
            color={getTipoContratoColor(data.tipoContrato)}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Schedule fontSize="small" color="action" />
          <Typography variant="body2">
            {new Date(data.dataInicio).toLocaleDateString('pt-BR')}
            {data.dataFim && ` - ${new Date(data.dataFim).toLocaleDateString('pt-BR')}`}
            {!data.dataFim && ' - Indeterminado'}
          </Typography>
        </Box>

        <Typography variant="body2" color="info.main" fontWeight="bold">
          Valor Total: {formatCurrency(data.valorContrato)}
        </Typography>

        <Typography variant="body2" color="success.main" fontWeight="bold">
          Valor Mensal: {formatCurrency(calcularValorMensal(data))}
        </Typography>

        <Typography variant="body2" color="warning.main" fontWeight="bold">
          Custo Mensal: {formatCurrency(calcularCustoMensal(data))}
        </Typography>

        <Typography variant="body2" color="error.main" fontWeight="bold">
          Impostos Mensais: {formatCurrency(calcularImpostosMensais(data))}
        </Typography>

        {/* Calcular margem mensal */}
        {(() => {
          const margemMensal = calcularMargemMensal(data)
          const percentualMargem = calcularValorMensal(data) > 0 ? 
            (margemMensal / (calcularValorMensal(data) - calcularImpostosMensais(data))) * 100 : 0
          
          return (
            <Typography variant="body2" color={margemMensal >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
              Margem Mensal: {formatCurrency(margemMensal)} ({percentualMargem.toFixed(1)}%)
            </Typography>
          )
        })()}

        <Typography variant="body2" color="warning.main" fontWeight="bold">
          Profissionais: {data.profissionais?.length || 0}
        </Typography>

        {/* Informações sobre dias restantes */}
        {data.dataFim && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <div 
              style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: statusColor,
                boxShadow: `0 0 4px ${statusColor}40`
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              {(() => {
                const diasRestantes = calcularDiasRestantes(data)
                if (diasRestantes === null) return ''
                if (diasRestantes > 0) return `${diasRestantes} dias restantes`
                return 'Vencido'
              })()}
            </Typography>
          </Box>
        )}

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Tipo:
              </Typography>
              <Typography variant="body2">
                {getTipoContratoText(data.tipoContrato)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Profissionais:
              </Typography>
              <Typography variant="body2">
                {data.profissionais?.map((p: any) => p.profissional.nome).join(', ') || 'Nenhum'}
              </Typography>
            </Grid>
            {data.observacoes && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Observações:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {data.observacoes}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>

      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
        <IconButton
          size="small"
          onClick={handleExpandClick}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
    </Card>
  )

  const renderCard = () => {
    switch (type) {
      case 'profissional':
        return renderProfissionalCard()
      case 'cliente':
        return renderClienteCard()
      case 'contrato':
        return renderContratoCard()
      default:
        return null
    }
  }

  return (
    <Tooltip title={onClick ? "Clique para ver detalhes" : ""} arrow>
      <Box>
        {renderCard()}
      </Box>
    </Tooltip>
  )
}

export default DashboardCard 