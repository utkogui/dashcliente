import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_2025'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

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
    const { profissionalId } = req.query
    const id = Array.isArray(profissionalId) ? profissionalId[0] : profissionalId

    if (!id) {
      return res.status(400).json({ error: 'profissionalId é obrigatório' })
    }

    const profissional = await prisma.profissional.findUnique({
      where: { id }
    })

    if (!profissional || !profissional.contratoArquivo) {
      return res.status(404).json({ error: 'Arquivo de contrato não encontrado' })
    }

    if (payload.tipo !== 'admin' && profissional.clienteId !== payload.clienteId) {
      return res.status(403).json({ error: 'Sem permissão para baixar este contrato' })
    }

    if (profissional.contratoArquivo.startsWith('http')) {
      res.redirect(302, profissional.contratoArquivo)
      return
    }

    return res.status(404).json({
      error: 'Arquivo não disponível para download (armazenado apenas no servidor local). Faça um novo upload em produção.'
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    console.error('Erro no download do contrato:', error)
    res.status(500).json({ error: 'Erro ao fazer download do arquivo' })
  } finally {
    await prisma.$disconnect()
  }
}
