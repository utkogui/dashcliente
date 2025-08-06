import { Box, Typography } from '@mui/material'
import { Routes, Route } from 'react-router-dom'
import { DataProvider } from './contexts/DataContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Profissionais from './pages/Profissionais'
import CadastroProfissional from './pages/CadastroProfissional'
import EditarProfissional from './pages/EditarProfissional'
import Contratos from './pages/Contratos'
import CadastroContrato from './pages/CadastroContrato'
import DatabaseViewer from './pages/DatabaseViewer'
import Clientes from './pages/Clientes'
import VisaoCliente from './pages/VisaoCliente'
import Timeline from './pages/Timeline'

function App() {
  return (
    <DataProvider>
      <Routes>
        {/* Rota especial para Visão do Cliente - sem menu lateral */}
        <Route path="/visao-cliente" element={<VisaoCliente />} />
        
        {/* Rotas padrão com menu lateral */}
        <Route path="/*" element={
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
                }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profissionais" element={<Profissionais />} />
                  <Route path="/cadastro-profissional" element={<CadastroProfissional />} />
                  <Route path="/editar-profissional/:id" element={<EditarProfissional />} />
                  <Route path="/contratos" element={<Contratos />} />
                  <Route path="/cadastro-contrato" element={<CadastroContrato />} />
                  <Route path="/database" element={<DatabaseViewer />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/timeline" element={<Timeline />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        } />
      </Routes>
    </DataProvider>
  )
}

export default App
