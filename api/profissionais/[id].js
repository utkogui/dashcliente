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

    // No Vercel, rotas dinâmicas vêm em req.query
    const id = req.query.id || req.query
    
    console.log('🔍 Debug - Método:', req.method)
    console.log('🔍 Debug - Query:', req.query)
    console.log('🔍 Debug - ID extraído:', id)

    if (req.method === 'PUT') {
      const profissionalId = Array.isArray(id) ? id[0] : (typeof id === 'string' ? id : null)
      
      if (!profissionalId) {
        return res.status(400).json({ error: 'ID é obrigatório', query: req.query })
      }

      // Se não for admin, verificar se o profissional pertence ao cliente do usuário
      if (payload.tipo !== 'admin') {
        const profissionalExistente = await prisma.profissional.findFirst({
          where: { 
            id: profissionalId,
            clienteId: payload.clienteId
          }
        })
    
        if (!profissionalExistente) {
          return res.status(404).json({ error: 'Profissional não encontrado' })
        }
      }

      const profissionalData = req.body

      // Determinar clienteId se for admin
      let clienteIdFinal = null
      if (payload.tipo === 'admin') {
        if (profissionalData.clienteId) {
          clienteIdFinal = profissionalData.clienteId
        } else {
          // Se não foi informado, manter o existente
          const profissionalExistente = await prisma.profissional.findUnique({
            where: { id: profissionalId }
          })
          if (!profissionalExistente) {
            return res.status(404).json({ error: 'Profissional não encontrado' })
          }
          clienteIdFinal = profissionalExistente.clienteId
        }
      } else {
        clienteIdFinal = payload.clienteId
      }

      const profissional = await prisma.profissional.update({
        where: { id: profissionalId },
        data: {
          ...profissionalData,
          clienteId: clienteIdFinal
        }
      })
      
      res.status(200).json(profissional)
      
    } else if (req.method === 'DELETE') {
      const profissionalId = Array.isArray(id) ? id[0] : (typeof id === 'string' ? id : null)
      
      if (!profissionalId) {
        return res.status(400).json({ error: 'ID é obrigatório', query: req.query })
      }

      // Se não for admin, verificar se o profissional pertence ao cliente do usuário
      if (payload.tipo !== 'admin') {
        const profissionalExistente = await prisma.profissional.findFirst({
          where: { 
            id: profissionalId,
            clienteId: payload.clienteId
          }
        })
    
        if (!profissionalExistente) {
          return res.status(404).json({ error: 'Profissional não encontrado' })
        }
      }

      // Deletar profissional
      await prisma.profissional.delete({
        where: { id: profissionalId }
      })
      
      res.status(200).json({ message: 'Profissional deletado com sucesso' })
      
    } else {
      res.status(405).json({ error: 'Método não permitido' })
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de profissional:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Profissional não encontrado' })
    }
    
    res.status(500).json({ error: 'Erro ao processar requisição' })
  } finally {
    await prisma.$disconnect()
  }
}

