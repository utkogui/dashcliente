import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limparDadosTeste() {
  console.log('🧹 Iniciando limpeza dos dados de teste...')
  
  try {
    // 1. Remover contratos profissionais de teste
    console.log('\n1️⃣ Removendo contratos profissionais de teste...')
    const contratosProfissionaisRemovidos = await prisma.contratoProfissional.deleteMany({
      where: {
        contrato: {
          codigoContrato: 'TEST-001'
        }
      }
    })
    console.log(`✅ ${contratosProfissionaisRemovidos.count} contratos profissionais removidos`)
    
    // 2. Remover contratos de teste
    console.log('\n2️⃣ Removendo contratos de teste...')
    const contratosRemovidos = await prisma.contrato.deleteMany({
      where: {
        codigoContrato: 'TEST-001'
      }
    })
    console.log(`✅ ${contratosRemovidos.count} contratos removidos`)
    
    // 3. Remover profissionais de teste
    console.log('\n3️⃣ Removendo profissionais de teste...')
    const profissionaisRemovidos = await prisma.profissional.deleteMany({
      where: {
        email: {
          contains: '@teste.com'
        }
      }
    })
    console.log(`✅ ${profissionaisRemovidos.count} profissionais removidos`)
    
    // 4. Remover clientes de teste
    console.log('\n4️⃣ Removendo clientes de teste...')
    const clientesRemovidos = await prisma.cliente.deleteMany({
      where: {
        email: {
          contains: '@empresa.com'
        }
      }
    })
    console.log(`✅ ${clientesRemovidos.count} clientes removidos`)
    
    console.log('\n🎉 Limpeza dos dados de teste concluída com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a limpeza
limparDadosTeste()
