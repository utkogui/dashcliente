import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Card, Tag, Input, Select, Alert, Divider, Button, Modal, Typography, Skeleton, Pagination, Space } from 'antd'
import { UserOutlined, SearchOutlined, FieldTimeOutlined, CalendarOutlined, FilterOutlined, MailOutlined, MessageOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { calcularDiasRestantes, getCardStyle } from '../utils/formatters'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'
import { track } from '../utils/telemetry'

const { Text, Title } = Typography

const VisaoClienteAnt = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profissionais, contratos, clientes, loading, error, reload } = useData()
  const { sessionId } = useAuth()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterEspecialidade, setFilterEspecialidade] = useState('todas')
  const [filterPrazo, setFilterPrazo] = useState<'todos' | '<15' | '<30' | '<60' | 'indeterminado'>('todos')
  const [filterSenioridade, setFilterSenioridade] = useState('todas')
  const [orderBy, setOrderBy] = useState<'prazo' | 'status'>('prazo')

  const [interestLoading, setInterestLoading] = useState(false)
  const [interestMessage, setInterestMessage] = useState<string | null>(null)
  const [interestError, setInterestError] = useState<string | null>(null)
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [noteSaved, setNoteSaved] = useState(false)

  // Debounce busca
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(h)
  }, [searchTerm])

  // Paginação
  const [page, setPage] = useState(1)
  const pageSize = 12

  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (
    process.env.NODE_ENV === 'production' ? 'https://dashcliente.onrender.com/api' : 'http://localhost:3001/api'
  )

  const getProfissionalInfo = (profissional: any) => {
    const contratosAtivos = contratos.filter(c => c.status === 'ativo' && c.profissionais.some(p => p.profissionalId === profissional.id))
    if (contratosAtivos.length === 0) return { status: 'aguardando', projetos: [] as any[] }
    const projetos = contratosAtivos.map(contrato => {
      const cliente = clientes.find(c => c.id === contrato.clienteId)
      return {
        nome: contrato.nomeProjeto,
        cliente: cliente?.empresa || 'Cliente não encontrado',
        dataInicio: contrato.dataInicio,
        dataFim: contrato.dataFim,
        status: contrato.status,
        contrato
      }
    })
    return { status: 'ativo', projetos }
  }

  // Filtros e ordenação
  const filteredProfissionais = profissionais
    .filter(profissional => {
      const info = getProfissionalInfo(profissional)
      const searchLc = (debouncedSearch || '').toLowerCase()
      const nomeLc = (profissional.nome || '').toLowerCase()
      const espLc = (profissional.especialidade || '').toLowerCase()
      const matchesSearch = nomeLc.includes(searchLc) || espLc.includes(searchLc) || info.projetos.some(p => (p.nome || '').toLowerCase().includes(searchLc))
      const matchesStatus = filterStatus === 'todos' || (filterStatus === 'ativo' && info.status === 'ativo') || (filterStatus === 'aguardando' && info.status === 'aguardando')
      const matchesEspecialidade = filterEspecialidade === 'todas' || profissional.especialidade === filterEspecialidade
      const matchesSenioridade = filterSenioridade === 'todas' || (profissional.perfil || '') === filterSenioridade
      const projeto = info.projetos[0]
      const dias = projeto ? calcularDiasRestantes(projeto.contrato) : null
      const matchesPrazo = (() => {
        if (filterPrazo === 'todos') return true
        if (filterPrazo === 'indeterminado') return dias === null
        if (dias === null) return false
        switch (filterPrazo) {
          case '<15': return dias < 15 && dias >= 0
          case '<30': return dias < 30 && dias >= 0
          case '<60': return dias < 60 && dias >= 0
          default: return true
        }
      })()
      return matchesSearch && matchesStatus && matchesEspecialidade && matchesSenioridade && matchesPrazo
    })
    .sort((a, b) => {
      const infoA = getProfissionalInfo(a)
      const infoB = getProfissionalInfo(b)
      if (orderBy === 'status') {
        if (infoA.status === 'ativo' && infoB.status !== 'ativo') return -1
        if (infoB.status === 'ativo' && infoA.status !== 'ativo') return 1
        return a.nome.localeCompare(b.nome)
      }
      if (infoA.status === 'ativo' && infoB.status !== 'ativo') return -1
      if (infoB.status === 'ativo' && infoA.status !== 'ativo') return 1
      const projetoA = infoA.projetos[0]
      const projetoB = infoB.projetos[0]
      const diasA = projetoA ? calcularDiasRestantes(projetoA.contrato) : null
      const diasB = projetoB ? calcularDiasRestantes(projetoB.contrato) : null
      const rank = (dias: number | null) => (dias === null ? Number.POSITIVE_INFINITY : dias)
      return rank(diasA) - rank(diasB)
    })

  useEffect(() => { setPage(1) }, [debouncedSearch, filterStatus, filterEspecialidade, filterPrazo, filterSenioridade, orderBy])
  const totalPages = Math.max(1, Math.ceil(filteredProfissionais.length / pageSize))
  const paginatedProfissionais = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProfissionais.slice(start, start + pageSize)
  }, [filteredProfissionais, page])

  const especialidades = [...new Set(profissionais.map(p => p.especialidade || '').filter(Boolean))] as string[]
  const senioridades = [...new Set(profissionais.map(p => p.perfil || '').filter(Boolean))] as string[]

  // URL params
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const st = searchParams.get('status') || 'todos'
    const esp = searchParams.get('esp') || 'todas'
    const prazo = (searchParams.get('prazo') as any) || 'todos'
    const sen = searchParams.get('sen') || 'todas'
    const ord = (searchParams.get('ord') as any) || 'prazo'
    setSearchTerm(q)
    setFilterStatus(st)
    setFilterEspecialidade(esp)
    setFilterPrazo(prazo)
    setFilterSenioridade(sen)
    setOrderBy(ord)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (searchTerm) params.q = searchTerm
    if (filterStatus !== 'todos') params.status = filterStatus
    if (filterEspecialidade !== 'todas') params.esp = filterEspecialidade
    if (filterPrazo !== 'todos') params.prazo = filterPrazo
    if (filterSenioridade !== 'todas') params.sen = filterSenioridade
    if (orderBy !== 'prazo') params.ord = orderBy
    setSearchParams(params, { replace: true })
    track({ type: 'filters_change', payload: params })
  }, [searchTerm, filterStatus, filterEspecialidade, filterPrazo, filterSenioridade, orderBy, setSearchParams])

  const getDiasRestantesText = (dias: number | null) => {
    if (dias === null) return 'Indeterminado'
    if (dias > 0) return `${dias} dias`
    return 'Vencido'
  }

  const getDiasRestantesColor = (dias: number | null) => {
    if (dias === null) return '#166534'
    if (dias > 60) return '#166534'
    if (dias > 30) return '#92400e'
    if (dias > 0) return '#b91c1c'
    return '#7f1d1d'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 80, background: 'rgb(0,49,188)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, boxShadow: 'rgba(0,0,0,0.15) 0 2px 8px' }}>
        <img src={logoFtdMatilha} alt="FTD Matilha" style={{ height: 50, width: 'auto', objectFit: 'contain' }} />
      </div>

      <div style={{ paddingTop: 120, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }}>
        {/* Filtros */}
        <div style={{ padding: 16, marginBottom: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FilterOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <Text strong>Filtros</Text>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar profissionais ou projetos..." prefix={<SearchOutlined />} style={{ background: '#f8fafc', borderRadius: 8 }} />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: '100%' }} placeholder="Status">
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="ativo">Ativos</Select.Option>
                <Select.Option value="aguardando">Aguardando Contrato</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={filterEspecialidade} onChange={setFilterEspecialidade} style={{ width: '100%' }} placeholder="Especialidade">
                <Select.Option value="todas">Todas as Especialidades</Select.Option>
                {especialidades.map(esp => <Select.Option key={esp} value={esp}>{esp}</Select.Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={filterPrazo} onChange={(v) => setFilterPrazo(v as any)} style={{ width: '100%' }} placeholder="Prazo">
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="<60">Menos de 60 dias</Select.Option>
                <Select.Option value="<30">Menos de 30 dias</Select.Option>
                <Select.Option value="<15">Menos de 15 dias</Select.Option>
                <Select.Option value="indeterminado">Indeterminado</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={filterSenioridade} onChange={setFilterSenioridade} style={{ width: '100%' }} placeholder="Senioridade">
                <Select.Option value="todas">Todas</Select.Option>
                {senioridades.map(l => <Select.Option key={l} value={l}>{l}</Select.Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={orderBy} onChange={(v) => setOrderBy(v as any)} style={{ width: '100%' }} placeholder="Ordenar por">
                <Select.Option value="prazo">Prazo (menor→maior)</Select.Option>
                <Select.Option value="status">Status (ativos primeiro)</Select.Option>
              </Select>
            </Col>
            <Col span={24}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => { setSearchTerm(''); setFilterStatus('todos'); setFilterEspecialidade('todas'); setFilterPrazo('todos'); setFilterSenioridade('todas'); setOrderBy('prazo') }}>Limpar filtros</Button>
              </div>
            </Col>
          </Row>
        </div>

        {error && (
          <Alert type="error" style={{ borderRadius: 8, marginBottom: 16 }} message={error} action={<Button size="small" onClick={() => reload()}>Tentar novamente</Button>} />
        )}

        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: pageSize }).map((_, idx) => (
              <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                <Card style={{ borderRadius: 12 }}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : filteredProfissionais.length === 0 ? (
          <Alert type="info" style={{ borderRadius: 8 }} message="Nenhum profissional encontrado com os filtros aplicados." />
        ) : (
          <Row gutter={[16, 16]}>
            {paginatedProfissionais.map((profissional) => {
              const info = getProfissionalInfo(profissional)
              const projetoAtivo = info.projetos[0]
              const diasRestantes = projetoAtivo ? calcularDiasRestantes(projetoAtivo.contrato) : null
              const diasColor = getDiasRestantesColor(diasRestantes)
              const emProjeto = info.status === 'ativo' && Boolean(projetoAtivo)
              const disponibilidadeCor = emProjeto ? '#22c55e' : '#ff9aa2'

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={profissional.id}>
                  <Card
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedProfissionalId(profissional.id); track({ type: 'card_open', profissionalId: profissional.id }) } }}
                    onClick={() => { setSelectedProfissionalId(profissional.id); track({ type: 'card_open', profissionalId: profissional.id }) }}
                    style={{ height: 380, display: 'flex', flexDirection: 'column', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', ...(info.status === 'ativo' && projetoAtivo ? getCardStyle(projetoAtivo.contrato) : {}) }}
                    bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}
                  >
                    <div style={{ height: 6, width: '100%', background: diasColor, borderTopLeftRadius: 12, borderTopRightRadius: 12, position: 'absolute', left: 0, top: 0 }} />
                    <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: disponibilidadeCor, boxShadow: `0 0 0 3px ${emProjeto ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)'}` }} />
                        <Title level={5} style={{ margin: 0 }} title={profissional.nome}>{profissional.nome}</Title>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ color: emProjeto ? '#1677ff' : '#faad14' }}>{emProjeto ? 'Em projeto' : 'Disponível'}</Text>
                        {info.projetos.length > 1 && <Tag color="geekblue">Multi-projeto</Tag>}
                      </div>
                      <Text type="secondary" style={{ marginTop: 4 }}>{profissional.especialidade}</Text>
                      {profissional.tags && (
                        <Space size={[4, 4]} wrap style={{ marginTop: 8 }}>
                          {profissional.tags.split(',').map((tag: string, index: number) => {
                            const t = tag.trim()
                            if (!t) return null
                            let color: string | undefined
                            if (t.toLowerCase().includes('alocação') || t.toLowerCase().includes('alocacao')) color = 'blue'
                            else if (t.toLowerCase().includes('projeto')) color = 'green'
                            else if (t.toLowerCase().includes('bodyshop')) color = 'orange'
                            else if (t.toLowerCase().includes('freelancer')) color = 'cyan'
                            else if (t.toLowerCase().includes('clt')) color = 'purple'
                            else if (t.toLowerCase().includes('pj')) color = 'red'
                            return <Tag key={index} color={color}>{t}</Tag>
                          })}
                        </Space>
                      )}
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', justifyContent: (info.status === 'aguardando' || !projetoAtivo) ? 'center' : 'flex-start' }}>
                      {info.status === 'aguardando' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f', textAlign: 'center' }}>
                          <Text strong style={{ marginBottom: 8 }}>Aguardando contrato</Text>
                          <Button type="primary" onClick={(e) => { e.stopPropagation(); navigate('/cadastro-contrato') }}>Alocar este profissional</Button>
                        </div>
                      ) : projetoAtivo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <Title level={5} style={{ margin: 0 }} title={projetoAtivo.nome}>{projetoAtivo.nome}</Title>
                          <Text type="secondary">{projetoAtivo.cliente}</Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CalendarOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
                            <Text type="secondary">{new Date(projetoAtivo.dataInicio).toLocaleDateString('pt-BR')}{projetoAtivo.dataFim && ` - ${new Date(projetoAtivo.dataFim).toLocaleDateString('pt-BR')}`}</Text>
                          </div>
                          <Space size={[8, 8]} wrap style={{ marginTop: 6 }}>
                            {(() => {
                              const cliente = clientes.find(c => c.empresa === projetoAtivo.cliente)
                              const contatoNome = cliente?.nome
                              const contatoEmail = cliente?.email
                              const contatoTelefone = (() => {
                                const prof = profissionais.find(p => p.id === profissional.id)
                                return prof?.contatoClienteTelefone || cliente?.telefone || undefined
                              })()
                              const teamsHref = contatoEmail ? `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(contatoEmail)}` : undefined
                              return (
                                <>
                                  {contatoNome && <Tag icon={<UserOutlined />}>{`Contato: ${contatoNome}`}</Tag>}
                                  {contatoEmail && <Button type="link" icon={<MessageOutlined />} href={teamsHref} target="_blank" onClick={(e) => e.stopPropagation()}>Teams</Button>}
                                  {contatoEmail && <Button type="link" icon={<MailOutlined />} href={`mailto:${contatoEmail}`} onClick={(e) => e.stopPropagation()}>Email</Button>}
                                  {contatoTelefone && <Tag icon={<PhoneOutlined />}>{contatoTelefone}</Tag>}
                                </>
                              )
                            })()}
                          </Space>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, marginTop: 6, background: `${diasColor}10`, borderRadius: 8, border: `1px solid ${diasColor}30` }}>
                            <FieldTimeOutlined style={{ color: diasColor }} />
                            <Text strong style={{ color: diasColor }}>{getDiasRestantesText(diasRestantes)}</Text>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#fafafa', borderRadius: 8, textAlign: 'center' }}>
                          <Text type="secondary" style={{ marginBottom: 8 }}>Sem projeto ativo</Text>
                          <Button type="primary" onClick={(e) => { e.stopPropagation(); navigate('/cadastro-contrato') }}>Alocar este profissional</Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}

        {!loading && filteredProfissionais.length > pageSize && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination total={filteredProfissionais.length} pageSize={pageSize} current={page} onChange={(p) => setPage(p)} showSizeChanger={false} showQuickJumper />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selectedProfissionalId)}
        onCancel={() => setSelectedProfissionalId(null)}
        footer={null}
        width={1000}
        styles={{ content: { borderRadius: 12 } }}
        title={(() => profissionais.find(p => p.id === selectedProfissionalId)?.nome || '')()}
      >
        {(() => {
          const profissionalSel = profissionais.find(p => p.id === selectedProfissionalId)
          if (!profissionalSel) return null
          const infoSel = getProfissionalInfo(profissionalSel)
          const projetoSel = infoSel.projetos[0]
          const diasSel = projetoSel ? calcularDiasRestantes(projetoSel.contrato) : null
          const diasSelColor = getDiasRestantesColor(diasSel)
          return (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Text strong>Projeto atual</Text>
                    <Divider style={{ margin: '8px 0' }} />
                    {projetoSel ? (
                      <>
                        <div><strong>Nome:</strong> {projetoSel.nome}</div>
                        <div><strong>Cliente:</strong> {projetoSel.cliente}</div>
                        <div><strong>Início:</strong> {new Date(projetoSel.dataInicio).toLocaleDateString('pt-BR')}</div>
                        <div><strong>Término:</strong> {projetoSel.dataFim ? new Date(projetoSel.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, marginTop: 8, background: `${diasSelColor}10`, borderRadius: 6, border: `1px solid ${diasSelColor}30` }}>
                          <FieldTimeOutlined style={{ color: diasSelColor }} />
                          <Text style={{ color: diasSelColor }}>{getDiasRestantesText(diasSel)}</Text>
                        </div>
                        <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>Outras infos (mock): Squad Ecommerce, Regime Híbrido, 3 reuniões semanais</Text>
                      </>
                    ) : (
                      <Text type="secondary">Sem alocação atual</Text>
                    )}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Text strong>Projetos futuros (previstos)</Text>
                    <Divider style={{ margin: '8px 0' }} />
                    <Space direction="vertical" size={4}>
                      <div>• Portal Pedagógico - UX Review — Previsto: 01/09/2025</div>
                      <div>• App Leitura FTD - Fase 2 — Previsto: 15/10/2025</div>
                      <div>• Design System v2 — Previsto: 01/11/2025</div>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Text strong>Informações Matilha</Text>
                    <Divider style={{ margin: '8px 0' }} />
                    <div><strong>Gestor interno:</strong> Bruno Silva</div>
                    <div><strong>Tempo de casa:</strong> 1 ano e 3 meses</div>
                    <div><strong>Cargo:</strong> {profissionalSel.especialidade}</div>
                    <div><strong>Skills:</strong> {profissionalSel.tags || 'UX, UI, Prototipação'}</div>
                    <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>Notas (mock): Disponível para workshops; excelente comunicação</Text>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Text strong>Informações financeiras</Text>
                    <Divider style={{ margin: '8px 0' }} />
                    <div><strong>Nº da vaga:</strong> FTD-2025-UX-123</div>
                    <div><strong>Código da vaga:</strong> CON-FTD-UX-9876</div>
                    <div><strong>Data emissão NF:</strong> 10/08/2025</div>
                    <Text type="secondary">Dados mockados para layout</Text>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Text strong>Linha do tempo do contrato</Text>
                    <Divider style={{ margin: '8px 0' }} />
                    {projetoSel ? (
                      <Space size={[8, 8]} wrap>
                        <Tag>{`Início: ${new Date(projetoSel.dataInicio).toLocaleDateString('pt-BR')}`}</Tag>
                        <Tag>{`Término: ${projetoSel.dataFim ? new Date(projetoSel.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}`}</Tag>
                        <Tag>Renovações: 0 (mock)</Tag>
                      </Space>
                    ) : (
                      <Text type="secondary">Sem dados de contrato</Text>
                    )}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Text strong>Ações</Text>
                    <Divider style={{ margin: '8px 0' }} />
                    <Space wrap>
                      <Button size="small" disabled={interestLoading} onClick={async () => {
                        if (!projetoSel) return
                        try {
                          setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                          const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                            body: JSON.stringify({ interesse: 'RENOVAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id })
                          })
                          const data = await resp.json()
                          if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                          setInterestMessage('Interesse registrada: Renovar')
                          track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'RENOVAR' })
                        } catch (e: any) { setInterestError(e.message) } finally { setInterestLoading(false) }
                      }}>Renovar</Button>
                      <Button size="small" disabled={interestLoading} onClick={async () => {
                        if (!projetoSel) return
                        try {
                          setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                          const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                            body: JSON.stringify({ interesse: 'REDUZIR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id })
                          })
                          const data = await resp.json()
                          if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                          setInterestMessage('Interesse registrada: Reduzir')
                          track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'REDUZIR' })
                        } catch (e: any) { setInterestError(e.message) } finally { setInterestLoading(false) }
                      }}>Reduzir</Button>
                      <Button size="small" disabled={interestLoading} onClick={async () => {
                        if (!projetoSel) return
                        try {
                          setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                          const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                            body: JSON.stringify({ interesse: 'TROCAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id })
                          })
                          const data = await resp.json()
                          if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                          setInterestMessage('Interesse registrada: Trocar')
                          track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'TROCAR' })
                        } catch (e: any) { setInterestError(e.message) } finally { setInterestLoading(false) }
                      }}>Trocar</Button>
                      {(diasSel !== null && diasSel <= 60) && (
                        <Button size="small" danger disabled={interestLoading} onClick={async () => {
                          if (!projetoSel) return
                          try {
                            setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                            const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, {
                              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                              body: JSON.stringify({ interesse: 'ESPERAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id })
                            })
                            const data = await resp.json()
                            if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                            setInterestMessage('Interesse registrada: Esperar')
                            track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'ESPERAR' })
                          } catch (e: any) { setInterestError(e.message) } finally { setInterestLoading(false) }
                        }}>Esperar</Button>
                      )}
                      {interestLoading && <Text type="secondary">Enviando...</Text>}
                      {interestMessage && <Text type="success">{interestMessage}</Text>}
                      {interestError && <Text type="danger">{interestError}</Text>}
                    </Space>
                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>“Esperar” aparece apenas para contratos com ≤ 60 dias.</Text>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Text strong>Anotações do cliente</Text>
                    <Divider style={{ margin: '8px 0' }} />
                    <Input.TextArea placeholder="Escreva uma anotação..." autoSize={{ minRows: 3 }} value={noteText} onChange={(e) => { setNoteText(e.target.value); setNoteError(null); setNoteSaved(false) }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <Button type="primary" size="small" onClick={async () => {
                        if (!noteText.trim()) { setNoteError('Digite uma anotação antes de salvar'); return }
                        if (!projetoSel) return
                        try {
                          const resp = await fetch(`${API_BASE_URL}/notes`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` },
                            body: JSON.stringify({ contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id, texto: noteText.trim() })
                          })
                          const data = await resp.json()
                          if (!resp.ok) throw new Error(data.error || 'Falha ao salvar anotação')
                          setNoteSaved(true)
                          setNoteError(null)
                        } catch (e: any) { setNoteError(e.message); setNoteSaved(false) }
                      }}>Salvar</Button>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      {noteError && <Text type="danger">{noteError}</Text>}
                      {noteSaved && !noteError && <Text type="success">Anotação salva</Text>}
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          )
        })()}
      </Modal>
    </div>
  )
}

export default VisaoClienteAnt


