/*
  Warnings:

  - You are about to drop the column `imagem` on the `produtos` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_produtos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ingredientes" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "preco" REAL NOT NULL,
    "custoMedio" REAL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "estoque" BOOLEAN NOT NULL DEFAULT false,
    "imagens" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "totalVendido" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_produtos" ("categoriaId", "createdAt", "custoMedio", "descricao", "destaque", "disponivel", "estoque", "id", "ingredientes", "nome", "ordem", "preco", "totalVendido", "updatedAt") SELECT "categoriaId", "createdAt", "custoMedio", "descricao", "destaque", "disponivel", "estoque", "id", "ingredientes", "nome", "ordem", "preco", "totalVendido", "updatedAt" FROM "produtos";
DROP TABLE "produtos";
ALTER TABLE "new_produtos" RENAME TO "produtos";
CREATE INDEX "produtos_categoriaId_idx" ON "produtos"("categoriaId");
CREATE INDEX "produtos_disponivel_idx" ON "produtos"("disponivel");
CREATE INDEX "produtos_ordem_idx" ON "produtos"("ordem");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
