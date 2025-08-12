-- CreateTable
CREATE TABLE "cliente_interesses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "interesse" TEXT NOT NULL,
    "comentario" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cliente_interesses_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_sistema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cliente_notas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cliente_notas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_sistema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "solicitacoes_profissional" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "senioridade" TEXT,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "solicitacoes_profissional_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_sistema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
