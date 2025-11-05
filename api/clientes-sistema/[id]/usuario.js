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

    if (req.method === 'PUT') {
      const { id } = req.query
      
      if (!id) {
        return res.status(400).json({ error: 'ID do cliente é obrigatório' })
      }
      
      const { email, senha } = req.body
      
      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' })
      }
      
      // Buscar o cliente do sistema
      const clienteSistema = await prisma.clienteSistema.findUnique({
        where: { id: Array.isArray(id) ? id[0] : id },
        include: {
          usuarios: {
            where: { tipo: 'cliente' }
          }
        }
      })
      
      if (!clienteSistema) {
        return res.status(404).json({ error: 'Cliente não encontrado' })
      }
      
      // Buscar usuário existente
      const usuarioExistente = clienteSistema.usuarios[0]
      
      if (!usuarioExistente) {
        return res.status(404).json({ error: 'Usuário não encontrado para este cliente' })
      }
      
      // Verificar se o novo email já está em uso por outro usuário
      if (email !== usuarioExistente.email) {
        const emailEmUso = await prisma.usuario.findUnique({
          where: { email }
        })
        
        if (emailEmUso) {
          return res.status(400).json({ error: 'Email já está em uso' })
        }
      }
      
      // Preparar dados de atualização
      const dadosAtualizacao = {
        email
      }
      
      // Se senha foi fornecida, atualizar
      if (senha && senha.trim() !== '') {
        const senhaHash = await bcrypt.hash(senha, 12)
        dadosAtualizacao.senha = senhaHash
      }
      
      // Atualizar usuário
      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: dadosAtualizacao,
        select: {
          id: true,
          email: true,
          tipo: true,
          ativo: true,
          createdAt: true
        }
      })
      
      res.status(200).json(usuarioAtualizado)
      
    } else {
      res.status(405).json({ error: 'Método não permitido' })
    }
    
  } catch (error) {
    console.error('Erro ao atualizar credenciais do usuário:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Recurso não encontrado' })
    }
    
    res.status(500).json({ error: 'Erro ao processar requisição' })
  } finally {
    await prisma.$disconnect()
  }
}

