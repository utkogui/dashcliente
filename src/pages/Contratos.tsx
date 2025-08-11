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
import { 
  formatCurrency, 
  calcularValoresAgregados,
  calcularValorMensal,
  calcularImpostosMensais,
  calcularCustoMensal,
  calcularMargemMensal
} from '../utils/formatters'

const { Title, Text } = Typography
const { Search } = Input

// Tipos
interface Contrato {
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
        c.codigoContrato?.toLowerCase().includes(value.toLowerCase()) ||
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
        <Text strong style={{ fontSize: 14 }}>{text}</Text>
      ),
      sorter: (a: any, b: any) => a.nomeProjeto.localeCompare(b.nomeProjeto),
      width: 200,
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (record: any) => (
        <Text style={{ fontSize: 13 }}>{record.cliente?.empresa}</Text>
      ),
      sorter: (a: any, b: any) => a.cliente?.empresa.localeCompare(b.cliente?.empresa),
      width: 150,
    },
    {
      title: 'Valor Total',
      key: 'valorTotal',
      render: (record: any) => {
        return (
          <Text strong style={{ color: '#1890ff', fontSize: 13 }}>
            R$ {record.valorContrato?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
          </Text>
        )
      },
      sorter: (a: any, b: any) => (a.valorContrato || 0) - (b.valorContrato || 0),
      width: 120,
    },
    {
      title: 'Valor Mensal',
      key: 'valorMensal',
      render: (record: any) => {
        const valorMensal = !record.dataFim ? (record.valorContrato / 12) : 
          (record.valorContrato / Math.max(1, 
            (new Date(record.dataFim).getFullYear() - new Date(record.dataInicio).getFullYear()) * 12 + 
            (new Date(record.dataFim).getMonth() - new Date(record.dataInicio).getMonth())
          ))
        return (
          <Text strong style={{ color: '#52c41a', fontSize: 13 }}>
            R$ {valorMensal?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
          </Text>
        )
      },
      sorter: (a: any, b: any) => {
        const valorA = !a.dataFim ? (a.valorContrato / 12) : 
          (a.valorContrato / Math.max(1, 
            (new Date(a.dataFim).getFullYear() - new Date(a.dataInicio).getFullYear()) * 12 + 
            (new Date(a.dataFim).getMonth() - new Date(a.dataInicio).getMonth())
          ))
        const valorB = !b.dataFim ? (b.valorContrato / 12) : 
          (b.valorContrato / Math.max(1, 
            (new Date(b.dataFim).getFullYear() - new Date(b.dataInicio).getFullYear()) * 12 + 
            (new Date(b.dataFim).getMonth() - new Date(b.dataInicio).getMonth())
          ))
        return valorA - valorB
      },
      width: 120,
    },
    {
      title: 'Custo Mensal',
      key: 'custoMensal',
      render: (record: any) => {
        const custoMensal = record.profissionais?.reduce((total: number, prof: any) => {
          if (prof.valorHora && prof.horasMensais) {
            return total + (prof.valorHora * prof.horasMensais)
          } else if (prof.valorFechado) {
            if (record.dataFim) {
              const dataInicio = new Date(record.dataInicio)
              const dataFim = new Date(record.dataFim)
              const mesesDuracao = Math.max(1, (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + 
                (dataFim.getMonth() - dataInicio.getMonth()))
              return total + (prof.valorFechado / mesesDuracao)
            }
            return total + prof.valorFechado
          }
          return total
        }, 0) || 0
        return (
          <Text strong style={{ color: '#faad14', fontSize: 13 }}>
            R$ {custoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        )
      },
      sorter: (a: any, b: any) => {
        const custoA = a.profissionais?.reduce((total: number, prof: any) => {
          if (prof.valorHora && prof.horasMensais) {
            return total + (prof.valorHora * prof.horasMensais)
          } else if (prof.valorFechado) {
            if (a.dataFim) {
              const dataInicio = new Date(a.dataInicio)
              const dataFim = new Date(a.dataFim)
              const mesesDuracao = Math.max(1, (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + 
                (dataFim.getMonth() - dataInicio.getMonth()))
              return total + (prof.valorFechado / mesesDuracao)
            }
            return total + prof.valorFechado
          }
          return total
        }, 0) || 0
        const custoB = b.profissionais?.reduce((total: number, prof: any) => {
          if (prof.valorHora && prof.horasMensais) {
            return total + (prof.valorHora * prof.horasMensais)
          } else if (prof.valorFechado) {
            if (b.dataFim) {
              const dataInicio = new Date(b.dataInicio)
              const dataFim = new Date(b.dataFim)
              const mesesDuracao = Math.max(1, (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + 
                (dataFim.getMonth() - dataInicio.getMonth()))
              return total + (prof.valorFechado / mesesDuracao)
            }
            return total + prof.valorFechado
          }
          return total
        }, 0) || 0
        return custoA - custoB
      },
      width: 120,
    },
    {
      title: 'Impostos',
      key: 'impostos',
      render: (record: any) => {
        const impostosMensais = calcularImpostosMensais(record)
        return (
          <Text strong style={{ color: '#f5222d', fontSize: 13 }}>
            R$ {impostosMensais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        )
      },
      sorter: (a: any, b: any) => {
        const impostosA = calcularImpostosMensais(a)
        const impostosB = calcularImpostosMensais(b)
        return impostosA - impostosB
      },
      width: 120,
    },
    {
      title: 'Resultado Mensal',
      key: 'resultadoMensal',
      render: (record: any) => {
        const margemMensal = calcularMargemMensal(record)
        const color = margemMensal >= 0 ? '#52c41a' : '#cf1322'
        return (
          <Text strong style={{ color, fontSize: 13 }}>
            R$ {margemMensal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        )
      },
      sorter: (a: any, b: any) => calcularMargemMensal(a) - calcularMargemMensal(b),
      width: 140,
    },
    {
      title: 'Profissionais',
      key: 'profissionais',
      render: (record: any) => (
        <Text style={{ fontSize: 13 }}>
          {record.profissionais?.length || 0} prof.
        </Text>
      ),
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

        {/* Estatísticas Simplificadas */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Contratos Ativos"
                value={contratosAtivos.length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total de Contratos"
                value={contratos.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Valor Total"
                value={calcularValoresAgregados(contratosAtivos).valoresTotais}
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
                value={calcularValoresAgregados(contratosAtivos).valoresMensais}
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
              placeholder="Buscar contratos..."
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
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
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total) => `${total} contratos`,
              pageSize: 15,
            }}
            size="small"
          />
        </Card>
      </Space>
    </div>
  )
}

export default Contratos 