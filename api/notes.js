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
      
      const { profissionalId } = req.query
      
      if (!profissionalId) {
        return res.status(400).json({ error: 'profissionalId é obrigatório' })
      }
      
      const notas = await prisma.clienteNota.findMany({
        where: {
          profissionalId: profissionalId,
          clienteId: payload.clienteId
        },
        orderBy: { createdAt: 'desc' }
      })
      
      res.status(200).json(notas)
      
    } catch (error) {
      console.error('Erro ao buscar notas:', error)
      res.status(500).json({ error: 'Erro ao buscar notas' })
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
      res.status(500).json({ error: 'Erro ao criar nota' })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
