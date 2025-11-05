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

  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }
    
    const payload = jwt.verify(token, JWT_SECRET)

    // No Vercel, rotas dinâmicas vêm em req.query.id
    const { id } = req.query
    
    console.log('🔍 Debug Contrato - Método:', req.method)
    console.log('🔍 Debug Contrato - Query:', JSON.stringify(req.query))
    console.log('🔍 Debug Contrato - ID extraído:', id)

    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório', query: req.query })
      }
      
      const contratoId = Array.isArray(id) ? id[0] : id
      
      const { profissionais, ...contratoData } = req.body

      // Validar que profissionais é um array válido
      if (!Array.isArray(profissionais)) {
        return res.status(400).json({ 
          error: 'Profissionais deve ser um array',
          details: 'O campo profissionais não foi enviado ou está em formato inválido'
        })
      }

      if (profissionais.length === 0) {
        return res.status(400).json({ 
          error: 'É necessário pelo menos um profissional no contrato',
          details: 'Adicione pelo menos um profissional antes de salvar'
        })
      }

      // Validar dados dos profissionais
      for (let i = 0; i < profissionais.length; i++) {
        const prof = profissionais[i]
        if (!prof.profissionalId) {
          return res.status(400).json({ 
            error: `Profissional na posição ${i + 1} não possui ID válido`,
            details: 'Todos os profissionais devem ter um ID válido'
          })
        }
      }

      // Se não for admin, verificar se o contrato pertence ao cliente do usuário
      if (payload.tipo !== 'admin') {
        const contratoExistente = await prisma.contrato.findFirst({
          where: { 
            id: contratoId,
            clienteSistemaId: payload.clienteId
          }
        })
    
        if (!contratoExistente) {
          return res.status(404).json({ error: 'Contrato não encontrado' })
        }
      }

      // Determinar cliente do sistema para o contrato
      let clienteSistemaId = null
      if (payload.tipo === 'admin') {
        if (contratoData.clienteId) {
          const clienteNegocio = await prisma.cliente.findUnique({ where: { id: contratoData.clienteId } })
          if (!clienteNegocio) {
            return res.status(400).json({ error: 'Cliente informado não encontrado' })
          }
          clienteSistemaId = clienteNegocio.clienteId
        } else {
          const contratoExistente = await prisma.contrato.findUnique({ where: { id: contratoId } })
          if (!contratoExistente) {
            return res.status(404).json({ error: 'Contrato não encontrado' })
          }
          clienteSistemaId = contratoExistente.clienteSistemaId
        }
      } else {
        if (!payload.clienteId) {
          return res.status(403).json({ error: 'Usuário não possui clienteId válido' })
        }
        clienteSistemaId = payload.clienteId
      }

      // Remover clienteId do contratoData
      const { clienteId, ...dataSemClienteId } = contratoData

      // Primeiro deleta os profissionais existentes
      await prisma.contratoProfissional.deleteMany({
        where: { contratoId: contratoId }
      })

      // Depois atualiza o contrato e cria os novos profissionais
      const contrato = await prisma.contrato.update({
        where: { id: contratoId },
        data: {
          ...dataSemClienteId,
          clienteSistemaId,
          observacoes: contratoData.observacoes || null,
          profissionais: {
            create: profissionais.map((prof) => ({
              profissionalId: prof.profissionalId,
              valorHora: prof.valorHora,
              horasMensais: prof.horasMensais,
              valorFechado: prof.valorFechado,
              periodoFechado: prof.periodoFechado
            }))
          }
        },
        include: {
          profissionais: {
            include: {
              profissional: true
            }
          },
          cliente: true
        }
      })
      
      res.status(200).json({
        ...contrato,
        observacoes: contrato.observacoes || ''
      })
      
    } else if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório', query: req.query })
      }
      
      const contratoId = Array.isArray(id) ? id[0] : id

      // Se não for admin, verificar se o contrato pertence ao cliente do usuário
      if (payload.tipo !== 'admin') {
        const contratoExistente = await prisma.contrato.findFirst({
          where: { 
            id: contratoId,
            clienteSistemaId: payload.clienteId
          }
        })
    
        if (!contratoExistente) {
          return res.status(404).json({ error: 'Contrato não encontrado' })
        }
      }

      // Primeiro deleta os relacionamentos em ContratoProfissional
      await prisma.contratoProfissional.deleteMany({
        where: { contratoId: contratoId }
      })
      
      // Depois deleta o contrato
      await prisma.contrato.delete({
        where: { id: contratoId }
      })
      
      res.status(200).json({ message: 'Contrato deletado com sucesso' })
      
    } else {
      res.status(405).json({ error: 'Método não permitido' })
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de contrato:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Contrato não encontrado' })
    }
    
    res.status(500).json({ error: 'Erro ao processar requisição' })
  } finally {
    await prisma.$disconnect()
  }
}

