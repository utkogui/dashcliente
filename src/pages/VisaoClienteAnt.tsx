import { useEffect, useMemo, useRef, useState } from 'react'
import { Row, Col, Card, Tag, Input, Select, Alert, Divider, Button, Modal, Typography, Skeleton, Pagination, Space, Spin, FloatButton } from 'antd'
import { UserOutlined, SearchOutlined, FieldTimeOutlined, CalendarOutlined, FilterOutlined, MailOutlined, MessageOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { calcularDiasRestantes, getRiskColors } from '../utils/formatters'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'
import { track } from '../utils/telemetry'
import ProfessionalCard from '../components/cliente/ProfessionalCard'

const { Text, Title } = Typography

// Estilos customizados para o modal (aplicar padding/base e barra superior)
const customModalStyles = `
  .ant-modal-content {
    position: relative;
    padding: 10px 10px !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    background-color: #ffffff; /* sobrescrito dinamicamente via styles.content quando houver projeto */
  }
  .ant-modal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: var(--riskBarBg, #166534);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    pointer-events: none;
  }
`

const VisaoClienteAnt = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profissionais, contratos, clientes, loading, error, reload } = useData()
  const { sessionId, logout } = useAuth()

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
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyItems, setHistoryItems] = useState<Array<{ cliente: string; projeto: string; inicio: string; fim?: string | null }>>([])

  // Debounce busca
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(h)
  }, [searchTerm])

  // Paginação
  const [page, setPage] = useState(1)
  const pageSize = 12
  const supportsIO = typeof window !== 'undefined' && 'IntersectionObserver' in window
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const ioLockRef = useRef<boolean>(false)

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

  useEffect(() => { setPage(1); try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch (_) {} }, [debouncedSearch, filterStatus, filterEspecialidade, filterPrazo, filterSenioridade, orderBy])
  const totalPages = Math.max(1, Math.ceil(filteredProfissionais.length / pageSize))
  // Dados exibidos: se há IO, mostramos acumulado até page*pageSize; senão, apenas a página atual
  const visibleProfissionais = useMemo(() => {
    return filteredProfissionais.slice(0, page * pageSize)
  }, [filteredProfissionais, page])
  const pagedProfissionais = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProfissionais.slice(start, start + pageSize)
  }, [filteredProfissionais, page])
  const hasMore = (page * pageSize) < filteredProfissionais.length

  // Infinite scroll com IntersectionObserver
  useEffect(() => {
    if (!supportsIO) return
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore && !loading && !ioLockRef.current) {
        ioLockRef.current = true
        setPage((p) => p + 1)
        setTimeout(() => { ioLockRef.current = false }, 250)
      }
    }, { rootMargin: '200px 0px 0px 0px', threshold: 0.01 })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [supportsIO, sentinelRef, hasMore, loading])

  const especialidades = [...new Set(profissionais.map(p => p.especialidade || '').filter(Boolean))] as string[]
  const senioridades = [...new Set(profissionais.map(p => p.perfil || '').filter(Boolean))] as string[]

  // URL params
  const syncUrlParams = (state: { q?: string; status?: string; esp?: string; prazo?: string; sen?: string; ord?: string }) => {
    const params: Record<string, string> = {}
    if (state.q) params.q = state.q
    if (state.status && state.status !== 'todos') params.status = state.status
    if (state.esp && state.esp !== 'todas') params.esp = state.esp
    if (state.prazo && state.prazo !== 'todos') params.prazo = state.prazo
    if (state.sen && state.sen !== 'todas') params.sen = state.sen
    if (state.ord && state.ord !== 'prazo') params.ord = state.ord
    setSearchParams(params, { replace: true })
    track({ type: 'filters_change', payload: params })
  }
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
    syncUrlParams({ q: searchTerm, status: filterStatus, esp: filterEspecialidade, prazo: filterPrazo, sen: filterSenioridade, ord: orderBy })
  }, [searchTerm, filterStatus, filterEspecialidade, filterPrazo, filterSenioridade, orderBy])

  // Buscar histórico ao abrir modal
  useEffect(() => {
    const run = async () => {
      if (!selectedProfissionalId) return
      setHistoryLoading(true); setHistoryError(null); setHistoryItems([])
      try {
        const resp = await fetch(`${API_BASE_URL}/allocations/history?profissionalId=${encodeURIComponent(selectedProfissionalId)}`, {
          headers: { 'Authorization': `Bearer ${sessionId}` }
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data?.error || 'Falha ao carregar histórico')
        const items = Array.isArray(data) ? data : (data?.items || [])
        setHistoryItems(items)
      } catch (e: any) {
        setHistoryError(e.message)
      } finally {
        setHistoryLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfissionalId])

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

  const getDuracaoMesesVisual = (contrato: any): number => {
    if (!contrato) return 0
    if (!contrato.dataFim) return 12
    const inicio = new Date(contrato.dataInicio)
    const fim = new Date(contrato.dataFim)
    const meses = Math.max(1, (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth()))
    return meses
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Estilos customizados para o modal */}
      <style>{customModalStyles}</style>
      
      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 120, background: 'rgb(0,49,188)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, boxShadow: 'rgba(0,0,0,0.15) 0 2px 8px' }}>
        {/* Overlays de borda sobre o azul existente */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0))' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, pointerEvents: 'none', background: 'linear-gradient(to left, rgba(255,255,255,0.12), rgba(255,255,255,0))' }} />
        <img src={logoFtdMatilha} alt="FTD Matilha" style={{ height: 75, width: 'auto', objectFit: 'contain' }} />
        <div style={{ position: 'absolute', right: 16, top: 16 }}>
          <Button size="small" onClick={() => logout()}>Sair</Button>
        </div>
      </div>

      <div style={{ paddingTop: 140, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }}>
        {/* Filtros */}
        <div style={{ padding: 16, marginBottom: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FilterOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <Text strong>Filtros</Text>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Buscar profissionais, projetos ou especialidades..." prefix={<SearchOutlined />} style={{ background: '#f8fafc', borderRadius: 8 }} />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: '100%' }} placeholder="📊 Status do Profissional">
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="ativo">Ativos</Select.Option>
                <Select.Option value="aguardando">Aguardando Contrato</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={filterEspecialidade} onChange={setFilterEspecialidade} style={{ width: '100%' }} placeholder="🎯 Área de Especialização">
                <Select.Option value="todas">Todas as Especialidades</Select.Option>
                {especialidades.map(esp => <Select.Option key={esp} value={esp}>{esp}</Select.Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={filterPrazo} onChange={(v) => setFilterPrazo(v as any)} style={{ width: '100%' }} placeholder="⏰ Prazo do Contrato">
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="<60">Menos de 60 dias</Select.Option>
                <Select.Option value="<30">Menos de 30 dias</Select.Option>
                <Select.Option value="<15">Menos de 15 dias</Select.Option>
                <Select.Option value="indeterminado">Indeterminado</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={filterSenioridade} onChange={setFilterSenioridade} style={{ width: '100%' }} placeholder="👨‍💼 Nível de Senioridade">
                <Select.Option value="todas">Todas</Select.Option>
                {senioridades.map(l => <Select.Option key={l} value={l}>{l}</Select.Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select value={orderBy} onChange={(v) => setOrderBy(v as any)} style={{ width: '100%' }} placeholder="🔄 Ordenação dos Resultados">
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
          <>
          <Row gutter={[16, 16]}>
            {(supportsIO ? visibleProfissionais : pagedProfissionais).map((profissional) => {
              const info = getProfissionalInfo(profissional)
              const projetoAtivo = info.projetos[0]
              const diasRestantes = projetoAtivo ? calcularDiasRestantes(projetoAtivo.contrato) : null
              const emProjeto = info.status === 'ativo' && Boolean(projetoAtivo)

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={profissional.id}>
                  <ProfessionalCard
                    profissional={profissional}
                    projeto={projetoAtivo || null}
                    diasRestantes={diasRestantes}
                    contatoCliente={{
                      nome: clientes.find(c => c.empresa === (projetoAtivo?.cliente || ''))?.nome,
                      email: clientes.find(c => c.empresa === (projetoAtivo?.cliente || ''))?.email,
                      telefone: (profissionais.find(p => p.id === profissional.id)?.contatoClienteTelefone) || clientes.find(c => c.empresa === (projetoAtivo?.cliente || ''))?.telefone
                    }}
                    onOpen={() => { setSelectedProfissionalId(profissional.id); track({ type: 'card_open', profissionalId: profissional.id }) }}
                  />
                </Col>
              )
            })}
          </Row>
          {supportsIO && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              {hasMore ? (
                <div ref={sentinelRef} style={{ height: 48 }} />
              ) : (
                <Text type="secondary">Fim da lista</Text>
              )}
            </div>
          )}
          </>
        )}

        {!loading && !supportsIO && filteredProfissionais.length > pageSize && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination total={filteredProfissionais.length} pageSize={pageSize} current={page} onChange={(p) => setPage(p)} showSizeChanger={false} showQuickJumper />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selectedProfissionalId)}
        onCancel={() => setSelectedProfissionalId(null)}
        footer={null}
        centered
        destroyOnClose
        width="80vw"
        styles={{ 
          content: (() => {
            try {
              if (!selectedProfissionalId) return { borderRadius: 16, backgroundColor: '#ffffff' }
              const prof = profissionais.find(p => p.id === selectedProfissionalId)
              if (!prof) return { borderRadius: 16, backgroundColor: '#ffffff' }
              const info = getProfissionalInfo(prof)
              const projetoSel = info.projetos[0]
              if (!projetoSel) return { borderRadius: 16, backgroundColor: '#ffffff' }
              const dias = calcularDiasRestantes(projetoSel.contrato)
              const risk = getRiskColors(dias)
              return {
                borderRadius: 16,
                backgroundColor: '#ffffff',
                border: `1px solid ${risk.barBg}`,
                ['--riskBarBg' as any]: risk.barBg,
              } as any
            } catch {
              return { borderRadius: 16, backgroundColor: '#ffffff' }
            }
          })(),
          mask: { backdropFilter: 'blur(4px)' }
        }}
        keyboard
        zIndex={2000}
        title={profissionais.find(p => p.id === selectedProfissionalId)?.nome || ''}
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
                {/* Coluna 1: Projeto atual, Canais de contato, Linha do tempo */}
                <Col xs={24} md={12}>
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
                        </>
                      ) : (
                        <Text type="secondary">Sem alocação atual</Text>
                      )}
                    </Card>

                    <Card size="small" style={{ borderRadius: 8 }}>
                      <Text strong>Canais de contato</Text>
                      <Divider style={{ margin: '8px 0' }} />
                      <Space direction="vertical" size={6}>
                        <div>
                          <Text strong>Cliente</Text>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            {(() => {
                              const contatoEmail = profissionalSel.contatoClienteEmail
                              const contatoTelefone = profissionalSel.contatoClienteTelefone
                              const teamsHref = contatoEmail ? `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(contatoEmail)}` : undefined
                              return (
                                <>
                                  {contatoEmail && <Button size="small" icon={<MessageOutlined />} href={teamsHref} target="_blank">Teams</Button>}
                                  {contatoEmail && <Button size="small" icon={<MailOutlined />} href={`mailto:${contatoEmail}`}>Email</Button>}
                                  {contatoTelefone && <Tag icon={<PhoneOutlined />}>{contatoTelefone}</Tag>}
                                </>
                              )
                            })()}
                          </div>
                        </div>
                        <div>
                          <Text strong>Matilha</Text>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            {(() => {
                              const contatoEmail = profissionalSel.contatoMatilhaEmail
                              const contatoTelefone = profissionalSel.contatoMatilhaTelefone
                              const teamsHref = contatoEmail ? `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(contatoEmail)}` : undefined
                              return (
                                <>
                                  {contatoEmail && <Button size="small" icon={<MessageOutlined />} href={teamsHref} target="_blank">Teams</Button>}
                                  {contatoEmail && <Button size="small" icon={<MailOutlined />} href={`mailto:${contatoEmail}`}>Email</Button>}
                                  {contatoTelefone && <Tag icon={<PhoneOutlined />}>{contatoTelefone}</Tag>}
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </Space>
                    </Card>

                    <Card size="small" style={{ borderRadius: 8 }}>
                      <Text strong>Linha do tempo do contrato</Text>
                      <Divider style={{ margin: '8px 0' }} />
                      {projetoSel ? (
                        <Space size={[8, 8]} wrap>
                          <Tag>{`Início: ${new Date(projetoSel.dataInicio).toLocaleDateString('pt-BR')}`}</Tag>
                          <Tag>{`Término: ${projetoSel.dataFim ? new Date(projetoSel.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}`}</Tag>
                          <Tag>{`Duração ${projetoSel.dataFim ? '' : 'visual '}: ${getDuracaoMesesVisual(projetoSel.contrato)} meses`}</Tag>
                        </Space>
                      ) : (
                        <Text type="secondary">Sem dados de contrato</Text>
                      )}
                    </Card>
                  </Space>
                </Col>

                {/* Coluna 2: Histórico, Ações, Anotações */}
                <Col xs={24} md={12}>
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Card size="small" style={{ borderRadius: 8 }}>
                      <Text strong>Histórico de alocação recente</Text>
                      <Divider style={{ margin: '8px 0' }} />
                      {historyLoading ? (
                        <Skeleton active paragraph={{ rows: 3 }} />
                      ) : historyError ? (
                        <Alert type="error" message={historyError} />
                      ) : historyItems.length === 0 ? (
                        <Text type="secondary">Sem histórico recente</Text>
                      ) : (
                        <Space direction="vertical" size={6} style={{ width: '100%' }}>
                          {historyItems.map((h, idx) => {
                            const clienteLabel = ((): string => {
                              const v: any = (h as any).cliente
                              if (v == null) return 'Cliente não informado'
                              if (typeof v === 'string') return v
                              if (typeof v === 'object') return v.empresa || v.nome || 'Cliente'
                              return String(v)
                            })()
                            const projetoLabel = ((): string => {
                              const v: any = (h as any).projeto
                              if (v == null) return 'Projeto não informado'
                              if (typeof v === 'string') return v
                              if (typeof v === 'object') return v.nome || v.titulo || 'Projeto'
                              return String(v)
                            })()
                            return (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                <span>{projetoLabel} — {clienteLabel}</span>
                                <span>{new Date(h.inicio).toLocaleDateString('pt-BR')}{h.fim ? ` → ${new Date(h.fim).toLocaleDateString('pt-BR')}` : ''}</span>
                              </div>
                            )
                          })}
                        </Space>
                      )}
                    </Card>

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
                      <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                        “Esperar” aparece apenas para contratos com ≤ 60 dias.
                      </Text>
                    </Card>

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
                          } catch (e: any) {
                            setNoteError(e.message)
                            setNoteSaved(false)
                          }
                        }}>Salvar</Button>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        {noteError && <Text type="danger">{noteError}</Text>}
                        {noteSaved && !noteError && <Text type="success">Anotação salva</Text>}
                      </div>
                    </Card>
                  </Space>
                </Col>
              </Row>
            </>
          )
        })()}
      </Modal>
      <FloatButton.BackTop visibilityHeight={300} />
    </div>
  )
}

export default VisaoClienteAnt


