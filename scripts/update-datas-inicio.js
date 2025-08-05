import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

// Função para converter data do formato inglês para YYYY-MM-DD
const converterData = (dataString) => {
  if (!dataString) return null
  
  try {
    // Formato: "Monday, 21 July 2025"
    const data = new Date(dataString)
    
    // Verificar se a data é válida
    if (isNaN(data.getTime())) {
      console.log(`Data inválida: ${dataString}`)
      return null
    }
    
    // Retornar no formato YYYY-MM-DD
    return data.toISOString().split('T')[0]
  } catch (error) {
    console.log(`Erro ao converter data: ${dataString}`, error.message)
    return null
  }
}

async function atualizarDatasInicio() {
  try {
    console.log('Iniciando atualização das datas de início...')
    
    // Ler o arquivo CSV
    const csvPath = path.join(__dirname, '..', 'pro_banco.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Dividir em linhas
    const linhas = csvContent.split('\n').filter(linha => linha.trim())
    
    // Pular o cabeçalho
    const dados = linhas.slice(1)
    
    console.log(`Encontrados ${dados.length} profissionais para atualizar`)
    
    let sucessos = 0
    let erros = 0
    let naoEncontrados = 0
    
    for (const linha of dados) {
      try {
        // Dividir por ponto e vírgula
        const campos = linha.split(';')
        
        if (campos.length < 2) {
          console.log(`Linha ignorada - campos insuficientes: ${linha}`)
          erros++
          continue
        }
        
        const [nome, dataInicio] = campos
        
        // Validar campos obrigatórios
        if (!nome || !dataInicio) {
          console.log(`Linha ignorada - nome ou data ausente: ${nome}`)
          erros++
          continue
        }
        
        // Converter a data
        const dataFormatada = converterData(dataInicio.trim())
        if (!dataFormatada) {
          console.log(`Data inválida para ${nome}: ${dataInicio}`)
          erros++
          continue
        }
        
        // Buscar o profissional pelo nome (busca exata)
        const profissional = await prisma.profissional.findFirst({
          where: {
            nome: nome.trim()
          }
        })
        
        if (!profissional) {
          console.log(`❌ Profissional não encontrado: ${nome}`)
          naoEncontrados++
          continue
        }
        
        // Atualizar a data de início
        const profissionalAtualizado = await prisma.profissional.update({
          where: { id: profissional.id },
          data: { dataInicio: dataFormatada }
        })
        
        console.log(`✅ Data atualizada: ${profissionalAtualizado.nome} - ${dataFormatada}`)
        sucessos++
        
      } catch (error) {
        console.log(`❌ Erro ao processar linha: ${linha}`)
        console.log(`   Erro: ${error.message}`)
        erros++
      }
    }
    
    console.log('\n=== RESUMO DA ATUALIZAÇÃO ===')
    console.log(`✅ Sucessos: ${sucessos}`)
    console.log(`❌ Erros: ${erros}`)
    console.log(`🔍 Não encontrados: ${naoEncontrados}`)
    console.log(`📊 Total processado: ${dados.length}`)
    
  } catch (error) {
    console.error('Erro durante a atualização:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a atualização
atualizarDatasInicio() 