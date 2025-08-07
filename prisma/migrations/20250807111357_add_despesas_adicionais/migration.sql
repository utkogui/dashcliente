-- CreateTable
CREATE TABLE "despesas_adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contratoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "despesas_adicionais_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
