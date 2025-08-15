import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testFluxoCompleto() {
  console.log('🧪 Iniciando teste do fluxo completo...')
  
  try {
    // 1. Verificar se existe um cliente do sistema FTD
    console.log('\n1️⃣ Verificando cliente do sistema FTD...')
    let ftd = await prisma.clienteSistema.findFirst({
      where: { nome: 'FTD' }
    })
    
    if (!ftd) {
      console.log('❌ Cliente do sistema FTD não encontrado!')
      return
    }
    
    console.log('✅ Cliente do sistema FTD encontrado:', ftd.nome)
    
    // 2. Criar um cliente de teste
    console.log('\n2️⃣ Criando cliente de teste...')
    const timestamp = Date.now()
    const clienteTeste = await prisma.cliente.create({
      data: {
        nome: 'João Silva',
        empresa: 'Empresa Teste LTDA',
        email: `teste${timestamp}@empresa.com`,
        telefone: '(11) 99999-9999',
        endereco: 'Rua Teste, 123 - São Paulo/SP',
        anoInicio: 2024,
        segmento: 'Tecnologia',
        tamanho: 'Média',
        clienteId: ftd.id
      }
    })
    
    console.log('✅ Cliente criado com sucesso:', clienteTeste.empresa)
    
    // 3. Criar um profissional de teste
    console.log('\n3️⃣ Criando profissional de teste...')
    const profissionalTeste = await prisma.profissional.create({
      data: {
        nome: 'Maria Santos',
        email: `maria.santos${timestamp}@teste.com`,
        especialidade: 'Desenvolvedor Full Stack',
        perfil: 'Senior',
        especialidadeEspecifica: 'React/Node.js',
        dataInicio: '2024-01-15',
        tipoContrato: 'hora',
        valorHora: 120.0,
        valorPago: 100.0,
        status: 'ativo',
        tags: 'Alocação,Projetos',
        clienteId: ftd.id,
        contatoClienteEmail: 'contato@empresa.com',
        contatoMatilhaEmail: 'maria@matilha.com'
      }
    })
    
    console.log('✅ Profissional criado com sucesso:', profissionalTeste.nome)
    
    // 4. Criar um contrato de teste
    console.log('\n4️⃣ Criando contrato de teste...')
    const contratoTeste = await prisma.contrato.create({
      data: {
        nomeProjeto: 'Projeto Teste Dashboard',
        codigoContrato: 'TEST-001',
        clienteId: clienteTeste.id,
        clienteSistemaId: ftd.id,
        dataInicio: '2024-01-15',
        dataFim: '2024-12-31',
        tipoContrato: 'hora',
        valorContrato: 50000.0,
        valorImpostos: 6500.0,
        percentualImpostos: 13.0,
        status: 'ativo',
        observacoes: 'Contrato de teste para validação do fluxo'
      }
    })
    
    console.log('✅ Contrato criado com sucesso:', contratoTeste.nomeProjeto)
    
    // 5. Associar profissional ao contrato
    console.log('\n5️⃣ Associando profissional ao contrato...')
    const contratoProfissional = await prisma.contratoProfissional.create({
      data: {
        contratoId: contratoTeste.id,
        profissionalId: profissionalTeste.id,
        valorHora: 120.0,
        horasMensais: 160
      }
    })
    
    console.log('✅ Profissional associado ao contrato com sucesso')
    
    // 6. Verificar dados no dashboard
    console.log('\n6️⃣ Verificando dados para o dashboard...')
    
    const totalProfissionais = await prisma.profissional.count({
      where: { clienteId: ftd.id }
    })
    
    const profissionaisAtivos = await prisma.profissional.count({
      where: { 
        clienteId: ftd.id,
        status: 'ativo'
      }
    })
    
    const contratosAtivos = await prisma.contrato.count({
      where: { 
        clienteSistemaId: ftd.id,
        status: 'ativo'
      }
    })
    
    const receitaTotal = await prisma.contrato.aggregate({
      where: { 
        clienteSistemaId: ftd.id,
        status: 'ativo'
      },
      _sum: {
        valorContrato: true
      }
    })
    
    console.log('📊 Dados do dashboard:')
    console.log(`   - Total de profissionais: ${totalProfissionais}`)
    console.log(`   - Profissionais ativos: ${profissionaisAtivos}`)
    console.log(`   - Contratos ativos: ${contratosAtivos}`)
    console.log(`   - Receita total: R$ ${receitaTotal._sum.valorContrato?.toLocaleString('pt-BR') || 0}`)
    
    console.log('\n🎉 Teste do fluxo completo realizado com sucesso!')
    console.log('✅ Cliente criado')
    console.log('✅ Profissional criado')
    console.log('✅ Contrato criado')
    console.log('✅ Profissional associado ao contrato')
    console.log('✅ Dashboard populado com dados')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o teste
testFluxoCompleto()
