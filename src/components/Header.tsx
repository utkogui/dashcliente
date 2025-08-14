import React from 'react'
import { Layout, Button, Space, Typography } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'
import { useAuth } from '../contexts/AuthContext'

const { Header: AntHeader } = Layout

const Header = () => {
  const { usuario, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // O logout já redireciona automaticamente
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleBackToAdmin = () => {
    const adminSession = localStorage.getItem('adminSessionId')
    if (adminSession) {
      localStorage.setItem('sessionId', adminSession)
      localStorage.removeItem('adminSessionId')
      window.location.hash = '#/gestao-usuarios'
      window.location.reload()
    }
  }

  return (
    <AntHeader
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#0031BC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        padding: '0 24px',
        lineHeight: 'normal'
      }}
    >
      <img
        src={logoFtdMatilha}
        alt="Logo FTD Educação + Matilha Tecnologia"
        style={{
          height: 80,
          width: 'auto',
          display: 'block'
        }}
      />
      
      {usuario && (
        <Space>
          <Space style={{ color: 'white' }}>
            <UserOutlined />
            <Typography.Text style={{ color: 'white' }}>
              {usuario.email}
            </Typography.Text>
            {usuario.cliente && (
              <Typography.Text style={{ color: 'white', opacity: 0.8 }}>
                ({usuario.cliente.nome})
              </Typography.Text>
            )}
          </Space>
          {localStorage.getItem('adminSessionId') && (
            <Button
              type="link"
              style={{ color: 'white' }}
              onClick={handleBackToAdmin}
            >
              Voltar ao Admin
            </Button>
          )}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: 'white' }}
            title="Sair"
          >
            Sair
          </Button>
        </Space>
      )}
    </AntHeader>
  )
}

export default Header 