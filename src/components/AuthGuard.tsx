import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin, Result } from 'antd'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { usuario, loading } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <div>Verificando autenticação...</div>
      </div>
    )
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se há usuário autenticado, renderizar o conteúdo protegido
  return <>{children}</>
}

export default AuthGuard
