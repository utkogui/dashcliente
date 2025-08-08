import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateDataFromMatilhaToFtd() {
  try {
    console.log('🚀 Iniciando migração de dados da Matilha para FTD...')

    // 1. Buscar os clientes do sistema
    const matilha = await prisma.clienteSistema.findUnique({
      where: { id: 'cliente_matilha_default' }
    })

    const ftd = await prisma.clienteSistema.findFirst({
      where: { nome: 'FTD' }
    })

    if (!matilha || !ftd) {
      console.error('❌ Clientes do sistema não encontrados')
      return
    }

    console.log('📋 Clientes encontrados:')
    console.log('- Matilha:', matilha.id)
    console.log('- FTD:', ftd.id)

    // 2. Migrar profissionais da Matilha para FTD
    console.log('\n👥 Migrando profissionais...')
    const profissionaisMatilha = await prisma.profissional.findMany({
      where: { clienteId: matilha.id }
    })

    for (const prof of profissionaisMatilha) {
      await prisma.profissional.update({
        where: { id: prof.id },
        data: { clienteId: ftd.id }
      })
      console.log(`  ✅ Profissional "${prof.nome}" migrado para FTD`)
    }

    // 3. Migrar clientes da Matilha para FTD
    console.log('\n🏢 Migrando clientes...')
    const clientesMatilha = await prisma.cliente.findMany({
      where: { clienteId: matilha.id }
    })

    for (const cliente of clientesMatilha) {
      await prisma.cliente.update({
        where: { id: cliente.id },
        data: { clienteId: ftd.id }
      })
      console.log(`  ✅ Cliente "${cliente.nome}" migrado para FTD`)
    }

    // 4. Migrar contratos da Matilha para FTD
    console.log('\n📄 Migrando contratos...')
    const contratosMatilha = await prisma.contrato.findMany({
      where: { clienteSistemaId: matilha.id }
    })

    for (const contrato of contratosMatilha) {
      await prisma.contrato.update({
        where: { id: contrato.id },
        data: { clienteSistemaId: ftd.id }
      })
      console.log(`  ✅ Contrato "${contrato.nome}" migrado para FTD`)
    }

    // 5. Verificar se há dados restantes na Matilha
    const profissionaisRestantes = await prisma.profissional.count({
      where: { clienteId: matilha.id }
    })

    const clientesRestantes = await prisma.cliente.count({
      where: { clienteId: matilha.id }
    })

    const contratosRestantes = await prisma.contrato.count({
      where: { clienteSistemaId: matilha.id }
    })

    console.log('\n📊 Resumo da migração:')
    console.log(`- Profissionais migrados: ${profissionaisMatilha.length}`)
    console.log(`- Clientes migrados: ${clientesMatilha.length}`)
    console.log(`- Contratos migrados: ${contratosMatilha.length}`)
    console.log(`- Profissionais restantes na Matilha: ${profissionaisRestantes}`)
    console.log(`- Clientes restantes na Matilha: ${clientesRestantes}`)
    console.log(`- Contratos restantes na Matilha: ${contratosRestantes}`)

    if (profissionaisRestantes === 0 && clientesRestantes === 0 && contratosRestantes === 0) {
      console.log('\n✅ Migração concluída com sucesso!')
      console.log('🎯 Matilha agora está com painel vazio')
      console.log('📈 FTD agora possui todos os dados que estavam na Matilha')
    } else {
      console.log('\n⚠️  Ainda existem dados na Matilha que não foram migrados')
    }

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a migração
migrateDataFromMatilhaToFtd()
