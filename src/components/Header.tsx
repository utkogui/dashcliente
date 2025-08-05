import { Box } from '@mui/material'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'

const Header = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 80, // Altura do header
        bgcolor: '#0031BC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Centraliza o conteúdo horizontalmente
        zIndex: 1000,
        boxShadow: 2,
      }}
    >
      {/* Logo FTD + Matilha */}
      <Box
        component="img"
        src={logoFtdMatilha}
        alt="Logo FTD Educação + Matilha Tecnologia"
        sx={{
          height: 80, // Altura de 80px conforme solicitado
          width: 'auto', // Mantém a proporção da imagem
          display: 'block', // Garante que a imagem se comporte como um bloco para centralização
        }}
      />
    </Box>
  )
}

export default Header 