import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { del } from '@vercel/blob'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_2025'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'DELETE') {
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

    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' })
    }

    if (!profissional.contratoArquivo) {
      return res.status(404).json({ error: 'Arquivo de contrato não encontrado' })
    }

    if (payload.tipo !== 'admin') {
      if (profissional.clienteId !== payload.clienteId) {
        return res.status(403).json({ error: 'Sem permissão para remover este contrato' })
      }
    }

    if (profissional.contratoArquivo.startsWith('http') && profissional.contratoArquivo.includes('blob.vercel-storage.com')) {
      try {
        await del(profissional.contratoArquivo)
      } catch (e) {
        console.warn('Blob delete failed (may already be gone):', e.message)
      }
    }

    await prisma.profissional.update({
      where: { id },
      data: { contratoArquivo: null }
    })

    res.status(200).json({ success: true, message: 'Arquivo removido com sucesso' })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    console.error('Erro ao remover contrato:', error)
    res.status(500).json({ error: 'Erro ao remover arquivo' })
  } finally {
    await prisma.$disconnect()
  }
}
