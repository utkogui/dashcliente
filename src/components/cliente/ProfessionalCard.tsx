import React from 'react'
import { Card, Typography, Tag, Space, Divider, Button } from 'antd'
import { CalendarOutlined, MessageOutlined, MailOutlined, PhoneOutlined, FieldTimeOutlined, UserOutlined } from '@ant-design/icons'
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

  return (
    <Card
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') { onOpen() } }}
      onClick={onOpen}
      style={{ height: 380, display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: risk.cardBg }}
      bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}
    >
      <div style={{ height: 6, width: '100%', background: risk.barBg, borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'absolute', left: 0, top: 0 }} />

      {/* Topo */}
      <div style={{ flex: '0 0 35%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: disponibilidadeCor }} />
          <Title level={5} style={{ margin: 0 }} title={profissional.nome}>{profissional.nome}</Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text strong style={{ color: emProjeto ? '#1677ff' : '#faad14' }}>{emProjeto ? 'Em projeto' : 'Disponível'}</Text>
        </div>
        <Text type="secondary" style={{ marginTop: 4 }}>{profissional.especialidade}</Text>
        {profissional.tags && (
          <Space size={[4, 4]} wrap style={{ marginTop: 8 }}>
            {profissional.tags.split(',').map((tag: string, idx: number) => {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Title level={5} style={{ margin: 0 }} title={projeto!.nome}>{projeto!.nome}</Title>
            <Text type="secondary">{projeto!.cliente}</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
              <Text type="secondary">{new Date(projeto!.dataInicio).toLocaleDateString('pt-BR')}{projeto!.dataFim && ` - ${new Date(projeto!.dataFim!).toLocaleDateString('pt-BR')}`}</Text>
            </div>
            <Space size={[8, 8]} wrap style={{ marginTop: 6 }}>
              {contatoCliente?.nome && <Tag icon={<UserOutlined />}>{`Contato: ${contatoCliente.nome}`}</Tag>}
              {contatoCliente?.email && (
                <Button type="link" icon={<MessageOutlined />} href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(contatoCliente.email)}`} target="_blank" onClick={(e) => e.stopPropagation()}>Teams</Button>
              )}
              {contatoCliente?.email && (
                <Button type="link" icon={<MailOutlined />} href={`mailto:${contatoCliente.email}`} onClick={(e) => e.stopPropagation()}>Email</Button>
              )}
              {contatoCliente?.telefone && <Tag icon={<PhoneOutlined />}>{contatoCliente.telefone}</Tag>}
            </Space>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, marginTop: 6, background: risk.cardBg, borderRadius: 8, border: `1px solid ${risk.barBg}30` }}>
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


