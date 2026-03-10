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
const MAX_SIZE = 4 * 1024 * 1024 // 4MB (Vercel body limit ~4.5MB)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function parseFormNode(req) {
  const form = formidable({
    maxFileSize: MAX_SIZE,
    keepExtensions: true,
  })
  const [fields, files] = await form.parse(req)
  return { fields, files }
}

/** Obtém o arquivo do request: suporta Web Request (formData) ou Node (formidable). */
async function getUploadedFile(req) {
  if (req && typeof req.formData === 'function') {
    const formData = await req.formData()
    const file = formData.get('arquivo')
    if (!file || typeof file.arrayBuffer !== 'function') return null
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimetype = (file.type || '').toLowerCase()
    const name = file.name || 'arquivo'
    return { buffer, mimetype, originalFilename: name, size: buffer.length }
  }
  const { files } = await parseFormNode(req)
  const file = files?.arquivo
  const first = Array.isArray(file) ? file[0] : file
  if (!first || !first.filepath) return null
  const buffer = fs.readFileSync(first.filepath)
  const mimetype = (first.mimetype || '').toLowerCase()
  return {
    buffer,
    mimetype,
    originalFilename: first.originalFilename || 'arquivo',
    size: first.size,
    _filepath: first.filepath,
  }
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
    const token = req.headers?.authorization?.replace('Bearer ', '') || req.headers?.get?.('authorization')?.replace?.('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const payload = jwt.verify(token, JWT_SECRET)
    const query = req.query || {}
    const { profissionalId } = query
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

    const fileData = await getUploadedFile(req)
    if (!fileData || !fileData.buffer || fileData.buffer.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado. Use o campo "arquivo".' })
    }

    const mimetype = (fileData.mimetype || '').toLowerCase()
    if (!mimetype || !ALLOWED_TYPES.includes(mimetype)) {
      return res.status(400).json({ error: 'Tipo não permitido. Apenas PDF, JPG, JPEG e PNG.' })
    }

    const ext = path.extname(fileData.originalFilename || '') || (mimetype === 'application/pdf' ? '.pdf' : '.bin')
    const pathname = `contratos/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`

    const buffer = fileData.buffer
    let blob
    try {
      blob = await put(pathname, buffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: mimetype,
      })
    } catch (blobError) {
      console.error('Erro Vercel Blob:', blobError)
      const msg = !process.env.BLOB_READ_WRITE_TOKEN
        ? 'Blob não configurado. Crie um Blob store no projeto Vercel e defina BLOB_READ_WRITE_TOKEN.'
        : (blobError.message || 'Erro ao enviar arquivo para o storage.')
      return res.status(503).json({ error: msg })
    }

    await prisma.profissional.update({
      where: { id },
      data: { contratoArquivo: blob.url }
    })

    if (fileData._filepath) {
      try { fs.unlinkSync(fileData._filepath) } catch (_) {}
    }

    res.status(200).json({
      success: true,
      filename: blob.url,
      originalName: fileData.originalFilename || 'arquivo',
      size: fileData.size,
      message: 'Arquivo enviado com sucesso',
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 4MB na Vercel.' })
    }
    console.error('Erro no upload do contrato:', error?.message || error)
    const msg = error?.message && typeof error.message === 'string' ? error.message : 'Erro ao fazer upload do arquivo'
    res.status(500).json({ error: msg })
  } finally {
    await prisma.$disconnect()
  }
}
