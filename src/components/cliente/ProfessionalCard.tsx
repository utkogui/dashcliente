import React, { useState } from 'react'
import { Card, Typography, Tag, Space, Divider } from 'antd'
import { CalendarOutlined, FieldTimeOutlined, UserOutlined } from '@ant-design/icons'
import { getRiskColors } from '../../utils/formatters'

const { Title, Text } = Typography

interface ProjetoAtivo {
  nome: string
  cliente: string
  dataInicio: string
  dataFim?: string | null
  contrato: any
}

interface ProfessionalCardProps {
  profissional: any
  projeto: ProjetoAtivo | null
  diasRestantes: number | null
  contatoCliente?: { nome?: string; email?: string; telefone?: string }
  onOpen: () => void
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ profissional, projeto, diasRestantes, contatoCliente, onOpen }) => {
  const emProjeto = Boolean(projeto)
  
  // Se não está em projeto, usar cor azul claro
  const risk = emProjeto 
    ? getRiskColors(diasRestantes)
    : { barBg: '#3b82f6', cardBg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6' }
  
  const disponibilidadeCor = emProjeto ? '#22c55e' : '#3b82f6'
  const [isFocused, setIsFocused] = useState(false)
  
  // Função para extrair primeiro e último nome
  const getFirstAndLastName = (fullName: string) => {
    const names = fullName.trim().split(' ')
    if (names.length === 1) return fullName
    return `${names[0]} ${names[names.length - 1]}`
  }

  return (
    <Card
      style={{ 
        position: 'relative', 
        height: '100%', 
        minHeight: 350,
        maxHeight: 450,
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 12, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        background: risk.cardBg, 
        outline: 'none', 
        border: `1px solid ${risk.barBg}` 
      }}
      styles={{ 
        body: { 
          display: 'flex', 
          flexDirection: 'column', 
          flex: '1', 
          padding: 0, 
          height: '100%' 
        } 
      }}
    >
      <div style={{ height: 6, width: '100%', background: risk.barBg, borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'absolute', left: 0, top: 0 }} />

      {/* Primeiro Terço - Nome do Profissional (Clicável) */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Abrir detalhes do profissional ${profissional?.nome || ''}`}
        onKeyDown={(e) => { if (e.key === 'Enter') { onOpen() } }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={onOpen}
        style={{ 
          flex: '0 0 33.333%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'flex-start', 
          padding: 'clamp(16px, 4vw, 20px) clamp(20px, 5vw, 32px)',
          background: isFocused 
            ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(24, 144, 255, 0.02) 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
          borderRadius: '12px 12px 0 0'
        }}
      >
        <Title level={1} style={{ 
          margin: 0, 
          textAlign: 'left', 
          color: '#000000', 
          fontSize: 'clamp(24px, 5vw, 32px)', 
          fontWeight: '700',
          lineHeight: '1.1',
          letterSpacing: '-0.5px',
          pointerEvents: 'none'
        }} title={profissional.nome}>
          {getFirstAndLastName(profissional.nome)}
        </Title>
        
        {/* Cargo do Profissional */}
        <Text style={{ 
          fontSize: 'clamp(14px, 3vw, 16px)', 
          color: '#666666', 
          marginTop: 4,
          pointerEvents: 'none'
        }}>
          {profissional.especialidade}
          {profissional.perfil && ` / ${profissional.perfil}`}
        </Text>
      </div>

      {/* Segundo e Terceiro Terços Unificados - Conteúdo Principal (Não Clicável) */}
      <div style={{ 
        flex: '1 0 66.667%', 
        padding: 'clamp(16px, 4vw, 24px) clamp(20px, 5vw, 32px)', 
        display: 'flex', 
        flexDirection: 'column', 
        pointerEvents: 'none', 
        position: 'relative' 
      }}>
        {/* Status e Informações do Profissional */}
        <div style={{ marginBottom: 16 }}>
          {/* Status com indicador de projeto finalizado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: disponibilidadeCor }} />
            <Text strong style={{ color: emProjeto ? '#1677ff' : '#faad14', fontSize: '16px' }}>
              {emProjeto && projeto && projeto.dataFim && (() => {
                const dataFim = new Date(projeto.dataFim)
                const hoje = new Date()
                const isFinalizado = dataFim < hoje
                return isFinalizado ? 'Aguardando projeto' : 'Em projeto'
              })() || (emProjeto ? 'Em projeto' : 'Disponível')}
            </Text>
          </div>
          
        </div>

        {/* Conteúdo do Projeto */}
        {!emProjeto ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#fafafa', borderRadius: 8, textAlign: 'center', height: '100%' }}>
            <Text type="secondary" style={{ marginBottom: 8, fontSize: '16px' }}>Sem projeto ativo</Text>
            <Text type="secondary" style={{ fontSize: '14px' }}>Alocar este profissional</Text>
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'clamp(8px, 2vw, 12px)', 
              minWidth: 0, 
              flex: '1 1 0%', 
              paddingRight: 'clamp(80px, 15vw, 100px)', 
              paddingBottom: 0,
              justifyContent: 'flex-end'
            }}>
              <Title level={4} style={{ margin: 0, lineHeight: '1.3', wordBreak: 'break-word', color: '#262626' }} title={projeto!.nome}>
                {projeto!.nome}
              </Title>
              
              {/* Data de Finalização - Destacada */}
              {projeto!.dataFim && (() => {
                const dataFim = new Date(projeto!.dataFim!)
                const hoje = new Date()
                const isFinalizado = dataFim < hoje
                
                return (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    padding: '6px 10px',
                    background: isFinalizado 
                      ? `linear-gradient(135deg, ${(risk as any).barBg}15 0%, ${(risk as any).barBg}08 100%)`
                      : `linear-gradient(135deg, ${(risk as any).barBg}20 0%, ${(risk as any).barBg}10 100%)`,
                    borderRadius: '6px',
                    border: `1px solid ${(risk as any).barBg}40`
                  }}>
                    <CalendarOutlined style={{ 
                      color: risk.text, 
                      fontSize: '14px', 
                      flexShrink: 0 
                    }} />
                    <Text strong style={{ 
                      fontSize: '14px', 
                      lineHeight: '1.2', 
                      color: risk.text,
                      fontWeight: '500'
                    }}>
                      {isFinalizado ? 'Finalizado em:' : 'Finalização:'} {dataFim.toLocaleDateString('pt-BR')}
                    </Text>
                  </div>
                )
              })()}
              
              {/* Gestor Interno - Só aparece se existir */}
              {profissional.gestorInterno && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  padding: '4px 8px',
                  background: `linear-gradient(135deg, ${(risk as any).barBg}15 0%, ${(risk as any).barBg}08 100%)`,
                  borderRadius: '6px',
                  border: `1px solid ${(risk as any).barBg}40`
                }}>
                  <UserOutlined style={{ 
                    color: risk.text, 
                    fontSize: '12px', 
                    flexShrink: 0 
                  }} />
                  <Text strong style={{ 
                    fontSize: '12px', 
                    lineHeight: '1.2', 
                    color: risk.text,
                    fontWeight: '500'
                  }}>
                    Gestor Interno: {profissional.gestorInterno}
                  </Text>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Contador de Dias - Posicionado em relação ao card principal */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 16px',
        background: `${(risk as any).barBg}15`,
        borderRadius: 12,
        border: `2px solid ${risk.barBg}40`,
        minWidth: 80,
        position: 'absolute',
        bottom: '20px',
        right: '30px'
      }}>
        <Text strong style={{ color: risk.text, fontSize: 32, lineHeight: 1 }}>
          {diasRestantes === null ? '∞' : Math.max(0, diasRestantes)}
        </Text>
        <Text type="secondary" style={{ marginTop: 4, fontSize: '12px' }}>
          {diasRestantes === null ? 'indeterminado' : 'dias'}
        </Text>
      </div>
    </Card>
  )
}

export default ProfessionalCard


