import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui'

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }
    
    const payload = jwt.verify(token, JWT_SECRET)
    
    // Buscar usuário atualizado
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      include: {
        cliente: true
      }
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    res.status(200).json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        clienteId: usuario.clienteId,
        cliente: usuario.cliente
      }
    })

  } catch (error) {
    console.error('Erro na verificação:', error)
    res.status(401).json({ error: 'Token inválido' })
  } finally {
    await prisma.$disconnect()
  }
}
