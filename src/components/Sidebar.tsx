import React from 'react'
import { Layout, Menu, Typography, Divider } from 'antd'
import { NavLink, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  EyeOutlined,
  BarChartOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'

const { Sider } = Layout
const { Title, Text } = Typography

const menuItems = [
  { 
    key: '/', 
    icon: <DashboardOutlined />, 
    label: 'Dashboard',
    path: '/'
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
]

const Sidebar = () => {
  const location = useLocation()

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find(item => item.key === key)
    if (item) {
      window.location.href = item.path
    }
  }

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
          Alocações Matilha
        </Title>
      </div>

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
        items={menuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          style: {
            color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.8)',
            fontWeight: location.pathname === item.path ? 600 : 400,
            margin: '0 8px',
            borderRadius: 6
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