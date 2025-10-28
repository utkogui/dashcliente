import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_2025'

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'POST') {
    try {
      // Verificar autenticação
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' })
      }
      
      const payload = jwt.verify(token, JWT_SECRET)
      
      const { interesse, comentario, contratoId, profissionalId } = req.body
      
      if (!interesse || !contratoId || !profissionalId) {
        return res.status(400).json({ error: 'interesse, contratoId e profissionalId são obrigatórios' })
      }

      // Validar tipos de interesse permitidos
      const interessesValidos = ['RENOVAR', 'ESPERAR', 'REDUZIR', 'TROCAR']
      if (!interessesValidos.includes(interesse)) {
        return res.status(400).json({ error: 'Tipo de interesse inválido' })
      }

      const clienteInteresse = await prisma.clienteInteresse.create({
        data: {
          clienteId: payload.clienteId,
          contratoId,
          profissionalId,
          interesse,
          comentario: comentario || null,
          dataInteresse: new Date()
        }
      })

      res.status(201).json({ ok: true, id: clienteInteresse.id })
      
    } catch (error) {
      console.error('Erro ao registrar interesse:', error)
      res.status(500).json({ error: 'Erro ao registrar interesse' })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
