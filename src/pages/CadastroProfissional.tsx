import React, { useEffect, useState } from 'react'
import { Typography, Form, Input, Button, Select, Radio, Card, Alert, Space, Row, Col, Tag } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { obterPerfisDisponiveis, obterEspecialidadesPorPerfil, obterValorHora, obterEspecialidadesDisponiveis } from '../utils/tabelaPrecos'
import { useAuth } from '../contexts/AuthContext'

interface ProfissionalFormData {
  nome: string
  email: string
  especialidade: string
  perfil: string | null
  especialidadeEspecifica: string | null
  dataInicio: string
  tipoContrato: 'hora' | 'fechado'
  valorHora: number | null
  valorFechado: number | null
  periodoFechado: string | null
  valorPago: number
  status: 'ativo' | 'inativo' | 'ferias'
  tags: string | null
  clienteId: string
  contatoClienteEmail: string | null
  contatoClienteTeams: string | null
  contatoClienteTelefone: string | null
  contatoMatilhaEmail: string | null
  contatoMatilhaTeams: string | null
  contatoMatilhaTelefone: string | null
}

const CadastroProfissional: React.FC = () => {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { addProfissional } = useData()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Debug: verificar se o usuário está sendo carregado
  console.log('🔍 Debug - Componente CadastroProfissional renderizado')
  console.log('🔍 Debug - usuario do useAuth():', usuario)

  const [formState, setFormState] = useState<{ tipoContrato: 'hora' | 'fechado'; perfil?: string; especialidadeEspecifica?: string; tags: string[] }>({ tipoContrato: 'hora', tags: [] })
  const [newTag, setNewTag] = useState('')
  const [especialidadesCustom, setEspecialidadesCustom] = useState<string[]>(obterEspecialidadesDisponiveis())
  const [especialidadesPerfil, setEspecialidadesPerfil] = useState<string[]>([])
  const [novaEspecialidade, setNovaEspecialidade] = useState('')

  useEffect(() => {
    if (!formState.perfil) {
      setEspecialidadesPerfil([])
      return
    }
    const esp = obterEspecialidadesPorPerfil(formState.perfil)
    setEspecialidadesPerfil(esp)
    // Ajustar valorHora recomendado quando aplicável
    const perfil = form.getFieldValue('perfil')
    const espEsp = form.getFieldValue('especialidadeEspecifica')
    if (formState.tipoContrato === 'hora' && perfil && espEsp) {
      const v = obterValorHora(perfil, espEsp)
      if (v) form.setFieldValue('valorHora', v)
    }
  }, [formState.perfil, formState.tipoContrato])

  const handleAddTag = () => {
    const v = newTag.trim()
    if (!v) return
    if (!formState.tags.includes(v)) setFormState(prev => ({ ...prev, tags: [...prev.tags, v] }))
    setNewTag('')
  }

  const handleRemoveTag = (tag: string) => setFormState(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  const onFinish = async (values: ProfissionalFormData) => {
    setError(null)
    setSubmitting(true)
    
    // Debug: verificar dados do usuário
    console.log('🔍 Debug - Dados do usuário:', usuario)
    console.log('🔍 Debug - usuario?.clienteId:', usuario?.clienteId)
    console.log('🔍 Debug - Tipo do usuario:', typeof usuario)
    
    // Para admin, usar clienteId do formulário. Para cliente, usar clienteId do usuário
    let clienteIdParaUsar = usuario?.clienteId
    
    if (usuario?.tipo === 'admin') {
      // Admin deve selecionar o cliente no formulário
      if (!values.clienteId) {
        setError('Admin deve selecionar um cliente do sistema.')
        setSubmitting(false)
        return
      }
      clienteIdParaUsar = values.clienteId
    } else if (!usuario?.clienteId) {
      // Cliente deve ter clienteId válido
      console.error('❌ Usuário cliente sem clienteId válido:', usuario)
      setError('Usuário não possui clienteId válido. Entre em contato com o administrador.')
      setSubmitting(false)
      return
    }
    
    console.log('🔍 Debug - clienteId que será usado:', clienteIdParaUsar)
    
    try {
      const payload: ProfissionalFormData = {
        nome: values.nome,
        email: values.email,
        especialidade: values.especialidade,
        perfil: values.perfil || null,
        especialidadeEspecifica: values.especialidadeEspecifica || null,
        dataInicio: values.dataInicio,
        tipoContrato: values.tipoContrato,
        valorHora: values.tipoContrato === 'hora' ? parseFloat(values.valorHora?.toString() || '0') : null,
        valorFechado: values.tipoContrato === 'fechado' ? parseFloat(values.valorFechado?.toString() || '0') : null,
        periodoFechado: values.tipoContrato === 'fechado' ? values.periodoFechado : null,
        valorPago: parseFloat(values.valorPago.toString()),
        status: values.status,
        tags: formState.tags.join(',') || null,
        clienteId: clienteIdParaUsar!, // Usar o clienteId determinado pela lógica
        contatoClienteEmail: values.contatoClienteEmail || null,
        contatoClienteTeams: values.contatoClienteTeams || null,
        contatoClienteTelefone: values.contatoClienteTelefone || null,
        contatoMatilhaEmail: values.contatoMatilhaEmail || null,
        contatoMatilhaTeams: values.contatoMatilhaTeams || null,
        contatoMatilhaTelefone: values.contatoMatilhaTelefone || null,
      }
      
      console.log('🔍 Debug - Payload para cadastro:', payload)
      
      await addProfissional(payload)
      navigate('/profissionais')
    } catch (error) {
      console.error('Erro ao cadastrar profissional:', error)
      setError('Erro ao cadastrar profissional. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/profissionais')}>Voltar</Button>
        <Typography.Title level={2} style={{ margin: 0 }}>Cadastrar Profissional</Typography.Title>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ 
          tipoContrato: 'hora', 
          status: 'ativo', 
          periodoFechado: 'mensal',
          clienteId: usuario?.tipo === 'admin' ? undefined : usuario?.clienteId
        }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="nome" label="Nome Completo" rules={[{ required: true, message: 'Nome é obrigatório' }]}>
                <Input placeholder="Nome completo" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Email é obrigatório' }, { type: 'email', message: 'Email inválido' }]}>
                <Input type="email" placeholder="email@empresa.com" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="especialidade" label="Especialidade" rules={[{ required: true, message: 'Especialidade é obrigatória' }]}>
                <Select placeholder="Selecione">
                  {especialidadesCustom.map(esp => (<Select.Option key={esp} value={esp}>{esp}</Select.Option>))}
                </Select>
              </Form.Item>
              <Space.Compact style={{ width: '100%', marginTop: -8 }}>
                <Input placeholder="Nova especialidade" value={novaEspecialidade} onChange={e => setNovaEspecialidade(e.target.value)} />
                <Button icon={<PlusOutlined />} onClick={() => {
                  const v = novaEspecialidade.trim(); if (!v) return; if (!especialidadesCustom.includes(v)) setEspecialidadesCustom(prev => [...prev, v]); form.setFieldValue('especialidade', v); setNovaEspecialidade('')
                }} disabled={!novaEspecialidade.trim()}>Adicionar</Button>
              </Space.Compact>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="perfil" label="Perfil">
                <Select placeholder="Selecione" onChange={(v) => setFormState(prev => ({ ...prev, perfil: v }))}>
                  {obterPerfisDisponiveis().map(p => (<Select.Option key={p} value={p}>{p}</Select.Option>))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="especialidadeEspecifica" label="Especialidade Específica">
                <Select placeholder="Selecione" disabled={!formState.perfil} onChange={(v) => setFormState(prev => ({ ...prev, especialidadeEspecifica: v }))}>
                  {especialidadesPerfil.map(esp => (<Select.Option key={esp} value={esp}>{esp}</Select.Option>))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dataInicio" label="Data de Início" rules={[{ required: true, message: 'Data de início é obrigatória' }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            
            {/* Campo para admin selecionar cliente */}
            {usuario?.tipo === 'admin' && (
              <Col xs={24} md={12}>
                <Form.Item 
                  name="clienteId" 
                  label="Cliente do Sistema" 
                  rules={[{ required: true, message: 'Cliente é obrigatório para admin' }]}
                >
                  <Select placeholder="Selecione o cliente">
                    <Select.Option value="cme1imy560000a71egelnpyzy">FTD</Select.Option>
                    <Select.Option value="cliente_matilha_default">Matilha</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            )}

            <Col span={24}>
              <Typography.Title level={4} style={{ marginBottom: 8, color: '#1890ff' }}>Tipo de Contrato</Typography.Title>
              <Form.Item name="tipoContrato">
                <Radio.Group onChange={(e) => setFormState(prev => ({ ...prev, tipoContrato: e.target.value }))}>
                  <Radio value="hora">Por Hora</Radio>
                  <Radio value="fechado">Por Valor Fechado</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            {formState.tipoContrato === 'hora' ? (
              <Col xs={24} md={12}>
                <Form.Item name="valorHora" label="Valor por Hora" rules={[{ required: true, message: 'Informe o valor por hora' }]}>
                  <Input type="number" prefix="R$" placeholder="100,00" />
                </Form.Item>
              </Col>
            ) : (
              <>
                <Col xs={24} md={12}>
                  <Form.Item name="valorFechado" label="Valor Fechado" rules={[{ required: true, message: 'Informe o valor fechado' }]}>
                    <Input type="number" prefix="R$" placeholder="5000,00" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="periodoFechado" label="Período">
                    <Select>
                      <Select.Option value="mensal">Mensal</Select.Option>
                      <Select.Option value="trimestral">Trimestral</Select.Option>
                      <Select.Option value="semestral">Semestral</Select.Option>
                      <Select.Option value="anual">Anual</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </>
            )}

            <Col xs={24} md={12}>
              <Form.Item name="valorPago" label="Valor Bruto Pago ao Profissional" rules={[{ required: true, message: 'Informe o valor pago' }]}>
                <Input type="number" prefix="R$" placeholder="4500,00" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Status" initialValue="ativo">
                <Select>
                  <Select.Option value="ativo">Ativo</Select.Option>
                  <Select.Option value="inativo">Inativo</Select.Option>
                  <Select.Option value="ferias">Férias</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Typography.Title level={4} style={{ marginBottom: 8, color: '#1890ff' }}>Tags</Typography.Title>
              <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
                <Input placeholder="Digite uma tag" value={newTag} onChange={e => setNewTag(e.target.value)} onPressEnter={handleAddTag} />
                <Button icon={<PlusOutlined />} onClick={handleAddTag} disabled={!newTag.trim()}>Adicionar</Button>
              </Space.Compact>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {formState.tags.map(tag => (
                  <Tag key={tag} closable onClose={() => handleRemoveTag(tag)} color="blue">{tag}</Tag>
                ))}
              </div>
            </Col>

            <Col span={24}>
              <Typography.Title level={4} style={{ marginBottom: 8, color: '#1890ff' }}>Canais de Contato</Typography.Title>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="contatoClienteEmail" label="Email (Cliente)">
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="contatoClienteTeams" label="Teams (Cliente)">
                <Input placeholder="https://teams.microsoft.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="contatoClienteTelefone" label="Telefone (Cliente)">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="contatoMatilhaEmail" label="Email (Matilha)">
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="contatoMatilhaTeams" label="Teams (Matilha)">
                <Input placeholder="https://teams.microsoft.com/..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="contatoMatilhaTelefone" label="Telefone (Matilha)">
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => navigate('/profissionais')} disabled={submitting}>Cancelar</Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>Salvar Profissional</Button>
              </div>
            </Col>
          </Row>
        </Form>

        {error && (
          <Alert type="error" message={error} showIcon style={{ marginTop: 16 }} />
        )}
      </Card>
    </div>
  )
}

export default CadastroProfissional 