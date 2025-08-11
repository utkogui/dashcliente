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
  UserOutlined, 
  EditOutlined
} from '@ant-design/icons'
import { useData } from '../contexts/DataContext'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { Search } = Input

const Profissionais = () => {
  const { profissionais, deleteProfissional, loading, error } = useData()
  const navigate = useNavigate()
  const [filteredProfissionais, setFilteredProfissionais] = useState(profissionais)

  // Atualizar lista filtrada quando profissionais mudar
  useEffect(() => {
    setFilteredProfissionais(profissionais)
  }, [profissionais])

  const handleSearch = (value: string) => {
    const filtered = profissionais.filter(
      p => p.nome.toLowerCase().includes(value.toLowerCase()) ||
           p.especialidade.toLowerCase().includes(value.toLowerCase()) ||
           p.email.toLowerCase().includes(value.toLowerCase()) ||
           p.tipoContrato.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredProfissionais(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'success'
      case 'ferias': return 'warning'
      case 'inativo': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'ferias': return 'Férias'
      case 'inativo': return 'Inativo'
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

  const handleAddProfissional = () => {
    navigate('/cadastro-profissional')
  }

  const handleEdit = (id: string) => {
    navigate(`/editar-profissional/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProfissional(id)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar profissional'
      alert(errorMessage)
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string, record: any) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <UserOutlined />
            <Text strong>{record.nome}</Text>
          </Space>
          <Text copyable style={{ fontSize: '11px', color: '#666', marginLeft: 16 }}>
            {record.email}
          </Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.nome.localeCompare(b.nome),
      width: 220,
    },
    {
      title: 'Especialidade',
      dataIndex: 'especialidade',
      key: 'especialidade',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
      filters: [
        { text: 'Frontend', value: 'Frontend' },
        { text: 'Backend', value: 'Backend' },
        { text: 'Full Stack', value: 'Full Stack' },
        { text: 'DevOps', value: 'DevOps' },
        { text: 'QA', value: 'QA' },
        { text: 'UX/UI', value: 'UX/UI' },
        { text: 'UX Writer', value: 'UX Writer' },
        { text: 'Service Designer', value: 'Service Designer' },
        { text: 'Pesquisador', value: 'Pesquisador' },
        { text: 'Content Ops', value: 'Content Ops' },
      ],
      onFilter: (value: string | number | boolean, record: any) => record.especialidade === value,
      width: 120,
    },
    {
      title: 'Contrato & Valor',
      key: 'contratoValor',
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <Tag color={getTipoContratoColor(record.tipoContrato)}>
            {getTipoContratoText(record.tipoContrato)}
          </Tag>
          <Text style={{ fontSize: '12px' }}>
            {record.tipoContrato === 'hora' 
              ? `R$ ${record.valorHora?.toLocaleString('pt-BR') || '0'}/h`
              : `R$ ${record.valorFechado?.toLocaleString('pt-BR') || '0'}`
            }
          </Text>
        </Space>
      ),
      sorter: (a: any, b: any) => {
        const valorA = a.tipoContrato === 'hora' ? (a.valorHora || 0) : (a.valorFechado || 0)
        const valorB = b.tipoContrato === 'hora' ? (b.valorHora || 0) : (b.valorFechado || 0)
        return valorA - valorB
      },
      width: 140,
    },
    {
      title: 'Início',
      dataIndex: 'dataInicio',
      key: 'dataInicio',
      render: (text: string) => (
        <Text style={{ fontSize: '12px' }}>
          {new Date(text).toLocaleDateString('pt-BR')}
        </Text>
      ),
      sorter: (a: any, b: any) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime(),
      width: 100,
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
        { text: 'Férias', value: 'ferias' },
        { text: 'Inativo', value: 'inativo' },
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
            onClick={() => handleEdit(record.id)}
            title="Editar"
          />
          <Popconfirm
            title="Excluir profissional"
            description="Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita."
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

  const profissionaisAtivos = profissionais.filter(p => p.status === 'ativo')
  const profissionaisFerias = profissionais.filter(p => p.status === 'ferias')
  const profissionaisInativos = profissionais.filter(p => p.status === 'inativo')

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            Profissionais
          </Title>
          <Text type="secondary">
            Gerencie seus profissionais e suas informações
          </Text>
        </div>

        {/* Estatísticas */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total"
                value={profissionais.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ativos"
                value={profissionaisAtivos.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Férias"
                value={profissionaisFerias.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Inativos"
                value={profissionaisInativos.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabela */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Search
              placeholder="Buscar profissionais..."
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
              onClick={handleAddProfissional}
            >
              Novo Profissional
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredProfissionais}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} profissionais`,
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

export default Profissionais 