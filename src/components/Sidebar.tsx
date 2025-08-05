import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'

const menuItems = [
  { icon: DashboardIcon, label: 'Dashboard', path: '/' },
  { icon: PeopleIcon, label: 'Profissionais', path: '/profissionais' },
  { icon: DescriptionIcon, label: 'Contratos', path: '/contratos' },
  { icon: BusinessIcon, label: 'Clientes', path: '/clientes' },
  { icon: TrendingUpIcon, label: 'Relatórios', path: '/relatorios' },
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: 'white',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Bodyshop Manager
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Controle de Profissionais
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  bgcolor: isActive ? 'primary.50' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.100' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2024 Bodyshop Manager
        </Typography>
      </Box>
    </Box>
  )
}

export default Sidebar 