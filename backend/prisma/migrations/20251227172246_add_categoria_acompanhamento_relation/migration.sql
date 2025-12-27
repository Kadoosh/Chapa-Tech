/*
  Warnings:

  - You are about to drop the column `email` on the `clientes` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "acompanhamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" REAL NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categorias_acompanhamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoriaId" INTEGER NOT NULL,
    "acompanhamentoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categorias_acompanhamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "categorias_acompanhamentos_acompanhamentoId_fkey" FOREIGN KEY ("acompanhamentoId") REFERENCES "acompanhamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT,
    "telefone" TEXT,
    "totalGasto" REAL NOT NULL DEFAULT 0,
    "totalVisitas" INTEGER NOT NULL DEFAULT 0,
    "ultimaVisita" DATETIME,
    "primeiraVisita" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_clientes" ("createdAt", "id", "nome", "primeiraVisita", "sobrenome", "telefone", "totalGasto", "totalVisitas", "ultimaVisita", "updatedAt") SELECT "createdAt", "id", "nome", "primeiraVisita", "sobrenome", "telefone", "totalGasto", "totalVisitas", "ultimaVisita", "updatedAt" FROM "clientes";
DROP TABLE "clientes";
ALTER TABLE "new_clientes" RENAME TO "clientes";
CREATE INDEX "clientes_telefone_idx" ON "clientes"("telefone");
CREATE INDEX "clientes_nome_idx" ON "clientes"("nome");
CREATE TABLE "new_pedidos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "mesaId" INTEGER,
    "clienteId" INTEGER,
    "criadoPorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'preparando',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "desconto" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "paraViagem" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "motivoCancelamento" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preparadoEm" DATETIME,
    "prontoEm" DATETIME,
    "entregueEm" DATETIME,
    "canceladoEm" DATETIME,
    "pagoEm" DATETIME,
    "tempoPreparo" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pedidos_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pedidos_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_pedidos" ("canceladoEm", "clienteId", "criadoEm", "criadoPorId", "desconto", "entregueEm", "id", "mesaId", "motivoCancelamento", "numero", "observacao", "pagoEm", "preparadoEm", "prontoEm", "status", "subtotal", "tempoPreparo", "total", "updatedAt") SELECT "canceladoEm", "clienteId", "criadoEm", "criadoPorId", "desconto", "entregueEm", "id", "mesaId", "motivoCancelamento", "numero", "observacao", "pagoEm", "preparadoEm", "prontoEm", "status", "subtotal", "tempoPreparo", "total", "updatedAt" FROM "pedidos";
DROP TABLE "pedidos";
ALTER TABLE "new_pedidos" RENAME TO "pedidos";
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");
CREATE INDEX "pedidos_mesaId_idx" ON "pedidos"("mesaId");
CREATE INDEX "pedidos_clienteId_idx" ON "pedidos"("clienteId");
CREATE INDEX "pedidos_criadoPorId_idx" ON "pedidos"("criadoPorId");
CREATE INDEX "pedidos_status_idx" ON "pedidos"("status");
CREATE INDEX "pedidos_criadoEm_idx" ON "pedidos"("criadoEm");
CREATE INDEX "pedidos_numero_idx" ON "pedidos"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "categorias_acompanhamentos_categoriaId_idx" ON "categorias_acompanhamentos"("categoriaId");

-- CreateIndex
CREATE INDEX "categorias_acompanhamentos_acompanhamentoId_idx" ON "categorias_acompanhamentos"("acompanhamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_acompanhamentos_categoriaId_acompanhamentoId_key" ON "categorias_acompanhamentos"("categoriaId", "acompanhamentoId");
