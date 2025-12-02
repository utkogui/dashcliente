import React, { useState, useEffect, useMemo } from 'react'
import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Divider,
  InputNumber,
  Space,
  Spin,
  Alert,
  Collapse,
  Checkbox,
  Radio,
  Table,
  Tag,
  List,
  Avatar,
  message,
  Modal
} from 'antd'
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  DollarOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  LaptopOutlined,
  AppstoreOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../utils/formatters'
import { API_CONFIG } from '../config/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { Panel } = Collapse

interface ResumoFinanceiro {
  valorContrato: number
  custoPessoas: number
  custoEquipamentos: number
  custoSoftwares: number
  custoDespesas: number
  impostos: number
  totalCustos: number
  lucro: number
  margemPercentual: number
}

const CadastroContrato = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profissionais, clientes, loading } = useData()
  const { sessionId } = useAuth()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const contratoId = searchParams.get('id') // Se houver ID, é edição
  
  // Estados para valores financeiros
  const [valorContrato, setValorContrato] = useState<number>(0)
  const [custoPessoas, setCustoPessoas] = useState<number>(0)
  const [custoEquipamentos, setCustoEquipamentos] = useState<number>(0)
  const [custoSoftwares, setCustoSoftwares] = useState<number>(0)
  const [custoDespesas, setCustoDespesas] = useState<number>(0)
  const [percentualImpostos, setPercentualImpostos] = useState<number>(13.0)
  
  // Estados para equipamentos/softwares dinâmicos
  interface ItemEquipamentoSoftware {
    id: string
    nome: string
    valor: number
  }
  const [itensEquipamentosSoftwares, setItensEquipamentosSoftwares] = useState<ItemEquipamentoSoftware[]>([])
  
  // Estados para dados do projeto
  const [contratoIndeterminado, setContratoIndeterminado] = useState<boolean>(false)
  const [duracaoEstimada, setDuracaoEstimada] = useState<number>(12) // meses padrão
  const [valorEhMensal, setValorEhMensal] = useState<boolean>(true) // true = mensal, false = total
  
  // Estados para seleção de pessoas
  const [modoSelecaoPessoas, setModoSelecaoPessoas] = useState<'manual' | 'automatico'>('manual')
  const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<string[]>([])
  const [sugestaoAutomatica, setSugestaoAutomatica] = useState<any[]>([])
  const [quantidadeMaximaPessoas, setQuantidadeMaximaPessoas] = useState<number>(2)
  
  // Estado para controle de carregamento do contrato existente
  const [loadingContrato, setLoadingContrato] = useState<boolean>(false)
  const [contratoCarregado, setContratoCarregado] = useState<boolean>(false)

  // Carregar dados do contrato existente se houver ID
  useEffect(() => {
    const carregarContrato = async () => {
      if (!contratoId || contratoCarregado) return
      
      try {
        setLoadingContrato(true)
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }
        
        if (sessionId) {
          headers['Authorization'] = `Bearer ${sessionId}`
        }
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/contratos`, {
          method: 'GET',
          headers,
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Erro ao carregar contratos')
        }
        
        const contratos = await response.json()
        const contrato = contratos.find((c: any) => c.id === contratoId)
        
        if (contrato) {
          // Preencher formulário com dados existentes
          form.setFieldsValue({
            nomeProjeto: contrato.nomeProjeto,
            codigoContrato: contrato.codigoContrato,
            clienteId: contrato.clienteId,
            dataInicio: contrato.dataInicio ? dayjs(contrato.dataInicio) : null,
            dataFim: contrato.dataFim ? dayjs(contrato.dataFim) : null,
            valorContrato: contrato.valorContrato,
            percentualImpostos: contrato.percentualImpostos || 13.0,
            observacoes: contrato.observacoes
          })
          
          // Atualizar estados
          setValorContrato(contrato.valorContrato || 0)
          setPercentualImpostos(contrato.percentualImpostos || 13.0)
          setContratoIndeterminado(!contrato.dataFim)
          
          // Calcular duração estimada
          if (contrato.dataInicio && contrato.dataFim) {
            // Se tem datas, calcular meses entre elas
            const inicio = dayjs(contrato.dataInicio)
            const fim = dayjs(contrato.dataFim)
            const meses = Math.max(1, fim.diff(inicio, 'month') + 1)
            setDuracaoEstimada(meses)
            form.setFieldValue('duracaoEstimada', meses)
          } else {
            // Contrato indeterminado - usar 12 meses como padrão
            setDuracaoEstimada(12)
            form.setFieldValue('duracaoEstimada', 12)
          }
          
          // Carregar profissionais selecionados
          if (contrato.profissionais && contrato.profissionais.length > 0) {
            const profIds = contrato.profissionais.map((p: any) => p.profissionalId)
            setProfissionaisSelecionados(profIds)
            setQuantidadeMaximaPessoas(Math.max(profIds.length, 2))
          }
          
          console.log('✅ Contrato carregado:', contrato.nomeProjeto)
        }
        
        setContratoCarregado(true)
      } catch (error) {
        console.error('Erro ao carregar contrato:', error)
        message.error('Erro ao carregar dados do contrato')
      } finally {
        setLoadingContrato(false)
      }
    }
    
    carregarContrato()
  }, [contratoId, sessionId, form, contratoCarregado])

  // Filtrar apenas profissionais ativos
  const profissionaisAtivos = useMemo(() => {
    return profissionais.filter(p => p.status === 'ativo')
  }, [profissionais])

  // Algoritmo de sugestão automática de profissionais
  const calcularSugestaoAutomatica = useMemo(() => {
    if (modoSelecaoPessoas !== 'automatico' || valorContrato === 0) {
      return []
    }

    // Calcular valor disponível para pessoas (considerando margem desejada)
    const valorTotalContrato = contratoIndeterminado && valorEhMensal 
      ? valorContrato * duracaoEstimada 
      : valorContrato
    const impostos = valorTotalContrato * (percentualImpostos / 100)
    const valorDisponivel = valorTotalContrato - impostos - custoEquipamentos - custoSoftwares - custoDespesas
    
    // Ordenar profissionais por custo-benefício
    const profissionaisOrdenados = profissionaisAtivos
      .map(prof => {
        // Calcular valor mensal do profissional
        let valorMensalProf = 0
        if (prof.tipoContrato === 'hora' && prof.valorHora) {
          // Assumir 160 horas/mês padrão
          valorMensalProf = prof.valorHora * 160
        } else if (prof.tipoContrato === 'fechado' && prof.valorFechado) {
          if (prof.periodoFechado === 'mensal') {
            valorMensalProf = prof.valorFechado
          } else if (prof.periodoFechado === 'trimestral') {
            valorMensalProf = prof.valorFechado / 3
          } else if (prof.periodoFechado === 'semestral') {
            valorMensalProf = prof.valorFechado / 6
          } else if (prof.periodoFechado === 'anual') {
            valorMensalProf = prof.valorFechado / 12
          }
        }

        // Score de custo-benefício (quanto menor o custo por experiência, melhor)
        const scorePerfil = prof.perfil === 'SENIOR' ? 3 : prof.perfil === 'PLENO' ? 2 : 1
        const scoreCustoBeneficio = scorePerfil / (valorMensalProf || 1)

        return {
          ...prof,
          valorMensalProf,
          scoreCustoBeneficio
        }
      })
      .sort((a, b) => b.scoreCustoBeneficio - a.scoreCustoBeneficio)

    // Algoritmo guloso: selecionar profissionais respeitando o limite de quantidade
    const valorAlvo = valorDisponivel * 0.7
    const selecionados: any[] = []
    let custoTotal = 0

    // Selecionar até a quantidade máxima de pessoas
    for (const prof of profissionaisOrdenados) {
      if (selecionados.length >= quantidadeMaximaPessoas) {
        break
      }
      
      if (custoTotal + prof.valorMensalProf <= valorAlvo) {
        selecionados.push(prof)
        custoTotal += prof.valorMensalProf
      }
    }

    // Se não preencheu bem e ainda há espaço, adicionar mais profissionais até o limite
    if (selecionados.length < quantidadeMaximaPessoas && custoTotal < valorDisponivel * 0.5) {
      for (const prof of profissionaisOrdenados) {
        if (selecionados.length >= quantidadeMaximaPessoas) {
          break
        }
        
        if (!selecionados.find(p => p.id === prof.id)) {
          if (custoTotal + prof.valorMensalProf <= valorDisponivel * 0.9) {
            selecionados.push(prof)
            custoTotal += prof.valorMensalProf
          }
        }
      }
    }

    return selecionados
  }, [modoSelecaoPessoas, valorContrato, profissionaisAtivos, contratoIndeterminado, valorEhMensal, duracaoEstimada, percentualImpostos, itensEquipamentosSoftwares, custoDespesas, quantidadeMaximaPessoas])

  // Atualizar custo de pessoas baseado na seleção
  useEffect(() => {
    if (modoSelecaoPessoas === 'manual') {
      const selecionados = profissionaisAtivos.filter(p => profissionaisSelecionados.includes(p.id))
      let total = 0
      selecionados.forEach(prof => {
        if (prof.tipoContrato === 'hora' && prof.valorHora) {
          total += prof.valorHora * 160 // 160 horas/mês padrão
        } else if (prof.tipoContrato === 'fechado' && prof.valorFechado) {
          if (prof.periodoFechado === 'mensal') {
            total += prof.valorFechado
          } else if (prof.periodoFechado === 'trimestral') {
            total += prof.valorFechado / 3
          } else if (prof.periodoFechado === 'semestral') {
            total += prof.valorFechado / 6
          } else if (prof.periodoFechado === 'anual') {
            total += prof.valorFechado / 12
          }
        }
      })
      setCustoPessoas(total)
    } else {
      // Modo automático: usar sugestão
      const total = calcularSugestaoAutomatica.reduce((acc, prof) => acc + prof.valorMensalProf, 0)
      setCustoPessoas(total)
      setProfissionaisSelecionados(calcularSugestaoAutomatica.map(p => p.id))
    }
  }, [modoSelecaoPessoas, profissionaisSelecionados, calcularSugestaoAutomatica, profissionaisAtivos])

  // Calcular resumo financeiro em tempo real
  const resumoFinanceiro: ResumoFinanceiro = useMemo(() => {
    // Determinar número de meses do contrato
    // Se indeterminado, usar duração estimada; senão, calcular pelas datas
    let mesesContrato = duracaoEstimada
    const dataInicioForm = form.getFieldValue('dataInicio')
    const dataFimForm = form.getFieldValue('dataFim')
    
    if (!contratoIndeterminado && dataInicioForm && dataFimForm) {
      // Calcular meses entre as datas
      const inicio = dayjs(dataInicioForm)
      const fim = dayjs(dataFimForm)
      mesesContrato = Math.max(1, fim.diff(inicio, 'month') + 1)
    }
    
    // Se contrato indeterminado e valor é mensal, calcular valor total
    let valorTotalContrato = valorContrato
    if (contratoIndeterminado && valorEhMensal) {
      valorTotalContrato = valorContrato * mesesContrato
    }
    
    const impostos = valorTotalContrato * (percentualImpostos / 100)
    
    // Calcular custo total de equipamentos/softwares a partir dos itens dinâmicos (mensal)
    const custoMensalEquipamentosSoftwares = itensEquipamentosSoftwares.reduce(
      (total, item) => total + (item.valor || 0), 
      0
    )
    
    // Multiplicar custos mensais pela duração do contrato
    const custoPessoasTotal = custoPessoas * mesesContrato
    const custoEquipamentosTotal = custoMensalEquipamentosSoftwares * mesesContrato
    const custoDespesasTotal = custoDespesas * mesesContrato
    
    const totalCustos = custoPessoasTotal + custoEquipamentosTotal + custoDespesasTotal
    const lucro = valorTotalContrato - impostos - totalCustos
    const margemPercentual = valorTotalContrato > 0 ? ((lucro / (valorTotalContrato - impostos)) * 100) : 0

    return {
      valorContrato: valorTotalContrato,
      custoPessoas: custoPessoasTotal,
      custoEquipamentos: custoEquipamentosTotal,
      custoSoftwares: 0, // Mantido para compatibilidade, mas não usado mais
      custoDespesas: custoDespesasTotal,
      impostos,
      totalCustos,
      lucro,
      margemPercentual
    }
  }, [valorContrato, custoPessoas, itensEquipamentosSoftwares, custoDespesas, percentualImpostos, contratoIndeterminado, valorEhMensal, duracaoEstimada, form])

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

  return (
    <div style={{ padding: 24 }}>
      {/* Header Fixo com Resumo Financeiro */}
      <Card 
        style={{ 
          position: 'sticky',
          top: 0,
          zIndex: 100,
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Valor do Contrato</Text>
              <div>
                <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                  {formatCurrency(resumoFinanceiro.valorContrato)}
                </Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Total de Custos</Text>
              <div>
                <Text strong style={{ fontSize: 20, color: '#722ed1' }}>
                  {formatCurrency(resumoFinanceiro.totalCustos)}
                </Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Impostos</Text>
              <div>
                <Text strong style={{ fontSize: 20, color: '#fa8c16' }}>
                  {formatCurrency(resumoFinanceiro.impostos)}
                </Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Lucro</Text>
              <div>
                <Text 
                  strong 
                  style={{ 
                    fontSize: 20, 
                    color: resumoFinanceiro.lucro >= 0 ? '#52c41a' : '#ff4d4f' 
                  }}
                >
                  {formatCurrency(resumoFinanceiro.lucro)}
                </Text>
              </div>
              <div>
                <Text 
                  type="secondary" 
                  style={{ fontSize: 12 }}
                >
                  ({resumoFinanceiro.margemPercentual.toFixed(1)}% margem)
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Botão Voltar */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/contratos_new')}
        style={{ marginBottom: 24 }}
      >
        Voltar
      </Button>

      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          try {
            setSaving(true)
            
            // Preparar profissionais selecionados
            const profissionaisParaSalvar = modoSelecaoPessoas === 'manual'
              ? profissionaisAtivos
                  .filter(p => profissionaisSelecionados.includes(p.id))
                  .map(prof => {
                    // Calcular valor mensal do profissional
                    let valorMensalProf = 0
                    if (prof.tipoContrato === 'hora' && prof.valorHora) {
                      valorMensalProf = prof.valorHora * 160 // 160 horas/mês
                    } else if (prof.tipoContrato === 'fechado' && prof.valorFechado) {
                      if (prof.periodoFechado === 'mensal') {
                        valorMensalProf = prof.valorFechado
                      } else if (prof.periodoFechado === 'trimestral') {
                        valorMensalProf = prof.valorFechado / 3
                      } else if (prof.periodoFechado === 'semestral') {
                        valorMensalProf = prof.valorFechado / 6
                      } else if (prof.periodoFechado === 'anual') {
                        valorMensalProf = prof.valorFechado / 12
                      }
                    }
                    
                    return {
                      profissionalId: prof.id,
                      valorHora: prof.tipoContrato === 'hora' ? prof.valorHora : null,
                      horasMensais: prof.tipoContrato === 'hora' ? 160 : null,
                      valorFechado: prof.tipoContrato === 'fechado' ? valorMensalProf : null,
                      periodoFechado: prof.tipoContrato === 'fechado' ? 'mensal' : null
                    }
                  })
              : calcularSugestaoAutomatica.map(prof => ({
                  profissionalId: prof.id,
                  valorHora: prof.tipoContrato === 'hora' ? prof.valorHora : null,
                  horasMensais: prof.tipoContrato === 'hora' ? 160 : null,
                  valorFechado: prof.tipoContrato === 'fechado' ? prof.valorMensalProf : null,
                  periodoFechado: prof.tipoContrato === 'fechado' ? 'mensal' : null
                }))
            
            // Preparar dados do contrato
            const valorTotalContrato = contratoIndeterminado && valorEhMensal 
              ? valorContrato * duracaoEstimada 
              : valorContrato
            
            const dadosContrato = {
              nomeProjeto: values.nomeProjeto,
              clienteId: values.clienteId,
              dataInicio: dayjs(values.dataInicio).format('YYYY-MM-DD'),
              dataFim: contratoIndeterminado ? null : dayjs(values.dataFim).format('YYYY-MM-DD'),
              valorContrato: valorTotalContrato,
              valorImpostos: resumoFinanceiro.impostos,
              percentualImpostos: percentualImpostos,
              status: 'ativo',
              observacoes: values.observacoes || null,
              profissionais: profissionaisParaSalvar
            }
            
            // Fazer requisição para salvar (POST para novo, PUT para edição)
            const headers: Record<string, string> = {
              'Content-Type': 'application/json'
            }
            
            if (sessionId) {
              headers['Authorization'] = `Bearer ${sessionId}`
            }
            
            const isEdicao = !!contratoId
            const url = isEdicao 
              ? `${API_CONFIG.BASE_URL}/contratos/${contratoId}`
              : `${API_CONFIG.BASE_URL}/contratos`
            
            const response = await fetch(url, {
              method: isEdicao ? 'PUT' : 'POST',
              headers,
              credentials: 'include',
              body: JSON.stringify(dadosContrato)
            })
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(errorData.error || 'Erro ao salvar contrato')
            }
            
            const contratoSalvo = await response.json()
            
            message.success('Contrato salvo com sucesso!')
            navigate('/contratos_new')
          } catch (error: any) {
            console.error('Erro ao salvar contrato:', error)
            message.error(error.message || 'Erro ao salvar contrato. Tente novamente.')
          } finally {
            setSaving(false)
          }
        }}
      >
        {/* Acordeons */}
        <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
          {/* Acordeon 1: Dados do Projeto */}
          <Panel 
            header={
              <Space>
                <FileTextOutlined />
                <span>Dados do Projeto</span>
              </Space>
            } 
            key="1"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Nome do Projeto"
                  name="nomeProjeto"
                  rules={[{ required: true, message: 'Informe o nome do projeto' }]}
                >
                  <Input placeholder="Nome do projeto" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Cliente"
                  name="clienteId"
                  rules={[{ required: true, message: 'Selecione o cliente' }]}
                >
                  <Select placeholder="Selecione o cliente" showSearch>
                    {clientes.map(cliente => (
                      <Option key={cliente.id} value={cliente.id}>
                        {cliente.empresa} - {cliente.nome}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Data de Início"
                  name="dataInicio"
                  rules={[{ required: true, message: 'Selecione a data de início' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
                
                <Form.Item style={{ marginBottom: 16 }}>
                  <Checkbox
                    checked={contratoIndeterminado}
                    onChange={(e) => {
                      setContratoIndeterminado(e.target.checked)
                      if (e.target.checked) {
                        form.setFieldValue('dataFim', null)
                      }
                    }}
                  >
                    Contrato Indeterminado
                  </Checkbox>
                </Form.Item>

                {!contratoIndeterminado && (
                  <Form.Item
                    label="Data de Fim"
                    name="dataFim"
                    rules={[{ required: true, message: 'Selecione a data de fim' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                )}
              </Col>
            </Row>

            {contratoIndeterminado && (
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Duração Estimada (para cálculos)"
                    name="duracaoEstimada"
                    tooltip="Informe a duração estimada em meses para cálculos de valores mensais. Ex: 6 meses, 12 meses, etc."
                    initialValue={12}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      max={120}
                      step={1}
                      addonAfter="meses"
                      onChange={(value) => setDuracaoEstimada(value || 12)}
                    />
                  </Form.Item>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Esta duração será usada apenas para cálculos e previsões. O contrato permanece indeterminado.
                  </Text>
                </Col>
              </Row>
            )}
          </Panel>

          {/* Acordeon 2: Valor do Contrato */}
          <Panel 
            header={
              <Space>
                <DollarOutlined />
                <span>Valor do Contrato</span>
              </Space>
            } 
            key="2"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                {contratoIndeterminado && (
                  <Form.Item>
                    <Space>
                      <Text strong>Tipo de Valor:</Text>
                      <Radio.Group 
                        value={valorEhMensal} 
                        onChange={(e) => setValorEhMensal(e.target.value)}
                        buttonStyle="solid"
                      >
                        <Radio.Button value={true}>Valor Mensal</Radio.Button>
                        <Radio.Button value={false}>Valor Total</Radio.Button>
                      </Radio.Group>
                    </Space>
                  </Form.Item>
                )}
                
                <Form.Item
                  label={contratoIndeterminado 
                    ? (valorEhMensal ? "Valor Mensal do Contrato" : `Valor Total do Contrato (${duracaoEstimada} meses)`)
                    : "Valor Total do Contrato"
                  }
                  name="valorContrato"
                  rules={[{ required: true, message: 'Informe o valor do contrato' }]}
                  tooltip={contratoIndeterminado 
                    ? (valorEhMensal 
                      ? `Valor mensal do contrato` 
                      : `Valor total para ${duracaoEstimada} meses estimados`)
                    : 'Valor total do contrato'
                  }
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="R$"
                    min={0}
                    step={1000}
                    formatter={(value) => 
                      `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => 
                      value!.replace(/R\$\s?|(,*)/g, '')
                    }
                    onChange={(value) => setValorContrato(value || 0)}
                  />
                </Form.Item>
                
                {contratoIndeterminado && (
                  <div>
                    {valorEhMensal ? (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Valor total estimado ({duracaoEstimada} meses): {formatCurrency(valorContrato * duracaoEstimada)}
                      </Text>
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Valor mensal estimado: {formatCurrency(valorContrato / duracaoEstimada)}/mês
                      </Text>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </Panel>

          {/* Acordeon 3: Pessoas */}
          <Panel 
            header={
              <Space>
                <TeamOutlined />
                <span>Pessoas</span>
              </Space>
            } 
            key="3"
          >
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Quantidade Máxima de Pessoas"
                  name="quantidadeMaximaPessoas"
                  initialValue={2}
                  tooltip="Defina quantas pessoas podem trabalhar neste projeto"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    max={20}
                    value={quantidadeMaximaPessoas}
                    onChange={(value) => setQuantidadeMaximaPessoas(value || 2)}
                    addonAfter="pessoas"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Modo de Seleção">
                  <Radio.Group 
                    value={modoSelecaoPessoas} 
                    onChange={(e) => setModoSelecaoPessoas(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="manual">
                      <UserOutlined /> Seleção Manual
                    </Radio.Button>
                    <Radio.Button value="automatico">
                      <TeamOutlined /> Sugestão Automática
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            {modoSelecaoPessoas === 'manual' ? (
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Selecione até {quantidadeMaximaPessoas} profissional(is) ativo(s) para este projeto
                </Text>
                <Table
                  dataSource={profissionaisAtivos}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: profissionaisSelecionados,
                    onChange: (selectedKeys) => {
                      // Limitar seleção ao máximo de pessoas
                      const limitados = (selectedKeys as string[]).slice(0, quantidadeMaximaPessoas)
                      setProfissionaisSelecionados(limitados)
                    },
                    getCheckboxProps: (record: any) => ({
                      disabled: profissionaisSelecionados.length >= quantidadeMaximaPessoas && 
                                !profissionaisSelecionados.includes(record.id)
                    })
                  }}
                  columns={[
                    {
                      title: 'Nome',
                      dataIndex: 'nome',
                      key: 'nome',
                      render: (text: string) => (
                        <Text strong>{text}</Text>
                      )
                    },
                    {
                      title: 'Especialidade',
                      dataIndex: 'especialidade',
                      key: 'especialidade',
                      render: (text: string) => (
                        <Tag color="blue">{text}</Tag>
                      )
                    },
                    {
                      title: 'Valor de Contrato',
                      key: 'valorContrato',
                      align: 'right' as const,
                      render: (record: any) => {
                        let valor = 0
                        if (record.tipoContrato === 'hora' && record.valorHora) {
                          valor = record.valorHora * 160 // 160 horas/mês
                        } else if (record.tipoContrato === 'fechado' && record.valorFechado) {
                          if (record.periodoFechado === 'mensal') {
                            valor = record.valorFechado
                          } else if (record.periodoFechado === 'trimestral') {
                            valor = record.valorFechado / 3
                          } else if (record.periodoFechado === 'semestral') {
                            valor = record.valorFechado / 6
                          } else if (record.periodoFechado === 'anual') {
                            valor = record.valorFechado / 12
                          }
                        }
                        return (
                          <Text style={{ color: '#1890ff', fontWeight: 600 }}>
                            {formatCurrency(valor)}/mês
                          </Text>
                        )
                      }
                    }
                  ]}
                />
              </div>
            ) : (
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Algoritmo sugere profissionais baseado em custo-benefício e disponibilidade
                </Text>
                {calcularSugestaoAutomatica.length > 0 ? (
                  <div>
                    <Alert
                      message={`Sugestão de ${calcularSugestaoAutomatica.length} profissional(is) de até ${quantidadeMaximaPessoas} permitido(s)`}
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <List
                      dataSource={calcularSugestaoAutomatica}
                      renderItem={(prof) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={
                            <Space>
                              <Text strong>{prof.nome}</Text>
                              <Tag color="blue">{prof.especialidade}</Tag>
                              {prof.perfil && <Tag>{prof.perfil}</Tag>}
                            </Space>
                          }
                          description={
                            <Space>
                              <Text type="secondary">Valor: </Text>
                              <Text strong style={{ color: '#1890ff' }}>
                                {formatCurrency(prof.valorMensalProf)}/mês
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                    />
                  </div>
                ) : (
                  <Alert
                    message="Informe o valor do contrato para gerar sugestões automáticas"
                    type="info"
                    showIcon
                  />
                )}
              </div>
            )}
          </Panel>

          {/* Acordeon 4: Equipamentos / Softwares */}
          <Panel 
            header={
              <Space>
                <LaptopOutlined />
                <span>Equipamentos / Softwares</span>
              </Space>
            } 
            key="4"
          >
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Adicione equipamentos e softwares com seus respectivos valores. Estes itens podem ser reutilizados em novos projetos.
              </Text>
            </div>
            
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {itensEquipamentosSoftwares.map((item, index) => (
                <Card 
                  key={item.id} 
                  size="small"
                  style={{ backgroundColor: '#fafafa' }}
                >
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={14}>
                      <Form.Item
                        label="Nome do Item"
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          placeholder="Ex: Notebook Dell, Licença Adobe, etc."
                          value={item.nome}
                          onChange={(e) => {
                            const novosItens = [...itensEquipamentosSoftwares]
                            novosItens[index].nome = e.target.value
                            setItensEquipamentosSoftwares(novosItens)
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={18} sm={8}>
                      <Form.Item
                        label="Valor Mensal"
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          prefix="R$"
                          min={0}
                          step={100}
                          value={item.valor}
                          formatter={(value) => 
                            `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }
                          parser={(value) => 
                            value!.replace(/R\$\s?|(,*)/g, '')
                          }
                          onChange={(value) => {
                            const novosItens = [...itensEquipamentosSoftwares]
                            novosItens[index].valor = value || 0
                            setItensEquipamentosSoftwares(novosItens)
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={6} sm={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          const novosItens = itensEquipamentosSoftwares.filter(i => i.id !== item.id)
                          setItensEquipamentosSoftwares(novosItens)
                        }}
                        style={{ marginTop: 30 }}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
              
              <Button
                type="dashed"
                onClick={() => {
                  const novoItem: ItemEquipamentoSoftware = {
                    id: `item-${Date.now()}-${Math.random()}`,
                    nome: '',
                    valor: 0
                  }
                  setItensEquipamentosSoftwares([...itensEquipamentosSoftwares, novoItem])
                }}
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 8 }}
              >
                Adicionar Item
              </Button>
              
              {itensEquipamentosSoftwares.length > 0 && (
                <Card size="small" style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong>Custo Total:</Text>
                    </Col>
                    <Col>
                      <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                        {formatCurrency(
                          itensEquipamentosSoftwares.reduce((total, item) => total + (item.valor || 0), 0)
                        )}/mês
                      </Text>
                    </Col>
                  </Row>
                </Card>
              )}
            </Space>
          </Panel>

          {/* Acordeon 6: Impostos */}
          <Panel 
            header={
              <Space>
                <PercentageOutlined />
                <span>Impostos</span>
              </Space>
            } 
            key="6"
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Percentual de Impostos"
                  name="percentualImpostos"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    addonAfter="%"
                    min={0}
                    max={100}
                    step={0.5}
                    precision={2}
                    value={percentualImpostos}
                    onChange={(value) => {
                      const newValue = value || 13.0
                      setPercentualImpostos(newValue)
                      form.setFieldValue('percentualImpostos', newValue)
                    }}
                    placeholder="Ex: 15"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Valor dos Impostos (período)">
                  <Input
                    value={formatCurrency(resumoFinanceiro.impostos)}
                    disabled
                    style={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Valor Mensal Impostos">
                  <Input
                    value={formatCurrency(resumoFinanceiro.impostos / (duracaoEstimada || 12))}
                    disabled
                    style={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Cálculo: {formatCurrency(resumoFinanceiro.valorContrato)} × {percentualImpostos}% = {formatCurrency(resumoFinanceiro.impostos)}
              </Text>
            </div>
          </Panel>

          {/* Acordeon 7: Despesas */}
          <Panel 
            header={
              <Space>
                <ShoppingOutlined />
                <span>Despesas</span>
              </Space>
            } 
            key="7"
          >
            <Form.Item
              label="Custo Total de Despesas"
              name="custoDespesas"
            >
              <InputNumber
                style={{ width: '100%' }}
                prefix="R$"
                min={0}
                step={100}
                formatter={(value) => 
                  `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => 
                  value!.replace(/R\$\s?|(,*)/g, '')
                }
                onChange={(value) => setCustoDespesas(value || 0)}
              />
            </Form.Item>
          </Panel>
        </Collapse>

        {/* Botões de Ação */}
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Space>
            <Button onClick={() => navigate('/contratos_new')}>
              Cancelar
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Contrato'}
            </Button>
          </Space>
        </div>

        {/* Botão de Deletar - só aparece se estiver editando um contrato existente */}
        {contratoId && (
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deleting}
              onClick={() => {
                Modal.confirm({
                  title: 'Confirmar exclusão',
                  icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
                  content: 'Tem certeza que deseja deletar este contrato? Esta ação não pode ser desfeita.',
                  okText: 'Sim, deletar',
                  okType: 'danger',
                  cancelText: 'Cancelar',
                  onOk: async () => {
                    try {
                      setDeleting(true)
                      
                      const headers: Record<string, string> = {
                        'Content-Type': 'application/json'
                      }
                      
                      if (sessionId) {
                        headers['Authorization'] = `Bearer ${sessionId}`
                      }
                      
                      const response = await fetch(`${API_CONFIG.BASE_URL}/contratos/${contratoId}`, {
                        method: 'DELETE',
                        headers,
                        credentials: 'include'
                      })
                      
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}))
                        throw new Error(errorData.error || 'Erro ao deletar contrato')
                      }
                      
                      message.success('Contrato deletado com sucesso!')
                      navigate('/contratos_new')
                    } catch (error: any) {
                      console.error('Erro ao deletar contrato:', error)
                      message.error(error.message || 'Erro ao deletar contrato. Tente novamente.')
                    } finally {
                      setDeleting(false)
                    }
                  }
                })
              }}
            >
              Deletar Contrato
            </Button>
          </div>
        )}
      </Form>
    </div>
  )
}

export default CadastroContrato
