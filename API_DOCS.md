# 📚 Documentação da API - Sistema Lanchonete

**Base URL:** `http://localhost:3000/api`

**Autenticação:** Bearer Token (JWT)
```
Authorization: Bearer <token>
```

---

## 🔐 Autenticação

### Login
```http
POST /auth/login
```
**Body:**
```json
{
  "login": "admin",
  "senha": "admin123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "login": "admin",
    "grupo": {
      "id": 1,
      "nome": "Administrador",
      "permissoes": ["gerenciar_usuarios", "gerenciar_produtos", ...]
    }
  }
}
```

### Verificar Token
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## 👥 Usuários

### Listar Usuários
```http
GET /usuarios
Authorization: Bearer <token>
```

### Criar Usuário
```http
POST /usuarios
Authorization: Bearer <token>
```
**Body:**
```json
{
  "nome": "João Silva",
  "login": "joao",
  "senha": "senha123",
  "grupoId": 2
}
```

### Atualizar Usuário
```http
PUT /usuarios/:id
Authorization: Bearer <token>
```

### Deletar Usuário
```http
DELETE /usuarios/:id
Authorization: Bearer <token>
```

---

## 📦 Produtos

### Listar Produtos
```http
GET /produtos
GET /produtos?categoria=lanches
GET /produtos?ativo=true
```

### Buscar Produto
```http
GET /produtos/:id
```

### Criar Produto
```http
POST /produtos
Authorization: Bearer <token>
```
**Body:**
```json
{
  "nome": "X-Burguer",
  "descricao": "Hambúrguer com queijo",
  "preco": 18.90,
  "categoria": "lanches",
  "tempoPreparoMin": 15,
  "ativo": true,
  "estoqueMinimo": 10,
  "estoqueAtual": 50
}
```

### Atualizar Produto
```http
PUT /produtos/:id
Authorization: Bearer <token>
```

### Deletar Produto
```http
DELETE /produtos/:id
Authorization: Bearer <token>
```

---

## 🪑 Mesas

### Listar Mesas
```http
GET /mesas
GET /mesas?status=ocupada
```

### Criar Mesa
```http
POST /mesas
Authorization: Bearer <token>
```
**Body:**
```json
{
  "numero": 10,
  "capacidade": 4
}
```

### Atualizar Status
```http
PUT /mesas/:id/status
Authorization: Bearer <token>
```
**Body:**
```json
{
  "status": "ocupada"
}
```

---

## 🧾 Pedidos

### Listar Pedidos
```http
GET /pedidos
GET /pedidos?status=preparando
GET /pedidos?mesaId=1
GET /pedidos?data=2024-01-15
```

### Buscar Pedido
```http
GET /pedidos/:id
```

### Criar Pedido
```http
POST /pedidos
Authorization: Bearer <token>
```
**Body:**
```json
{
  "mesaId": 1,
  "tipo": "mesa",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "observacao": "Sem cebola"
    }
  ],
  "observacao": "Cliente VIP"
}
```

### Atualizar Status do Pedido
```http
PUT /pedidos/:id/status
Authorization: Bearer <token>
```
**Body:**
```json
{
  "status": "preparando"
}
```
**Status válidos:** `pendente`, `preparando`, `pronto`, `entregue`, `finalizado`, `cancelado`

### Adicionar Item ao Pedido
```http
POST /pedidos/:id/itens
Authorization: Bearer <token>
```
**Body:**
```json
{
  "produtoId": 3,
  "quantidade": 1
}
```

### Remover Item do Pedido
```http
DELETE /pedidos/:id/itens/:itemId
Authorization: Bearer <token>
```

---

## 💳 Pagamentos

### Finalizar Pedido (Pagamento)
```http
POST /pedidos/:id/finalizar
Authorization: Bearer <token>
```
**Body:**
```json
{
  "formaPagamento": "dinheiro",
  "valorPago": 50.00
}
```
**Formas válidas:** `dinheiro`, `cartao_credito`, `cartao_debito`, `pix`

---

## 📊 Dashboard / Relatórios

### Resumo do Dia
```http
GET /dashboard/resumo
GET /dashboard/resumo?data=2024-01-15
Authorization: Bearer <token>
```

### Vendas por Período
```http
GET /dashboard/vendas?inicio=2024-01-01&fim=2024-01-31
Authorization: Bearer <token>
```

### Produtos Mais Vendidos
```http
GET /dashboard/produtos-mais-vendidos
Authorization: Bearer <token>
```

### Vendas por Hora
```http
GET /dashboard/vendas-por-hora
Authorization: Bearer <token>
```

---

## 📦 Estoque

### Listar Movimentações
```http
GET /estoque/movimentacoes
GET /estoque/movimentacoes?produtoId=1
GET /estoque/movimentacoes?tipo=entrada
```

### Registrar Entrada
```http
POST /estoque/entrada
Authorization: Bearer <token>
```
**Body:**
```json
{
  "produtoId": 1,
  "quantidade": 100,
  "motivo": "Compra fornecedor"
}
```

### Registrar Saída
```http
POST /estoque/saida
Authorization: Bearer <token>
```
**Body:**
```json
{
  "produtoId": 1,
  "quantidade": 5,
  "motivo": "Perda/Vencimento"
}
```

### Ajuste de Estoque
```http
POST /estoque/ajuste
Authorization: Bearer <token>
```
**Body:**
```json
{
  "produtoId": 1,
  "novaQuantidade": 45,
  "motivo": "Inventário"
}
```

### Alertas de Estoque Baixo
```http
GET /estoque/alertas
Authorization: Bearer <token>
```

---

## 🖨️ Impressora

### Obter Configuração
```http
GET /printer/config
Authorization: Bearer <token>
```

### Atualizar Configuração
```http
PUT /printer/config
Authorization: Bearer <token>
```
**Body:**
```json
{
  "habilitado": true,
  "tipo": "rede",
  "ip": "192.168.1.200",
  "porta": 9100,
  "largura": 48,
  "imprimirCozinha": true,
  "imprimirComprovante": true
}
```

### Testar Conexão
```http
POST /printer/testar
Authorization: Bearer <token>
```

### Imprimir Pedido
```http
POST /printer/imprimir/pedido/:id
Authorization: Bearer <token>
```

### Preview (Texto)
```http
GET /printer/preview/pedido/:id
Authorization: Bearer <token>
```

---

## 💾 Backup

### Obter Configuração
```http
GET /backup/config
Authorization: Bearer <token>
```

### Atualizar Configuração
```http
PUT /backup/config
Authorization: Bearer <token>
```
**Body:**
```json
{
  "habilitado": true,
  "intervalo": "diario",
  "horario": "03:00",
  "retencaoDias": 30
}
```

### Criar Backup Manual
```http
POST /backup/criar
Authorization: Bearer <token>
```

### Listar Backups
```http
GET /backup/listar
Authorization: Bearer <token>
```

### Download Backup
```http
GET /backup/download/:arquivo
Authorization: Bearer <token>
```

### Deletar Backup
```http
DELETE /backup/:arquivo
Authorization: Bearer <token>
```

### Limpar Backups Antigos
```http
POST /backup/limpar
Authorization: Bearer <token>
```

---

## 🔔 WebSocket Events

### Conexão
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
```

### Eventos Recebidos (Server → Client)

| Evento | Descrição | Payload |
|--------|-----------|---------|
| `novo_pedido` | Pedido criado | `{ pedido: {...} }` |
| `pedido_atualizado` | Status alterado | `{ pedido: {...} }` |
| `pedido_item_adicionado` | Item adicionado | `{ pedidoId, item }` |
| `pedido_item_removido` | Item removido | `{ pedidoId, itemId }` |
| `mesa_atualizada` | Status da mesa | `{ mesa: {...} }` |

### Exemplo de Uso
```javascript
socket.on('pedido_atualizado', (data) => {
  console.log('Pedido atualizado:', data.pedido);
  // Atualizar UI
});
```

---

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/ausente |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: login duplicado) |
| 500 | Internal Server Error |

### Formato de Erro
```json
{
  "message": "Descrição do erro",
  "errors": ["Detalhes adicionais"]
}
```

---

## 📋 Grupos e Permissões

### Permissões Disponíveis
| Permissão | Descrição |
|-----------|-----------|
| `criar_pedido` | Criar novos pedidos |
| `ver_pedidos` | Visualizar pedidos |
| `editar_pedido` | Editar pedidos existentes |
| `cancelar_pedido` | Cancelar pedidos |
| `finalizar_pedido` | Finalizar/receber pagamento |
| `gerenciar_produtos` | CRUD de produtos |
| `gerenciar_mesas` | CRUD de mesas |
| `gerenciar_usuarios` | CRUD de usuários |
| `gerenciar_estoque` | Movimentações de estoque |
| `ver_relatorios` | Acessar dashboard |
| `configurar_sistema` | Configurações gerais |

### Grupos Padrão
1. **Administrador** - Todas as permissões
2. **Gerente** - Quase todas (exceto gerenciar usuários)
3. **Atendente** - Criar/editar pedidos
4. **Cozinha** - Ver pedidos, atualizar status
5. **Caixa** - Finalizar pedidos

---

**Versão da API:** 1.0.0  
**Última atualização:** Dezembro 2024
