import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_2025'

// Middleware para verificar JWT
const verificarSessao = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }
    
    const payload = jwt.verify(token, JWT_SECRET)
    req.usuario = payload
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

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
        whereClause = { clienteId: payload.clienteId }
      }
      
      const profissionais = await prisma.profissional.findMany({
        where: whereClause,
        orderBy: { nome: 'asc' }
      })
      
      res.status(200).json(profissionais.map(p => ({
        ...p,
        status: p.status
      })))
      
    } else if (req.method === 'POST') {
      const profissionalData = req.body

      // Determinar clienteId
      let clienteIdFinal = null
      if (payload.tipo === 'admin') {
        if (profissionalData.clienteId) {
          clienteIdFinal = profissionalData.clienteId
        } else if (payload.clienteId) {
          clienteIdFinal = payload.clienteId
        } else {
          return res.status(400).json({ error: 'clienteId é obrigatório' })
        }
      } else {
        if (!payload.clienteId) {
          return res.status(403).json({ error: 'Usuário não possui clienteId válido' })
        }
        clienteIdFinal = payload.clienteId
      }

      const profissional = await prisma.profissional.create({
        data: {
          ...profissionalData,
          clienteId: clienteIdFinal
        }
      })
      
      res.status(201).json(profissional)
      
    } else {
      res.status(405).json({ error: 'Método não permitido' })
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de profissionais:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    
    res.status(500).json({ error: 'Erro ao processar requisição' })
  } finally {
    await prisma.$disconnect()
  }
}
