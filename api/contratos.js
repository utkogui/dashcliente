import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_2025'

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }
    
    const payload = jwt.verify(token, JWT_SECRET)

    if (req.method === 'GET') {
      let whereClause = {}
      
      // Se não é admin, filtrar por cliente
      if (payload.tipo !== 'admin') {
        whereClause = { clienteSistemaId: payload.clienteId }
      }
      
      const contratos = await prisma.contrato.findMany({
        where: whereClause,
        include: {
          cliente: true,
          profissionais: {
            include: {
              profissional: true
            }
          }
        },
        orderBy: { dataInicio: 'desc' }
      })
      
      res.status(200).json(contratos.map(c => ({
        ...c,
        observacoes: c.observacoes || ''
      })))
      
    } else if (req.method === 'POST') {
      const { profissionais, ...contratoData } = req.body

      // Validar que profissionais é um array válido
      if (!Array.isArray(profissionais)) {
        return res.status(400).json({ 
          error: 'Profissionais deve ser um array',
          details: 'O campo profissionais não foi enviado ou está em formato inválido'
        })
      }

      if (profissionais.length === 0) {
        return res.status(400).json({ 
          error: 'É necessário pelo menos um profissional no contrato',
          details: 'Adicione pelo menos um profissional antes de salvar'
        })
      }

      // Determinar cliente do sistema para o contrato
      let clienteSistemaId = null
      if (payload.tipo === 'admin') {
        // Para admin, buscar pelo cliente de negócio informado para obter o cliente do sistema
        const clienteNegocio = await prisma.cliente.findUnique({ where: { id: contratoData.clienteId } })
        if (!clienteNegocio) {
          return res.status(400).json({ error: 'Cliente informado não encontrado' })
        }
        clienteSistemaId = clienteNegocio.clienteId
      } else {
        // Para cliente comum, usar o clienteId da sessão
        if (!payload.clienteId) {
          return res.status(403).json({ error: 'Apenas usuários cliente podem criar contratos' })
        }
        clienteSistemaId = payload.clienteId
      }

      // Montar payload com cliente do sistema resolvido
      const contratoComCliente = {
        ...contratoData,
        clienteSistemaId,
        observacoes: contratoData.observacoes || null
      }

      const contrato = await prisma.contrato.create({
        data: {
          ...contratoComCliente,
          profissionais: {
            create: profissionais.map((prof) => ({
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
      
      res.status(201).json({
        ...contrato,
        observacoes: contrato.observacoes || ''
      })
      
    } else {
      res.status(405).json({ error: 'Método não permitido' })
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de contratos:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Contrato não encontrado' })
    }
    
    res.status(500).json({ error: 'Erro ao processar requisição' })
  } finally {
    await prisma.$disconnect()
  }
}
