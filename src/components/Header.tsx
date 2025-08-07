import React from 'react'
import { Layout } from 'antd'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'

const { Header: AntHeader } = Layout

const Header = () => {
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
        justifyContent: 'center',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        padding: 0,
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
    </AntHeader>
  )
}

export default Header 