import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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
    
    // Apenas admin pode acessar
    if (payload.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    if (req.method === 'GET') {
      const clientesSistema = await prisma.clienteSistema.findMany({
        include: {
          usuarios: {
            select: {
              id: true,
              email: true,
              tipo: true,
              ativo: true,
              createdAt: true
            }
          }
        },
        orderBy: { nome: 'asc' }
      })
      
      res.status(200).json(clientesSistema)
      
    } else if (req.method === 'POST') {
      const { nome, descricao, email, senha } = req.body
      
      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
      }
      
      // Verificar se email já existe
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      })
      
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Email já está em uso' })
      }
      
      // Criar cliente do sistema e usuário
      const senhaHash = await bcrypt.hash(senha, 12)
      
      const clienteSistema = await prisma.clienteSistema.create({
        data: {
          nome,
          descricao: descricao || null,
          ativo: true,
          usuarios: {
            create: {
              email,
              senha: senhaHash,
              tipo: 'cliente',
              ativo: true,
              clienteId: null // Será atualizado após criar o ClienteSistema
            }
          }
        },
        include: {
          usuarios: {
            select: {
              id: true,
              email: true,
              tipo: true,
              ativo: true,
              createdAt: true
            }
          }
        }
      })
      
      // Atualizar clienteId do usuário
      await prisma.usuario.update({
        where: { id: clienteSistema.usuarios[0].id },
        data: { clienteId: clienteSistema.id }
      })
      
      res.status(201).json(clienteSistema)
      
    } else if (req.method === 'PUT') {
      const { id } = req.query
      
      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' })
      }
      
      const { nome, descricao, ativo } = req.body
      
      const clienteSistema = await prisma.clienteSistema.update({
        where: { id: Array.isArray(id) ? id[0] : id },
        data: {
          ...(nome && { nome }),
          ...(descricao !== undefined && { descricao }),
          ...(ativo !== undefined && { ativo })
        },
        include: {
          usuarios: {
            select: {
              id: true,
              email: true,
              tipo: true,
              ativo: true,
              createdAt: true
            }
          }
        }
      })
      
      res.status(200).json(clienteSistema)
      
    } else {
      res.status(405).json({ error: 'Método não permitido' })
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de clientes-sistema:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    
    res.status(500).json({ error: 'Erro ao processar requisição' })
  } finally {
    await prisma.$disconnect()
  }
}

