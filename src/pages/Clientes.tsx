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
  Statistic,
  Modal,
  Form,
  Select,
  DatePicker
} from 'antd'
import { 
  SearchOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  TeamOutlined, 
  EditOutlined,
  DollarOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { useData } from '../contexts/DataContext'
import { formatCurrency, calcularValoresAgregados } from '../utils/formatters'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

const Clientes = () => {
  const { clientes, contratos, addCliente, updateCliente, deleteCliente, loading, error } = useData()
  const [filteredClientes, setFilteredClientes] = useState(clientes)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCliente, setEditingCliente] = useState<any>(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  // Opções para os dropdowns
  const segmentos = [
    'Tecnologia',
    'Saúde',
    'Educação',
    'Financeiro',
    'Varejo',
    'Indústria',
    'Serviços',
    'Outros'
  ]

  const tamanhos = ['Pequena', 'Média', 'Grande']

  // Atualizar lista filtrada quando clientes mudar
  useEffect(() => {
    setFilteredClientes(clientes)
  }, [clientes])

  const handleSearch = (value: string) => {
    const filtered = clientes.filter(
      c => c.nome.toLowerCase().includes(value.toLowerCase()) ||
           c.empresa.toLowerCase().includes(value.toLowerCase()) ||
           c.email.toLowerCase().includes(value.toLowerCase()) ||
           c.segmento.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredClientes(filtered)
  }

  const getContratosAtivos = (clienteId: string) => {
    return contratos.filter(c => c.clienteId === clienteId && c.status === 'ativo').length
  }

  const getValorTotalContratos = (clienteId: string) => {
    return contratos
      .filter(c => c.clienteId === clienteId)
      .reduce((acc, c) => acc + (c.valorContrato || 0), 0)
  }

  const getValoresCliente = (clienteId: string) => {
    const contratosCliente = contratos.filter(c => c.clienteId === clienteId && c.status === 'ativo')
    return calcularValoresAgregados(contratosCliente)
  }

  const handleOpen = (cliente?: any) => {
    if (cliente) {
      setEditingCliente(cliente)
      form.setFieldsValue({
        nome: cliente.nome,
        empresa: cliente.empresa,
        email: cliente.email,
        telefone: cliente.telefone || '',
        endereco: cliente.endereco || '',
        anoInicio: cliente.anoInicio ? dayjs().year(cliente.anoInicio) : dayjs(),
        segmento: cliente.segmento || '',
        tamanho: cliente.tamanho || 'Média'
      })
    } else {
      setEditingCliente(null)
      form.setFieldsValue({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        endereco: '',
        anoInicio: dayjs(),
        segmento: '',
        tamanho: 'Média'
      })
    }
    setModalVisible(true)
  }

  const handleClose = () => {
    setModalVisible(false)
    setEditingCliente(null)
    form.resetFields()
    setSubmitting(false)
  }

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true)

      const clienteData = {
        nome: values.nome,
        empresa: values.empresa,
        email: values.email,
        telefone: values.telefone,
        endereco: values.endereco,
        anoInicio: values.anoInicio.year(),
        segmento: values.segmento,
        tamanho: values.tamanho
      }

      if (editingCliente) {
        await updateCliente(editingCliente.id, clienteData)
      } else {
        await addCliente(clienteData)
      }

      handleClose()
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const contratosAtivos = getContratosAtivos(id)
    if (contratosAtivos > 0) {
      alert(`Não é possível excluir este cliente pois possui ${contratosAtivos} contrato(s) ativo(s). Encerre os contratos antes de excluir o cliente.`)
      return
    }
    
    try {
      await deleteCliente(id)
    } catch (err: any) {
      alert(err.message || 'Erro ao deletar cliente')
    }
  }

  const columns = [
    {
      title: 'Empresa',
      key: 'empresa',
      render: (record: any) => (
        <Text strong style={{ fontSize: 14 }}>{record.empresa}</Text>
      ),
      sorter: (a: any, b: any) => a.empresa.localeCompare(b.empresa),
      width: 200,
    },
    {
      title: 'Contato',
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
      width: 180,
    },
    {
      title: 'Segmento',
      dataIndex: 'segmento',
      key: 'segmento',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
      width: 120,
    },
    {
      title: 'Contratos',
      key: 'contratos',
      render: (record: any) => {
        const contratosAtivos = getContratosAtivos(record.id)
        return (
          <Text style={{ fontSize: 13 }}>
            {contratosAtivos} ativo(s)
          </Text>
        )
      },
      sorter: (a: any, b: any) => getContratosAtivos(a.id) - getContratosAtivos(b.id),
      width: 100,
    },
    {
      title: 'Valor Total',
      key: 'valorTotal',
      render: (record: any) => {
        const { valoresTotais } = getValoresCliente(record.id)
        return (
          <Text strong style={{ color: '#1890ff', fontSize: 13 }}>
            R$ {valoresTotais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        )
      },
      sorter: (a: any, b: any) => getValoresCliente(a.id).valoresTotais - getValoresCliente(b.id).valoresTotais,
      width: 140,
    },
    {
      title: 'Valor Mensal',
      key: 'valorMensal',
      render: (record: any) => {
        const { valoresMensais } = getValoresCliente(record.id)
        return (
          <Text strong style={{ color: '#52c41a', fontSize: 13 }}>
            R$ {valoresMensais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        )
      },
      sorter: (a: any, b: any) => getValoresCliente(a.id).valoresMensais - getValoresCliente(b.id).valoresMensais,
      width: 140,
    },
    {
      title: 'Custo Total',
      key: 'custoTotal',
      render: (record: any) => {
        const { custosTotais } = getValoresCliente(record.id)
        return (
          <Text strong style={{ color: '#faad14', fontSize: 13 }}>
            R$ {custosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        )
      },
      sorter: (a: any, b: any) => getValoresCliente(a.id).custosTotais - getValoresCliente(b.id).custosTotais,
      width: 140,
    },
    {
      title: 'Impostos',
      key: 'impostos',
      render: (record: any) => {
        const { impostosTotais } = getValoresCliente(record.id)
        return (
          <Text strong style={{ color: '#f5222d', fontSize: 13 }}>
            R$ {impostosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        )
      },
      sorter: (a: any, b: any) => getValoresCliente(a.id).impostosTotais - getValoresCliente(b.id).impostosTotais,
      width: 140,
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
            title="Excluir cliente"
            description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
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

  const clientesComContratos = clientes.filter(c => getContratosAtivos(c.id) > 0)
  const clientesSemContratos = clientes.filter(c => getContratosAtivos(c.id) === 0)

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            Clientes
          </Title>
          <Text type="secondary">
            Gerencie seus clientes e suas informações
          </Text>
        </div>

        {/* Estatísticas Simplificadas */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total de Clientes"
                value={clientes.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Clientes Ativos"
                value={clientes.filter(c => getContratosAtivos(c.id) > 0).length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Valor Total"
                value={calcularValoresAgregados(contratos.filter(c => c.status === 'ativo')).valoresTotais}
                prefix="R$"
                valueStyle={{ color: '#faad14' }}
                formatter={(value) => value?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Valor Mensal"
                value={calcularValoresAgregados(contratos.filter(c => c.status === 'ativo')).valoresMensais}
                prefix="R$"
                valueStyle={{ color: '#3f8600' }}
                formatter={(value) => value?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabela */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Search
              placeholder="Buscar clientes..."
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpen()}
            >
              Novo Cliente
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredClientes}
            rowKey="id"
            pagination={{
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total) => `${total} clientes`,
              pageSize: 15,
            }}
            size="small"
          />
        </Card>
      </Space>

      {/* Modal de Adicionar/Editar */}
      <Modal
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        open={modalVisible}
        onCancel={handleClose}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            tamanho: 'Média',
            anoInicio: dayjs()
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="nome"
                label="Nome do Contato"
                rules={[{ required: true, message: 'Nome do contato é obrigatório' }]}
              >
                <Input placeholder="Nome completo" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="empresa"
                label="Empresa"
                rules={[{ required: true, message: 'Nome da empresa é obrigatório' }]}
              >
                <Input placeholder="Nome da empresa" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email é obrigatório' },
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input placeholder="email@empresa.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="telefone"
                label="Telefone"
              >
                <Input placeholder="(11) 99999-9999" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="segmento"
                label="Segmento de Atuação"
                rules={[{ required: true, message: 'Segmento de atuação é obrigatório' }]}
              >
                <Select placeholder="Selecione o segmento">
                  {segmentos.map((segmento) => (
                    <Option key={segmento} value={segmento}>
                      {segmento}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="tamanho"
                label="Tamanho da Empresa"
              >
                <Select placeholder="Selecione o tamanho">
                  {tamanhos.map((tamanho) => (
                    <Option key={tamanho} value={tamanho}>
                      {tamanho}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="anoInicio"
                label="Ano de Início"
                rules={[{ required: true, message: 'Ano de início é obrigatório' }]}
              >
                <DatePicker 
                  picker="year" 
                  style={{ width: '100%' }} 
                  placeholder="Selecione o ano"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="endereco"
                label="Endereço"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Endereço completo"
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              {submitting ? 'Salvando...' : (editingCliente ? 'Salvar' : 'Adicionar')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Clientes 