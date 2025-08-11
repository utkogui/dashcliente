import React from 'react'
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material'
import { useData } from '../contexts/DataContext'
import { formatCurrency } from '../utils/formatters'

const Home: React.FC = () => {
  const { profissionais, contratos } = useData()

  const isOcupado = (profId: string): boolean => {
    return contratos.some(c => c.status === 'ativo' && c.profissionais.some(p => p.profissionalId === profId))
  }

  const getValorGanho = (prof: any): string => {
    if (prof.tipoContrato === 'hora') {
      return `${formatCurrency(Number(prof.valorHora || 0))} /h`
    }
    return `${formatCurrency(Number(prof.valorFechado || 0))} /mês`
  }

  const sorted = [...profissionais].sort((a, b) => a.nome.localeCompare(b.nome))

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Profissionais
      </Typography>

      <List disablePadding>
        {sorted.map((prof) => {
          const ocupado = isOcupado(prof.id)
          const cor = ocupado ? '#22c55e' : '#ef4444'
          return (
            <ListItem key={prof.id} divider sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cor, boxShadow: `0 0 0 3px ${ocupado ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)'}` }} />
                <Typography variant="subtitle1" fontWeight="bold" noWrap title={prof.nome}>
                  {prof.nome}
                </Typography>
              </Box>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    {prof.especialidade}
                  </Typography>
                }
              />
              <Chip label={getValorGanho(prof)} color="default" variant="outlined" />
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

export default Home


