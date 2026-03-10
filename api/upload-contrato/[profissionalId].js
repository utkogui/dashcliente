/**
 * Upload de contrato do profissional para Vercel Blob.
 * No projeto Vercel, configure a env BLOB_READ_WRITE_TOKEN (crie um Blob store no dashboard).
 */
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { put } from '@vercel/blob'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_2025'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export const config = {
  api: {
    bodyParser: false,
  },
}

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: MAX_SIZE,
      filter: (part) => {
        if (part.mimetype && ALLOWED_TYPES.includes(part.mimetype)) return true
        return false
      },
    })
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
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

    if (payload.tipo !== 'admin') {
      if (profissional.clienteId !== payload.clienteId) {
        return res.status(403).json({ error: 'Sem permissão para enviar contrato para este profissional' })
      }
    }

    const { files } = await parseForm(req)
    const file = files.arquivo
    const first = Array.isArray(file) ? file[0] : file

    if (!first || !first.filepath) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado. Use o campo "arquivo".' })
    }

    const mimetype = first.mimetype || ''
    if (!ALLOWED_TYPES.includes(mimetype)) {
      return res.status(400).json({ error: 'Tipo não permitido. Apenas PDF, JPG, JPEG e PNG.' })
    }

    const ext = path.extname(first.originalFilename || '') || (mimetype === 'application/pdf' ? '.pdf' : '.bin')
    const pathname = `contratos/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`

    const buffer = fs.readFileSync(first.filepath)
    const blob = await put(pathname, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: mimetype,
    })

    await prisma.profissional.update({
      where: { id },
      data: { contratoArquivo: blob.url }
    })

    try { fs.unlinkSync(first.filepath) } catch (_) {}

    res.status(200).json({
      success: true,
      filename: blob.url,
      originalName: first.originalFilename || 'arquivo',
      size: first.size,
      message: 'Arquivo enviado com sucesso',
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' })
    }
    console.error('Erro no upload do contrato:', error)
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' })
  } finally {
    await prisma.$disconnect()
  }
}
