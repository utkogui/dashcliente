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
      
      res.status(200).json(contratos)
      
    } catch (error) {
      console.error('Erro ao buscar contratos:', error)
      res.status(500).json({ error: 'Erro ao buscar contratos' })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
