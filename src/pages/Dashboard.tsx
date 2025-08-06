import React, { useState } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space, 
  Button, 
  Alert, 
  Spin,
  Tag
} from 'antd'
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useData } from '../contexts/DataContext'
import { useNavigate } from 'react-router-dom'
import DetalhesModal from '../components/DetalhesModal'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const { Title, Text } = Typography

const Dashboard = () => {
  const { profissionais, clientes, contratos, loading, error } = useData()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'profissional' | 'cliente' | 'contrato'>('profissional')
  const [modalData, setModalData] = useState<any>(null)
  const [showAllContratos, setShowAllContratos] = useState(false)
  const [showAllProfissionais, setShowAllProfissionais] = useState(false)
  const [showAllClientes, setShowAllClientes] = useState(false)

  const handleCardClick = (type: 'profissional' | 'cliente' | 'contrato', data: any) => {
    setModalType(type)
    setModalData(data)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setModalData(null)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert 
          message="Erro" 
          description={error} 
          type="error" 
          showIcon 
        />
      </div>
    )
  }

  // Cálculos das estatísticas
  const contratosAtivos = contratos.filter(c => c.status === 'ativo')
  const contratosPendentes = contratos.filter(c => c.status === 'pendente')
  
  const receitaTotal = contratos.reduce((acc, c) => acc + (c.valorContrato || 0), 0)
  const impostosTotal = contratos.reduce((acc, c) => acc + (c.valorImpostos || 0), 0)
  const receitaLiquida = receitaTotal - impostosTotal
  
  // Calcular custo total baseado nos profissionais dos contratos
  const custoTotal = contratos.reduce((acc, c) => {
    const custoContrato = c.profissionais?.reduce((profAcc, p) => {
      if (p.valorHora && p.horasMensais) {
        return profAcc + (p.valorHora * p.horasMensais)
      } else if (p.valorFechado) {
        return profAcc + p.valorFechado
      }
      return profAcc
    }, 0) || 0
    return acc + custoContrato
  }, 0)
  
  const lucroTotal = receitaLiquida - custoTotal
  const margemLucro = receitaLiquida > 0 ? (lucroTotal / receitaLiquida) * 100 : 0

  // Contratos próximos do vencimento (30 dias)
  const hoje = new Date()
  const contratosVencendo = contratosAtivos.filter(c => {
    if (!c.dataFim) return false
    const dataFim = new Date(c.dataFim)
    const diasRestantes = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return diasRestantes <= 30 && diasRestantes > 0
  })

  // Dados para gráficos
  const dadosEvolucao = [
    { mes: 'Jan', receita: 45000, custo: 32000 },
    { mes: 'Fev', receita: 52000, custo: 38000 },
    { mes: 'Mar', receita: 48000, custo: 35000 },
    { mes: 'Abr', receita: 61000, custo: 42000 },
    { mes: 'Mai', receita: 55000, custo: 39000 },
    { mes: 'Jun', receita: 67000, custo: 45000 },
  ]

  const dadosEspecialidades = profissionais.reduce((acc, prof) => {
    const especialidade = prof.especialidade
    acc[especialidade] = (acc[especialidade] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dadosPie = Object.entries(dadosEspecialidades).map(([name, value]) => ({
    name,
    value
  }))

  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']

  const renderCard = (type: 'profissional' | 'cliente' | 'contrato', data: any) => {
    const isContrato = type === 'contrato'
    const isProfissional = type === 'profissional'
    const isCliente = type === 'cliente'

    return (
      <Card
        key={data.id}
        hoverable
        style={{ cursor: 'pointer' }}
        onClick={() => handleCardClick(type, data)}
        bodyStyle={{ padding: 16 }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                {isContrato ? data.nomeProjeto : isProfissional ? data.nome : data.empresa}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {isContrato ? data.cliente?.empresa : isProfissional ? data.especialidade : data.contato}
              </Text>
            </div>
            <Tag color={isContrato ? 'blue' : isProfissional ? 'green' : 'orange'}>
              {isContrato ? data.status : isProfissional ? data.tipoContrato : 'Cliente'}
            </Tag>
          </div>
          
          {isContrato && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Valor Mensal</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text strong style={{ fontSize: 14 }}>
                    R$ {(() => {
                      // Se não tem dataFim, é contrato indeterminado - mostrar valor mensal
                      if (!data.dataFim) {
                        return (data.valorContrato / 12)?.toLocaleString('pt-BR', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        }) || '0'
                      }
                      // Se tem dataFim, mostrar valor total
                      return data.valorContrato?.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0 
                      }) || '0'
                    })()}
                  </Text>
                  {!data.dataFim && (
                    <Text type="secondary" style={{ fontSize: 12 }}>∞</Text>
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {data.profissionais?.length || 0} prof.
                </Text>
              </div>
            </div>
          )}

          {isProfissional && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Valor/Hora</Text>
              <Text strong style={{ fontSize: 14 }}>
                R$ {data.valorHora?.toLocaleString('pt-BR') || data.valorFechado?.toLocaleString('pt-BR') || '0'}
              </Text>
            </div>
          )}

          {isCliente && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Contratos Ativos</Text>
              <Text strong style={{ fontSize: 14 }}>
                {contratos.filter(c => c.clienteId === data.id && c.status === 'ativo').length}
              </Text>
            </div>
          )}
        </Space>
      </Card>
    )
  }

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            Dashboard
          </Title>
          <Text type="secondary">
            Visão geral dos seus profissionais, clientes e contratos
          </Text>
        </div>

        {/* Cards de Estatísticas */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Profissionais"
                value={profissionais.length}
                prefix={<UserOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {profissionais.filter(p => p.status === 'ativo').length} ativos
                  </Text>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Clientes"
                value={clientes.length}
                prefix={<TeamOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {contratosAtivos.length} contratos ativos
                  </Text>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Contratos Ativos"
                value={contratosAtivos.length}
                prefix={<FileTextOutlined />}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {contratosPendentes.length} pendentes
                  </Text>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Receita Total"
                value={receitaTotal}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {margemLucro >= 0 ? (
                      <RiseOutlined style={{ color: '#3f8600' }} />
                    ) : (
                      <FallOutlined style={{ color: '#cf1322' }} />
                    )}
                    <Text 
                      type={margemLucro >= 0 ? 'success' : 'danger'} 
                      style={{ fontSize: 12 }}
                    >
                      {margemLucro.toFixed(1)}% margem
                    </Text>
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Cards Clicáveis */}
        <div>
          <Title level={3} style={{ marginBottom: 16 }}>
            Cards Clicáveis
          </Title>

          {/* Contratos */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                Contratos Ativos ({contratosAtivos.length})
              </Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/cadastro-contrato')}
              >
                Novo Contrato
              </Button>
            </div>
            
            <Row gutter={[16, 16]}>
              {(showAllContratos ? contratosAtivos : contratosAtivos.slice(0, 4)).map((contrato) => (
                <Col xs={24} sm={12} md={8} lg={6} key={contrato.id}>
                  {renderCard('contrato', contrato)}
                </Col>
              ))}
            </Row>
            
            {contratosAtivos.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => setShowAllContratos(!showAllContratos)}
                >
                  {showAllContratos ? 'Ver Menos' : `Ver Mais (${contratosAtivos.length - 4})`}
                </Button>
              </div>
            )}
          </Card>

          {/* Profissionais */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                Profissionais ({profissionais.length})
              </Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/cadastro-profissional')}
              >
                Novo Profissional
              </Button>
            </div>
            
            <Row gutter={[16, 16]}>
              {(showAllProfissionais ? profissionais : profissionais.slice(0, 4)).map((profissional) => (
                <Col xs={24} sm={12} md={8} lg={6} key={profissional.id}>
                  {renderCard('profissional', profissional)}
                </Col>
              ))}
            </Row>
            
            {profissionais.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => setShowAllProfissionais(!showAllProfissionais)}
                >
                  {showAllProfissionais ? 'Ver Menos' : `Ver Mais (${profissionais.length - 4})`}
                </Button>
              </div>
            )}
          </Card>

          {/* Clientes */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>
                Clientes ({clientes.length})
              </Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/clientes')}
              >
                Novo Cliente
              </Button>
            </div>
            
            <Row gutter={[16, 16]}>
              {(showAllClientes ? clientes : clientes.slice(0, 4)).map((cliente) => (
                <Col xs={24} sm={12} md={8} lg={6} key={cliente.id}>
                  {renderCard('cliente', cliente)}
                </Col>
              ))}
            </Row>
            
            {clientes.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => setShowAllClientes(!showAllClientes)}
                >
                  {showAllClientes ? 'Ver Menos' : `Ver Mais (${clientes.length - 4})`}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Alertas */}
        {contratosVencendo.length > 0 && (
          <Alert
            message="Contratos Vencendo"
            description={
              <div>
                <Text>{contratosVencendo.length} contrato(s) vence(m) nos próximos 30 dias:</Text>
                <div style={{ marginTop: 8 }}>
                  {contratosVencendo.slice(0, 3).map((contrato) => {
                    const profissional = contrato.profissionais?.[0]?.profissional
                    const cliente = clientes.find(c => c.id === contrato.clienteId)
                    const dataFim = contrato.dataFim ? new Date(contrato.dataFim) : null
                    const diasRestantes = dataFim ? Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : 0
                    
                    return (
                      <div key={contrato.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <WarningOutlined style={{ color: '#faad14' }} />
                        <Text>
                          {profissional?.nome} - {cliente?.empresa} (vence em {diasRestantes} dias)
                        </Text>
                      </div>
                    )
                  })}
                  {contratosVencendo.length > 3 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ... e mais {contratosVencendo.length - 3} contrato(s)
                    </Text>
                  )}
                </div>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Gráficos */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Evolução Mensal">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosEvolucao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="receita" stroke="#1890ff" name="Receita" />
                  <Line type="monotone" dataKey="custo" stroke="#52c41a" name="Custo" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Distribuição por Especialidade">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Space>

      {/* Modal de Detalhes */}
      <DetalhesModal
        open={modalOpen}
        onClose={handleCloseModal}
        type={modalType}
        data={modalData}
      />
    </div>
  )
}

export default Dashboard 