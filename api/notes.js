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

  if (req.method === 'GET') {
    try {
      // Verificar autenticação
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' })
      }
      
      const payload = jwt.verify(token, JWT_SECRET)
      
      const { profissionalId, contratoId } = req.query
      
      if (!profissionalId && !contratoId) {
        return res.status(400).json({ error: 'profissionalId ou contratoId é obrigatório' })
      }
      
      // Construir where clause
      const whereClause = {}
      
      if (profissionalId) {
        whereClause.profissionalId = profissionalId
      }
      
      if (contratoId) {
        whereClause.contratoId = contratoId
      }
      
      // Se não for admin, filtrar por clienteId
      if (payload.tipo !== 'admin' && payload.clienteId) {
        whereClause.clienteId = payload.clienteId
      }
      
      const notas = await prisma.clienteNota.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      })
      
      res.status(200).json(notas)
      
    } catch (error) {
      console.error('Erro ao buscar notas:', error)
      res.status(500).json({ error: 'Erro ao buscar notas', details: error.message })
    } finally {
      await prisma.$disconnect()
    }
  } else if (req.method === 'POST') {
    try {
      // Verificar autenticação
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' })
      }
      
      const payload = jwt.verify(token, JWT_SECRET)
      
      // Apenas usuários cliente podem criar notas
      if (payload.tipo !== 'cliente' || !payload.clienteId) {
        return res.status(403).json({ error: 'Apenas usuários cliente podem criar notas' })
      }
      
      const { profissionalId, contratoId, texto } = req.body
      
      if (!profissionalId || !texto || !contratoId) {
        return res.status(400).json({ error: 'profissionalId, contratoId e texto são obrigatórios' })
      }
      
      const nota = await prisma.clienteNota.create({
        data: {
          clienteId: payload.clienteId,
          contratoId: contratoId,
          profissionalId: profissionalId,
          texto: texto
        }
      })
      
      res.status(201).json({ ok: true, id: nota.id })
      
    } catch (error) {
      console.error('Erro ao criar nota:', error)
      res.status(500).json({ error: 'Erro ao criar nota', details: error.message })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
