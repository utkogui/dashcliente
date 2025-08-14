import { Box, Typography } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './contexts/DataContext'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import AuthGuard from './components/AuthGuard'
import { useMemo } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profissionais from './pages/Profissionais'
import CadastroProfissional from './pages/CadastroProfissional'
import EditarProfissional from './pages/EditarProfissional'
import Contratos from './pages/Contratos'
import CadastroContrato from './pages/CadastroContrato'
import DatabaseViewer from './pages/DatabaseViewer'
import Clientes from './pages/Clientes'
import VisaoCliente from './pages/VisaoClienteAnt'
import Timeline from './pages/Timeline'
import GestaoUsuarios from './pages/GestaoUsuarios'

// Componente para redirecionar admin/cliente
const AdminRedirect = () => {
  const { usuario } = useAuth()
  
  if (usuario?.tipo === 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <Navigate to="/visao-cliente" replace />
}

// Guarda de papel para rotas restritas (apenas admin)
const RoleGuard: React.FC<{ children: React.ReactNode; allowed: Array<'admin' | 'cliente'> }> = ({ children, allowed }) => {
  const { usuario, loading } = useAuth()
  if (loading) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (!allowed.includes(usuario.tipo)) {
    // Se for cliente tentando acessar dashboard, manda para visão do cliente
    return <Navigate to={usuario.tipo === 'cliente' ? '/visao-cliente' : '/gestao-usuarios'} replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          {/* Rota de login - pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rota especial para Visão do Cliente - protegida */}
          <Route path="/visao-cliente" element={
            <AuthGuard>
              <VisaoCliente />
            </AuthGuard>
          } />
          
          {/* Layout principal com sidebar - protegido e restrito a admin */}
          <Route path="/*" element={
            <AuthGuard>
              <RoleGuard allowed={['admin']}>
                <Box sx={{ height: '100vh' }}>
                  <Header />
                  <Box sx={{ display: 'flex', height: '100vh', pt: 10 }}>
                    <Sidebar />
                    <Box 
                      component="main" 
                      sx={{ 
                        flexGrow: 1, 
                        overflow: 'auto', 
                        bgcolor: 'background.default',
                        ml: '280px',
                        width: 'calc(100% - 280px)'
                      }}
                    >
                      <Routes>
                        <Route path="/" element={<AdminRedirect />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profissionais" element={<Profissionais />} />
                        <Route path="/cadastro-profissional" element={<CadastroProfissional />} />
                        <Route path="/editar-profissional/:id" element={<EditarProfissional />} />
                        <Route path="/contratos" element={<Contratos />} />
                        <Route path="/cadastro-contrato" element={<CadastroContrato />} />
                        <Route path="/database" element={<DatabaseViewer />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/timeline" element={<Timeline />} />
                        <Route path="/gestao-usuarios" element={<GestaoUsuarios />} />
                        {/* Rota catch-all para 404 */}
                        <Route path="*" element={
                          <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h4" color="error">
                              Página não encontrada
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                              A página que você está procurando não existe.
                            </Typography>
                          </Box>
                        } />
                      </Routes>
                    </Box>
                  </Box>
                </Box>
              </RoleGuard>
            </AuthGuard>
          } />
        </Routes>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
