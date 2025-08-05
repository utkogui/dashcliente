/*
  Warnings:

  - You are about to drop the column `horasMensais` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `margemLucro` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `percentualImpostos` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `periodoFechado` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `profissionalId` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `valorFechado` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `valorHora` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `valorPago` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `valorRecebido` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `contratos` table. All the data in the column will be lost.
  - Added the required column `nomeProjeto` to the `contratos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorContrato` to the `contratos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "contrato_profissionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contratoId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "valorHora" REAL,
    "horasMensais" INTEGER,
    "valorFechado" REAL,
    "periodoFechado" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contrato_profissionais_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "contrato_profissionais_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contratos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeProjeto" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "dataInicio" TEXT NOT NULL,
    "dataFim" TEXT,
    "tipoContrato" TEXT NOT NULL DEFAULT 'hora',
    "valorContrato" REAL NOT NULL,
    "valorImpostos" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contratos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_contratos" ("clienteId", "createdAt", "dataFim", "dataInicio", "id", "observacoes", "status", "tipoContrato", "updatedAt", "valorImpostos") SELECT "clienteId", "createdAt", "dataFim", "dataInicio", "id", "observacoes", "status", "tipoContrato", "updatedAt", "valorImpostos" FROM "contratos";
DROP TABLE "contratos";
ALTER TABLE "new_contratos" RENAME TO "contratos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "contrato_profissionais_contratoId_profissionalId_key" ON "contrato_profissionais"("contratoId", "profissionalId");
