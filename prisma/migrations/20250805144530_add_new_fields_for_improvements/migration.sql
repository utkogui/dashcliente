-- CreateTable
CREATE TABLE "profissionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "especialidade" TEXT NOT NULL,
    "valorHora" REAL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "dataAdmissao" TEXT NOT NULL,
    "tipoContrato" TEXT NOT NULL DEFAULT 'hora',
    "valorFechado" REAL,
    "periodoFechado" TEXT,
    "valorPago" REAL NOT NULL,
    "percentualImpostos" REAL NOT NULL DEFAULT 13.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "anoInicio" INTEGER NOT NULL,
    "segmento" TEXT NOT NULL,
    "tamanho" TEXT NOT NULL DEFAULT 'Média',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profissionalId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "dataInicio" TEXT NOT NULL,
    "dataFim" TEXT NOT NULL,
    "tipoContrato" TEXT NOT NULL DEFAULT 'hora',
    "valorHora" REAL,
    "horasMensais" INTEGER,
    "valorFechado" REAL,
    "periodoFechado" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "valorTotal" REAL NOT NULL,
    "valorRecebido" REAL NOT NULL,
    "valorPago" REAL NOT NULL,
    "percentualImpostos" REAL NOT NULL DEFAULT 13.0,
    "valorImpostos" REAL NOT NULL,
    "margemLucro" REAL NOT NULL,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contratos_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "contratos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_email_key" ON "profissionais"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");
