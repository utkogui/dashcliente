import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = 3001

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : (process.env.NODE_ENV === 'production'
      ? ['https://dashcliente-1.onrender.com', 'https://dashcliente.onrender.com']
      : ['http://localhost:5173', 'http://10.0.1.214:5173', 'http://127.0.0.1:5173'])

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

import { generateToken, verifyToken, JWTPayload } from './utils/jwt.js'

// Middleware para verificar JWT
const verificarSessao = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      console.log('Token não fornecido')
      return res.status(401).json({ error: 'Token não fornecido' })
    }
    
    const payload = verifyToken(token)
    console.log('Token verificado:', { userId: payload.id, email: payload.email, tipo: payload.tipo })
    
    req.usuario = payload
    next()
  } catch (error) {
    console.log('Token inválido:', error.message)
    res.status(401).json({ error: 'Token inválido ou expirado' })
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

    // Criar usuário admin padrão (super admin sem cliente)
    const { criptografarSenha } = await import('./utils/auth.js')
    const senhaAdmin = await criptografarSenha('admin123')
    
    await prisma.usuario.create({
      data: {
        email: 'admin@matilha.com',
        senha: senhaAdmin,
        tipo: 'admin',
        ativo: true,
        clienteId: null
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

    // Criar usuários cliente para FTD
    const senhaFtd = await criptografarSenha('ftd123')
    const senhaMarcus = await criptografarSenha('ftd2025')
    await prisma.usuario.createMany({
      data: [
        {
          email: 'ftd@ftd.com',
          senha: senhaFtd,
          tipo: 'cliente',
          clienteId: ftd.id,
          ativo: true
        },
        {
          email: 'marcus@ftd.com.br',
          senha: senhaMarcus,
          tipo: 'cliente',
          clienteId: ftd.id,
          ativo: true
        }
      ],
      skipDuplicates: true
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
    
    // Debug: verificar dados do usuário
    console.log('Dados do usuário:', {
      tipo: usuario.tipo,
      clienteId: usuario.clienteId,
      bodyClienteId: req.body.clienteId
    })
    
    // Validar clienteId antes de criar
    let clienteIdFinal = null
    
    if (usuario.tipo === 'admin') {
      // Admin pode especificar clienteId ou usar o próprio
      if (req.body.clienteId) {
        // Verificar se o clienteId existe
        const clienteExiste = await prisma.clienteSistema.findUnique({
          where: { id: req.body.clienteId }
        })
        if (!clienteExiste) {
          return res.status(400).json({ 
            error: 'ClienteId especificado não existe no sistema' 
          })
        }
        clienteIdFinal = req.body.clienteId
      } else if (usuario.clienteId) {
        clienteIdFinal = usuario.clienteId
      } else {
        return res.status(400).json({ 
          error: 'Admin deve especificar um clienteId válido' 
        })
      }
    } else {
      // Usuário cliente usa o próprio clienteId
      if (!usuario.clienteId) {
        return res.status(400).json({ 
          error: 'Usuário não possui clienteId válido' 
        })
      }
      clienteIdFinal = usuario.clienteId
    }
    
    console.log('ClienteId final:', clienteIdFinal)
    
    // Adicionar cliente_id validado
    const dadosProfissional = {
      ...req.body,
      clienteId: clienteIdFinal
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

app.put('/api/profissionais/:id', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req

    // Se não for admin, garantir que o profissional pertence ao mesmo cliente
    if (usuario.tipo !== 'admin') {
      const existente = await prisma.profissional.findFirst({ where: { id: req.params.id, clienteId: usuario.clienteId } })
      if (!existente) return res.status(404).json({ error: 'Profissional não encontrado' })
    }

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

app.delete('/api/profissionais/:id', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req

    if (usuario.tipo !== 'admin') {
      const existente = await prisma.profissional.findFirst({ where: { id: req.params.id, clienteId: usuario.clienteId } })
      if (!existente) return res.status(404).json({ error: 'Profissional não encontrado' })
    }

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

app.post('/api/clientes', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    console.log('Criando cliente:', { usuario, body: req.body })
    
    // Para usuários admin, usar o clienteId do corpo da requisição ou um padrão
    let clienteId = req.body.clienteId
    if (!clienteId) {
      if (usuario.tipo === 'admin') {
        // Admin pode escolher qualquer cliente do sistema
        clienteId = 'cliente_matilha_default'
      } else {
        // Usuário cliente usa seu próprio clienteId
        clienteId = usuario.clienteId
      }
    }
    
    if (!clienteId) {
      return res.status(400).json({ error: 'clienteId é obrigatório' })
    }
    
    const cliente = await prisma.cliente.create({
      data: {
        nome: req.body.nome,
        empresa: req.body.empresa,
        email: req.body.email,
        telefone: req.body.telefone || null,
        endereco: req.body.endereco || null,
        anoInicio: req.body.anoInicio,
        segmento: req.body.segmento,
        tamanho: req.body.tamanho,
        clienteId: clienteId
      }
    })
    
    console.log('Cliente criado com sucesso:', cliente)
    res.json({
      ...cliente,
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || ''
    })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    res.status(500).json({ error: 'Erro ao criar cliente' })
  }
})

app.put('/api/clientes/:id', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    
    // Se não for admin, verificar se o cliente pertence ao usuário
    if (usuario.tipo !== 'admin') {
      const clienteExistente = await prisma.cliente.findFirst({
        where: { 
          id: req.params.id,
          clienteId: usuario.clienteId
        }
      })
  
      if (!clienteExistente) {
        return res.status(404).json({ error: 'Cliente não encontrado' })
      }
    }

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

app.delete('/api/clientes/:id', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    
    // Se não for admin, verificar se o cliente pertence ao usuário
    if (usuario.tipo !== 'admin') {
      const clienteExistente = await prisma.cliente.findFirst({
        where: { 
          id: req.params.id,
          clienteId: usuario.clienteId
        }
      })
  
      if (!clienteExistente) {
        return res.status(404).json({ error: 'Cliente não encontrado' })
      }
    }

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

app.post('/api/contratos', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    const { profissionais, ...contratoData } = req.body

    console.log('Dados recebidos:', { contratoData, profissionais, usuario })

    // Determinar cliente do sistema para o contrato
    let clienteSistemaId: string | null = null
    if (usuario.tipo === 'admin') {
      // Para admin, buscar pelo cliente de negócio informado para obter o cliente do sistema
      const clienteNegocio = await prisma.cliente.findUnique({ where: { id: contratoData.clienteId } })
      if (!clienteNegocio) {
        return res.status(400).json({ error: 'Cliente informado não encontrado' })
      }
      clienteSistemaId = clienteNegocio.clienteId
    } else {
      // Para cliente comum, usar o clienteId da sessão
      if (!usuario.clienteId) {
        return res.status(403).json({ error: 'Apenas usuários cliente podem criar contratos' })
      }
      clienteSistemaId = usuario.clienteId
    }

    // Montar payload com cliente do sistema resolvido
    const contratoComCliente = {
      ...contratoData,
      clienteSistemaId,
      observacoes: contratoData.observacoes || null
    }

    console.log('Dados para criação:', contratoComCliente)

    const contrato = await prisma.contrato.create({
      data: {
        ...contratoComCliente,
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
    
    console.log('Contrato criado com sucesso:', contrato.id)
    
    res.json({
      ...contrato,
      observacoes: contrato.observacoes || ''
    })
  } catch (error) {
    console.error('Erro ao criar contrato:', error)
    const isDev = process.env.NODE_ENV !== 'production'
    res.status(500).json({ 
      error: 'Erro ao criar contrato',
      ...(isDev && {
        details: (error as any)?.message || String(error),
        code: (error as any)?.code,
      })
    })
  }
})

app.put('/api/contratos/:id', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    const { profissionais, ...contratoData } = req.body

    // Se não for admin, verificar se o contrato pertence ao cliente do usuário
    if (usuario.tipo !== 'admin') {
      const contratoExistente = await prisma.contrato.findFirst({
        where: { 
          id: req.params.id,
          clienteSistemaId: usuario.clienteId
        }
      })
  
      if (!contratoExistente) {
        return res.status(404).json({ error: 'Contrato não encontrado' })
      }
    }

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

app.delete('/api/contratos/:id', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req

    // Se não for admin, verificar se o contrato pertence ao cliente do usuário
    if (usuario.tipo !== 'admin') {
      const contratoExistente = await prisma.contrato.findFirst({
        where: { 
          id: req.params.id,
          clienteSistemaId: usuario.clienteId
        }
      })
  
      if (!contratoExistente) {
        return res.status(404).json({ error: 'Contrato não encontrado' })
      }
    }

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
    const { verificarSenha } = await import('./utils/auth.js')
    const senhaValida = await verificarSenha(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Gerar JWT
    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      clienteId: usuario.clienteId
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
      sessionId: token // Mantendo compatibilidade com o frontend
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.post('/api/auth/logout', async (req, res) => {
  try {
    // Com JWT, não precisamos fazer nada no servidor
    // O token será invalidado no frontend
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

// Impersonação: admin assume sessão de um cliente existente
app.post('/api/auth/impersonate', verificarSessao, async (req: any, res) => {
  try {
    const { clienteId } = req.body as { clienteId?: string }
    const usuarioAdmin = req.usuario
    if (usuarioAdmin.tipo !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem impersonar' })
    }
    if (!clienteId) {
      return res.status(400).json({ error: 'clienteId é obrigatório' })
    }
    const userCliente = await prisma.usuario.findFirst({
      where: { clienteId, tipo: 'cliente', ativo: true },
      include: { cliente: true }
    })
    if (!userCliente) {
      return res.status(404).json({ error: 'Usuário do cliente não encontrado' })
    }
    // Para JWT, retornar dados do usuário cliente sem criar sessão
    return res.json({
      usuario: {
        id: userCliente.id,
        email: userCliente.email,
        tipo: 'cliente',
        clienteId: userCliente.clienteId,
        cliente: userCliente.cliente,
        impersonatedBy: usuarioAdmin.email
      },
      message: 'Impersonação realizada com sucesso'
    })
  } catch (error) {
    console.error('Erro na impersonação:', error)
    res.status(500).json({ error: 'Erro na impersonação' })
  }
})

// ===== ROTAS: Interações do Cliente (Visão do Cliente) =====
// Registrar interesse do cliente
app.post('/api/client-actions/interest', verificarSessao, async (req: any, res) => {
  try {
    const { interesse, comentario, contratoId, profissionalId } = req.body
    const usuario = req.usuario
    if (!interesse || !contratoId || !profissionalId) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
    }
    // Apenas cliente pode registrar
    if (!usuario.clienteId) {
      return res.status(403).json({ error: 'Apenas usuários cliente podem registrar interesse' })
    }
    // Validar tipos permitidos para clientes (PRD)
    const interesseUpper = String(interesse).toUpperCase()
    const allowedForClient = ['RENOVAR', 'ESPERAR']
    if (usuario.tipo !== 'admin' && !allowedForClient.includes(interesseUpper)) {
      return res.status(400).json({ error: 'Interesse inválido. Permitidos: RENOVAR, ESPERAR' })
    }
    const created = await prisma.clienteInteresse.create({
      data: {
        clienteId: usuario.clienteId,
        contratoId,
        profissionalId,
        interesse: interesseUpper,
        comentario: comentario || null
      }
    })
    res.json({ ok: true, id: created.id })
  } catch (error) {
    console.error('Erro ao registrar interesse:', { route: '/api/client-actions/interest', error })
    res.status(500).json({ error: 'Erro ao registrar interesse' })
  }
})

// Listar interesses do cliente (por contrato/profissional)
app.get('/api/client-actions', verificarSessao, async (req: any, res) => {
  try {
    const { contratoId, profissionalId } = req.query as { contratoId?: string; profissionalId?: string }
    const usuario = req.usuario
    const whereClause: any = {}
    if (contratoId) whereClause.contratoId = contratoId
    if (profissionalId) whereClause.profissionalId = profissionalId
    // Restringir por cliente do sistema quando não for admin
    if (usuario.tipo !== 'admin') {
      whereClause.clienteId = usuario.clienteId
    }
    const itens = await prisma.clienteInteresse.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })
    res.json(itens)
  } catch (error) {
    console.error('Erro ao listar interesses:', { route: '/api/client-actions', error })
    res.status(500).json({ error: 'Erro ao listar interesses' })
  }
})

// Registrar anotação do cliente
app.post('/api/notes', verificarSessao, async (req: any, res) => {
  try {
    const { contratoId, profissionalId, texto } = req.body
    const usuario = req.usuario
    if (!texto || !contratoId || !profissionalId) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
    }
    if (!usuario.clienteId) {
      return res.status(403).json({ error: 'Apenas usuários cliente podem anotar' })
    }
    const created = await prisma.clienteNota.create({
      data: {
        clienteId: usuario.clienteId,
        contratoId,
        profissionalId,
        texto
      }
    })
    res.json({ ok: true, id: created.id })
  } catch (error) {
    console.error('Erro ao registrar anotação:', { route: '/api/notes', error })
    res.status(500).json({ error: 'Erro ao registrar anotação' })
  }
})

// Listar anotações do cliente (por contrato/profissional)
app.get('/api/notes', verificarSessao, async (req: any, res) => {
  try {
    const { contratoId, profissionalId } = req.query as { contratoId?: string; profissionalId?: string }
    const usuario = req.usuario
    const whereClause: any = {}
    if (contratoId) whereClause.contratoId = contratoId
    if (profissionalId) whereClause.profissionalId = profissionalId
    if (usuario.tipo !== 'admin') {
      whereClause.clienteId = usuario.clienteId
    }
    const notas = await prisma.clienteNota.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })
    res.json(notas)
  } catch (error) {
    console.error('Erro ao listar notas:', { route: '/api/notes', error })
    res.status(500).json({ error: 'Erro ao listar notas' })
  }
})

// Solicitar novo profissional
app.post('/api/requests/new-professional', verificarSessao, async (req: any, res) => {
  try {
    const { especialidade, senioridade, descricao } = req.body
    const usuario = req.usuario
    if (!especialidade) {
      return res.status(400).json({ error: 'Especialidade é obrigatória' })
    }
    if (!usuario.clienteId) {
      return res.status(403).json({ error: 'Apenas usuários cliente podem solicitar' })
    }
    const created = await prisma.solicitacaoProfissional.create({
      data: {
        clienteId: usuario.clienteId,
        especialidade,
        senioridade: senioridade || null,
        descricao: descricao || null
      }
    })
    res.json({ ok: true, id: created.id })
  } catch (error) {
    console.error('Erro ao solicitar profissional:', error)
    res.status(500).json({ error: 'Erro ao solicitar profissional' })
  }
})

// Histórico de alocação por profissional
app.get('/api/allocations/history', verificarSessao, async (req: any, res) => {
  try {
    const { profissionalId } = req.query as { profissionalId?: string }
    const usuario = req.usuario
    if (!profissionalId) {
      return res.status(400).json({ error: 'profissionalId é obrigatório' })
    }

    const whereClause: any = {
      profissionais: {
        some: { profissionalId }
      }
    }
    // Se não é admin, filtrar por cliente do sistema
    if (usuario.tipo !== 'admin') {
      whereClause.clienteSistemaId = usuario.clienteId
    }

    const historico = await prisma.contrato.findMany({
      where: whereClause,
      select: {
        id: true,
        nomeProjeto: true,
        dataInicio: true,
        dataFim: true,
        cliente: { select: { empresa: true } }
      },
      orderBy: { dataInicio: 'desc' }
    })
    const flattened = historico.map(h => ({
      id: h.id,
      projeto: h.nomeProjeto,
      inicio: h.dataInicio,
      fim: h.dataFim,
      cliente: h.cliente?.empresa || 'Cliente'
    }))
    res.json(flattened)
  } catch (error) {
    console.error('Erro ao obter histórico de alocação:', { route: '/api/allocations/history', error })
    res.status(500).json({ error: 'Erro ao obter histórico de alocação' })
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
    
    // Validar senha mínima
    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
    }
    
    // Verificar se já existe cliente com este nome
    const clienteExistente = await prisma.clienteSistema.findFirst({
      where: { nome }
    })
    
    if (clienteExistente) {
      return res.status(400).json({ error: 'Já existe uma empresa com este nome' })
    }
    
    // Verificar se já existe usuário com este email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })
    
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Já existe um usuário com este email' })
    }
    
    // Criar cliente do sistema
    const { criptografarSenha } = await import('./utils/auth.js')
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
    console.error('Erro ao criar empresa:', error)
    res.status(500).json({ error: 'Erro ao criar empresa' })
  }
})

// Rota para atualizar credenciais do usuário de uma empresa
app.put('/api/clientes-sistema/:id/usuario', verificarSessao, async (req, res) => {
  try {
    const { usuario } = req
    const { id } = req.params
    const { email, senha } = req.body
    
    // Apenas admin pode editar
    if (usuario.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    
    // Verificar se o cliente existe
    const cliente = await prisma.clienteSistema.findUnique({
      where: { id },
      include: {
        usuarios: {
          where: { tipo: 'cliente' }
        }
      }
    })
    
    if (!cliente) {
      return res.status(404).json({ error: 'Empresa não encontrada' })
    }
    
    if (cliente.usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuário da empresa não encontrado' })
    }
    
    const usuarioCliente = cliente.usuarios[0]
    
    // Preparar dados para atualização
    const updateData: any = {}
    
    if (email && email !== usuarioCliente.email) {
      // Verificar se o novo email já existe
      const emailExistente = await prisma.usuario.findUnique({
        where: { email }
      })
      
      if (emailExistente && emailExistente.id !== usuarioCliente.id) {
        return res.status(400).json({ error: 'Já existe um usuário com este email' })
      }
      
      updateData.email = email
    }
    
    if (senha && senha.length >= 6) {
      const { criptografarSenha } = await import('./utils/auth.js')
      updateData.senha = await criptografarSenha(senha)
    }
    
    // Atualizar usuário se há mudanças
    if (Object.keys(updateData).length > 0) {
      await prisma.usuario.update({
        where: { id: usuarioCliente.id },
        data: updateData
      })
    }
    
    res.json({ message: 'Credenciais atualizadas com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar credenciais:', error)
    res.status(500).json({ error: 'Erro ao atualizar credenciais' })
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

    // Garantir usuário Marcus (FTD) independente do seed inicial
    try {
      const ftd = await prisma.clienteSistema.findFirst({ where: { nome: 'FTD' } })
      if (ftd) {
        const existing = await prisma.usuario.findUnique({ where: { email: 'marcus@ftd.com.br' } })
        if (!existing) {
          const { criptografarSenha } = await import('./utils/auth.js')
          const senhaMarcus = await criptografarSenha('ftd2025')
          await prisma.usuario.create({
            data: {
              email: 'marcus@ftd.com.br',
              senha: senhaMarcus,
              tipo: 'cliente',
              clienteId: ftd.id,
              ativo: true
            }
          })
          console.log('👤 Usuário Marcus (FTD) criado')
        } else {
          console.log('👤 Usuário Marcus (FTD) já existe')
        }
      }
    } catch (e) {
      console.error('Erro garantindo usuário Marcus:', e)
    }

    // Garantir usuário Admin FTD solicitado (admin@ftd.com.br / ftd2025) vinculado ao cliente FTD
    try {
      const adminFtd = await prisma.usuario.findUnique({ where: { email: 'admin@ftd.com.br' } })
      if (!adminFtd) {
        const { criptografarSenha } = await import('./utils/auth.js')
        const senhaAdminFtd = await criptografarSenha('ftd2025')
        const ftd = await prisma.clienteSistema.findFirst({ where: { nome: 'FTD' } })
        await prisma.usuario.create({
          data: {
            email: 'admin@ftd.com.br',
            senha: senhaAdminFtd,
            tipo: 'admin',
            clienteId: ftd?.id || null,
            ativo: true
          }
        })
        console.log('👤 Usuário Admin FTD criado (admin@ftd.com.br)')
      } else {
        console.log('👤 Usuário Admin FTD já existe (admin@ftd.com.br)')
      }
    } catch (e) {
      console.error('Erro garantindo Admin FTD:', e)
    }
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