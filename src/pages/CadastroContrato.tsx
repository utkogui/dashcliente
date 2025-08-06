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
  Divider,
  Checkbox,
  List,
  Tag
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, BulbOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import SugestaoProfissionais from '../components/SugestaoProfissionais'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const CadastroContrato = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addContrato, updateContrato, contratos, profissionais, clientes } = useData()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [contratoId, setContratoId] = useState<string | null>(null)

  const [showSugestao, setShowSugestao] = useState(false)

  const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<Array<{
    profissionalId: string
    valorHora: string
    horasMensais: string
    valorFechado: string
    periodoFechado: string
  }>>([])

  // Carregar dados do contrato se estiver editando
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      const contrato = contratos.find(c => c.id === id)
      if (contrato) {
        setIsEditing(true)
        setContratoId(id)
        
        // Preencher formulário com dados do contrato
        form.setFieldsValue({
          nomeProjeto: contrato.nomeProjeto,
          clienteId: contrato.clienteId,
          dataInicio: contrato.dataInicio ? dayjs(contrato.dataInicio) : null,
          dataFim: contrato.dataFim ? dayjs(contrato.dataFim) : null,
          tipoContrato: contrato.tipoContrato,
          valorContrato: contrato.valorContrato.toString(),
          valorContratoMensal: false,
          percentualImpostos: contrato.valorImpostos > 0 ? 
            ((contrato.valorImpostos / contrato.valorContrato) * 100).toFixed(2) : '',
          valorImpostos: contrato.valorImpostos.toString(),
          status: contrato.status,
          observacoes: contrato.observacoes || '',
          contratoIndeterminado: !contrato.dataFim,
          quantidadeProfissionais: '1'
        })

        // Preencher profissionais selecionados
        if (contrato.profissionais && contrato.profissionais.length > 0) {
          setProfissionaisSelecionados(contrato.profissionais.map(p => ({
            profissionalId: p.profissionalId,
            valorHora: p.valorHora?.toString() || '',
            horasMensais: p.horasMensais?.toString() || '',
            valorFechado: p.valorFechado?.toString() || '',
            periodoFechado: p.periodoFechado || 'mensal'
          })))
        }
      }
    }
  }, [searchParams, contratos, form])

  const handleAddProfissional = () => {
    setProfissionaisSelecionados(prev => [...prev, {
      profissionalId: '',
      valorHora: '',
      horasMensais: '',
      valorFechado: '',
      periodoFechado: 'mensal'
    }])
  }

  // Função para preencher automaticamente os campos do profissional baseado no tipo de contrato
  const preencherCamposProfissional = (profissionalId: string, index: number) => {
    const profissional = profissionais.find(p => p.id === profissionalId)
    if (!profissional) return

    setProfissionaisSelecionados(prev => prev.map((item, i) => {
      if (i === index) {
        if (profissional.tipoContrato === 'hora') {
          return {
            ...item,
            profissionalId,
            valorHora: profissional.valorHora?.toString() || '',
            horasMensais: '',
            valorFechado: '',
            periodoFechado: 'mensal'
          }
        } else {
          return {
            ...item,
            profissionalId,
            valorHora: '',
            horasMensais: '',
            valorFechado: profissional.valorFechado?.toString() || '',
            periodoFechado: profissional.periodoFechado || 'mensal'
          }
        }
      }
      return item
    }))
  }

  const handleRemoveProfissional = (index: number) => {
    setProfissionaisSelecionados(prev => prev.filter((_, i) => i !== index))
  }

  const handleAplicarSugestao = (profissionaisSugeridos: any[]) => {
    setProfissionaisSelecionados(profissionaisSugeridos)
  }

  const handleProfissionalChange = (index: number, field: string, value: string) => {
    // Se estiver selecionando um profissional, preencher automaticamente os campos
    if (field === 'profissionalId') {
      preencherCamposProfissional(value, index)
    } else {
      setProfissionaisSelecionados(prev => prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ))
    }
  }

  const handleSubmit = async (values: any) => {
    setError(null)
    setSubmitting(true)

    try {
      // Validar campos baseados no tipo de contrato
      if (values.tipoContrato === 'hora') {
        if (!values.quantidadeHoras || parseFloat(values.quantidadeHoras) <= 0) {
          setError('Quantidade de horas deve ser maior que zero')
          setSubmitting(false)
          return
        }
        if (!values.valorHora || parseFloat(values.valorHora) <= 0) {
          setError('Valor da hora deve ser maior que zero')
          setSubmitting(false)
          return
        }
      } else {
        if (!values.valorContrato || parseFloat(values.valorContrato) <= 0) {
          setError('Valor do contrato deve ser maior que zero')
          setSubmitting(false)
          return
        }
      }

      // Validar se há profissionais selecionados
      if (profissionaisSelecionados.length === 0) {
        setError('Adicione pelo menos um profissional')
        setSubmitting(false)
        return
      }

      // Validar profissionais selecionados
      for (let i = 0; i < profissionaisSelecionados.length; i++) {
        const prof = profissionaisSelecionados[i]
        if (!prof.profissionalId) {
          setError(`Selecione um profissional na linha ${i + 1}`)
          setSubmitting(false)
          return
        }

        const profissionalSelecionado = profissionais.find(p => p.id === prof.profissionalId)
        const tipoContratoProfissional = profissionalSelecionado?.tipoContrato || 'hora'

        if (tipoContratoProfissional === 'hora') {
          if (!prof.valorHora || !prof.horasMensais) {
            setError(`Preencha valor por hora e horas mensais para o profissional na linha ${i + 1}`)
            setSubmitting(false)
            return
          }
        } else {
          if (!prof.valorFechado) {
            setError(`Preencha valor fechado para o profissional na linha ${i + 1}`)
            setSubmitting(false)
            return
          }
        }
      }

      // Calcular valor total do contrato
      let valorContratoFinal = 0
      if (values.tipoContrato === 'hora') {
        const quantidadeHoras = parseFloat(values.quantidadeHoras) || 0
        const valorHora = parseFloat(values.valorHora) || 0
        valorContratoFinal = quantidadeHoras * valorHora
        if (values.valorContratoMensal && values.contratoIndeterminado) {
          valorContratoFinal = valorContratoFinal * 12
        }
      } else {
        valorContratoFinal = parseFloat(values.valorContrato) || 0
        if (values.valorContratoMensal && values.contratoIndeterminado) {
          valorContratoFinal = valorContratoFinal * 12
        }
      }

      const contratoData = {
        nomeProjeto: values.nomeProjeto,
        clienteId: values.clienteId,
        dataInicio: values.dataInicio?.format('YYYY-MM-DD') || '',
        dataFim: values.contratoIndeterminado ? null : values.dataFim?.format('YYYY-MM-DD') || '',
        tipoContrato: values.tipoContrato,
        valorContrato: valorContratoFinal,
        valorImpostos: parseFloat(values.valorImpostos),
        status: values.status,
        observacoes: values.observacoes || null,
        profissionais: profissionaisSelecionados.map(prof => {
          const profissionalSelecionado = profissionais.find(p => p.id === prof.profissionalId)
          const tipoContratoProfissional = profissionalSelecionado?.tipoContrato || 'hora'
          
          return {
            profissionalId: prof.profissionalId,
            valorHora: tipoContratoProfissional === 'hora' ? parseFloat(prof.valorHora) : null,
            horasMensais: tipoContratoProfissional === 'hora' ? parseInt(prof.horasMensais) : null,
            valorFechado: tipoContratoProfissional === 'fechado' ? parseFloat(prof.valorFechado) : null,
            periodoFechado: tipoContratoProfissional === 'fechado' ? prof.periodoFechado : null
          }
        })
      }

      if (isEditing && contratoId) {
        await updateContrato(contratoId, contratoData)
      } else {
        await addContrato(contratoData)
      }
      navigate('/contratos')
    } catch (err) {
      setError('Erro ao cadastrar contrato. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        
        {/* Header */}
        <div>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/contratos')}
            >
              Voltar
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {isEditing ? 'Editar Contrato' : 'Cadastrar Contrato'}
            </Title>
          </Space>
          <Text type="secondary">
            {isEditing ? 'Atualize as informações do contrato' : 'Crie um novo contrato e projeto'}
          </Text>
        </div>

        {/* Formulário */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              tipoContrato: 'hora',
              status: 'ativo',
              contratoIndeterminado: false,
              valorContratoMensal: false,
              quantidadeProfissionais: '1'
            }}
          >
            {/* Dados do Projeto */}
            <Title level={4} style={{ marginBottom: 16, color: '#1890ff' }}>
              Dados do Projeto
            </Title>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nomeProjeto"
                  label="Nome do Projeto"
                  rules={[{ required: true, message: 'Nome do projeto é obrigatório' }]}
                >
                  <Input placeholder="Digite o nome do projeto" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="clienteId"
                  label="Cliente"
                  rules={[{ required: true, message: 'Cliente é obrigatório' }]}
                >
                  <Select placeholder="Selecione o cliente">
                    {clientes.map((cliente) => (
                      <Option key={cliente.id} value={cliente.id}>
                        {cliente.empresa} - {cliente.nome}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

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
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="dataFim"
                  label="Data de Fim"
                  dependencies={['contratoIndeterminado']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!getFieldValue('contratoIndeterminado') && !value) {
                          return Promise.reject(new Error('Data de fim é obrigatória'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    placeholder="Selecione a data"
                    format="DD/MM/YYYY"
                    disabled={form.getFieldValue('contratoIndeterminado')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="contratoIndeterminado"
                  valuePropName="checked"
                >
                  <Checkbox>Contrato Indeterminado</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            {/* Tipo de Contrato */}
            <Title level={4} style={{ marginBottom: 16, color: '#1890ff' }}>
              Tipo de Contrato
            </Title>

            <Form.Item
              name="tipoContrato"
              rules={[{ required: true, message: 'Tipo de contrato é obrigatório' }]}
            >
              <Radio.Group>
                <Radio value="hora">Por Horas</Radio>
                <Radio value="fechado">Valor Negociado</Radio>
              </Radio.Group>
            </Form.Item>

            <Divider />

            {/* Valores */}
            <Title level={4} style={{ marginBottom: 16, color: '#1890ff' }}>
              Valores
            </Title>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const tipoContrato = getFieldValue('tipoContrato')
                
                if (tipoContrato === 'hora') {
                  return (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="quantidadeHoras"
                          label="Quantidade de Horas"
                          rules={[{ required: true, message: 'Quantidade de horas é obrigatória' }]}
                        >
                          <Input 
                            type="number" 
                            placeholder="160"
                            min={0}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="valorHora"
                          label="Valor da Hora"
                          rules={[{ required: true, message: 'Valor da hora é obrigatório' }]}
                        >
                          <Input 
                            type="number" 
                            placeholder="150,00"
                            prefix="R$"
                            min={0}
                            step={0.01}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="valorContratoMensal"
                          valuePropName="checked"
                        >
                          <Checkbox>Valor é mensal</Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  )
                } else {
                  return (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="valorContrato"
                          label="Valor do Contrato"
                          rules={[{ required: true, message: 'Valor do contrato é obrigatório' }]}
                        >
                          <Input 
                            type="number" 
                            placeholder="50000,00"
                            prefix="R$"
                            min={0}
                            step={0.01}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="valorContratoMensal"
                          valuePropName="checked"
                        >
                          <Checkbox>Valor é mensal</Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  )
                }
              }}
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const valorContratoMensal = getFieldValue('valorContratoMensal')
                const contratoIndeterminado = getFieldValue('contratoIndeterminado')
                
                if (valorContratoMensal && contratoIndeterminado) {
                  return (
                    <Row gutter={[16, 16]}>
                      <Col xs={24}>
                        <Alert 
                          message="Contrato mensal indeterminado - será considerado 12 meses para cálculos"
                          type="info"
                          showIcon
                        />
                      </Col>
                    </Row>
                  )
                }
                return null
              }}
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="percentualImpostos"
                  label="Percentual de Impostos (%)"
                  rules={[{ required: true, message: 'Percentual de impostos é obrigatório' }]}
                >
                  <Input 
                    type="number" 
                    placeholder="13,00"
                    suffix="%"
                    min={0}
                    max={100}
                    step={0.01}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={16}>
                <Form.Item
                  name="valorImpostos"
                  label="Valor dos Impostos (Calculado)"
                  rules={[{ required: true, message: 'Valor dos impostos é obrigatório' }]}
                >
                  <Input 
                    type="number"
                    prefix="R$"
                    disabled
                    placeholder="Calculado automaticamente"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            {/* Profissionais */}
            <Title level={4} style={{ marginBottom: 16, color: '#1890ff' }}>
              Profissionais
            </Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24}>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setShowSugestao(true)}
                  disabled={submitting}
                  type="primary"
                  size="large"
                >
                  Adicionar Profissional
                </Button>
              </Col>
            </Row>

            {profissionaisSelecionados.length === 0 && (
              <Alert 
                message="Adicione pelo menos um profissional"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <List
              dataSource={profissionaisSelecionados}
              renderItem={(prof, index) => (
                <List.Item
                  style={{ 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 6, 
                    marginBottom: 8,
                    padding: 16
                  }}
                  actions={[
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveProfissional(index)}
                      disabled={submitting}
                      danger
                    />
                  ]}
                >
                  <div style={{ width: '100%' }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={6}>
                        <Form.Item
                          label="Profissional"
                          style={{ marginBottom: 8 }}
                        >
                          <Select
                            placeholder="Selecione o profissional"
                            value={prof.profissionalId}
                            onChange={(value) => handleProfissionalChange(index, 'profissionalId', value)}
                            disabled={submitting}
                          >
                            {profissionais.map((p) => (
                              <Option key={p.id} value={p.id}>
                                {p.nome} - {p.especialidade}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      {(() => {
                        const profissionalSelecionado = profissionais.find(p => p.id === prof.profissionalId)
                        const tipoContratoProfissional = profissionalSelecionado?.tipoContrato || 'hora'
                        
                        if (tipoContratoProfissional === 'hora') {
                          return (
                            <>
                              <Col xs={24} md={4}>
                                <Form.Item
                                  label="Valor/Hora"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Input
                                    type="number"
                                    value={prof.valorHora}
                                    onChange={(e) => handleProfissionalChange(index, 'valorHora', e.target.value)}
                                    placeholder="150,00"
                                    prefix="R$"
                                    min={0}
                                    step={0.01}
                                    disabled={submitting}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={4}>
                                <Form.Item
                                  label="Horas/Mês"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Input
                                    type="number"
                                    value={prof.horasMensais}
                                    onChange={(e) => handleProfissionalChange(index, 'horasMensais', e.target.value)}
                                    placeholder="160"
                                    min={0}
                                    disabled={submitting}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={4}>
                                <Form.Item
                                  label="Valor Mensal"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Input
                                    type="number"
                                    value={prof.valorHora && prof.horasMensais ? 
                                      (parseFloat(prof.valorHora) * parseFloat(prof.horasMensais)).toFixed(2) : ''}
                                    prefix="R$"
                                    disabled
                                    placeholder="Calculado automaticamente"
                                  />
                                </Form.Item>
                              </Col>
                            </>
                          )
                        } else {
                          return (
                            <>
                              <Col xs={24} md={4}>
                                <Form.Item
                                  label="Período"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Select
                                    value={prof.periodoFechado}
                                    onChange={(value) => handleProfissionalChange(index, 'periodoFechado', value)}
                                    disabled={submitting}
                                  >
                                    <Option value="mensal">Mensal</Option>
                                    <Option value="trimestral">Trimestral</Option>
                                    <Option value="semestral">Semestral</Option>
                                    <Option value="anual">Anual</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={4}>
                                <Form.Item
                                  label="Valor Fechado"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Input
                                    type="number"
                                    value={prof.valorFechado}
                                    onChange={(e) => handleProfissionalChange(index, 'valorFechado', e.target.value)}
                                    placeholder="5000,00"
                                    prefix="R$"
                                    min={0}
                                    step={0.01}
                                    disabled={submitting}
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={4}>
                                <Form.Item
                                  label="Custo Total"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Input
                                    type="number"
                                    value={prof.valorFechado || ''}
                                    prefix="R$"
                                    disabled
                                    placeholder="Mesmo valor"
                                  />
                                </Form.Item>
                              </Col>
                            </>
                          )
                        }
                      })()}
                    </Row>
                  </div>
                </List.Item>
              )}
            />

            <Divider />

            {/* Status e Observações */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Status é obrigatório' }]}
                >
                  <Select placeholder="Selecione o status">
                    <Option value="ativo">Ativo</Option>
                    <Option value="encerrado">Encerrado</Option>
                    <Option value="pendente">Pendente</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="observacoes"
                  label="Observações"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Observações sobre o contrato"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            {/* Botões */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button 
                onClick={() => navigate('/contratos')}
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
                {submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Salvar Contrato')}
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

      {/* Modal de Sugestão de Profissionais */}
      <SugestaoProfissionais
        open={showSugestao}
        onClose={() => setShowSugestao(false)}
        valorContrato={parseFloat(form.getFieldValue('valorContrato')) || 0}
        valorImpostos={parseFloat(form.getFieldValue('valorImpostos')) || 0}
        quantidadeProfissionais={parseInt(form.getFieldValue('quantidadeProfissionais')) || 1}
        isMensal={form.getFieldValue('valorContratoMensal')}
        onAplicarSugestao={handleAplicarSugestao}
      />
    </div>
  )
}

export default CadastroContrato 