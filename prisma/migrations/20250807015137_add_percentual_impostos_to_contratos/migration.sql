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
    "percentualImpostos" REAL NOT NULL DEFAULT 13.0,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contratos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_contratos" ("clienteId", "createdAt", "dataFim", "dataInicio", "id", "nomeProjeto", "observacoes", "status", "tipoContrato", "updatedAt", "valorContrato", "valorImpostos") SELECT "clienteId", "createdAt", "dataFim", "dataInicio", "id", "nomeProjeto", "observacoes", "status", "tipoContrato", "updatedAt", "valorContrato", "valorImpostos" FROM "contratos";
DROP TABLE "contratos";
ALTER TABLE "new_contratos" RENAME TO "contratos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
