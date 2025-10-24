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
  Tag,
  Upload,
  message
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { 
  obterPerfisDisponiveis, 
  obterEspecialidadesPorPerfil, 
  obterValorHora 
} from '../utils/tabelaPrecos'
import dayjs from 'dayjs'

// Configuração da API
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (
  process.env.NODE_ENV === 'production' ? 'https://dashcliente.onrender.com/api' : 'http://localhost:3001/api'
)

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
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [especialidadesPorPerfil, setEspecialidadesPorPerfil] = useState<string[]>([])
  const [arquivoContrato, setArquivoContrato] = useState<File | null>(null)
  const [arquivoContratoExistente, setArquivoContratoExistente] = useState<string | null>(null)

  const especialidades = [
    'Desenvolvedor Full Stack',
    'Desenvolvedor Frontend',
    'Desenvolvedor Backend',
    'UX/UI Designer',
    'Pesquisador',
    'UX Writer',
    'DevOps Engineer',
    'Product Manager',
    'Service Designer',
    'Content Ops',
    'QA Engineer',
    'Data Scientist'
  ]

  const tagsSugeridas = [
    'Alocação',
    'Projetos',
    'Bodyshop',
    'Freelancer',
    'CLT',
    'PJ',
    'Remoto',
    'Presencial',
    'Híbrido',
    'Senior',
    'Pleno',
    'Junior',
    'Especialista',
    'Consultor',
    'Mentor'
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
          perfil: profissional.perfil || '',
          especialidadeEspecifica: profissional.especialidadeEspecifica || '',
          gestorInterno: profissional.gestorInterno || '',
          linhaCobranca: profissional.linhaCobranca || '',
          pontosFortes: profissional.pontosFortes || '',
          pontosFracos: profissional.pontosFracos || '',
          dataInicio: profissional.dataInicio ? dayjs(profissional.dataInicio) : null,
          tipoContrato: profissional.tipoContrato || 'hora',
          valorHora: profissional.valorHora?.toString() || '',
          valorFechado: profissional.valorFechado?.toString() || '',
          periodoFechado: profissional.periodoFechado || 'mensal',
          valorPago: profissional.valorPago?.toString() || '',
          status: profissional.status || 'ativo',
          contatoClienteEmail: profissional.contatoClienteEmail || '',
          contatoClienteTeams: profissional.contatoClienteTeams || '',
          contatoClienteTelefone: profissional.contatoClienteTelefone || '',
          contatoMatilhaEmail: profissional.contatoMatilhaEmail || '',
          contatoMatilhaTeams: profissional.contatoMatilhaTeams || '',
          contatoMatilhaTelefone: profissional.contatoMatilhaTelefone || ''
        })
        
        // Carregar arquivo de contrato existente
        if (profissional.contratoArquivo) {
          setArquivoContratoExistente(profissional.contratoArquivo)
        }
        
        // Atualizar especialidades disponíveis para o perfil
        if (profissional.perfil) {
          setEspecialidadesPorPerfil(obterEspecialidadesPorPerfil(profissional.perfil))
        }
        
        // Carregar tags
        if (profissional.tags) {
          setTags(profissional.tags.split(',').map(tag => tag.trim()).filter(tag => tag))
        }
      } else {
        setError('Profissional não encontrado')
      }
      setLoading(false)
    }
  }, [id, profissionais, form])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddTag()
    }
  }

  const handleUploadContrato = async (info: any) => {
    const { file } = info
    
    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      message.error('Apenas arquivos PDF, JPG, JPEG e PNG são permitidos')
      return
    }
    
    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      message.error('Arquivo muito grande. Tamanho máximo permitido: 10MB')
      return
    }
    
    try {
      // Criar FormData para upload
      const formData = new FormData()
      formData.append('arquivo', file)
      
      // Fazer upload para o servidor
      const response = await fetch(`${API_BASE_URL}/upload-contrato/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro no upload')
      }
      
      const result = await response.json()
      
      setArquivoContrato(file)
      setArquivoContratoExistente(result.filename)
      message.success('Arquivo enviado com sucesso!')
    } catch (error) {
      console.error('Erro no upload:', error)
      message.error(`Erro ao enviar arquivo: ${error.message}`)
    }
  }

  const handleRemoveContrato = async () => {
    try {
      // Fazer requisição para remover arquivo do servidor
      const response = await fetch(`${API_BASE_URL}/remove-contrato/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na remoção')
      }
      
      setArquivoContrato(null)
      setArquivoContratoExistente(null)
      message.info('Arquivo removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover arquivo:', error)
      message.error(`Erro ao remover arquivo: ${error.message}`)
    }
  }

  const handleSubmit = async (values: any) => {
    setError(null)
    setSubmitting(true)

    try {
      const profissionalData = {
        nome: values.nome,
        email: values.email,
        especialidade: values.especialidade,
        perfil: values.perfil || null,
        especialidadeEspecifica: values.especialidadeEspecifica || null,
        contratoArquivo: arquivoContrato ? arquivoContrato.name : arquivoContratoExistente,
        gestorInterno: values.gestorInterno && values.gestorInterno.trim() ? values.gestorInterno.trim() : null,
        linhaCobranca: values.linhaCobranca && values.linhaCobranca.trim() ? values.linhaCobranca.trim() : null,
        pontosFortes: values.pontosFortes && values.pontosFortes.trim() ? values.pontosFortes.trim() : null,
        pontosFracos: values.pontosFracos && values.pontosFracos.trim() ? values.pontosFracos.trim() : null,
        dataInicio: values.dataInicio?.format('YYYY-MM-DD') || '',
        tipoContrato: values.tipoContrato,
        valorHora: values.tipoContrato === 'hora' ? parseFloat(values.valorHora) : null,
        valorFechado: values.tipoContrato === 'fechado' ? parseFloat(values.valorFechado) : null,
        periodoFechado: values.tipoContrato === 'fechado' ? values.periodoFechado : null,
        valorPago: values.tipoContrato === 'fechado' ? parseFloat(values.valorFechado) : null, // Para valor fechado, o valor pago é o mesmo do valor fechado
        status: values.status,
        tags: tags.join(','),
        contatoClienteEmail: values.contatoClienteEmail || null,
        contatoClienteTeams: values.contatoClienteTeams || null,
        contatoClienteTelefone: values.contatoClienteTelefone || null,
        contatoMatilhaEmail: values.contatoMatilhaEmail || null,
        contatoMatilhaTeams: values.contatoMatilhaTeams || null,
        contatoMatilhaTelefone: values.contatoMatilhaTelefone || null
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

              {/* Perfil */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="perfil"
                  label="Perfil"
                >
                  <Select 
                    placeholder="Selecione o perfil"
                    onChange={(value) => {
                      if (value) {
                        setEspecialidadesPorPerfil(obterEspecialidadesPorPerfil(value))
                        form.setFieldsValue({ especialidadeEspecifica: undefined })
                      }
                    }}
                  >
                    {obterPerfisDisponiveis().map((perfil) => (
                      <Option key={perfil} value={perfil}>
                        {perfil}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Upload de Contrato */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Contrato do Profissional"
                  extra="Faça upload do contrato em PDF, JPG, JPEG ou PNG (máximo 10MB)"
                >
                  <div>
                    {/* Arquivo existente */}
                    {arquivoContratoExistente && !arquivoContrato && (
                      <div style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #d9d9d9', 
                        borderRadius: '6px', 
                        backgroundColor: '#fafafa',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Space>
                          <FileTextOutlined />
                          <span>{arquivoContratoExistente}</span>
                        </Space>
                        <Button 
                          type="link" 
                          danger 
                          size="small"
                          onClick={handleRemoveContrato}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                    
                    {/* Novo arquivo selecionado */}
                    {arquivoContrato && (
                      <div style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #52c41a', 
                        borderRadius: '6px', 
                        backgroundColor: '#f6ffed',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Space>
                          <FileTextOutlined style={{ color: '#52c41a' }} />
                          <span>{arquivoContrato.name}</span>
                          <span style={{ color: '#52c41a', fontSize: '12px' }}>
                            ({(arquivoContrato.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </Space>
                        <Button 
                          type="link" 
                          danger 
                          size="small"
                          onClick={handleRemoveContrato}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                    
                    {/* Upload component */}
                    <Upload
                      beforeUpload={() => false} // Impede upload automático
                      onChange={handleUploadContrato}
                      showUploadList={false}
                      accept=".pdf,.jpg,.jpeg,.png"
                    >
                      <Button icon={<UploadOutlined />}>
                        {arquivoContratoExistente || arquivoContrato ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
                      </Button>
                    </Upload>
                  </div>
                </Form.Item>
              </Col>

              {/* Linha de cobrança / Descrição da nota / Atividade */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="linhaCobranca"
                  label="Linha de cobrança / Descrição da nota / Atividade"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Descreva a linha de cobrança, descrição da nota ou atividade do profissional"
                  />
                </Form.Item>
              </Col>

              {/* Pontos Fortes e Pontos Fracos */}
              <Col xs={24}>
                <div style={{ 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  backgroundColor: '#fafafa',
                  marginBottom: '16px'
                }}>
                  <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                    Avaliação do Profissional
                  </Title>
                  
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="pontosFortes"
                        label="Pontos Fortes"
                        extra="Principais qualidades e competências do profissional"
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Descreva os pontos fortes do profissional..."
                          style={{ borderRadius: 6 }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="pontosFracos"
                        label="Pontos Fracos"
                        extra="Áreas de melhoria e pontos de atenção"
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Descreva os pontos fracos do profissional..."
                          style={{ borderRadius: 6 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Gestor Interno */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="gestorInterno"
                  label="Gestor Interno"
                  extra="Nome do gestor interno do cliente responsável por este profissional"
                >
                  <Input 
                    placeholder="Digite o nome do gestor interno"
                    style={{ borderRadius: 6 }}
                  />
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
                    const perfil = getFieldValue('perfil')
                    const especialidadeEspecifica = getFieldValue('especialidadeEspecifica')
                    const isValorAutomatico = perfil && especialidadeEspecifica
                    
                    return (
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="valorHora"
                          label="Valor por Hora"
                          rules={[{ required: true, message: 'Valor por hora é obrigatório' }]}
                          extra={isValorAutomatico ? 'Valor da tabela de preços - será editável no contrato' : undefined}
                        >
                          <Input 
                            type="number" 
                            placeholder="0,00"
                            prefix="R$"
                            min={0}
                            step={0.01}
                            disabled={isValorAutomatico}
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

              {/* Canais de Contato */}
              <Col span={24}>
                <Divider />
                <Title level={4} style={{ margin: 0 }}>Canais de Contato</Title>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="contatoClienteEmail" label="Email (Cliente)">
                  <Input type="email" placeholder="email@cliente.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="contatoClienteTeams" label="Teams (Cliente)">
                  <Input placeholder="https://teams.microsoft.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="contatoClienteTelefone" label="Telefone (Cliente)">
                  <Input placeholder="(11) 99999-9999" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="contatoMatilhaEmail" label="Email (Matilha)">
                  <Input type="email" placeholder="email@matilha.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="contatoMatilhaTeams" label="Teams (Matilha)">
                  <Input placeholder="https://teams.microsoft.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="contatoMatilhaTelefone" label="Telefone (Matilha)">
                  <Input placeholder="(11) 99999-9999" />
                </Form.Item>
              </Col>

              {/* Tags */}
              <Col xs={24}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    Tags
                  </Text>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Adicione tags para categorizar o profissional (ex: Alocação, Projetos, Bodyshop)
                  </Text>
                  
                  {/* Input para adicionar tags */}
                  <Space style={{ marginBottom: 16 }}>
                    <Input
                      placeholder="Digite uma tag e pressione Enter"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      style={{ width: 300 }}
                    />
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      Adicionar
                    </Button>
                  </Space>

                  {/* Tags sugeridas */}
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                      Tags sugeridas:
                    </Text>
                    <Space wrap>
                      {tagsSugeridas.map((tag) => (
                        <Tag
                          key={tag}
                          color={tags.includes(tag) ? 'blue' : 'default'}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (tags.includes(tag)) {
                              handleRemoveTag(tag)
                            } else {
                              setTags([...tags, tag])
                            }
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  </div>

                  {/* Tags selecionadas */}
                  {tags.length > 0 && (
                    <div>
                      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                        Tags selecionadas:
                      </Text>
                      <Space wrap>
                        {tags.map((tag) => (
                          <Tag
                            key={tag}
                            color="blue"
                            closable
                            onClose={() => handleRemoveTag(tag)}
                          >
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
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