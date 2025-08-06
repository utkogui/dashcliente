import React, { useState, useEffect } from 'react'
import {
  Typography,
  Table,
  Button,
  Input,
  Tag,
  Space,
  Card,
  Alert,
  Spin,
  Popconfirm,
  Row,
  Col,
  Statistic
} from 'antd'
import { 
  SearchOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  FileTextOutlined, 
  EditOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useData } from '../contexts/DataContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const { Title, Text } = Typography
const { Search } = Input

// Tipos
interface Contrato {
  id: string
  nomeProjeto: string
  clienteId: string
  dataInicio: string
  dataFim: string | null
  tipoContrato: 'hora' | 'fechado'
  valorContrato: number
  valorImpostos: number
  status: 'ativo' | 'encerrado' | 'pendente'
  observacoes?: string
  profissionais: ContratoProfissional[]
  cliente: Cliente
}

interface ContratoProfissional {
  id: string
  contratoId: string
  profissionalId: string
  valorHora: number | null
  horasMensais: number | null
  valorFechado: number | null
  periodoFechado: string | null
  profissional: Profissional
}

const Contratos = () => {
  const navigate = useNavigate()
  const { contratos, deleteContrato, loading, error } = useData()
  const [filteredContratos, setFilteredContratos] = useState(contratos)

  // Atualizar lista filtrada quando contratos mudar
  useEffect(() => {
    setFilteredContratos(contratos)
  }, [contratos])

  const handleSearch = (value: string) => {
    const filtered = contratos.filter(c => {
      return (
        c.nomeProjeto.toLowerCase().includes(value.toLowerCase()) ||
        c.cliente?.nome.toLowerCase().includes(value.toLowerCase()) ||
        c.cliente?.empresa.toLowerCase().includes(value.toLowerCase()) ||
        c.observacoes?.toLowerCase().includes(value.toLowerCase()) ||
        c.tipoContrato.toLowerCase().includes(value.toLowerCase()) ||
        c.profissionais?.some(p => 
          p.profissional.nome.toLowerCase().includes(value.toLowerCase()) ||
          p.profissional.especialidade.toLowerCase().includes(value.toLowerCase())
        )
      )
    })
    setFilteredContratos(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success'
      case 'pendente': return 'warning'
      case 'encerrado': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'pendente': return 'Pendente'
      case 'encerrado': return 'Encerrado'
      default: return status
    }
  }

  const getTipoContratoColor = (tipo: string) => {
    switch (tipo) {
      case 'hora': return 'blue'
      case 'fechado': return 'green'
      default: return 'default'
    }
  }

  const getTipoContratoText = (tipo: string) => {
    switch (tipo) {
      case 'hora': return 'Por Hora'
      case 'fechado': return 'Valor Fechado'
      default: return tipo
    }
  }

  const handleOpen = (contrato?: Contrato) => {
    // Para edição, redirecionar para a página de cadastro
    if (contrato) {
      navigate(`/cadastro-contrato?id=${contrato.id}`)
    } else {
      navigate('/cadastro-contrato')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContrato(id)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar contrato'
      alert(errorMessage)
    }
  }

  const columns = [
    {
      title: 'Projeto',
      dataIndex: 'nomeProjeto',
      key: 'nomeProjeto',
      render: (text: string) => (
        <Space>
          <FileTextOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.nomeProjeto.localeCompare(b.nomeProjeto),
      width: 200,
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (record: any) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <TeamOutlined />
            <Text strong>{record.cliente?.empresa}</Text>
          </Space>
          <Text style={{ fontSize: '11px', color: '#666', marginLeft: 16 }}>
            {record.cliente?.nome}
          </Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.cliente?.empresa.localeCompare(b.cliente?.empresa),
      width: 200,
    },
    {
      title: 'Período',
      key: 'periodo',
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <Space>
            <CalendarOutlined />
            <Text style={{ fontSize: '12px' }}>
              {format(new Date(record.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
            </Text>
          </Space>
          <Text style={{ fontSize: '11px', color: '#666' }}>
            {record.dataFim ? `até ${format(new Date(record.dataFim), 'dd/MM/yyyy', { locale: ptBR })}` : 'Indeterminado'}
          </Text>
        </Space>
      ),
      sorter: (a: any, b: any) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime(),
      width: 140,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipoContrato',
      key: 'tipoContrato',
      render: (text: string) => (
        <Tag color={getTipoContratoColor(text)}>
          {getTipoContratoText(text)}
        </Tag>
      ),
      filters: [
        { text: 'Por Hora', value: 'hora' },
        { text: 'Valor Fechado', value: 'fechado' },
      ],
      onFilter: (value: string | number | boolean, record: any) => record.tipoContrato === value,
      width: 120,
    },
    {
      title: 'Valor',
      key: 'valor',
      render: (record: any) => {
        // Para contratos indeterminados, mostrar apenas valor mensal
        const valorMensal = record.dataFim ? record.valorContrato : (record.valorContrato / 12)
        const impostosMensais = record.dataFim ? record.valorImpostos : (record.valorImpostos / 12)
        
        return (
          <Space direction="vertical" size="small">
            <Space>
              <DollarOutlined />
              <Text strong style={{ color: '#52c41a' }}>
                R$ {valorMensal?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
              </Text>
            </Space>
            <Text style={{ fontSize: '11px', color: '#faad14', whiteSpace: 'nowrap', overflow: 'visible' }}>
              Impostos: R$ {impostosMensais?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </Text>
          </Space>
        )
      },
      sorter: (a: any, b: any) => (a.valorContrato || 0) - (b.valorContrato || 0),
      width: 180,
    },
    {
      title: 'Profissionais',
      key: 'profissionais',
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ color: '#1890ff' }}>
            {record.profissionais?.length || 0} profissional(is)
          </Text>
          <Text style={{ fontSize: '11px', color: '#666' }}>
            {record.profissionais?.map((p: any) => p.profissional.nome).join(', ') || 'Nenhum'}
          </Text>
        </Space>
      ),
      width: 160,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <Tag color={getStatusColor(text)}>
          {getStatusText(text)}
        </Tag>
      ),
      filters: [
        { text: 'Ativo', value: 'ativo' },
        { text: 'Pendente', value: 'pendente' },
        { text: 'Encerrado', value: 'encerrado' },
      ],
      onFilter: (value: string | number | boolean, record: any) => record.status === value,
      width: 100,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: any) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpen(record)}
            title="Editar"
          />
          <Popconfirm
            title="Excluir contrato"
            description="Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita."
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
            okType="danger"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
              title="Excluir"
            />
          </Popconfirm>
        </Space>
      ),
      width: 80,
      fixed: 'right',
    },
  ]

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

  const contratosAtivos = contratos.filter(c => c.status === 'ativo')
  const contratosPendentes = contratos.filter(c => c.status === 'pendente')
  const contratosEncerrados = contratos.filter(c => c.status === 'encerrado')

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            Contratos
          </Title>
          <Text type="secondary">
            Gerencie seus contratos e projetos
          </Text>
        </div>

        {/* Estatísticas */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total"
                value={contratos.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ativos"
                value={contratosAtivos.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pendentes"
                value={contratosPendentes.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Encerrados"
                value={contratosEncerrados.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabela */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Search
              placeholder="Buscar por projeto, cliente, profissionais..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              style={{ width: 400 }}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/cadastro-contrato')}
            >
              Novo Contrato
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredContratos}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} contratos`,
              pageSizeOptions: ['10', '20', '50', '100'],
              defaultPageSize: 20,
            }}
            size="small"
          />
        </Card>
      </Space>
    </div>
  )
}

export default Contratos 