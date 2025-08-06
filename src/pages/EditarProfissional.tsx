import React, { useState, useEffect } from 'react'
import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  Radio,
  DatePicker,
  Card,
  Alert,
  Spin,
  Space,
  Row,
  Col,
  Divider
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const EditarProfissional = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { profissionais, updateProfissional } = useData()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const especialidades = [
    'Desenvolvedor Full Stack',
    'Desenvolvedor Frontend',
    'Desenvolvedor Backend',
    'UX/UI Designer',
    'DevOps Engineer',
    'Product Manager',
    'Service Designer',
    'Content Ops',
    'QA Engineer',
    'Data Scientist'
  ]

  // Carregar dados do profissional
  useEffect(() => {
    if (id && profissionais.length > 0) {
      const profissional = profissionais.find(p => p.id === id)
      if (profissional) {
        form.setFieldsValue({
          nome: profissional.nome || '',
          email: profissional.email || '',
          especialidade: profissional.especialidade || '',
          dataInicio: profissional.dataInicio ? dayjs(profissional.dataInicio) : null,
          tipoContrato: profissional.tipoContrato || 'hora',
          valorHora: profissional.valorHora?.toString() || '',
          valorFechado: profissional.valorFechado?.toString() || '',
          periodoFechado: profissional.periodoFechado || 'mensal',
          valorPago: profissional.valorPago?.toString() || '',
          status: profissional.status || 'ativo'
        })
      } else {
        setError('Profissional não encontrado')
      }
      setLoading(false)
    }
  }, [id, profissionais, form])

  const handleSubmit = async (values: any) => {
    setError(null)
    setSubmitting(true)

    try {
      const profissionalData = {
        nome: values.nome,
        email: values.email,
        especialidade: values.especialidade,
        dataInicio: values.dataInicio?.format('YYYY-MM-DD') || '',
        tipoContrato: values.tipoContrato,
        valorHora: values.tipoContrato === 'hora' ? parseFloat(values.valorHora) : null,
        valorFechado: values.tipoContrato === 'fechado' ? parseFloat(values.valorFechado) : null,
        periodoFechado: values.tipoContrato === 'fechado' ? values.periodoFechado : null,
        valorPago: values.tipoContrato === 'fechado' ? parseFloat(values.valorFechado) : null, // Para valor fechado, o valor pago é o mesmo do valor fechado
        status: values.status
      }

      if (id) {
        await updateProfissional(id, profissionalData)
      }
      navigate('/profissionais')
    } catch (err) {
      setError('Erro ao atualizar profissional. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
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

  if (error && error === 'Profissional não encontrado') {
    return (
      <div style={{ padding: 24 }}>
        <Alert 
          message="Erro" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/profissionais')}
        >
          Voltar para Profissionais
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Header */}
        <div>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/profissionais')}
              >
                Voltar
              </Button>
              <Title level={2} style={{ margin: 0, marginBottom: 0 }}>
                Editar Profissional
              </Title>
            </Space>
            <Text type="secondary" style={{ marginLeft: 0 }}>
              Atualize as informações do profissional
            </Text>
          </Space>
        </div>

        {/* Formulário */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              tipoContrato: 'hora',
              periodoFechado: 'mensal',
              status: 'ativo'
            }}
          >
            <Row gutter={[16, 16]}>
              {/* Nome */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="nome"
                  label="Nome Completo"
                  rules={[{ required: true, message: 'Nome é obrigatório' }]}
                >
                  <Input placeholder="Digite o nome completo" />
                </Form.Item>
              </Col>

              {/* Email */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Email é obrigatório' },
                    { type: 'email', message: 'Email inválido' }
                  ]}
                >
                  <Input placeholder="Digite o email" />
                </Form.Item>
              </Col>

              {/* Especialidade */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="especialidade"
                  label="Especialidade"
                  rules={[{ required: true, message: 'Especialidade é obrigatória' }]}
                >
                  <Select placeholder="Selecione a especialidade">
                    {especialidades.map((especialidade) => (
                      <Option key={especialidade} value={especialidade}>
                        {especialidade}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Data de Início */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="dataInicio"
                  label="Data de Início"
                  rules={[{ required: true, message: 'Data de início é obrigatória' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    placeholder="Selecione a data"
                    format="DD/MM/YYYY"
                    allowClear={false}
                  />
                </Form.Item>
              </Col>

              {/* Tipo de Contrato */}
              <Col xs={24}>
                <Form.Item
                  name="tipoContrato"
                  label="Tipo de Contrato"
                  rules={[{ required: true, message: 'Tipo de contrato é obrigatório' }]}
                >
                  <Radio.Group>
                    <Radio value="hora">Por Hora</Radio>
                    <Radio value="fechado">Valor Fechado</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>

              {/* Campos condicionais baseados no tipo de contrato */}
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const tipoContrato = getFieldValue('tipoContrato')
                  
                  if (tipoContrato === 'hora') {
                    return (
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="valorHora"
                          label="Valor por Hora"
                          rules={[{ required: true, message: 'Valor por hora é obrigatório' }]}
                        >
                          <Input 
                            type="number" 
                            placeholder="0,00"
                            prefix="R$"
                            min={0}
                            step={0.01}
                          />
                        </Form.Item>
                      </Col>
                    )
                  }
                  
                  if (tipoContrato === 'fechado') {
                    return (
                      <>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="valorFechado"
                            label="Valor Fechado"
                            rules={[{ required: true, message: 'Valor fechado é obrigatório' }]}
                          >
                            <Input 
                              type="number" 
                              placeholder="0,00"
                              prefix="R$"
                              min={0}
                              step={0.01}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="periodoFechado"
                            label="Período"
                            rules={[{ required: true, message: 'Período é obrigatório' }]}
                          >
                            <Select placeholder="Selecione o período">
                              <Option value="mensal">Mensal</Option>
                              <Option value="trimestral">Trimestral</Option>
                              <Option value="semestral">Semestral</Option>
                              <Option value="anual">Anual</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </>
                    )
                  }
                  
                  return null
                }}
              </Form.Item>

              {/* Status */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Status é obrigatório' }]}
                >
                  <Select placeholder="Selecione o status">
                    <Option value="ativo">Ativo</Option>
                    <Option value="inativo">Inativo</Option>
                    <Option value="ferias">Férias</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            {/* Botões */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button 
                onClick={() => navigate('/profissionais')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={submitting ? <Spin size="small" /> : <SaveOutlined />}
                loading={submitting}
              >
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </Form>

          {error && (
            <Alert 
              message="Erro" 
              description={error} 
              type="error" 
              showIcon 
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      </Space>
    </div>
  )
}

export default EditarProfissional 