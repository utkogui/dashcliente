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

      const whereClause = {
        profissionais: {
          some: { profissionalId }
        }
      }
      
      // Se não é admin, filtrar por cliente do sistema
      if (payload.tipo !== 'admin') {
        whereClause.clienteSistemaId = payload.clienteId
      }

      const historico = await prisma.contrato.findMany({
        where: whereClause,
        select: {
          id: true,
          nomeProjeto: true,
          dataInicio: true,
          dataFim: true,
          cliente: {
            select: {
              empresa: true
            }
          }
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

      res.status(200).json(flattened)
      
    } catch (error) {
      console.error('Erro ao obter histórico de alocação:', error)
      res.status(500).json({ error: 'Erro ao obter histórico de alocação' })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
