import React from 'react'
import {
  Modal,
  Button,
  Typography,
  Row,
  Col,
  Tag,
  Table,
  Space,
  Card,
  Descriptions,
  Statistic
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
// cálculos mensais removidos conforme solicitado
import * as XLSX from 'xlsx'

const { Title, Text } = Typography

interface ProfissionalData {
  id: string
  nome: string
  email: string
  especialidade: string
  valorHora: number | null
  status: 'ativo' | 'inativo' | 'ferias'
  dataInicio: string
  tipoContrato: 'hora' | 'fechado'
  valorFechado: number | null
  periodoFechado: string | null
  valorPago: number
}

interface ClienteData {
  id: string
  nome: string
  empresa: string
  email: string
  telefone?: string
  endereco?: string
  anoInicio: number
  segmento: string
  tamanho: string
}

interface ContratoData {
  id: string
  nomeProjeto: string
  codigoContrato?: string
  clienteId: string
  dataInicio: string
  dataFim: string | null
  tipoContrato: 'hora' | 'fechado'
  valorContrato: number
  valorImpostos: number
  status: 'ativo' | 'encerrado' | 'pendente'
  observacoes?: string
  profissionais: Array<{
    id: string
    profissionalId: string
    valorHora: number | null
    horasMensais: number | null
    valorFechado: number | null
    periodoFechado: string | null
    profissional: ProfissionalData
  }>
  cliente: ClienteData
}

interface DetalhesModalProps {
  open: boolean
  onClose: () => void
  type: 'profissional' | 'cliente' | 'contrato'
  data: ProfissionalData | ClienteData | ContratoData | null
}

const DetalhesModal: React.FC<DetalhesModalProps> = ({
  open,
  onClose,
  type,
  data,
}) => {
  // Função para exportar detalhes do contrato para Excel
  const exportContratoToExcel = () => {
    if (!data || type !== 'contrato') return
    
    const contrato = data as ContratoData
    
    // Dados do contrato
    const contratoData = [{
      'Projeto': contrato.nomeProjeto,
      'Código do Contrato': contrato.codigoContrato || '-',
      'Cliente': contrato.cliente.empresa,
      'Status': getStatusText(contrato.status),
      'Data Início': new Date(contrato.dataInicio).toLocaleDateString('pt-BR'),
      'Data Fim': contrato.dataFim ? new Date(contrato.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado',
      'Valor Contrato': contrato.valorContrato,
      'Impostos': contrato.valorImpostos,
      'Valor Líquido': contrato.valorContrato - contrato.valorImpostos,
      'Observações': contrato.observacoes || '-'
    }]

    // Dados dos profissionais
    const profissionaisData = contrato.profissionais.map(p => ({
      'Nome': p.profissional.nome,
      'Email': p.profissional.email,
      'Especialidade': p.profissional.especialidade,
      'Tipo de Contrato': getTipoContratoText(p.profissional.tipoContrato),
      'Valor/Hora': p.profissional.tipoContrato === 'hora' ? p.valorHora : '-',
      'Horas Mensais': p.profissional.tipoContrato === 'hora' ? p.horasMensais : '-',
      'Valor Fechado': p.profissional.tipoContrato === 'fechado' ? p.valorFechado : '-',
      'Período': p.profissional.tipoContrato === 'fechado' ? p.periodoFechado : '-',
      'Valor Mensal': p.profissional.tipoContrato === 'hora' ? 
        (p.valorHora || 0) * (p.horasMensais || 0) : 
        (p.valorFechado || 0)
    }))

    // Dados do cliente
    const clienteData = [{
      'Empresa': contrato.cliente.empresa,
      'Nome': contrato.cliente.nome,
      'Email': contrato.cliente.email,
      'Telefone': contrato.cliente.telefone || '-',
      'Endereço': contrato.cliente.endereco || '-',
      'Ano de Início': contrato.cliente.anoInicio,
      'Segmento': contrato.cliente.segmento,
      'Tamanho': contrato.cliente.tamanho
    }]

    // Criar workbook
    const workbook = XLSX.utils.book_new()
    
    // Adicionar abas
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(contratoData), 'Contrato')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(profissionaisData), 'Profissionais')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(clienteData), 'Cliente')

    // Gerar e baixar arquivo
    const fileName = `contrato_${contrato.nomeProjeto.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'success'
      case 'inativo':
        return 'default'
      case 'ferias':
        return 'warning'
      case 'encerrado':
        return 'error'
      case 'pendente':
        return 'processing'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo'
      case 'inativo':
        return 'Inativo'
      case 'ferias':
        return 'Férias'
      case 'encerrado':
        return 'Encerrado'
      case 'pendente':
        return 'Pendente'
      default:
        return status
    }
  }

  const getTipoContratoColor = (tipo: string) => {
    switch (tipo) {
      case 'hora':
        return 'blue'
      case 'fechado':
        return 'green'
      default:
        return 'default'
    }
  }

  const getTipoContratoText = (tipo: string) => {
    switch (tipo) {
      case 'hora':
        return 'Por Hora'
      case 'fechado':
        return 'Valor Fechado'
      default:
        return tipo
    }
  }

  const renderProfissionalDetalhes = () => {
    if (!data || type !== 'profissional') return null
    const profissional = data as ProfissionalData

    return (
      <div>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card>
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <UserOutlined style={{ fontSize: 32, color: 'white' }} />
                  </div>
                </Col>
                <Col flex="1">
                  <Title level={3} style={{ margin: 0 }}>
                    {profissional.nome}
                  </Title>
                  <Space>
                    <Tag color={getStatusColor(profissional.status)}>
                      {getStatusText(profissional.status)}
                    </Tag>
                    <Tag color={getTipoContratoColor(profissional.tipoContrato)}>
                      {getTipoContratoText(profissional.tipoContrato)}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Informações Pessoais">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {profissional.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Especialidade">
                  {profissional.especialidade}
                </Descriptions.Item>
                <Descriptions.Item label="Data de Início">
                  <Space>
                    <ClockCircleOutlined />
                    {new Date(profissional.dataInicio).toLocaleDateString('pt-BR')}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Informações Financeiras">
              <Space direction="vertical" style={{ width: '100%' }}>
                {profissional.tipoContrato === 'hora' ? (
                  <Statistic
                    title="Valor por Hora"
                    value={Number(profissional.valorHora) || 0}
                    precision={2}
                    prefix="R$"
                    valueStyle={{ color: '#3f8600' }}
                  />
                ) : (
                  <Statistic
                    title="Valor Fechado"
                    value={Number(profissional.valorFechado) || 0}
                    precision={2}
                    prefix="R$"
                    valueStyle={{ color: '#3f8600' }}
                  />
                )}
                {profissional.tipoContrato === 'fechado' && profissional.periodoFechado && (
                  <Text type="secondary">
                    Período: {profissional.periodoFechado}
                  </Text>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderClienteDetalhes = () => {
    if (!data || type !== 'cliente') return null
    const cliente = data as ClienteData

    return (
      <div>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card>
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    background: '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TeamOutlined style={{ fontSize: 32, color: 'white' }} />
                  </div>
                </Col>
                <Col flex="1">
                  <Title level={3} style={{ margin: 0 }}>
                    {cliente.empresa}
                  </Title>
                  <Text type="secondary">{cliente.nome}</Text>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Informações de Contato">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {cliente.email}
                  </Space>
                </Descriptions.Item>
                {cliente.telefone && (
                  <Descriptions.Item label="Telefone">
                    <Space>
                      <PhoneOutlined />
                      {cliente.telefone}
                    </Space>
                  </Descriptions.Item>
                )}
                {cliente.endereco && (
                  <Descriptions.Item label="Endereço">
                    <Space>
                      <EnvironmentOutlined />
                      {cliente.endereco}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Informações da Empresa">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Ano de Início">
                  {cliente.anoInicio}
                </Descriptions.Item>
                <Descriptions.Item label="Segmento">
                  {cliente.segmento}
                </Descriptions.Item>
                <Descriptions.Item label="Tamanho">
                  {cliente.tamanho}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderContratoDetalhes = () => {
    if (!data || type !== 'contrato') return null
    const contrato = data as ContratoData

    const profissionaisColumns = [
      {
        title: 'Profissional',
        dataIndex: 'profissional',
        key: 'profissional',
        render: (profissional: ProfissionalData) => (
          <Space>
            <UserOutlined />
            {profissional.nome}
          </Space>
        ),
      },
      {
        title: 'Especialidade',
        dataIndex: 'profissional',
        key: 'especialidade',
        render: (profissional: ProfissionalData) => profissional.especialidade,
      },
      {
        title: 'Tipo',
        dataIndex: 'profissional',
        key: 'tipo',
        render: (profissional: ProfissionalData) => (
          <Tag color={getTipoContratoColor(profissional.tipoContrato)}>
            {getTipoContratoText(profissional.tipoContrato)}
          </Tag>
        ),
      },
      {
        title: 'Valor',
        dataIndex: 'valorHora',
        key: 'valor',
        render: (valorHora: number | null, record: any) => {
          if (record.profissional.tipoContrato === 'hora') {
            return `R$ ${valorHora?.toLocaleString('pt-BR') || '0'}/hora`
          } else {
            return `R$ ${record.valorFechado?.toLocaleString('pt-BR') || '0'}`
          }
        },
      },
    ]

    return (
      <div>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card>
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    background: '#722ed1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileTextOutlined style={{ fontSize: 32, color: 'white' }} />
                  </div>
                </Col>
                <Col flex="1">
                  <Title level={3} style={{ margin: 0 }}>
                    {contrato.nomeProjeto}
                  </Title>
                  <Space>
                    <Tag color={getStatusColor(contrato.status)}>
                      {getStatusText(contrato.status)}
                    </Tag>
                    <Text type="secondary">
                      Cliente: {contrato.cliente.empresa}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Informações do Projeto">
              <Descriptions column={1} size="small">
                {contrato.codigoContrato && (
                  <Descriptions.Item label="Código do Contrato">
                    <Text strong style={{ color: '#1890ff' }}>
                      {contrato.codigoContrato}
                    </Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Data de Início">
                  <Space>
                    <ClockCircleOutlined />
                    {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Data de Fim">
                  <Space>
                    <ClockCircleOutlined />
                    {contrato.dataFim 
                      ? new Date(contrato.dataFim).toLocaleDateString('pt-BR')
                      : 'Indeterminado'
                    }
                  </Space>
                </Descriptions.Item>
                {contrato.observacoes && (
                  <Descriptions.Item label="Observações">
                    {contrato.observacoes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Informações Financeiras">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Valor do Contrato"
                  value={Number(contrato.valorContrato) || 0}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: '#3f8600' }}
                />
                <Statistic
                  title="Impostos"
                  value={Number(contrato.valorImpostos) || 0}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: '#cf1322' }}
                />
                <Statistic
                  title="Valor Líquido"
                  value={(Number(contrato.valorContrato) || 0) - (Number(contrato.valorImpostos) || 0)}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Space>
            </Card>
          </Col>

          <Col span={24}>
            <Card title={`Profissionais (${contrato.profissionais.length})`}>
              <Table
                columns={profissionaisColumns}
                dataSource={contrato.profissionais}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderDetalhes = () => {
    switch (type) {
      case 'profissional':
        return renderProfissionalDetalhes()
      case 'cliente':
        return renderClienteDetalhes()
      case 'contrato':
        return renderContratoDetalhes()
      default:
        return null
    }
  }

  const getModalTitle = () => {
    switch (type) {
      case 'profissional':
        return 'Detalhes do Profissional'
      case 'cliente':
        return 'Detalhes do Cliente'
      case 'contrato':
        return 'Detalhes do Contrato'
      default:
        return 'Detalhes'
    }
  }

  return (
    <Modal
      title={getModalTitle()}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>,
        ...(type === 'contrato' ? [
          <Button 
            key="export" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={exportContratoToExcel}
          >
            Exportar Excel
          </Button>
        ] : [])
      ]}
      width={800}
      style={{ top: 20 }}
    >
      {renderDetalhes()}
    </Modal>
  )
}

export default DetalhesModal 