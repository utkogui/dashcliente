import React from 'react'
import { Layout, Menu, Typography, Divider } from 'antd'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  EyeOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import ClientSelector from './ClientSelector'

const { Sider } = Layout
const { Title, Text } = Typography

const menuItems = [
  { 
    key: '/dashboard', 
    icon: <DashboardOutlined />, 
    label: 'Dashboard',
    path: '/dashboard'
  },
  { 
    key: '/profissionais', 
    icon: <UserOutlined />, 
    label: 'Profissionais',
    path: '/profissionais'
  },
  { 
    key: '/contratos', 
    icon: <FileTextOutlined />, 
    label: 'Contratos',
    path: '/contratos'
  },
  { 
    key: '/clientes', 
    icon: <TeamOutlined />, 
    label: 'Clientes',
    path: '/clientes'
  },
  { 
    key: '/visao-cliente', 
    icon: <EyeOutlined />, 
    label: 'Visão do Cliente',
    path: '/visao-cliente'
  },
  { 
    key: '/timeline', 
    icon: <BarChartOutlined />, 
    label: 'Timeline',
    path: '/timeline'
  },
  { 
    key: '/database', 
    icon: <DatabaseOutlined />, 
    label: 'Banco de Dados',
    path: '/database'
  },
  { 
    key: '/gestao-usuarios', 
    icon: <SettingOutlined />, 
    label: 'Gestão de Empresas',
    path: '/gestao-usuarios'
  },
]

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find(item => item.key === key)
    if (item) {
      navigate(item.path)
    }
  }

  // Filtrar itens do menu baseado no tipo de usuário
  const filteredMenuItems = menuItems.filter(item => {
    if (usuario?.tipo === 'admin') {
      // Admin vê todo o painel (tudo exceto Visão do Cliente)
      return item.key !== '/visao-cliente'
    }
    // Cliente vê apenas Visão do Cliente
    return item.key === '/visao-cliente'
  })

  return (
    <Sider
      width={280}
      style={{
        background: '#0031BC',
        borderRight: '1px solid #d9d9d9',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'fixed',
        left: 0,
        top: 80,
        bottom: 0,
        zIndex: 999
      }}
    >
      <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Title 
          level={4} 
          style={{ 
            color: 'white', 
            fontWeight: 'bold',
            margin: 0
          }}
        >
          {usuario?.tipo === 'admin' ? 'Administração' : 'Alocações Matilha'}
        </Title>
      </div>

      {/* ClientSelector apenas para administradores */}
      {usuario?.tipo === 'admin' && (
        <div style={{ padding: '0 16px 16px 16px' }}>
          <ClientSelector />
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{
          background: '#0031BC',
          border: 'none',
          flex: 1,
          paddingTop: 8
        }}
        onClick={handleMenuClick}
        items={filteredMenuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          style: {
            color: location.pathname === item.path ? '#1a1a1a' : 'rgba(255,255,255,0.8)',
            fontWeight: location.pathname === item.path ? 600 : 400,
            margin: '0 8px',
            borderRadius: 6,
            backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.9)' : 'transparent',
            padding: '8px 12px'
          }
        }))}
      />

      <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: 0 }} />
      <div style={{ padding: 16, textAlign: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
          © 2024 Matilha Tecnologia
        </Text>
      </div>
    </Sider>
  )
}

export default Sidebar 