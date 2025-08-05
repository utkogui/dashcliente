import { Box, Typography } from '@mui/material'
import { Routes, Route } from 'react-router-dom'
import { DataProvider } from './contexts/DataContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Profissionais from './pages/Profissionais'
import Contratos from './pages/Contratos'
import Clientes from './pages/Clientes'
import Relatorios from './pages/Relatorios'

function App() {
  return (
    <DataProvider>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'background.default' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profissionais" element={<Profissionais />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </Box>
      </Box>
    </DataProvider>
  )
}

export default App
