import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Função para popular o banco com dados iniciais
const seedDatabase = async () => {
  const profissionaisCount = await prisma.profissional.count()
  const clientesCount = await prisma.cliente.count()
  const contratosCount = await prisma.contrato.count()

  if (profissionaisCount === 0 && clientesCount === 0 && contratosCount === 0) {
    console.log('🌱 Populando banco de dados com dados iniciais...')

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
        valorPago: 11520
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
        valorPago: 7200
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
        valorPago: 12600
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
        tamanho: 'Média'
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
        tamanho: 'Pequena'
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
        tamanho: 'Pequena'
      }
    })

    // Criar contratos
    await prisma.contrato.create({
      data: {
        nomeProjeto: 'Sistema de Gestão',
        clienteId: cli1.id,
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
        clienteId: cli2.id,
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
        clienteId: cli3.id,
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
app.get('/api/profissionais', async (req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany({
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

app.post('/api/profissionais', async (req, res) => {
  try {
    const profissional = await prisma.profissional.create({
      data: req.body
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
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
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
app.get('/api/contratos', async (req, res) => {
  try {
    const contratos = await prisma.contrato.findMany({
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

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando!' })
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