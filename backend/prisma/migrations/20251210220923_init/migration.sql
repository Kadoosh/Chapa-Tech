-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "grupoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "usuarios_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos_usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grupos_usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "permissoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chave" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "modulo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "permissoes_grupos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "grupoId" INTEGER NOT NULL,
    "permissaoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissoes_grupos_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos_usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "permissoes_grupos_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "permissoes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telefone" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "email" TEXT,
    "totalGasto" REAL NOT NULL DEFAULT 0,
    "totalVisitas" INTEGER NOT NULL DEFAULT 0,
    "ultimaVisita" DATETIME,
    "primeiraVisita" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'livre',
    "capacidade" INTEGER NOT NULL DEFAULT 4,
    "localizacao" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "clienteId" INTEGER,
    "criadoPorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'preparando',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "desconto" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
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
    CONSTRAINT "pedidos_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pedidos_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "itens_pedidos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoUnitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "observacao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "itens_pedidos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "itens_pedidos_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "icone" TEXT,
    "cor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "preco" REAL NOT NULL,
    "custoMedio" REAL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "estoque" BOOLEAN NOT NULL DEFAULT false,
    "imagem" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "totalVendido" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "itens_estoque" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produtoId" INTEGER NOT NULL,
    "quantidadeAtual" REAL NOT NULL DEFAULT 0,
    "quantidadeMinima" REAL NOT NULL DEFAULT 0,
    "quantidadeMaxima" REAL,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'un',
    "alertaEstoqueBaixo" BOOLEAN NOT NULL DEFAULT false,
    "ultimaEntrada" DATETIME,
    "ultimaSaida" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "itens_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'string',
    "descricao" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'geral',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "logs_acoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" INTEGER,
    "detalhes" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_acoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "usuarios_grupoId_idx" ON "usuarios"("grupoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_usuarios_nome_key" ON "grupos_usuarios"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_chave_key" ON "permissoes"("chave");

-- CreateIndex
CREATE INDEX "permissoes_chave_idx" ON "permissoes"("chave");

-- CreateIndex
CREATE INDEX "permissoes_modulo_idx" ON "permissoes"("modulo");

-- CreateIndex
CREATE INDEX "permissoes_grupos_grupoId_idx" ON "permissoes_grupos"("grupoId");

-- CreateIndex
CREATE INDEX "permissoes_grupos_permissaoId_idx" ON "permissoes_grupos"("permissaoId");

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_grupos_grupoId_permissaoId_key" ON "permissoes_grupos"("grupoId", "permissaoId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefone_key" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "clientes_telefone_idx" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "clientes_nome_idx" ON "clientes"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_numero_key" ON "mesas"("numero");

-- CreateIndex
CREATE INDEX "mesas_numero_idx" ON "mesas"("numero");

-- CreateIndex
CREATE INDEX "mesas_status_idx" ON "mesas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");

-- CreateIndex
CREATE INDEX "pedidos_mesaId_idx" ON "pedidos"("mesaId");

-- CreateIndex
CREATE INDEX "pedidos_clienteId_idx" ON "pedidos"("clienteId");

-- CreateIndex
CREATE INDEX "pedidos_criadoPorId_idx" ON "pedidos"("criadoPorId");

-- CreateIndex
CREATE INDEX "pedidos_status_idx" ON "pedidos"("status");

-- CreateIndex
CREATE INDEX "pedidos_criadoEm_idx" ON "pedidos"("criadoEm");

-- CreateIndex
CREATE INDEX "pedidos_numero_idx" ON "pedidos"("numero");

-- CreateIndex
CREATE INDEX "itens_pedidos_pedidoId_idx" ON "itens_pedidos"("pedidoId");

-- CreateIndex
CREATE INDEX "itens_pedidos_produtoId_idx" ON "itens_pedidos"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE INDEX "categorias_ordem_idx" ON "categorias"("ordem");

-- CreateIndex
CREATE INDEX "produtos_categoriaId_idx" ON "produtos"("categoriaId");

-- CreateIndex
CREATE INDEX "produtos_disponivel_idx" ON "produtos"("disponivel");

-- CreateIndex
CREATE INDEX "produtos_ordem_idx" ON "produtos"("ordem");

-- CreateIndex
CREATE UNIQUE INDEX "itens_estoque_produtoId_key" ON "itens_estoque"("produtoId");

-- CreateIndex
CREATE INDEX "itens_estoque_produtoId_idx" ON "itens_estoque"("produtoId");

-- CreateIndex
CREATE INDEX "itens_estoque_alertaEstoqueBaixo_idx" ON "itens_estoque"("alertaEstoqueBaixo");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");

-- CreateIndex
CREATE INDEX "configuracoes_chave_idx" ON "configuracoes"("chave");

-- CreateIndex
CREATE INDEX "configuracoes_categoria_idx" ON "configuracoes"("categoria");

-- CreateIndex
CREATE INDEX "logs_acoes_usuarioId_idx" ON "logs_acoes"("usuarioId");

-- CreateIndex
CREATE INDEX "logs_acoes_acao_idx" ON "logs_acoes"("acao");

-- CreateIndex
CREATE INDEX "logs_acoes_entidade_idx" ON "logs_acoes"("entidade");

-- CreateIndex
CREATE INDEX "logs_acoes_createdAt_idx" ON "logs_acoes"("createdAt");
