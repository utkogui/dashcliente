import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { email, senha } = req.body

    // Validar campos obrigatórios
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        cliente: true
      }
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' })
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        clienteId: usuario.clienteId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(200).json({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        clienteId: usuario.clienteId,
        cliente: usuario.cliente
      },
      sessionId: token
    })

  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  } finally {
    await prisma.$disconnect()
  }
}
