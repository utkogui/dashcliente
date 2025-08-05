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
  Timeline as TimelineIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'

const menuItems = [
  { icon: DashboardIcon, label: 'Dashboard', path: '/' },
  { icon: PeopleIcon, label: 'Profissionais', path: '/profissionais' },
  { icon: DescriptionIcon, label: 'Contratos', path: '/contratos' },
  { icon: BusinessIcon, label: 'Clientes', path: '/clientes' },
  { icon: TimelineIcon, label: 'Timeline', path: '/timeline' },
  { icon: StorageIcon, label: 'Banco de Dados', path: '/database' },
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: '#0031BC',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h1" color="white" fontWeight="bold">
          Alocações Matilha
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
                  bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="rgba(255,255,255,0.6)">
          © 2024 Matilha Tecnologia
        </Typography>
      </Box>
    </Box>
  )
}

export default Sidebar 