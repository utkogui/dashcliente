import React, { useState } from 'react'
import { Card, Typography, Tag, Space, Divider } from 'antd'
import { CalendarOutlined, FieldTimeOutlined } from '@ant-design/icons'
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
  const risk = getRiskColors(diasRestantes)
  const emProjeto = Boolean(projeto)
  const disponibilidadeCor = emProjeto ? '#22c55e' : '#ff9aa2'
  const [isFocused, setIsFocused] = useState(false)
  
  // Função para extrair primeiro e último nome
  const getFirstAndLastName = (fullName: string) => {
    const names = fullName.trim().split(' ')
    if (names.length === 1) return fullName
    return `${names[0]} ${names[names.length - 1]}`
  }

  return (
    <Card
      style={{ position: 'relative', minHeight: 336, height: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: risk.cardBg, outline: 'none', border: `1px solid ${risk.barBg}` }}
      styles={{ body: { display: 'flex', flexDirection: 'column', flex: '1', padding: 0 } }}
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
          padding: '20px 32px',
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
          fontSize: '32px', 
          fontWeight: '700',
          lineHeight: '1.1',
          letterSpacing: '-0.5px',
          pointerEvents: 'none'
        }} title={profissional.nome}>
          {getFirstAndLastName(profissional.nome)}
        </Title>
      </div>

      {/* Segundo e Terceiro Terços - Conteúdo Principal (Não Clicável) */}
      <div style={{ flex: '1 0 66.667%', padding: '24px 32px', display: 'flex', flexDirection: 'column', pointerEvents: 'none', position: 'relative' }}>
        {/* Status e Especialidade */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: disponibilidadeCor }} />
            <Text strong style={{ color: emProjeto ? '#1677ff' : '#faad14', fontSize: '16px' }}>
              {emProjeto ? 'Em projeto' : 'Disponível'}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: 8 }}>
            {profissional.especialidade}
          </Text>
          
          {/* Área de tags - Sempre presente para manter consistência */}
          <div style={{ minHeight: '24px', display: 'flex', alignItems: 'flex-start' }}>
            {profissional.tags ? (
              <Space size={[4, 4]} wrap>
                {profissional.tags.split(',').slice(0, 4).map((tag: string, idx: number) => {
                  const t = tag.trim()
                  if (!t) return null
                  return <Tag key={idx} style={{ fontSize: '11px', lineHeight: '16px' }}>{t}</Tag>
                })}
              </Space>
            ) : (
              <div style={{ height: '24px' }}></div>
            )}
          </div>
        </div>

        {/* Terceiro Terço - Conteúdo Principal (sem tags) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: !emProjeto ? 'center' : 'flex-start' }}>
          {!emProjeto ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#fafafa', borderRadius: 8, textAlign: 'center', height: '100%' }}>
              <Text type="secondary" style={{ marginBottom: 8, fontSize: '16px' }}>Sem projeto ativo</Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>Alocar este profissional</Text>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, flex: 1, paddingRight: '100px' }}>
                <Title level={4} style={{ margin: 0, lineHeight: '1.3', wordBreak: 'break-word', color: '#262626' }} title={projeto!.nome}>
                  {projeto!.nome}
                </Title>
                <Text type="secondary" style={{ wordBreak: 'break-word', fontSize: '14px' }}>{projeto!.cliente}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined style={{ color: 'rgba(0,0,0,0.45)', flexShrink: 0 }} />
                  <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.2' }}>
                    {new Date(projeto!.dataInicio).toLocaleDateString('pt-BR')}
                    {projeto!.dataFim && ` - ${new Date(projeto!.dataFim!).toLocaleDateString('pt-BR')}`}
                  </Text>
                </div>
              </div>
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
                bottom: '30px',
                right: '30px'
              }}>
                <Text strong style={{ color: risk.text, fontSize: 32, lineHeight: 1 }}>
                  {diasRestantes === null ? '∞' : Math.max(0, diasRestantes)}
                </Text>
                <Text type="secondary" style={{ marginTop: 4, fontSize: '12px' }}>
                  {diasRestantes === null ? 'indeterminado' : 'dias'}
                </Text>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

export default ProfessionalCard


