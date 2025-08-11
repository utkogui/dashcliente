import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Typography,
  Button,
  Space,
  Card,
  Row,
  Col,
  Tabs,
  Input,
  Select,
  List,
  Tag,
  Spin,
  Alert,
  Divider,
  InputNumber,
  Badge
} from 'antd'
import {
  SearchOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useData } from '../contexts/DataContext'
import { formatCurrency } from '../utils/formatters'

interface SugestaoProfissional {
  profissional: any
  custoMensal: number
  margem: number
  percentualMargem: number
  score: number
  disponivel: boolean
  especialidade: string
}

interface SugestaoProfissionaisProps {
  open: boolean
  onClose: () => void
  valorContrato: number
  valorImpostos: number
  quantidadeProfissionais: number
  isMensal: boolean
  onAplicarSugestao: (profissionais: any[]) => void
}

const SugestaoProfissionais: React.FC<SugestaoProfissionaisProps> = ({
  open,
  onClose,
  valorContrato,
  valorImpostos,
  quantidadeProfissionais,
  isMensal,
  onAplicarSugestao
}) => {
  const { profissionais, contratos } = useData()
  const [sugestoes, setSugestoes] = useState<SugestaoProfissional[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todas')
  const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<string[]>([])
  const [margemDesejada, setMargemDesejada] = useState<number>(20) // 20% padrão
  const [tabAtiva, setTabAtiva] = useState<'manual' | 'sugestoes'>('manual')
  const [buscaManual, setBuscaManual] = useState('')

  // Calcular orçamento disponível
  const valorLiquido = valorContrato - valorImpostos
  const valorTotal = isMensal ? valorLiquido * 12 : valorLiquido
  const orcamentoDisponivel = valorTotal // Orçamento total disponível para todos os profissionais

  // Verificar disponibilidade dos profissionais
  const verificarDisponibilidade = (profissionalId: string) => {
    const contratosAtivos = contratos.filter(c => 
      c.status === 'ativo' && 
      c.profissionais.some(p => p.profissionalId === profissionalId)
    )
    
    // Considerar disponível se não está em mais de 2 projetos ativos
    return contratosAtivos.length < 2
  }

  // Calcular custo mensal do profissional
  const calcularCustoMensal = (profissional: any) => {
    if (profissional.tipoContrato === 'hora') {
      // Assumir 160h/mês (8h/dia * 20 dias)
      return (profissional.valorHora || 0) * 160
    } else {
      // Para valor fechado, usar o valor fechado
      return profissional.valorFechado || 0
    }
  }

  // Filtrar profissionais para seleção manual
  const profissionaisFiltrados = profissionais.filter(profissional => {
    const nomeMatch = profissional.nome.toLowerCase().includes(buscaManual.toLowerCase())
    const especialidadeMatch = filtroEspecialidade === 'todas' || profissional.especialidade === filtroEspecialidade
    return nomeMatch && especialidadeMatch
  })

  // Gerar sugestões
  const gerarSugestoes = () => {
    setLoading(true)
    const sugestoesCalculadas: SugestaoProfissional[] = profissionais
      .filter((profissional) => filtroEspecialidade === 'todas' || profissional.especialidade === filtroEspecialidade)
      .map((profissional) => {
        const custoMensal = calcularCustoMensal(profissional)
        const custoTotal = isMensal ? custoMensal * 12 : custoMensal
        const margem = orcamentoDisponivel - custoTotal
        const percentualMargem = orcamentoDisponivel > 0 ? (margem / orcamentoDisponivel) * 100 : 0
        const disponivel = verificarDisponibilidade(profissional.id)
        const score = disponivel ? percentualMargem : percentualMargem * 0.5
        return {
          profissional,
          custoMensal,
          margem,
          percentualMargem,
          score,
          disponivel,
          especialidade: profissional.especialidade
        }
      })
      .filter((sugestao) => sugestao.percentualMargem >= -margemDesejada)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
    setSugestoes(sugestoesCalculadas)
    setLoading(false)
  }

  // Aplicar sugestão
  const aplicarSugestao = () => {
    let profissionaisSelecionadosData: any[] = []

    if (tabAtiva === 'manual') {
      // Seleção manual
      const profissionaisManual = profissionaisFiltrados.filter(p => 
        profissionaisSelecionados.includes(p.id)
      )
      profissionaisSelecionadosData = profissionaisManual.map(p => ({
        profissionalId: p.id,
        valorHora: p.tipoContrato === 'hora' ? p.valorHora : null,
        horasMensais: p.tipoContrato === 'hora' ? 160 : null,
        valorFechado: p.tipoContrato === 'fechado' ? p.valorFechado : null,
        periodoFechado: p.tipoContrato === 'fechado' ? p.periodoFechado : null
      }))
    } else {
      // Sugestões automáticas
      const profissionaisSugestao = sugestoes
        .filter(s => profissionaisSelecionados.includes(s.profissional.id))
        .map(s => ({
          profissionalId: s.profissional.id,
          valorHora: s.profissional.tipoContrato === 'hora' ? s.profissional.valorHora : null,
          horasMensais: s.profissional.tipoContrato === 'hora' ? 160 : null,
          valorFechado: s.profissional.tipoContrato === 'fechado' ? s.profissional.valorFechado : null,
          periodoFechado: s.profissional.tipoContrato === 'fechado' ? s.profissional.periodoFechado : null
        }))
      profissionaisSelecionadosData = profissionaisSugestao
    }

    onAplicarSugestao(profissionaisSelecionadosData)
    onClose()
  }

  // Selecionar/deselecionar profissional
  const toggleProfissional = (profissionalId: string) => {
    setProfissionaisSelecionados(prev => {
      if (prev.includes(profissionalId)) {
        return prev.filter(id => id !== profissionalId)
      } else {
        return [...prev, profissionalId]
      }
    })
  }

  // Gerar sugestões quando abrir o modal ou mudar para aba de sugestões
  // Recalcular sugestões quando mudar filtros/campos na aba "Sugestões"
  useEffect(() => {
    if (open && tabAtiva === 'sugestoes') {
      // Loading a cada caractere: ativa imediatamente e aplica debounce curto
      setLoading(true)
      const t = setTimeout(() => {
        gerarSugestoes()
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open, tabAtiva, valorContrato, valorImpostos, isMensal, filtroEspecialidade, margemDesejada])

  // Resetar seleções quando abrir o modal
  useEffect(() => {
    if (open) {
      setProfissionaisSelecionados([])
      setTabAtiva('manual')
      setBuscaManual('')
    }
  }, [open])

  const especialidades = useMemo(() => [...new Set(profissionais.map(p => p.especialidade))], [profissionais])

  // Resumo dinâmico baseado na seleção atual (dentro do modal)
  const selecionadosObjs = useMemo(
    () => profissionais.filter(p => profissionaisSelecionados.includes(p.id)),
    [profissionais, profissionaisSelecionados]
  )
  const custoSelecionadosMensal = useMemo(() => {
    return selecionadosObjs.reduce((acc, p) => {
      if (p.tipoContrato === 'hora') return acc + ((p.valorHora || 0) * 160)
      return acc + (p.valorFechado || 0)
    }, 0)
  }, [selecionadosObjs])
  const resultadoAtual = useMemo(() => (valorContrato - valorImpostos) - custoSelecionadosMensal, [valorContrato, valorImpostos, custoSelecionadosMensal])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      title={
        <Space>
          <ThunderboltOutlined />
          <Typography.Title level={4} style={{ margin: 0 }}>Adicionar Profissional</Typography.Title>
        </Space>
      }
      footer={[
        <Button key="cancel" onClick={onClose}>Cancelar</Button>,
        <Button
          key="apply"
          type="primary"
          onClick={aplicarSugestao}
          disabled={profissionaisSelecionados.length === 0}
          icon={<CheckCircleOutlined />}
        >
          Adicionar Profissional ({profissionaisSelecionados.length})
        </Button>
      ]}
    >
      {/* Tabs */}
      <Tabs
        activeKey={tabAtiva}
        onChange={(k) => setTabAtiva(k as 'manual' | 'sugestoes')}
        items={[
          { key: 'manual', label: 'Seleção Manual' },
          { key: 'sugestoes', label: 'Sugestões Automáticas' }
        ]}
      />

      {/* Resumo do Contrato */}
      <Card style={{ marginBottom: 16 }}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>Resumo do Contrato</Typography.Title>
        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Valor do Contrato</Typography.Text>
              <Typography.Text strong>{formatCurrency(valorContrato)}</Typography.Text>
            </Space>
          </Col>
          <Col xs={12} md={6}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Impostos</Typography.Text>
              <Typography.Text strong type="danger">{formatCurrency(valorImpostos)}</Typography.Text>
            </Space>
          </Col>
          <Col xs={12} md={6}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Valor Líquido</Typography.Text>
              <Typography.Text strong type="success">{formatCurrency(valorLiquido)}</Typography.Text>
            </Space>
          </Col>
          <Col xs={12} md={6}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Orçamento Disponível</Typography.Text>
              <Typography.Text strong>{formatCurrency(orcamentoDisponivel)}</Typography.Text>
            </Space>
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={[16, 16]}>
          <Col xs={12} md={8}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Selecionados</Typography.Text>
              <Typography.Text strong>{profissionaisSelecionados.length}</Typography.Text>
            </Space>
          </Col>
          <Col xs={12} md={8}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Custo Profissionais (Mensal)</Typography.Text>
              <Typography.Text strong>{formatCurrency(custoSelecionadosMensal)}</Typography.Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Líquido - Profissionais (Mensal)</Typography.Text>
              <Typography.Text strong type={resultadoAtual >= 0 ? 'success' : 'danger'}>{formatCurrency(resultadoAtual)}</Typography.Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filtros */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={12}>
            <Space>
              <Typography.Text>Especialidade:</Typography.Text>
              <Select
                value={filtroEspecialidade}
                onChange={setFiltroEspecialidade}
                style={{ minWidth: 240 }}
                options={[{ label: 'Todas as Especialidades', value: 'todas' }, ...especialidades.map(e => ({ label: e, value: e }))]}
              />
            </Space>
          </Col>
          <Col xs={24} md={12}>
            {tabAtiva === 'manual' ? (
              <Input
                placeholder="Buscar por Nome"
                prefix={<SearchOutlined />}
                value={buscaManual}
                onChange={(e) => setBuscaManual(e.target.value)}
                allowClear
              />
            ) : (
              <Space>
                <Typography.Text>Margem Mínima (%):</Typography.Text>
                <InputNumber
                  min={-100}
                  max={100}
                  value={margemDesejada}
                  onChange={(v) => setMargemDesejada(Number(v || 0))}
                />
                {loading && <Spin indicator={<LoadingOutlined spin />} size="small" />}
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      {/* Conteúdo */}
      {tabAtiva === 'manual' ? (
        <>
          <Space style={{ marginBottom: 8 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>Selecionar Profissional</Typography.Title>
            <Tag color={profissionaisSelecionados.length > 0 ? 'green' : 'orange'}>
              {profissionaisSelecionados.length} selecionados
            </Tag>
          </Space>

          <List
            itemLayout="horizontal"
            dataSource={profissionaisFiltrados}
            renderItem={(profissional) => {
              const disponivel = verificarDisponibilidade(profissional.id)
              const custoMensal = calcularCustoMensal(profissional)
              const selecionado = profissionaisSelecionados.includes(profissional.id)
              return (
                <List.Item
                  onClick={() => toggleProfissional(profissional.id)}
                  style={{
                    border: `1px solid ${selecionado ? '#1677ff' : '#f0f0f0'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    padding: 12,
                    marginBottom: 8
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Typography.Text strong>{profissional.nome}</Typography.Text>
                        <Badge status={disponivel ? 'success' : 'warning'} text={disponivel ? 'Disponível' : 'Ocupado'} />
                      </Space>
                    }
                    description={
                      <Row gutter={12} wrap align="middle">
                        <Col>
                          <Typography.Text type="secondary">{profissional.especialidade}</Typography.Text>
                        </Col>
                        <Col>
                          <Typography.Text>Tipo: {profissional.tipoContrato === 'hora' ? 'Por Hora' : 'Valor Fechado'}</Typography.Text>
                        </Col>
                        <Col>
                          <Typography.Text>Custo: {formatCurrency(custoMensal)}/mês</Typography.Text>
                        </Col>
                      </Row>
                    }
                  />
                  {selecionado && <CheckCircleOutlined style={{ color: '#1677ff' }} />}
                </List.Item>
              )
            }}
          />

          {profissionaisFiltrados.length === 0 && (
            <Alert type="info" message="Nenhum profissional encontrado com os filtros atuais." />
          )}
        </>
      ) : (
        <>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Space style={{ marginBottom: 8 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>Melhores Sugestões</Typography.Title>
                <Tag color={profissionaisSelecionados.length > 0 ? 'green' : 'orange'}>
                  {profissionaisSelecionados.length} selecionados
                </Tag>
              </Space>

              <List
                itemLayout="horizontal"
                dataSource={sugestoes}
                renderItem={(sugestao, index) => {
                  const selecionado = profissionaisSelecionados.includes(sugestao.profissional.id)
                  return (
                    <List.Item
                      onClick={() => toggleProfissional(sugestao.profissional.id)}
                      style={{
                        border: `1px solid ${selecionado ? '#1677ff' : '#f0f0f0'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        padding: 12,
                        marginBottom: 8
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Typography.Text strong>{sugestao.profissional.nome}</Typography.Text>
                            {index < quantidadeProfissionais && <Tag color="blue">Top</Tag>}
                          </Space>
                        }
                        description={
                          <Row gutter={12} wrap align="middle">
                            <Col>
                              <Typography.Text type="secondary">{sugestao.especialidade}</Typography.Text>
                            </Col>
                            <Col>
                              <Typography.Text>Custo: {formatCurrency(sugestao.custoMensal)}/mês</Typography.Text>
                            </Col>
                            <Col>
                              <Typography.Text type={sugestao.margem >= 0 ? 'success' : 'danger'}>
                                Margem: {formatCurrency(sugestao.margem)} ({sugestao.percentualMargem.toFixed(1)}%)
                              </Typography.Text>
                            </Col>
                          </Row>
                        }
                      />
                      {selecionado && <CheckCircleOutlined style={{ color: '#1677ff' }} />}
                    </List.Item>
                  )
                }}
              />

              {sugestoes.length === 0 && (
                <Alert type="warning" message="Nenhuma sugestão encontrada com os critérios atuais. Ajuste os filtros ou a margem mínima." />
              )}
            </>
          )}
        </>
      )}
    </Modal>
  )
}

export default SugestaoProfissionais 