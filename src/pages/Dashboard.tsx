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
  Tag,
  List,
  Pagination
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
  PlusOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { useData } from '../contexts/DataContext'
import { useNavigate } from 'react-router-dom'
import DetalhesModal from '../components/DetalhesModal'
import { 
  calcularValoresAgregados, 
  getCardStyle, 
  getStatusBadgeColor, 
  calcularDiasRestantes,
  calcularValorMensal,
  calcularMargemMensal,
  calcularPercentualMargem
} from '../utils/formatters'
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
  // Removido controle de encerrados da primeira dobra
  // Lista paginada substitui o botão "ver mais" para profissionais
  const [showAllClientes, setShowAllClientes] = useState(false)
  const [profPage, setProfPage] = useState(1)
  const pageSize = 10
  const CARD_HEIGHT = 240

  // Função para exportar dados para Excel
  const exportToExcel = () => {
    // Preparar dados dos profissionais
    const profissionaisData = profissionais.map(p => ({
      'Nome': p.nome,
      'Email': p.email,
      'Especialidade': p.especialidade,
      'Tipo de Contrato': p.tipoContrato === 'hora' ? 'Por Hora' : 'Valor Fechado',
      'Valor/Hora': p.tipoContrato === 'hora' ? p.valorHora : '-',
      'Valor Fechado': p.tipoContrato === 'fechado' ? p.valorFechado : '-',
      'Data de Início': p.dataInicio ? new Date(p.dataInicio).toLocaleDateString('pt-BR') : '-',
      'Status': p.status
    }))

    // Preparar dados dos clientes
    const clientesData = clientes.map(c => ({
      'Empresa': c.empresa,
      'Email': c.email,
      'Telefone': c.telefone || '-',
      'Endereço': c.endereco || '-',
      'Contratos Ativos': contratos.filter(contrato => contrato.clienteId === c.id && contrato.status === 'ativo').length
    }))

    // Preparar dados dos contratos
    const contratosData = contratos.map(c => {
      const valorMensal = !c.dataFim ? (c.valorContrato / 12) : c.valorContrato
      const impostosMensais = !c.dataFim ? (c.valorImpostos / 12) : c.valorImpostos
      
      return {
        'Projeto': c.nomeProjeto,
        'Cliente': clientes.find(cli => cli.id === c.clienteId)?.empresa || '-',
        'Status': c.status,
        'Data Início': c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR') : '-',
        'Data Fim': c.dataFim ? new Date(c.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado',
        'Valor Contrato': c.valorContrato,
        'Valor Mensal': valorMensal,
        'Impostos': c.valorImpostos,
        'Impostos Mensais': impostosMensais,
        'Valor Líquido': c.valorContrato - c.valorImpostos,
        'Profissionais': c.profissionais?.length || 0,
        'Tipo': !c.dataFim ? 'Indeterminado' : 'Determinado'
      }
    })

    // Criar workbook com múltiplas abas
    const workbook = XLSX.utils.book_new()
    
    // Adicionar abas
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(profissionaisData), 'Profissionais')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(clientesData), 'Clientes')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(contratosData), 'Contratos')

    // Gerar e baixar arquivo
    const fileName = `dashboard_export_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

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
  const contratosEncerrados = contratos.filter(c => c.status === 'encerrado')
  
  // Filtrar contratos ativos que não estão encerrados para cálculos
  const contratosParaCalculo = contratos.filter(c => c.status === 'ativo')
  
  // Calcular valores usando as funções utilitárias
  const { valoresMensais, valoresTotais, custosTotais, impostosTotais } = calcularValoresAgregados(contratosParaCalculo)
  
  const receitaLiquida = valoresMensais - impostosTotais
  const lucroTotal = receitaLiquida - custosTotais
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

    // Aplicar estilos especiais para contratos
    const cardStyle = isContrato ? getCardStyle(data) : {}
    const statusColor = isContrato ? getStatusBadgeColor(data) : undefined

    // Calcular margem para contratos
    const margemMensal = isContrato ? calcularMargemMensal(data) : 0
    const percentualMargem = isContrato ? calcularPercentualMargem(data) : 0

    return (
      <Card
        key={data.id}
        hoverable
        style={{ 
          cursor: 'pointer', 
          height: `${CARD_HEIGHT}px`, // Altura fixa e igual para todos os cards
          display: 'flex',
          flexDirection: 'column',
          ...cardStyle 
        }}
        onClick={() => handleCardClick(type, data)}
        styles={{
          body: {
            padding: 16,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
                <Text strong style={{ fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {isContrato ? data.nomeProjeto : isProfissional ? data.nome : data.empresa}
                </Text>
                {isContrato && statusColor && (
                  <div 
                    style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: statusColor,
                      boxShadow: `0 0 4px ${statusColor}40`,
                      marginLeft: '10px'
                    }} 
                  />
                )}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {isContrato ? data.cliente?.empresa : isProfissional ? data.especialidade : data.contato}
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <Tag color={isContrato ? 'blue' : isProfissional ? 'green' : 'orange'}>
                {isContrato ? data.status : isProfissional ? data.tipoContrato : 'Cliente'}
              </Tag>
            </div>
          </div>
          
          {isContrato && (
            <>
              {/* Informações principais do contrato */}
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text strong style={{ fontSize: 16 }}>
                      R$ {calcularValorMensal(data)?.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0 
                      }) || '0'}
                    </Text>
                    {!data.dataFim && (
                      <Text type="secondary" style={{ fontSize: 12 }}>/mês</Text>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {data.profissionais?.length || 0} prof.
                    </Text>
                    {data.dataFim && (
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {(() => {
                          const diasRestantes = calcularDiasRestantes(data)
                          if (diasRestantes === null) return ''
                          if (diasRestantes > 0) return `${diasRestantes} dias`
                          return 'Vencido'
                        })()}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Margem do Projeto */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Margem</Text>
                  <Text strong style={{ 
                    fontSize: 16, 
                    color: margemMensal >= 0 ? '#52c41a' : '#cf1322' 
                  }}>
                    R$ {margemMensal?.toLocaleString('pt-BR', { 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 0 
                    }) || '0'}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Text style={{ 
                    fontSize: 12, 
                    color: percentualMargem >= 0 ? '#52c41a' : '#cf1322',
                    fontWeight: 'bold'
                  }}>
                    {percentualMargem?.toFixed(1) || '0'}% de margem
                  </Text>
                </div>
              </div>
            </>
          )}

          {isProfissional && (
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {data.tipoContrato === 'hora' ? 'Valor/Hora' : 'Valor Fechado'}
                </Text>
                <Text strong style={{ fontSize: 16 }}>
                  R$ {data.tipoContrato === 'hora' 
                    ? (data.valorHora?.toLocaleString('pt-BR') || '0')
                    : (data.valorFechado?.toLocaleString('pt-BR') || '0')
                  }
                </Text>
              </div>
            </div>
          )}

          {isCliente && (
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Contratos Ativos</Text>
                <Text strong style={{ fontSize: 16 }}>
                  {contratos.filter(c => c.clienteId === data.id && c.status === 'ativo').length}
                </Text>
              </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
              Dashboard
            </Title>
            <Text type="secondary">
              Visão geral dos seus profissionais, clientes e contratos
            </Text>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
            size="large"
          >
            Exportar Excel
          </Button>
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
          
          {/* Removido card de Contratos Encerrados da primeira dobra */}
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Valor Total"
                value={valoresTotais}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Novas estatísticas detalhadas */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Valor Mensal"
                value={valoresMensais}
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
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Custo Total"
                value={custosTotais}
                precision={0}
                valueStyle={{ color: '#faad14' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Impostos Totais"
                value={impostosTotais}
                precision={0}
                valueStyle={{ color: '#f5222d' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Lucro Total"
                value={lucroTotal}
                precision={0}
                valueStyle={{ color: lucroTotal >= 0 ? '#52c41a' : '#cf1322' }}
                prefix={<DollarOutlined />}
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
            
            {/* Encerrados não exibidos nesta seção */}
            
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

          {/* Profissionais - substituído por lista paginada */}
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

            <List
              grid={{ gutter: 12, column: 2, xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
              itemLayout="horizontal"
              dataSource={profissionais
                .slice()
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .slice((profPage - 1) * pageSize, profPage * pageSize)
              }
              renderItem={(item: any) => {
                const ocupado = contratos.some(c => c.status === 'ativo' && c.profissionais.some(p => p.profissionalId === item.id))
                const cor = ocupado ? '#22c55e' : '#ef4444'
                return (
                  <List.Item onClick={() => handleCardClick('profissional', item)} style={{ cursor: 'pointer' }}>
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: cor, boxShadow: `0 0 0 3px ${ocupado ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)'}` }} />
                          <span style={{ fontWeight: 600 }}>{item.nome}</span>
                        </div>
                      }
                      description={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: '#6b7280' }}>{item.especialidade}</span>
                          <span style={{ color: '#111827', fontWeight: 600 }}>
                            {item.tipoContrato === 'hora' ? `R$ ${(item.valorHora || 0).toLocaleString('pt-BR')} /h` : `R$ ${(item.valorFechado || 0).toLocaleString('pt-BR')} /mês`}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pagination
                current={profPage}
                pageSize={pageSize}
                total={profissionais.length}
                onChange={(p) => setProfPage(p)}
                showSizeChanger={false}
              />
            </div>
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
                    {dadosPie.map((_, index) => (
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