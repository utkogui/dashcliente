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
  Modal
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
  const [comentariosModal, setComentariosModal] = useState(false)
  const [profissionalComentarios, setProfissionalComentarios] = useState<any>(null)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [comentariosLoading, setComentariosLoading] = useState(false)
  const [profissionaisComComentarios, setProfissionaisComComentarios] = useState<Set<string>>(new Set())

  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (
    process.env.NODE_ENV === 'production' ? 'https://dashcliente.onrender.com/api' : 'http://localhost:3001/api'
  )

  // Atualizar lista filtrada quando profissionais mudar
  useEffect(() => {
    setFilteredProfissionais(profissionais)
  }, [profissionais])

  // Verificar quais profissionais têm comentários
  useEffect(() => {
    const verificarComentarios = async () => {
      if (profissionais.length === 0) return
      
      try {
        const token = localStorage.getItem('sessionId')
        const promises = profissionais.map(async (profissional) => {
          try {
            const response = await fetch(`${API_BASE_URL}/notes?profissionalId=${profissional.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            if (response.ok) {
              const data = await response.json()
              return { id: profissional.id, temComentarios: data.length > 0 }
            }
            return { id: profissional.id, temComentarios: false }
          } catch (error) {
            return { id: profissional.id, temComentarios: false }
          }
        })
        
        const resultados = await Promise.all(promises)
        const idsComComentarios = new Set(
          resultados
            .filter(r => r.temComentarios)
            .map(r => r.id)
        )
        setProfissionaisComComentarios(idsComComentarios)
      } catch (error) {
        console.error('Erro ao verificar comentários:', error)
      }
    }
    
    verificarComentarios()
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

  const buscarComentarios = async (profissionalId: string) => {
    setComentariosLoading(true)
    try {
      const token = localStorage.getItem('sessionId')
      const response = await fetch(`${API_BASE_URL}/notes?profissionalId=${profissionalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setComentarios(data)
      } else {
        setComentarios([])
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
      setComentarios([])
    } finally {
      setComentariosLoading(false)
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
      title: 'Comentário',
      key: 'comentario',
      render: (record: any) => {
        const temComentarios = profissionaisComComentarios.has(record.id)
        
        return (
          <Button
            type="link"
            size="small"
            onClick={async () => {
              setProfissionalComentarios(record)
              setComentariosModal(true)
              await buscarComentarios(record.id)
            }}
            disabled={!temComentarios}
            style={{ 
              color: temComentarios ? '#1890ff' : '#d9d9d9',
              cursor: temComentarios ? 'pointer' : 'not-allowed'
            }}
          >
            {temComentarios ? 'Sim' : 'Não'}
          </Button>
        )
      },
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

      {/* Modal de Comentários */}
      <Modal
        title={`Comentários - ${profissionalComentarios?.nome || ''}`}
        open={comentariosModal}
        onCancel={() => setComentariosModal(false)}
        footer={null}
        width={600}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {comentariosLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text type="secondary">Carregando comentários...</Text>
              </div>
            </div>
          ) : comentarios.length > 0 ? (
            <div>
              {comentarios.map((comentario, index) => (
                <Card key={index} size="small" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <Text strong style={{ fontSize: '14px' }}>
                      Comentário #{index + 1}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(comentario.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                  </div>
                  <Text style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    {comentario.texto}
                  </Text>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Text type="secondary">
                Nenhum comentário encontrado para este profissional.
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Os comentários são feitos na página de visão do cliente.
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Profissionais 