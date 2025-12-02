import React from 'react'
import { Typography, Row, Col, Card, Statistic, Spin, Alert, Table, Button, Space, Divider } from 'antd'
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  DollarOutlined,
  CalendarOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useData } from '../contexts/DataContext'
import { useNavigate } from 'react-router-dom'
import { 
  formatCurrency, 
  calcularValoresAgregados,
  calcularValorMensal,
  calcularCustoMensal
} from '../utils/formatters'

const { Title } = Typography

const ContratosNew = () => {
  const { contratos, loading, error } = useData()
  const navigate = useNavigate()

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

  // Calcular estatísticas
  const totalContratos = contratos.length
  const contratosAtivos = contratos.filter(c => c.status === 'ativo')
  const totalAtivos = contratosAtivos.length
  
  // Valor total dos contratos ativos
  const valorTotalAtivos = contratosAtivos.reduce((acc, c) => acc + (c.valorContrato || 0), 0)
  
  // Valor recebido mensalmente (receita líquida mensal)
  const { valoresMensais, impostosTotais, custosTotais } = calcularValoresAgregados(contratosAtivos)
  const valorRecebidoMensal = valoresMensais - impostosTotais
  
  // Calcular médias e totais para o rodapé
  const totalProjetos = contratos.length
  const somaValorMensal = contratos.reduce((acc, c) => acc + calcularValorMensal(c), 0)
  const somaCustoMensal = contratos.reduce((acc, c) => acc + calcularCustoMensal(c), 0)
  const somaValorTotal = contratos.reduce((acc, c) => acc + (c.valorContrato || 0), 0)
  
  const mediaValorMensal = totalProjetos > 0 ? somaValorMensal / totalProjetos : 0
  const mediaCustoMensal = totalProjetos > 0 ? somaCustoMensal / totalProjetos : 0
  const mediaValorTotal = totalProjetos > 0 ? somaValorTotal / totalProjetos : 0
  
  // Lucro total dos projetos ativos
  const receitaLiquidaAtivos = valoresMensais - impostosTotais
  const lucroTotalAtivos = receitaLiquidaAtivos - custosTotais

  // Colunas da tabela minimalista com color code
  const columns = [
    {
      title: 'Nome do Contrato',
      dataIndex: 'nomeProjeto',
      key: 'nomeProjeto',
      ellipsis: true,
      render: (text: string) => (
        <Typography.Text strong style={{ color: '#000' }}>
          {text}
        </Typography.Text>
      )
    },
    {
      title: 'Valor Mensal',
      key: 'valorMensal',
      align: 'right' as const,
      render: (record: any) => {
        const valorMensal = calcularValorMensal(record)
        return (
          <Typography.Text style={{ color: '#1890ff', fontWeight: 600 }}>
            {formatCurrency(valorMensal)}
          </Typography.Text>
        )
      }
    },
    {
      title: 'Custo Mensal',
      key: 'custoMensal',
      align: 'right' as const,
      render: (record: any) => {
        const custoMensal = calcularCustoMensal(record)
        return (
          <Typography.Text style={{ color: '#722ed1', fontWeight: 600 }}>
            {formatCurrency(custoMensal)}
          </Typography.Text>
        )
      }
    },
    {
      title: 'Valor Total',
      dataIndex: 'valorContrato',
      key: 'valorTotal',
      align: 'right' as const,
      render: (value: number, record: any) => {
        // Calcular margem para determinar cor
        const valorMensal = calcularValorMensal(record)
        const custoMensal = calcularCustoMensal(record)
        const margemMensal = valorMensal - custoMensal
        const color = margemMensal >= 0 ? '#52c41a' : '#ff4d4f'
        
        return (
          <Typography.Text style={{ color, fontWeight: 600 }}>
            {formatCurrency(value)}
          </Typography.Text>
        )
      }
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => navigate(`/cadastro-contrato?id=${record.id}`)}
          title="Editar contrato"
          style={{ color: '#1890ff' }}
        />
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <FileTextOutlined /> Contratos New
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/cadastro-contrato')}
          style={{
            height: 40,
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
            fontWeight: 500
          }}
        >
          Novo Contrato
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      {/* 
        Breakpoints:
        - Mobile (xs): < 576px → 1 card por linha (24/24)
        - Tablet (sm): 576px - 991px → 2 cards por linha (12/24 cada) - quebra em 2 linhas a partir de ~725px
        - Desktop (lg): >= 992px → 4 cards por linha (6/24 cada)
      */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Contratos"
              value={totalContratos}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Contratos Ativos"
              value={totalAtivos}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Valor Total dos Contratos Ativos"
              value={valorTotalAtivos}
              prefix={<DollarOutlined />}
              precision={0}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Valor Recebido Mensalmente"
              value={valorRecebidoMensal}
              prefix={<CalendarOutlined />}
              precision={0}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Lista de Contratos - Minimalista com Color Code */}
      <Card 
        style={{ 
          marginTop: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Table
          columns={columns}
          dataSource={contratos}
          rowKey="id"
          pagination={false}
          size="middle"
          onRow={(record) => {
            return {
              onClick: () => {
                navigate(`/cadastro-contrato?id=${record.id}`)
              },
              style: {
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              },
              onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)'
              },
              onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => {
                const statusBgColors: Record<string, string> = {
                  ativo: 'rgba(82, 196, 26, 0.05)',
                  encerrado: 'rgba(140, 140, 140, 0.05)',
                  pendente: 'rgba(250, 173, 20, 0.05)'
                }
                e.currentTarget.style.backgroundColor = statusBgColors[record.status] || ''
              }
            }
          }}
          rowClassName={(record) => {
            // Adicionar cor de fundo sutil baseada no status
            const statusBgColors: Record<string, string> = {
              ativo: 'rgba(82, 196, 26, 0.05)',
              encerrado: 'rgba(140, 140, 140, 0.05)',
              pendente: 'rgba(250, 173, 20, 0.05)'
            }
            return statusBgColors[record.status] || ''
          }}
        />
        
        {/* Rodapé com Médias e Totais */}
        <Divider style={{ margin: '24px 0 16px 0' }} />
        <Row gutter={[16, 16]} style={{ padding: '16px 0' }}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Média de Projetos
              </Typography.Text>
              <div>
                <Typography.Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {totalProjetos.toFixed(0)}
                </Typography.Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Média Valor Mensal
              </Typography.Text>
              <div>
                <Typography.Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {formatCurrency(mediaValorMensal)}
                </Typography.Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Média Custo Mensal
              </Typography.Text>
              <div>
                <Typography.Text strong style={{ fontSize: 18, color: '#722ed1' }}>
                  {formatCurrency(mediaCustoMensal)}
                </Typography.Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Média Valor Total
              </Typography.Text>
              <div>
                <Typography.Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {formatCurrency(mediaValorTotal)}
                </Typography.Text>
              </div>
            </div>
          </Col>
        </Row>
        
        <Divider style={{ margin: '16px 0' }} />
        
        {/* Lucro Total dos Projetos Ativos */}
        <Row>
          <Col span={24}>
            <div style={{ 
              textAlign: 'center',
              padding: '16px',
              backgroundColor: lucroTotalAtivos >= 0 ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
              borderRadius: 8
            }}>
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                Lucro Total dos Projetos Ativos
              </Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Typography.Text 
                  strong 
                  style={{ 
                    fontSize: 24, 
                    color: lucroTotalAtivos >= 0 ? '#52c41a' : '#ff4d4f' 
                  }}
                >
                  {formatCurrency(lucroTotalAtivos)}/mês
                </Typography.Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default ContratosNew
