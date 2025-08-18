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

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`Card do profissional ${profissional?.nome || ''}`}
      onKeyDown={(e) => { if (e.key === 'Enter') { onOpen() } }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={onOpen}
      style={{ position: 'relative', minHeight: 336, height: 'auto', display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: isFocused ? '0 0 0 3px rgba(24, 144, 255, 0.45), 0 4px 20px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.08)', background: risk.cardBg, outline: 'none', border: `1px solid ${risk.barBg}` }}
      styles={{ body: { display: 'flex', flexDirection: 'column', flex: '1', padding: 32 } }}
    >
      <div style={{ height: 6, width: '100%', background: risk.barBg, borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'absolute', left: 0, top: 0 }} />

      {/* Topo - Altura fixa para alinhamento */}
      <div style={{ flex: '0 0 auto', minHeight: 120 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
          <Title level={5} style={{ margin: 0 }} title={profissional.nome}>{profissional.nome}</Title>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: disponibilidadeCor }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text strong style={{ color: emProjeto ? '#1677ff' : '#faad14' }}>{emProjeto ? 'Em projeto' : 'Disponível'}</Text>
        </div>
        <Text type="secondary" style={{ marginTop: 3 }}>{profissional.especialidade}</Text>
        
        {/* Área de tags com altura fixa */}
        <div style={{ marginTop: 6, minHeight: 60 }}>
          {profissional.tags ? (
            <Space size={[4, 4]} wrap style={{ maxHeight: 60, overflow: 'hidden' }}>
              {profissional.tags.split(',').slice(0, 5).map((tag: string, idx: number) => {
                const t = tag.trim()
                if (!t) return null
                return <Tag key={idx} style={{ fontSize: '11px', lineHeight: '16px' }}>{t}</Tag>
              })}
            </Space>
          ) : (
            // Espaçador invisível quando não há tags para manter alinhamento
            <div style={{ height: 60, opacity: 0 }} />
          )}
        </div>
      </div>

      <Divider style={{ margin: '10px 0' }} />

      {/* Base - Altura fixa para alinhamento */}
      <div style={{ flex: '1 0 auto', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: !emProjeto ? 'center' : 'flex-start' }}>
        {!emProjeto ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12, background: '#fafafa', borderRadius: 8, textAlign: 'center', height: '100%' }}>
            <Text type="secondary" style={{ marginBottom: 8 }}>Sem projeto ativo</Text>
            <Text type="secondary">Alocar este profissional</Text>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, flex: 1, justifyContent: 'center' }}>
              <Title level={5} style={{ margin: 0, lineHeight: '1.2', wordBreak: 'break-word' }} title={projeto!.nome}>{projeto!.nome}</Title>
              <Text type="secondary" style={{ wordBreak: 'break-word' }}>{projeto!.cliente}</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarOutlined style={{ color: 'rgba(0,0,0,0.45)', flexShrink: 0 }} />
                <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.2' }}>
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
              padding: '8px 10px',
              background: `${(risk as any).barBg}10`,
              borderRadius: 10,
              border: `1px solid ${risk.barBg}30`,
              minWidth: 70,
              alignSelf: 'center'
            }}>
              <Text strong style={{ color: risk.text, fontSize: 28, lineHeight: 1 }}>
                {diasRestantes === null ? '∞' : Math.max(0, diasRestantes)}
              </Text>
              <Text type="secondary" style={{ marginTop: 2 }}>
                {diasRestantes === null ? 'indeterminado' : 'dias'}
              </Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ProfessionalCard


