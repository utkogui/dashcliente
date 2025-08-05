/*
  Warnings:

  - You are about to drop the column `dataAdmissao` on the `profissionais` table. All the data in the column will be lost.
  - You are about to drop the column `percentualImpostos` on the `profissionais` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `profissionais` table. All the data in the column will be lost.
  - Added the required column `dataInicio` to the `profissionais` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_profissionais" ("createdAt", "email", "especialidade", "id", "nome", "periodoFechado", "status", "tipoContrato", "updatedAt", "valorFechado", "valorHora", "valorPago") SELECT "createdAt", "email", "especialidade", "id", "nome", "periodoFechado", "status", "tipoContrato", "updatedAt", "valorFechado", "valorHora", "valorPago" FROM "profissionais";
DROP TABLE "profissionais";
ALTER TABLE "new_profissionais" RENAME TO "profissionais";
CREATE UNIQUE INDEX "profissionais_email_key" ON "profissionais"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
