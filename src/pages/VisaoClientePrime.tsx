import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { calcularDiasRestantes, getCardStyle } from '../utils/formatters'
import logoFtdMatilha from '../assets/logo_ftd_matilha.png'
import { track } from '../utils/telemetry'

import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { Skeleton } from 'primereact/skeleton'
import { Paginator } from 'primereact/paginator'

const VisaoClientePrime = () => {
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

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => { const h = setTimeout(() => setDebouncedSearch(searchTerm), 300); return () => clearTimeout(h) }, [searchTerm])

  const [first, setFirst] = useState(0)
  const rows = 12

  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://dashcliente.onrender.com/api' : 'http://localhost:3001/api')

  const getProfissionalInfo = (profissional: any) => {
    const contratosAtivos = contratos.filter(c => c.status === 'ativo' && c.profissionais.some(p => p.profissionalId === profissional.id))
    if (contratosAtivos.length === 0) return { status: 'aguardando', projetos: [] as any[] }
    const projetos = contratosAtivos.map(contrato => {
      const cliente = clientes.find(c => c.id === contrato.clienteId)
      return { nome: contrato.nomeProjeto, cliente: cliente?.empresa || 'Cliente não encontrado', dataInicio: contrato.dataInicio, dataFim: contrato.dataFim, status: contrato.status, contrato }
    })
    return { status: 'ativo', projetos }
  }

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
        switch (filterPrazo) { case '<15': return dias < 15 && dias >= 0; case '<30': return dias < 30 && dias >= 0; case '<60': return dias < 60 && dias >= 0; default: return true }
      })()
      return matchesSearch && matchesStatus && matchesEspecialidade && matchesSenioridade && matchesPrazo
    })
    .sort((a, b) => {
      const infoA = getProfissionalInfo(a); const infoB = getProfissionalInfo(b)
      if (orderBy === 'status') { if (infoA.status === 'ativo' && infoB.status !== 'ativo') return -1; if (infoB.status === 'ativo' && infoA.status !== 'ativo') return 1; return a.nome.localeCompare(b.nome) }
      if (infoA.status === 'ativo' && infoB.status !== 'ativo') return -1; if (infoB.status === 'ativo' && infoA.status !== 'ativo') return 1
      const projetoA = infoA.projetos[0]; const projetoB = infoB.projetos[0]
      const diasA = projetoA ? calcularDiasRestantes(projetoA.contrato) : null; const diasB = projetoB ? calcularDiasRestantes(projetoB.contrato) : null
      const rank = (dias: number | null) => (dias === null ? Number.POSITIVE_INFINITY : dias)
      return rank(diasA) - rank(diasB)
    })

  useEffect(() => { setFirst(0) }, [debouncedSearch, filterStatus, filterEspecialidade, filterPrazo, filterSenioridade, orderBy])
  const paginated = useMemo(() => filteredProfissionais.slice(first, first + rows), [filteredProfissionais, first])

  const especialidades = [...new Set(profissionais.map(p => p.especialidade || '').filter(Boolean))] as string[]
  const senioridades = [...new Set(profissionais.map(p => p.perfil || '').filter(Boolean))] as string[]

  useEffect(() => {
    const q = searchParams.get('q') || ''; const st = searchParams.get('status') || 'todos'; const esp = searchParams.get('esp') || 'todas'
    const prazo = (searchParams.get('prazo') as any) || 'todos'; const sen = searchParams.get('sen') || 'todas'; const ord = (searchParams.get('ord') as any) || 'prazo'
    setSearchTerm(q); setFilterStatus(st); setFilterEspecialidade(esp); setFilterPrazo(prazo); setFilterSenioridade(sen); setOrderBy(ord)
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

  const getDiasRestantesText = (dias: number | null) => dias === null ? 'Indeterminado' : dias > 0 ? `${dias} dias` : 'Vencido'
  const getDiasRestantesColor = (dias: number | null) => dias === null ? '#166534' : dias > 60 ? '#166534' : dias > 30 ? '#92400e' : dias > 0 ? '#b91c1c' : '#7f1d1d'

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 80, background: 'rgb(0,49,188)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, boxShadow: 'rgba(0,0,0,0.15) 0 2px 8px' }}>
        <img src={logoFtdMatilha} alt="FTD Matilha" style={{ height: 50, width: 'auto', objectFit: 'contain' }} />
      </div>

      <div className="p-3" style={{ paddingTop: 120 }}>
        {/* Filtros */}
        <div className="p-3" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 }}>
          <div className="flex align-items-center gap-2 mb-2">
            <i className="pi pi-filter" style={{ color: '#1677ff' }} />
            <span className="font-bold">Filtros</span>
          </div>
          <div className="grid">
            <div className="col-12 md:col-4">
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText className="w-full" placeholder="Buscar profissionais ou projetos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </span>
            </div>
            <div className="col-12 md:col-4">
              <Dropdown value={filterStatus} onChange={(e) => setFilterStatus(e.value)} className="w-full" options={[{ label: 'Todos', value: 'todos' }, { label: 'Ativos', value: 'ativo' }, { label: 'Aguardando Contrato', value: 'aguardando' }]} placeholder="Status" />
            </div>
            <div className="col-12 md:col-4">
              <Dropdown value={filterEspecialidade} onChange={(e) => setFilterEspecialidade(e.value)} className="w-full" options={[{ label: 'Todas as Especialidades', value: 'todas' }, ...especialidades.map(e => ({ label: e, value: e }))]} placeholder="Especialidade" />
            </div>
            <div className="col-12 md:col-4">
              <Dropdown value={filterPrazo} onChange={(e) => setFilterPrazo(e.value)} className="w-full" options={[{ label: 'Todos', value: 'todos' }, { label: 'Menos de 60 dias', value: '<60' }, { label: 'Menos de 30 dias', value: '<30' }, { label: 'Menos de 15 dias', value: '<15' }, { label: 'Indeterminado', value: 'indeterminado' }]} placeholder="Prazo" />
            </div>
            <div className="col-12 md:col-4">
              <Dropdown value={filterSenioridade} onChange={(e) => setFilterSenioridade(e.value)} className="w-full" options={[{ label: 'Todas', value: 'todas' }, ...senioridades.map(s => ({ label: s, value: s }))]} placeholder="Senioridade" />
            </div>
            <div className="col-12 md:col-4">
              <Dropdown value={orderBy} onChange={(e) => setOrderBy(e.value)} className="w-full" options={[{ label: 'Prazo (menor→maior)', value: 'prazo' }, { label: 'Status (ativos primeiro)', value: 'status' }]} placeholder="Ordenar por" />
            </div>
            <div className="col-12">
              <div className="flex justify-content-end">
                <Button label="Limpar filtros" outlined onClick={() => { setSearchTerm(''); setFilterStatus('todos'); setFilterEspecialidade('todas'); setFilterPrazo('todos'); setFilterSenioridade('todas'); setOrderBy('prazo') }} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-2">
            <div className="p-message p-message-error" style={{ borderRadius: 8 }}>
              <span className="p-message-text">{error}</span>
              <Button label="Tentar novamente" size="small" onClick={() => reload()} className="ml-2" />
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid">
            {Array.from({ length: rows }).map((_, idx) => (
              <div className="col-12 sm:col-6 md:col-4 lg:col-3" key={idx}>
                <div className="p-3" style={{ background: '#fff', borderRadius: 12 }}>
                  <Skeleton className="mb-2" width="100%" height="6px" />
                  <Skeleton className="mb-2" width="60%" height="1.5rem" />
                  <Skeleton className="mb-2" width="40%" height="1rem" />
                  <Skeleton width="100%" height="180px" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProfissionais.length === 0 ? (
          <div className="p-message p-message-info" style={{ borderRadius: 8 }}>Nenhum profissional encontrado com os filtros aplicados.</div>
        ) : (
          <div className="grid">
            {paginated.map((profissional) => {
              const info = getProfissionalInfo(profissional)
              const projetoAtivo = info.projetos[0]
              const diasRestantes = projetoAtivo ? calcularDiasRestantes(projetoAtivo.contrato) : null
              const diasColor = getDiasRestantesColor(diasRestantes)
              const emProjeto = info.status === 'ativo' && Boolean(projetoAtivo)
              const disponibilidadeCor = emProjeto ? '#22c55e' : '#ff9aa2'

              return (
                <div className="col-12 sm:col-6 md:col-4 lg:col-3" key={profissional.id}>
                  <Card
                    className="shadow-2 border-round surface-card"
                    style={{ height: 380, position: 'relative', overflow: 'hidden' }}
                    header={<div style={{ height: 6, width: '100%', background: diasColor }} />}
                    onClick={() => { setSelectedProfissionalId(profissional.id); track({ type: 'card_open', profissionalId: profissional.id }) }}
                  >
                    <div className="flex flex-column h-full" style={{ gap: 8 }}>
                      <div style={{ flex: '0 0 35%' }}>
                        <div className="flex align-items-center gap-2">
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: disponibilidadeCor }} />
                          <span className="text-xl font-semibold text-900" title={profissional.nome}>{profissional.nome}</span>
                          {info.projetos.length > 1 && <Tag value="Multi-projeto" severity="info" />}
                        </div>
                        <div className="text-700" style={{ marginTop: 2 }}>{profissional.especialidade}</div>
                        {profissional.tags && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profissional.tags.split(',').map((tag: string, index: number) => {
                              const t = tag.trim(); if (!t) return null
                              return <Tag key={index} value={t} />
                            })}
                          </div>
                        )}
                      </div>
                      <div className="p-divider p-component" />
                      <div className="flex flex-column" style={{ flex: '1 0 0' }}>
                        {info.status === 'aguardando' ? (
                          <div className="flex flex-column align-items-center justify-content-center p-3 surface-50 border-round">
                            <span className="font-medium text-800 mb-2">Aguardando contrato</span>
                            <Button label="Alocar este profissional" onClick={(e) => { e.stopPropagation(); navigate('/cadastro-contrato') }} />
                          </div>
                        ) : projetoAtivo ? (
                          <div className="flex flex-column" style={{ gap: 6 }}>
                            <span className="text-lg font-semibold text-900" title={projetoAtivo.nome}>{projetoAtivo.nome}</span>
                            <span className="text-700">{projetoAtivo.cliente}</span>
                            <div className="flex align-items-center gap-2 text-700">
                              <i className="pi pi-calendar" />
                              <span>{new Date(projetoAtivo.dataInicio).toLocaleDateString('pt-BR')}{projetoAtivo.dataFim && ` - ${new Date(projetoAtivo.dataFim).toLocaleDateString('pt-BR')}`}</span>
                            </div>
                            <div className="flex align-items-center gap-2 flex-wrap mt-2">
                              {(() => {
                                const cliente = clientes.find(c => c.empresa === projetoAtivo.cliente)
                                const contatoNome = cliente?.nome
                                const contatoEmail = cliente?.email
                                const contatoTelefone = (() => { const prof = profissionais.find(p => p.id === profissional.id); return prof?.contatoClienteTelefone || cliente?.telefone || undefined })()
                                const teamsHref = contatoEmail ? `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(contatoEmail)}` : undefined
                                return (
                                  <>
                                    {contatoNome && <Tag value={`Contato: ${contatoNome}`} />} 
                                    {contatoEmail && <Button label="Teams" link icon="pi pi-comments" onClick={(e) => { e.stopPropagation(); window.open(teamsHref, '_blank') }} />} 
                                    {contatoEmail && <Button label="Email" link icon="pi pi-envelope" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${contatoEmail}` }} />} 
                                    {contatoTelefone && <Tag value={contatoTelefone} icon="pi pi-phone" />} 
                                  </>
                                )
                              })()}
                            </div>
                            <div className="flex align-items-center gap-2 p-2 mt-2 border-round" style={{ background: `${diasColor}10`, border: `1px solid ${diasColor}30` }}>
                              <i className="pi pi-clock" style={{ color: diasColor }} />
                              <span className="font-medium" style={{ color: diasColor }}>{diasRestantes === null ? 'Indeterminado' : diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-column align-items-center justify-content-center p-3 surface-50 border-round">
                            <span className="text-700 mb-2">Sem projeto ativo</span>
                            <Button label="Alocar este profissional" onClick={(e) => { e.stopPropagation(); navigate('/cadastro-contrato') }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredProfissionais.length > rows && (
          <div className="flex justify-content-center mt-3">
            <Paginator first={first} rows={rows} totalRecords={filteredProfissionais.length} onPageChange={(e) => setFirst(e.first)}></Paginator>
          </div>
        )}
      </div>

      <Dialog visible={Boolean(selectedProfissionalId)} onHide={() => setSelectedProfissionalId(null)} header={profissionais.find(p => p.id === selectedProfissionalId)?.nome || ''} style={{ width: '80vw' }}>
        {(() => {
          const profissionalSel = profissionais.find(p => p.id === selectedProfissionalId)
          if (!profissionalSel) return null
          const infoSel = getProfissionalInfo(profissionalSel)
          const projetoSel = infoSel.projetos[0]
          const diasSel = projetoSel ? calcularDiasRestantes(projetoSel.contrato) : null
          const diasSelColor = getDiasRestantesColor(diasSel)
          return (
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="p-3" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <span className="font-bold">Projeto atual</span>
                  <div className="p-divider p-component" style={{ margin: '8px 0' }} />
                  {projetoSel ? (
                    <>
                      <div><strong>Nome:</strong> {projetoSel.nome}</div>
                      <div><strong>Cliente:</strong> {projetoSel.cliente}</div>
                      <div><strong>Início:</strong> {new Date(projetoSel.dataInicio).toLocaleDateString('pt-BR')}</div>
                      <div><strong>Término:</strong> {projetoSel.dataFim ? new Date(projetoSel.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}</div>
                      <div className="flex align-items-center gap-2 p-2 mt-2" style={{ background: `${diasSelColor}10`, borderRadius: 6, border: `1px solid ${diasSelColor}30` }}>
                        <i className="pi pi-clock" style={{ color: diasSelColor }} />
                        <span style={{ color: diasSelColor }}>{diasSel === null ? 'Indeterminado' : diasSel > 0 ? `${diasSel} dias` : 'Vencido'}</span>
                      </div>
                      <span className="text-500" style={{ marginTop: 8, display: 'block' }}>Outras infos (mock): Squad Ecommerce, Regime Híbrido, 3 reuniões semanais</span>
                    </>
                  ) : (
                    <span className="text-500">Sem alocação atual</span>
                  )}
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="p-3" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <span className="font-bold">Projetos futuros (previstos)</span>
                  <div className="p-divider p-component" style={{ margin: '8px 0' }} />
                  <div className="flex flex-column" style={{ gap: 4 }}>
                    <span>• Portal Pedagógico - UX Review — Previsto: 01/09/2025</span>
                    <span>• App Leitura FTD - Fase 2 — Previsto: 15/10/2025</span>
                    <span>• Design System v2 — Previsto: 01/11/2025</span>
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="p-3" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <span className="font-bold">Informações Matilha</span>
                  <div className="p-divider p-component" style={{ margin: '8px 0' }} />
                  <div><strong>Gestor interno:</strong> Bruno Silva</div>
                  <div><strong>Tempo de casa:</strong> 1 ano e 3 meses</div>
                  <div><strong>Cargo:</strong> {profissionalSel.especialidade}</div>
                  <div><strong>Skills:</strong> {profissionalSel.tags || 'UX, UI, Prototipação'}</div>
                  <span className="text-500" style={{ marginTop: 8, display: 'block' }}>Notas (mock): Disponível para workshops; excelente comunicação</span>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="p-3" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <span className="font-bold">Informações financeiras</span>
                  <div className="p-divider p-component" style={{ margin: '8px 0' }} />
                  <div><strong>Nº da vaga:</strong> FTD-2025-UX-123</div>
                  <div><strong>Código da vaga:</strong> CON-FTD-UX-9876</div>
                  <div><strong>Data emissão NF:</strong> 10/08/2025</div>
                  <span className="text-500">Dados mockados para layout</span>
                </div>
              </div>
              <div className="col-12">
                <div className="p-3" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <span className="font-bold">Linha do tempo do contrato</span>
                  <div className="p-divider p-component" style={{ margin: '8px 0' }} />
                  {projetoSel ? (
                    <div className="flex flex-wrap gap-2">
                      <Tag value={`Início: ${new Date(projetoSel.dataInicio).toLocaleDateString('pt-BR')}`} />
                      <Tag value={`Término: ${projetoSel.dataFim ? new Date(projetoSel.dataFim).toLocaleDateString('pt-BR') : 'Indeterminado'}`} />
                      <Tag value="Renovações: 0 (mock)" />
                    </div>
                  ) : (
                    <span className="text-500">Sem dados de contrato</span>
                  )}
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="p-3" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <span className="font-bold">Ações</span>
                  <div className="p-divider p-component" style={{ margin: '8px 0' }} />
                  <div className="flex gap-2 flex-wrap">
                    <Button label="Renovar" size="small" disabled={interestLoading} onClick={async () => {
                      if (!projetoSel) return
                      try { setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                        const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` }, body: JSON.stringify({ interesse: 'RENOVAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id }) })
                        const data = await resp.json(); if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                        setInterestMessage('Interesse registrada: Renovar'); track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'RENOVAR' })
                      } catch (e: any) { setInterestError(e.message) } finally { setInterestLoading(false) } }} />
                    <Button label="Reduzir" size="small" disabled={interestLoading} onClick={async () => {
                      if (!projetoSel) return
                      try { setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                        const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` }, body: JSON.stringify({ interesse: 'REDUZIR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id }) })
                        const data = await resp.json(); if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                        setInterestMessage('Interesse registrada: Reduzir'); track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'REDUZIR' })
                      } catch (e: any) { setInterestError(e.message) } finally { setInterestLoading(false) } }} />
                    <Button label="Trocar" size="small" disabled={interestLoading} onClick={async () => {
                      if (!projetoSel) return
                      try { setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                        const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` }, body: JSON.stringify({ interesse: 'TROCAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id }) })
                        const data = await resp.json(); if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                        setInterestMessage('Interesse registrada: Trocar'); track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'TROCAR' })
                      } catch (e: any) { setInterestError(e.message) } finally { setInterestLoading(false) } }} />
                    {(diasSel !== null && diasSel <= 60) && (
                      <Button label="Esperar" size="small" severity="danger" disabled={interestLoading} onClick={async () => {
                        if (!projetoSel) return
                        try { setInterestLoading(true); setInterestError(null); setInterestMessage(null)
                          const resp = await fetch(`${API_BASE_URL}/client-actions/interest`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` }, body: JSON.stringify({ interesse: 'ESPERAR', comentario: null, contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id }) })
                          const data = await resp.json(); if (!resp.ok) throw new Error(data.error || 'Falha ao registrar interesse')
                          setInterestMessage('Interesse registrada: Esperar'); track({ type: 'interest_click', profissionalId: profissionalSel.id, contratoId: projetoSel.contrato.id, acao: 'ESPERAR' })
                        } catch (e: any) { setInterestError(e.message) } finally { setInterestLoading(false) } }} />
                    )}
                    {interestLoading && <span className="text-500">Enviando...</span>}
                    {interestMessage && <span className="text-green-600">{interestMessage}</span>}
                    {interestError && <span className="text-red-600">{interestError}</span>}
                  </div>
                  <span className="text-500" style={{ display: 'block', marginTop: 8 }}>
                    “Esperar” aparece apenas para contratos com ≤ 60 dias.
                  </span>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="p-3" style={{ border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <span className="font-bold">Anotações do cliente</span>
                  <div className="p-divider p-component" style={{ margin: '8px 0' }} />
                  <InputText as="textarea" value={noteText} onChange={(e: any) => { setNoteText(e.target.value); setNoteError(null); setNoteSaved(false) }} style={{ width: '100%', minHeight: 96 }} placeholder="Escreva uma anotação..." />
                  <div className="flex justify-content-end mt-2">
                    <Button label="Salvar" size="small" onClick={async () => {
                      if (!noteText.trim()) { setNoteError('Digite uma anotação antes de salvar'); return }
                      if (!projetoSel) return
                      try { const resp = await fetch(`${API_BASE_URL}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionId}` }, body: JSON.stringify({ contratoId: projetoSel.contrato.id, profissionalId: profissionalSel.id, texto: noteText.trim() }) })
                        const data = await resp.json(); if (!resp.ok) throw new Error(data.error || 'Falha ao salvar anotação')
                        setNoteSaved(true); setNoteError(null)
                      } catch (e: any) { setNoteError(e.message); setNoteSaved(false) } }} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {noteError && <span className="text-red-600">{noteError}</span>}
                    {noteSaved && !noteError && <span className="text-green-600">Anotação salva</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </Dialog>
    </div>
  )
}

export default VisaoClientePrime


