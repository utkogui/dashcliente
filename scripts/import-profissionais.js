import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

// Função para mapear o tipo de contrato
const mapearTipoContrato = (tipo) => {
  if (tipo.toLowerCase().includes('valor fechado')) {
    return 'fechado'
  }
  if (tipo.toLowerCase().includes('hora')) {
    return 'hora'
  }
  return 'fechado' // padrão
}

// Função para mapear o período
const mapearPeriodo = (periodo) => {
  const periodoLower = periodo.toLowerCase()
  if (periodoLower.includes('mensal')) return 'mensal'
  if (periodoLower.includes('trimestral')) return 'trimestral'
  if (periodoLower.includes('semestral')) return 'semestral'
  if (periodoLower.includes('anual')) return 'anual'
  return 'mensal' // padrão
}

// Função para mapear o status
const mapearStatus = (status) => {
  const statusLower = status.toLowerCase()
  if (statusLower === 'ativo') return 'ativo'
  if (statusLower === 'inativo') return 'inativo'
  if (statusLower === 'ferias') return 'ferias'
  return 'ativo' // padrão
}

// Função para limpar valor numérico
const limparValor = (valor) => {
  if (!valor) return 0
  // Remove caracteres não numéricos exceto vírgula e ponto
  const limpo = valor.toString().replace(/[^\d,.-]/g, '').replace(',', '.')
  return parseFloat(limpo) || 0
}

async function importarProfissionais() {
  try {
    console.log('Iniciando importação de profissionais...')
    
    // Ler o arquivo CSV
    const csvPath = path.join(__dirname, '..', 'profissionais.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Dividir em linhas
    const linhas = csvContent.split('\n').filter(linha => linha.trim())
    
    // Pular o cabeçalho
    const dados = linhas.slice(1)
    
    console.log(`Encontrados ${dados.length} profissionais para importar`)
    
    let sucessos = 0
    let erros = 0
    
    for (const linha of dados) {
      try {
        // Dividir por ponto e vírgula
        const campos = linha.split(';')
        
        if (campos.length < 8) {
          console.log(`Linha ignorada - campos insuficientes: ${linha}`)
          erros++
          continue
        }
        
        const [
          nome,
          email,
          especialidade,
          tipoContrato,
          valorFechado,
          periodo,
          valorPago,
          status
        ] = campos
        
        // Validar campos obrigatórios
        if (!nome || !email) {
          console.log(`Linha ignorada - nome ou email ausente: ${nome}`)
          erros++
          continue
        }
        
        // Verificar se o profissional já existe
        const profissionalExistente = await prisma.profissional.findUnique({
          where: { email: email.trim() }
        })
        
        if (profissionalExistente) {
          console.log(`Profissional já existe: ${email}`)
          continue
        }
        
        // Criar o profissional
        const profissional = await prisma.profissional.create({
          data: {
            nome: nome.trim(),
            email: email.trim(),
            especialidade: especialidade.trim(),
            valorHora: null, // Todos são valor fechado
            status: mapearStatus(status),
            dataInicio: new Date().toISOString().split('T')[0], // Data atual como padrão
            tipoContrato: mapearTipoContrato(tipoContrato),
            valorFechado: limparValor(valorFechado),
            periodoFechado: mapearPeriodo(periodo),
            valorPago: limparValor(valorPago)
          }
        })
        
        console.log(`✅ Profissional criado: ${profissional.nome} (${profissional.email})`)
        sucessos++
        
      } catch (error) {
        console.log(`❌ Erro ao processar linha: ${linha}`)
        console.log(`   Erro: ${error.message}`)
        erros++
      }
    }
    
    console.log('\n=== RESUMO DA IMPORTAÇÃO ===')
    console.log(`✅ Sucessos: ${sucessos}`)
    console.log(`❌ Erros: ${erros}`)
    console.log(`📊 Total processado: ${dados.length}`)
    
  } catch (error) {
    console.error('Erro durante a importação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a importação
importarProfissionais() 