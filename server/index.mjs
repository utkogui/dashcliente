import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
const app = express();
const prisma = new PrismaClient();
const PORT = 3001;
// Middleware
app.use(cors());
app.use(express.json());
// Função para popular o banco com dados iniciais
const seedDatabase = async () => {
    const profissionaisCount = await prisma.profissional.count();
    const clientesCount = await prisma.cliente.count();
    const contratosCount = await prisma.contrato.count();
    if (profissionaisCount === 0 && clientesCount === 0 && contratosCount === 0) {
        console.log('🌱 Populando banco de dados com dados iniciais...');
        // Criar profissionais
        const prof1 = await prisma.profissional.create({
            data: {
                nome: 'João Silva',
                email: 'joao.silva@email.com',
                telefone: '(11) 99999-1111',
                especialidade: 'Desenvolvedor Full Stack',
                valorHora: 120,
                status: 'ativo',
                dataAdmissao: '2023-01-15',
                tipoContrato: 'hora',
                valorPago: 11520,
                percentualImpostos: 13.0
            }
        });
        const prof2 = await prisma.profissional.create({
            data: {
                nome: 'Maria Santos',
                email: 'maria.santos@email.com',
                telefone: '(11) 99999-2222',
                especialidade: 'UX/UI Designer',
                valorHora: 100,
                status: 'ativo',
                dataAdmissao: '2023-03-20',
                tipoContrato: 'hora',
                valorPago: 7200,
                percentualImpostos: 13.0
            }
        });
        const prof3 = await prisma.profissional.create({
            data: {
                nome: 'Pedro Costa',
                email: 'pedro.costa@email.com',
                telefone: '(11) 99999-3333',
                especialidade: 'DevOps Engineer',
                valorHora: 150,
                status: 'ativo',
                dataAdmissao: '2023-02-10',
                tipoContrato: 'hora',
                valorPago: 12600,
                percentualImpostos: 13.0
            }
        });
        // Criar clientes
        const cli1 = await prisma.cliente.create({
            data: {
                nome: 'Carlos Oliveira',
                empresa: 'TechCorp',
                email: 'carlos@techcorp.com',
                telefone: '(11) 88888-1111',
                endereco: 'Rua das Flores, 123 - São Paulo/SP',
                anoInicio: 2023,
                segmento: 'Tecnologia',
                tamanho: 'Média'
            }
        });
        const cli2 = await prisma.cliente.create({
            data: {
                nome: 'Ana Ferreira',
                empresa: 'Inovação Ltda',
                email: 'ana@inovacao.com',
                telefone: '(11) 88888-2222',
                endereco: 'Av. Paulista, 1000 - São Paulo/SP',
                anoInicio: 2024,
                segmento: 'Tecnologia',
                tamanho: 'Pequena'
            }
        });
        const cli3 = await prisma.cliente.create({
            data: {
                nome: 'Roberto Lima',
                empresa: 'StartupXYZ',
                email: 'roberto@startupxyz.com',
                telefone: '(11) 88888-3333',
                endereco: 'Rua Augusta, 500 - São Paulo/SP',
                anoInicio: 2023,
                segmento: 'Tecnologia',
                tamanho: 'Pequena'
            }
        });
        // Criar contratos
        await prisma.contrato.create({
            data: {
                profissionalId: prof1.id,
                clienteId: cli1.id,
                dataInicio: '2024-01-01',
                dataFim: '2024-12-31',
                tipoContrato: 'hora',
                valorHora: 120,
                horasMensais: 160,
                status: 'ativo',
                valorTotal: 19200,
                valorRecebido: 15360,
                valorPago: 11520,
                percentualImpostos: 13.0,
                valorImpostos: 1996.8,
                margemLucro: 1843.2,
                observacoes: 'Desenvolvimento de sistema web'
            }
        });
        await prisma.contrato.create({
            data: {
                profissionalId: prof2.id,
                clienteId: cli2.id,
                dataInicio: '2024-02-01',
                dataFim: '2024-11-30',
                tipoContrato: 'hora',
                valorHora: 100,
                horasMensais: 120,
                status: 'ativo',
                valorTotal: 12000,
                valorRecebido: 9600,
                valorPago: 7200,
                percentualImpostos: 13.0,
                valorImpostos: 1248.0,
                margemLucro: 1152.0,
                observacoes: 'Design de interface mobile'
            }
        });
        await prisma.contrato.create({
            data: {
                profissionalId: prof3.id,
                clienteId: cli3.id,
                dataInicio: '2024-03-01',
                dataFim: '2024-10-31',
                tipoContrato: 'hora',
                valorHora: 150,
                horasMensais: 140,
                status: 'ativo',
                valorTotal: 21000,
                valorRecebido: 16800,
                valorPago: 12600,
                percentualImpostos: 13.0,
                valorImpostos: 2184.0,
                margemLucro: 2016.0,
                observacoes: 'Infraestrutura cloud'
            }
        });
        console.log('✅ Banco de dados populado com sucesso!');
    }
};
// Rotas para Profissionais
app.get('/api/profissionais', async (req, res) => {
    try {
        const profissionais = await prisma.profissional.findMany({
            orderBy: { nome: 'asc' }
        });
        res.json(profissionais.map(p => ({
            ...p,
            telefone: p.telefone || '',
            status: p.status
        })));
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar profissionais' });
    }
});
app.post('/api/profissionais', async (req, res) => {
    try {
        const profissional = await prisma.profissional.create({
            data: {
                ...req.body,
                telefone: req.body.telefone || null
            }
        });
        res.json({
            ...profissional,
            telefone: profissional.telefone || '',
            status: profissional.status
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar profissional' });
    }
});
app.put('/api/profissionais/:id', async (req, res) => {
    try {
        const profissional = await prisma.profissional.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                telefone: req.body.telefone || null
            }
        });
        res.json({
            ...profissional,
            telefone: profissional.telefone || '',
            status: profissional.status
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar profissional' });
    }
});
app.delete('/api/profissionais/:id', async (req, res) => {
    try {
        await prisma.profissional.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Profissional deletado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao deletar profissional' });
    }
});
// Rotas para Clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            orderBy: { empresa: 'asc' }
        });
        res.json(clientes.map(c => ({
            ...c,
            telefone: c.telefone || '',
            endereco: c.endereco || ''
        })));
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});
app.post('/api/clientes', async (req, res) => {
    try {
        const cliente = await prisma.cliente.create({
            data: {
                ...req.body,
                telefone: req.body.telefone || null,
                endereco: req.body.endereco || null
            }
        });
        res.json({
            ...cliente,
            telefone: cliente.telefone || '',
            endereco: cliente.endereco || ''
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});
app.put('/api/clientes/:id', async (req, res) => {
    try {
        const cliente = await prisma.cliente.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                telefone: req.body.telefone || null,
                endereco: req.body.endereco || null
            }
        });
        res.json({
            ...cliente,
            telefone: cliente.telefone || '',
            endereco: cliente.endereco || ''
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});
app.delete('/api/clientes/:id', async (req, res) => {
    try {
        // Verificar se tem contratos ativos
        const contratosAtivos = await prisma.contrato.count({
            where: {
                clienteId: req.params.id,
                status: 'ativo'
            }
        });
        if (contratosAtivos > 0) {
            return res.status(400).json({
                error: `Não é possível excluir este cliente pois possui ${contratosAtivos} contrato(s) ativo(s)`
            });
        }
        await prisma.cliente.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Cliente deletado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
});
// Rotas para Contratos
app.get('/api/contratos', async (req, res) => {
    try {
        const contratos = await prisma.contrato.findMany({
            include: {
                profissional: true,
                cliente: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(contratos.map(c => ({
            ...c,
            observacoes: c.observacoes || ''
        })));
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar contratos' });
    }
});
app.post('/api/contratos', async (req, res) => {
    try {
        const contrato = await prisma.contrato.create({
            data: {
                ...req.body,
                observacoes: req.body.observacoes || null
            },
            include: {
                profissional: true,
                cliente: true
            }
        });
        res.json({
            ...contrato,
            observacoes: contrato.observacoes || ''
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar contrato' });
    }
});
app.put('/api/contratos/:id', async (req, res) => {
    try {
        const contrato = await prisma.contrato.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                observacoes: req.body.observacoes || null
            },
            include: {
                profissional: true,
                cliente: true
            }
        });
        res.json({
            ...contrato,
            observacoes: contrato.observacoes || ''
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar contrato' });
    }
});
app.delete('/api/contratos/:id', async (req, res) => {
    try {
        await prisma.contrato.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Contrato deletado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao deletar contrato' });
    }
});
// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API funcionando!' });
});
// Inicializar servidor
const startServer = async () => {
    try {
        // Popular banco apenas se estiver vazio
        await seedDatabase();
    }
    catch (error) {
        console.error('❌ Erro ao popular banco:', error);
    }
};
// Inicializar servidor
app.listen(process.env.PORT || PORT, async () => {
    console.log(`🚀 Servidor rodando na porta ${process.env.PORT || PORT}`);
    console.log(`📊 API disponível em: http://localhost:${process.env.PORT || PORT}/api`);
    await startServer();
});
// Exportar para Vercel
export default app;
