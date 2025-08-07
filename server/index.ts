import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = 3001

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true // Permitir cookies/sessões
}))
app.use(express.json())

// Middleware de sessão simples (em produção usar Redis ou similar)
const sessions = new Map()

// Middleware para verificar sessão
const verificarSessao = (req: any, res: any, next: any) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '')
  
  if (sessionId && sessions.has(sessionId)) {
    req.usuario = sessions.get(sessionId)
    next()
  } else {
    res.status(401).json({ error: 'Não autorizado' })
  }
}

// Função para popular o banco com dados iniciais
const seedDatabase = async () => {
  const profissionaisCount = await prisma.profissional.count()
  const clientesCount = await prisma.cliente.count()
  const contratosCount = await prisma.contrato.count()
  const usuariosCount = await prisma.usuario.count()
  const clientesSistemaCount = await prisma.clienteSistema.count()

  console.log('📊 Status do banco:', {
    profissionais: profissionaisCount,
    clientes: clientesCount,
    contratos: contratosCount,
    usuarios: usuariosCount,
    clientesSistema: clientesSistemaCount
  })

  // Sempre criar usuários se não existirem
  if (usuariosCount === 0) {
    console.log('🌱 Criando usuários iniciais...')

    // Verificar se os clientes do sistema já existem
    let matilha = await prisma.clienteSistema.findUnique({
      where: { id: 'cliente_matilha_default' }
    })
    
    if (!matilha) {
      matilha = await prisma.clienteSistema.create({
        data: {
          id: 'cliente_matilha_default',
          nome: 'Matilha',
          descricao: 'Cliente padrão do sistema',
          ativo: true
        }
      })
    }

    let ftd = await prisma.clienteSistema.findFirst({
      where: { nome: 'FTD' }
    })
    
    if (!ftd) {
      ftd = await prisma.clienteSistema.create({
        data: {
          nome: 'FTD',
          descricao: 'Cliente FTD',
          ativo: true
        }
      })
    }

    // Criar usuário admin padrão
    const { criptografarSenha } = await import('./utils/auth.ts')
    const senhaAdmin = await criptografarSenha('admin123')
    
    await prisma.usuario.create({
      data: {
        email: 'admin@matilha.com',
        senha: senhaAdmin,
        tipo: 'admin',
        ativo: true
      }
    })

    // Criar usuário cliente para Matilha
    const senhaMatilha = await criptografarSenha('matilha123')
    
    await prisma.usuario.create({
      data: {
        email: 'matilha@matilha.com',
        senha: senhaMatilha,
        tipo: 'cliente',
        clienteId: matilha.id,
        ativo: true
      }
    })

    // Criar usuário cliente para FTD
    const senhaFtd = await criptografarSenha('ftd123')
    
    await prisma.usuario.create({
      data: {
        email: 'ftd@ftd.com',
        senha: senhaFtd,
        tipo: 'cliente',
        clienteId: ftd.id,
        ativo: true
      }
    })

    // Criar profissionais
    const prof1 = await prisma.profissional.create({
      data: {
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        especialidade: 'Desenvolvedor Full Stack',
        valorHora: 120,
        status: 'ativo',
        dataInicio: '2023-01-15',
        tipoContrato: 'hora',
        valorPago: 11520,
        clienteId: matilha.id
      }
    })

    const prof2 = await prisma.profissional.create({
      data: {
        nome: 'Maria Santos',
        email: 'maria.santos@email.com',
        especialidade: 'UX/UI Designer',
        valorHora: 100,
        status: 'ativo',
        dataInicio: '2023-03-20',
        tipoContrato: 'hora',
        valorPago: 7200,
        clienteId: matilha.id
      }
    })

    const prof3 = await prisma.profissional.create({
      data: {
        nome: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        especialidade: 'DevOps Engineer',
        valorHora: 150,
        status: 'ativo',
        dataInicio: '2023-02-10',
        tipoContrato: 'hora',
        valorPago: 12600,
        clienteId: matilha.id
      }
    })

    // Criar clientes
    const cli1 = await prisma.cliente.create({
      data: {
        nome: 'Carlos Oliveira',
        empresa: 'TechCorp',
        email: 'carlos@techcorp.com',
        telefone: '(11) 88888-1111',
        endereco: 'Rua das Flores, 123 - São Paulo/SP',
        anoInicio: 2023,
        segmento: 'Tecnologia',
        tamanho: 'Média',
        clienteId: matilha.id
      }
    })

    const cli2 = await prisma.cliente.create({
      data: {
        nome: 'Ana Ferreira',
        empresa: 'Inovação Ltda',
        email: 'ana@inovacao.com',
        telefone: '(11) 88888-2222',
        endereco: 'Av. Paulista, 1000 - São Paulo/SP',
        anoInicio: 2024,
        segmento: 'Tecnologia',
        tamanho: 'Pequena',
        clienteId: matilha.id
      }
    })

    const cli3 = await prisma.cliente.create({
      data: {
        nome: 'Roberto Lima',
        empresa: 'StartupXYZ',
        email: 'roberto@startupxyz.com',
        telefone: '(11) 88888-3333',
        endereco: 'Rua Augusta, 500 - São Paulo/SP',
        anoInicio: 2023,
        segmento: 'Tecnologia',
        tamanho: 'Pequena',
        clienteId: matilha.id
      }
    })

    // Criar contratos
    await prisma.contrato.create({
      data: {
        nomeProjeto: 'Sistema de Gestão',
        codigoContrato: 'CON-2024-001',
        clienteId: cli1.id,
        clienteSistemaId: matilha.id,
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        tipoContrato: 'hora',
        valorContrato: 50000,
        valorImpostos: 6500,
        status: 'ativo',
        observacoes: 'Desenvolvimento de sistema completo',
        profissionais: {
          create: [
            {
              profissionalId: prof1.id,
              valorHora: 120,
              horasMensais: 160
            }
          ]
        }
      }
    })


    await prisma.contrato.create({
      data: {
        nomeProjeto: 'Design Mobile',
        codigoContrato: 'CON-2024-002',
        clienteId: cli2.id,
        clienteSistemaId: matilha.id,
        dataInicio: '2024-02-01',
        dataFim: '2024-11-30',
        tipoContrato: 'hora',
        valorContrato: 30000,
        valorImpostos: 3900,
        status: 'ativo',
        observacoes: 'Design de interface mobile',
        profissionais: {
          create: [
            {
              profissionalId: prof2.id,
              valorHora: 100,
              horasMensais: 120
            }
          ]
        }
      }
    })

    await prisma.contrato.create({
      data: {
        nomeProjeto: 'Infraestrutura Cloud',
        codigoContrato: 'CON-2024-003',
        clienteId: cli3.id,
        clienteSistemaId: matilha.id,
        dataInicio: '2024-03-01',
        dataFim: '2024-10-31',
        tipoContrato: 'hora',
        valorContrato: 45000,
        valorImpostos: 5850,
        status: 'ativo',
        observacoes: 'Infraestrutura cloud',
        profissionais: {
          create: [
            {
              profissionalId: prof3.id,
              valorHora: 150,
              horasMensais: 140
            }
          ]
        }
      }
    })

    console.log('✅ Banco de dados populado com sucesso!')
  }
}

// Rotas para Profissionais
app.get('/api/profissionais', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    
    let whereClause = {}
    
    // Se não é admin, filtrar por cliente
    if (usuario.tipo !== 'admin') {
      whereClause = { clienteId: usuario.clienteId }
    }
    
    const profissionais = await prisma.profissional.findMany({
      where: whereClause,
      orderBy: { nome: 'asc' }
    })
    res.json(profissionais.map(p => ({
      ...p,
      status: p.status as 'ativo' | 'inativo' | 'ferias'
    })))
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar profissionais' })
  }
})

app.post('/api/profissionais', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    
    // Adicionar cliente_id automaticamente se não for admin
    const dadosProfissional = {
      ...req.body,
      clienteId: usuario.tipo === 'admin' ? req.body.clienteId : usuario.clienteId
    }
    
    const profissional = await prisma.profissional.create({
      data: dadosProfissional
    })
    res.json({
      ...profissional,
      status: profissional.status as 'ativo' | 'inativo' | 'ferias'
    })
  } catch (error) {
    console.error('Erro ao criar profissional:', error)
    res.status(500).json({ error: 'Erro ao criar profissional' })
  }
})

app.put('/api/profissionais/:id', async (req, res) => {
  try {
    const profissional = await prisma.profissional.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json({
      ...profissional,
      status: profissional.status as 'ativo' | 'inativo' | 'ferias'
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar profissional' })
  }
})

app.delete('/api/profissionais/:id', async (req, res) => {
  try {
    // Primeiro deleta os relacionamentos em ContratoProfissional
    await prisma.contratoProfissional.deleteMany({
      where: { profissionalId: req.params.id }
    })
    
    // Depois deleta o profissional
    await prisma.profissional.delete({
      where: { id: req.params.id }
    })
    res.json({ message: 'Profissional deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar profissional:', error)
    res.status(500).json({ error: 'Erro ao deletar profissional' })
  }
})

// Rotas para Clientes
app.get('/api/clientes', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    
    let whereClause = {}
    
    // Se não é admin, filtrar por cliente
    if (usuario.tipo !== 'admin') {
      whereClause = { clienteId: usuario.clienteId }
    }
    
    const clientes = await prisma.cliente.findMany({
      where: whereClause,
      orderBy: { empresa: 'asc' }
    })
    res.json(clientes.map(c => ({
      ...c,
      telefone: c.telefone || '',
      endereco: c.endereco || ''
    })))
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' })
  }
})

app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({
      data: {
        ...req.body,
        telefone: req.body.telefone || null,
        endereco: req.body.endereco || null
      }
    })
    res.json({
      ...cliente,
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || ''
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' })
  }
})

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        telefone: req.body.telefone || null,
        endereco: req.body.endereco || null
      }
    })
    res.json({
      ...cliente,
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || ''
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' })
  }
})

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    // Verificar se tem contratos ativos
    const contratosAtivos = await prisma.contrato.count({
      where: {
        clienteId: req.params.id,
        status: 'ativo'
      }
    })
    
    if (contratosAtivos > 0) {
      return res.status(400).json({ 
        error: `Não é possível excluir este cliente pois possui ${contratosAtivos} contrato(s) ativo(s)` 
      })
    }
    
    // Se não tem contratos ativos, deleta todos os contratos relacionados primeiro
    await prisma.contratoProfissional.deleteMany({
      where: {
        contrato: {
          clienteId: req.params.id
        }
      }
    })
    
    await prisma.contrato.deleteMany({
      where: { clienteId: req.params.id }
    })
    
    await prisma.cliente.delete({
      where: { id: req.params.id }
    })
    res.json({ message: 'Cliente deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    res.status(500).json({ error: 'Erro ao deletar cliente' })
  }
})

// Rotas para Contratos
app.get('/api/contratos', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    
    let whereClause = {}
    
    // Se não é admin, filtrar por cliente
    if (usuario.tipo !== 'admin') {
      whereClause = { clienteSistemaId: usuario.clienteId }
    }
    
    const contratos = await prisma.contrato.findMany({
      where: whereClause,
      include: {
        profissionais: {
          include: {
            profissional: true
          }
        },
        cliente: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(contratos.map(c => ({
      ...c,
      observacoes: c.observacoes || ''
    })))
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contratos' })
  }
})

app.post('/api/contratos', async (req, res) => {
  try {
    const { profissionais, ...contratoData } = req.body

    const contrato = await prisma.contrato.create({
      data: {
        ...contratoData,
        observacoes: contratoData.observacoes || null,
        profissionais: {
          create: profissionais.map((prof: any) => ({
            profissionalId: prof.profissionalId,
            valorHora: prof.valorHora,
            horasMensais: prof.horasMensais,
            valorFechado: prof.valorFechado,
            periodoFechado: prof.periodoFechado
          }))
        }
      },
      include: {
        profissionais: {
          include: {
            profissional: true
          }
        },
        cliente: true
      }
    })
    res.json({
      ...contrato,
      observacoes: contrato.observacoes || ''
    })
  } catch (error) {
    console.error('Erro ao criar contrato:', error)
    res.status(500).json({ error: 'Erro ao criar contrato' })
  }
})

app.put('/api/contratos/:id', async (req, res) => {
  try {
    const { profissionais, ...contratoData } = req.body

    // Primeiro deleta os profissionais existentes
    await prisma.contratoProfissional.deleteMany({
      where: { contratoId: req.params.id }
    })

    // Depois atualiza o contrato e cria os novos profissionais
    const contrato = await prisma.contrato.update({
      where: { id: req.params.id },
      data: {
        ...contratoData,
        observacoes: contratoData.observacoes || null,
        profissionais: {
          create: profissionais.map((prof: any) => ({
            profissionalId: prof.profissionalId,
            valorHora: prof.valorHora,
            horasMensais: prof.horasMensais,
            valorFechado: prof.valorFechado,
            periodoFechado: prof.periodoFechado
          }))
        }
      },
      include: {
        profissionais: {
          include: {
            profissional: true
          }
        },
        cliente: true
      }
    })
    res.json({
      ...contrato,
      observacoes: contrato.observacoes || ''
    })
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error)
    res.status(500).json({ error: 'Erro ao atualizar contrato' })
  }
})

app.delete('/api/contratos/:id', async (req, res) => {
  try {
    // Primeiro deleta os relacionamentos em ContratoProfissional
    await prisma.contratoProfissional.deleteMany({
      where: { contratoId: req.params.id }
    })
    
    // Depois deleta o contrato
    await prisma.contrato.delete({
      where: { id: req.params.id }
    })
    res.json({ message: 'Contrato deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar contrato:', error)
    res.status(500).json({ error: 'Erro ao deletar contrato' })
  }
})

// ===== ROTAS DE AUTENTICAÇÃO =====

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body

    // Validar campos obrigatórios
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        cliente: true
      }
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' })
    }

    // Verificar senha
    const { verificarSenha } = await import('./utils/auth.ts')
    const senhaValida = await verificarSenha(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Criar sessão
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessions.set(sessionId, {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      clienteId: usuario.clienteId,
      cliente: usuario.cliente
    })

    // Retornar dados do usuário (sem senha)
    res.json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        clienteId: usuario.clienteId,
        cliente: usuario.cliente
      },
      sessionId
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.post('/api/auth/logout', async (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '')
    
    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId)
    }
    
    res.json({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    console.error('Erro no logout:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.get('/api/auth/me', verificarSessao, async (req, res) => {
  try {
    res.json({ usuario: req.usuario })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando!' })
})

// Rotas para Gestão de Clientes do Sistema (apenas admin)
app.get('/api/clientes-sistema', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    
    // Apenas admin pode acessar
    if (usuario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    
    const clientesSistema = await prisma.clienteSistema.findMany({
      include: {
        usuarios: {
          select: {
            id: true,
            email: true,
            tipo: true,
            ativo: true,
            createdAt: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    })
    
    res.json(clientesSistema)
  } catch (error) {
    console.error('Erro ao buscar clientes do sistema:', error)
    res.status(500).json({ error: 'Erro ao buscar clientes do sistema' })
  }
})

app.post('/api/clientes-sistema', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    const { nome, descricao, email, senha } = req.body
    
    // Apenas admin pode criar
    if (usuario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    
    // Validar campos obrigatórios
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    }
    
    // Verificar se já existe cliente com este nome
    const clienteExistente = await prisma.clienteSistema.findFirst({
      where: { nome }
    })
    
    if (clienteExistente) {
      return res.status(400).json({ error: 'Já existe um cliente com este nome' })
    }
    
    // Verificar se já existe usuário com este email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })
    
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Já existe um usuário com este email' })
    }
    
    // Criar cliente do sistema
    const { criptografarSenha } = await import('./utils/auth.ts')
    const senhaCriptografada = await criptografarSenha(senha)
    
    const novoCliente = await prisma.clienteSistema.create({
      data: {
        nome,
        descricao,
        ativo: true
      }
    })
    
    // Criar usuário para o cliente
    await prisma.usuario.create({
      data: {
        email,
        senha: senhaCriptografada,
        tipo: 'cliente',
        clienteId: novoCliente.id,
        ativo: true
      }
    })
    
    res.json(novoCliente)
  } catch (error) {
    console.error('Erro ao criar cliente do sistema:', error)
    res.status(500).json({ error: 'Erro ao criar cliente do sistema' })
  }
})

app.put('/api/clientes-sistema/:id', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    const { id } = req.params
    const { nome, descricao } = req.body
    
    // Apenas admin pode editar
    if (usuario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    
    // Verificar se o cliente existe
    const cliente = await prisma.clienteSistema.findUnique({
      where: { id }
    })
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }
    
    // Não permitir editar o nome do Matilha
    if (cliente.nome === 'Matilha' && nome !== 'Matilha') {
      return res.status(400).json({ error: 'Não é possível alterar o nome do cliente Matilha' })
    }
    
    // Verificar se já existe outro cliente com este nome
    if (nome !== cliente.nome) {
      const clienteExistente = await prisma.clienteSistema.findFirst({
        where: { 
          nome,
          id: { not: id }
        }
      })
      
      if (clienteExistente) {
        return res.status(400).json({ error: 'Já existe um cliente com este nome' })
      }
    }
    
    // Atualizar cliente
    const clienteAtualizado = await prisma.clienteSistema.update({
      where: { id },
      data: { nome, descricao }
    })
    
    res.json(clienteAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar cliente do sistema:', error)
    res.status(500).json({ error: 'Erro ao atualizar cliente do sistema' })
  }
})

app.delete('/api/clientes-sistema/:id', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    const { id } = req.params
    
    // Apenas admin pode deletar
    if (usuario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    
    // Verificar se o cliente existe
    const cliente = await prisma.clienteSistema.findUnique({
      where: { id }
    })
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }
    
    // Não permitir deletar o Matilha
    if (cliente.nome === 'Matilha') {
      return res.status(400).json({ error: 'Não é possível excluir o cliente Matilha' })
    }
    
    // Verificar se há dados associados
    const profissionaisCount = await prisma.profissional.count({
      where: { clienteId: id }
    })
    
    const clientesCount = await prisma.cliente.count({
      where: { clienteId: id }
    })
    
    const contratosCount = await prisma.contrato.count({
      where: { clienteSistemaId: id }
    })
    
    if (profissionaisCount > 0 || clientesCount > 0 || contratosCount > 0) {
      return res.status(400).json({ 
        error: `Não é possível excluir este cliente pois possui dados associados: ${profissionaisCount} profissionais, ${clientesCount} clientes, ${contratosCount} contratos` 
      })
    }
    
    // Deletar usuários associados
    await prisma.usuario.deleteMany({
      where: { clienteId: id }
    })
    
    // Deletar cliente do sistema
    await prisma.clienteSistema.delete({
      where: { id }
    })
    
    res.json({ message: 'Cliente excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar cliente do sistema:', error)
    res.status(500).json({ error: 'Erro ao deletar cliente do sistema' })
  }
})

// Rota temporária para criar usuários (remover depois)
app.post('/api/setup-users', async (req, res) => {
  try {
    // Verificar se já existem usuários
    const usuariosCount = await prisma.usuario.count()
    if (usuariosCount > 0) {
      return res.json({ message: 'Usuários já existem no sistema' })
    }

    // Criar clientes do sistema
    const matilha = await prisma.clienteSistema.create({
      data: {
        id: 'cliente_matilha_default',
        nome: 'Matilha',
        descricao: 'Cliente padrão do sistema',
        ativo: true
      }
    })

    const ftd = await prisma.clienteSistema.create({
      data: {
        nome: 'FTD',
        descricao: 'Cliente FTD',
        ativo: true
      }
    })

    // Criar usuário admin
    const { criptografarSenha } = await import('./utils/auth.js')
    const senhaAdmin = await criptografarSenha('admin123')
    
    await prisma.usuario.create({
      data: {
        email: 'admin@matilha.com',
        senha: senhaAdmin,
        tipo: 'admin',
        ativo: true
      }
    })

    // Criar usuário cliente para Matilha
    const senhaMatilha = await criptografarSenha('matilha123')
    
    await prisma.usuario.create({
      data: {
        email: 'matilha@matilha.com',
        senha: senhaMatilha,
        tipo: 'cliente',
        clienteId: matilha.id,
        ativo: true
      }
    })

    // Criar usuário cliente para FTD
    const senhaFtd = await criptografarSenha('ftd123')
    
    await prisma.usuario.create({
      data: {
        email: 'ftd@ftd.com',
        senha: senhaFtd,
        tipo: 'cliente',
        clienteId: ftd.id,
        ativo: true
      }
    })

    res.json({ 
      message: 'Usuários criados com sucesso!',
      usuarios: {
        admin: 'admin@matilha.com / admin123',
        matilha: 'matilha@matilha.com / matilha123',
        ftd: 'ftd@ftd.com / ftd123'
      }
    })
  } catch (error) {
    console.error('Erro ao criar usuários:', error)
    res.status(500).json({ error: 'Erro ao criar usuários' })
  }
})

// Rota para visualizar o banco de dados
app.get('/api/database', async (req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany()
    const clientes = await prisma.cliente.findMany()
    const contratos = await prisma.contrato.findMany({
      include: {
        profissionais: {
          include: {
            profissional: true
          }
        },
        cliente: true
      }
    })
    const contratoProfissionais = await prisma.contratoProfissional.findMany({
      include: {
        profissional: true,
        contrato: true
      }
    })
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        tipo: true,
        clienteId: true,
        ativo: true,
        createdAt: true
      }
    })
    const clientesSistema = await prisma.clienteSistema.findMany()

    res.json({
      profissionais: {
        count: profissionais.length,
        data: profissionais
      },
      clientes: {
        count: clientes.length,
        data: clientes
      },
      contratos: {
        count: contratos.length,
        data: contratos
      },
      contratoProfissionais: {
        count: contratoProfissionais.length,
        data: contratoProfissionais
      },
      usuarios: {
        count: usuarios.length,
        data: usuarios
      },
      clientesSistema: {
        count: clientesSistema.length,
        data: clientesSistema
      }
    })
  } catch (error) {
    console.error('Erro ao buscar dados do banco:', error)
    res.status(500).json({ error: 'Erro ao buscar dados do banco' })
  }
})

// Inicializar servidor
const startServer = async () => {
  try {
    // Popular banco apenas se estiver vazio
    await seedDatabase()
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error)
  }
}

// Inicializar servidor
app.listen(process.env.PORT || PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${process.env.PORT || PORT}`)
  console.log(`📊 API disponível em: http://localhost:${process.env.PORT || PORT}/api`)
  await startServer()
})

// Exportar para Vercel
export default app 