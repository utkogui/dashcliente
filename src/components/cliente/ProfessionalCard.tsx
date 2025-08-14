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
      style={{ position: 'relative', height: 420, display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: isFocused ? '0 0 0 3px rgba(24, 144, 255, 0.45), 0 4px 20px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.08)', background: risk.cardBg, outline: 'none', border: `1px solid ${risk.barBg}` }}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 40 } }}
    >
      <div style={{ height: 6, width: '100%', background: risk.barBg, borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'absolute', left: 0, top: 0 }} />

      {/* Topo */}
      <div style={{ flex: '0 0 35%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <Title level={5} style={{ margin: 0 }} title={profissional.nome}>{profissional.nome}</Title>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: disponibilidadeCor }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text strong style={{ color: emProjeto ? '#1677ff' : '#faad14' }}>{emProjeto ? 'Em projeto' : 'Disponível'}</Text>
        </div>
        <Text type="secondary" style={{ marginTop: 4 }}>{profissional.especialidade}</Text>
        {profissional.tags && (
          <Space size={[4, 4]} wrap style={{ marginTop: 8 }}>
            {profissional.tags.split(',').slice(0, 5).map((tag: string, idx: number) => {
              const t = tag.trim()
              if (!t) return null
              return <Tag key={idx}>{t}</Tag>
            })}
          </Space>
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Base */}
      <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', justifyContent: !emProjeto ? 'center' : 'flex-start' }}>
        {!emProjeto ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#fafafa', borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary" style={{ marginBottom: 8 }}>Sem projeto ativo</Text>
            <Text type="secondary">Alocar este profissional</Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Title level={5} style={{ margin: 0 }} title={projeto!.nome}>{projeto!.nome}</Title>
            <Text type="secondary">{projeto!.cliente}</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
              <Text type="secondary">{new Date(projeto!.dataInicio).toLocaleDateString('pt-BR')}{projeto!.dataFim && ` - ${new Date(projeto!.dataFim!).toLocaleDateString('pt-BR')}`}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, marginTop: 8, background: `${(risk as any).barBg}10`, borderRadius: 10, border: `1px solid ${risk.barBg}30`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <FieldTimeOutlined style={{ color: risk.text }} />
              <Text strong style={{ color: risk.text }}>{diasRestantes === null ? 'Indeterminado' : diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido'}</Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ProfessionalCard


