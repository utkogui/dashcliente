/*
  Warnings:

  - Added the required column `clienteId` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteSistemaId` to the `contratos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteId` to the `profissionais` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'cliente',
    "clienteId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "usuarios_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_sistema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clientes_sistema" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Criar cliente padrão "Matilha" para dados existentes
INSERT INTO "clientes_sistema" ("id", "nome", "descricao", "ativo", "createdAt", "updatedAt") 
VALUES ('cliente_matilha_default', 'Matilha', 'Cliente padrão para dados existentes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "anoInicio" INTEGER NOT NULL,
    "segmento" TEXT NOT NULL,
    "tamanho" TEXT NOT NULL DEFAULT 'Média',
    "clienteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "clientes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_sistema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_clientes" ("anoInicio", "createdAt", "email", "empresa", "endereco", "id", "nome", "segmento", "tamanho", "telefone", "updatedAt", "clienteId") SELECT "anoInicio", "createdAt", "email", "empresa", "endereco", "id", "nome", "segmento", "tamanho", "telefone", "updatedAt", 'cliente_matilha_default' FROM "clientes";
DROP TABLE "clientes";
ALTER TABLE "new_clientes" RENAME TO "clientes";
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");
CREATE TABLE "new_contratos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeProjeto" TEXT NOT NULL,
    "codigoContrato" TEXT,
    "clienteId" TEXT NOT NULL,
    "clienteSistemaId" TEXT NOT NULL,
    "dataInicio" TEXT NOT NULL,
    "dataFim" TEXT,
    "tipoContrato" TEXT NOT NULL DEFAULT 'hora',
    "valorContrato" REAL NOT NULL,
    "valorImpostos" REAL NOT NULL,
    "percentualImpostos" REAL NOT NULL DEFAULT 13.0,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contratos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "contratos_clienteSistemaId_fkey" FOREIGN KEY ("clienteSistemaId") REFERENCES "clientes_sistema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_contratos" ("clienteId", "codigoContrato", "createdAt", "dataFim", "dataInicio", "id", "nomeProjeto", "observacoes", "percentualImpostos", "status", "tipoContrato", "updatedAt", "valorContrato", "valorImpostos", "clienteSistemaId") SELECT "clienteId", "codigoContrato", "createdAt", "dataFim", "dataInicio", "id", "nomeProjeto", "observacoes", "percentualImpostos", "status", "tipoContrato", "updatedAt", "valorContrato", "valorImpostos", 'cliente_matilha_default' FROM "contratos";
DROP TABLE "contratos";
ALTER TABLE "new_contratos" RENAME TO "contratos";
CREATE TABLE "new_profissionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "valorHora" REAL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "dataInicio" TEXT NOT NULL,
    "tipoContrato" TEXT NOT NULL DEFAULT 'hora',
    "valorFechado" REAL,
    "periodoFechado" TEXT,
    "valorPago" REAL NOT NULL,
    "tags" TEXT,
    "clienteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "profissionais_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_sistema" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_profissionais" ("createdAt", "dataInicio", "email", "especialidade", "id", "nome", "periodoFechado", "status", "tags", "tipoContrato", "updatedAt", "valorFechado", "valorHora", "valorPago", "clienteId") SELECT "createdAt", "dataInicio", "email", "especialidade", "id", "nome", "periodoFechado", "status", "tags", "tipoContrato", "updatedAt", "valorFechado", "valorHora", "valorPago", 'cliente_matilha_default' FROM "profissionais";
DROP TABLE "profissionais";
ALTER TABLE "new_profissionais" RENAME TO "profissionais";
CREATE UNIQUE INDEX "profissionais_email_key" ON "profissionais"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
