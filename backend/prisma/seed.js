import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================
  // 1. CRIAR PERMISSÕES
  // ============================================
  console.log('📋 Criando permissões...');
  
  const permissoes = [
    // Pedidos
    { chave: 'criar_pedido', nome: 'Criar Pedido', descricao: 'Permite criar novos pedidos', modulo: 'pedidos' },
    { chave: 'editar_pedido', nome: 'Editar Pedido', descricao: 'Permite editar pedidos existentes', modulo: 'pedidos' },
    { chave: 'cancelar_pedido', nome: 'Cancelar Pedido', descricao: 'Permite cancelar pedidos', modulo: 'pedidos' },
    { chave: 'ver_pedidos', nome: 'Ver Pedidos', descricao: 'Permite visualizar pedidos', modulo: 'pedidos' },
    { chave: 'marcar_pronto', nome: 'Marcar como Pronto', descricao: 'Permite marcar pedidos como prontos', modulo: 'pedidos' },
    { chave: 'finalizar_pedido', nome: 'Finalizar Pedido', descricao: 'Permite marcar pedido como pago/entregue', modulo: 'pedidos' },
    
    // Produtos
    { chave: 'gerenciar_produtos', nome: 'Gerenciar Produtos', descricao: 'CRUD completo de produtos', modulo: 'produtos' },
    { chave: 'ver_produtos', nome: 'Ver Produtos', descricao: 'Visualizar lista de produtos', modulo: 'produtos' },
    
    // Clientes
    { chave: 'gerenciar_clientes', nome: 'Gerenciar Clientes', descricao: 'CRUD completo de clientes', modulo: 'clientes' },
    { chave: 'ver_clientes', nome: 'Ver Clientes', descricao: 'Visualizar lista de clientes', modulo: 'clientes' },
    
    // Usuários
    { chave: 'gerenciar_usuarios', nome: 'Gerenciar Usuários', descricao: 'CRUD de usuários e permissões', modulo: 'usuarios' },
    { chave: 'ver_usuarios', nome: 'Ver Usuários', descricao: 'Visualizar lista de usuários', modulo: 'usuarios' },
    
    // Dashboard
    { chave: 'ver_dashboard', nome: 'Ver Dashboard', descricao: 'Acesso ao dashboard e relatórios', modulo: 'dashboard' },
    { chave: 'ver_relatorios', nome: 'Ver Relatórios', descricao: 'Acesso a relatórios detalhados', modulo: 'dashboard' },
    
    // Estoque
    { chave: 'gerenciar_estoque', nome: 'Gerenciar Estoque', descricao: 'Controle de estoque', modulo: 'estoque' },
    { chave: 'ver_estoque', nome: 'Ver Estoque', descricao: 'Visualizar estoque', modulo: 'estoque' },
    
    // Configurações
    { chave: 'gerenciar_configuracoes', nome: 'Gerenciar Configurações', descricao: 'Alterar configurações do sistema', modulo: 'configuracoes' },
    
    // Mesas
    { chave: 'gerenciar_mesas', nome: 'Gerenciar Mesas', descricao: 'CRUD de mesas', modulo: 'mesas' },
  ];

  for (const perm of permissoes) {
    await prisma.permissao.upsert({
      where: { chave: perm.chave },
      update: {},
      create: perm,
    });
  }
  
  console.log(`✅ ${permissoes.length} permissões criadas\n`);

  // ============================================
  // 2. CRIAR GRUPOS DE USUÁRIOS
  // ============================================
  console.log('👥 Criando grupos de usuários...');
  
  const grupos = [
    {
      nome: 'Admin',
      descricao: 'Acesso total ao sistema',
      permissoes: permissoes.map(p => p.chave),
    },
    {
      nome: 'Gerente',
      descricao: 'Gerente do estabelecimento',
      permissoes: [
        'criar_pedido', 'editar_pedido', 'cancelar_pedido', 'ver_pedidos', 'finalizar_pedido',
        'gerenciar_produtos', 'ver_produtos',
        'gerenciar_clientes', 'ver_clientes',
        'ver_dashboard', 'ver_relatorios',
        'gerenciar_estoque', 'ver_estoque',
        'gerenciar_mesas',
      ],
    },
    {
      nome: 'Atendente',
      descricao: 'Atendente que anota pedidos',
      permissoes: [
        'criar_pedido', 'cancelar_pedido', 'ver_pedidos',
        'ver_produtos',
        'ver_clientes',
      ],
    },
    {
      nome: 'Cozinha',
      descricao: 'Funcionários da cozinha',
      permissoes: [
        'ver_pedidos', 'marcar_pronto',
      ],
    },
    {
      nome: 'Caixa',
      descricao: 'Operador de caixa',
      permissoes: [
        'ver_pedidos', 'finalizar_pedido',
        'ver_clientes',
      ],
    },
  ];

  for (const grupo of grupos) {
    const grupoExistente = await prisma.grupoUsuario.findUnique({
      where: { nome: grupo.nome },
    });

    let grupoCriado;
    if (!grupoExistente) {
      grupoCriado = await prisma.grupoUsuario.create({
        data: {
          nome: grupo.nome,
          descricao: grupo.descricao,
        },
      });
    } else {
      grupoCriado = grupoExistente;
    }

    // Associar permissões ao grupo
    for (const chavePermissao of grupo.permissoes) {
      const permissao = await prisma.permissao.findUnique({
        where: { chave: chavePermissao },
      });

      if (permissao) {
        await prisma.permissaoGrupo.upsert({
          where: {
            grupoId_permissaoId: {
              grupoId: grupoCriado.id,
              permissaoId: permissao.id,
            },
          },
          update: {},
          create: {
            grupoId: grupoCriado.id,
            permissaoId: permissao.id,
          },
        });
      }
    }
  }
  
  console.log(`✅ ${grupos.length} grupos criados com permissões\n`);

  // ============================================
  // 3. CRIAR USUÁRIO ADMIN PADRÃO
  // ============================================
  console.log('👤 Criando usuário admin...');
  
  const grupoAdmin = await prisma.grupoUsuario.findUnique({
    where: { nome: 'Admin' },
  });

  const senhaHash = await bcrypt.hash('admin123', 10);

  // Verificar se admin já existe (por nome, já que email não é unique)
  let admin = await prisma.usuario.findFirst({
    where: { 
      OR: [
        { email: 'admin@sistema.com' },
        { nome: 'Administrador Sistema' }
      ]
    },
  });
  
  if (!admin) {
    admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador Sistema',
        email: 'admin@sistema.com',
        senha: senhaHash,
        telefone: '(62) 99999-9999',
        grupoId: grupoAdmin.id,
      },
    });
  }
  
  console.log('✅ Admin criado:', admin.email, '/ Senha: admin123\n');

  // ============================================
  // 4. CRIAR CATEGORIAS
  // ============================================
  console.log('📁 Criando categorias...');
  
  const categorias = [
    { nome: 'Hambúrgueres', descricao: 'Hambúrgueres artesanais', ordem: 1, icone: 'burger', cor: '#f97316' },
    { nome: 'Bebidas', descricao: 'Bebidas geladas', ordem: 2, icone: 'drink', cor: '#3b82f6' },
    { nome: 'Acompanhamentos', descricao: 'Porções e acompanhamentos', ordem: 3, icone: 'fries', cor: '#eab308' },
    { nome: 'Sobremesas', descricao: 'Doces e sobremesas', ordem: 4, icone: 'dessert', cor: '#ec4899' },
    { nome: 'Lanches', descricao: 'Lanches diversos', ordem: 5, icone: 'sandwich', cor: '#8b5cf6' },
  ];

  const categoriasCreated = [];
  for (const cat of categorias) {
    const categoria = await prisma.categoria.upsert({
      where: { nome: cat.nome },
      update: {},
      create: cat,
    });
    categoriasCreated.push(categoria);
  }
  
  console.log(`✅ ${categorias.length} categorias criadas\n`);

  // ============================================
  // 5. CRIAR PRODUTOS DE EXEMPLO
  // ============================================
  console.log('🍔 Criando produtos de exemplo...');
  
  const produtos = [
    // Hambúrgueres
    { nome: 'X-Burger Clássico', descricao: 'Hambúrguer, queijo, alface, tomate', categoriaId: categoriasCreated[0].id, preco: 18.90, ordem: 1, destaque: true },
    { nome: 'X-Bacon', descricao: 'Hambúrguer, queijo, bacon crocante', categoriaId: categoriasCreated[0].id, preco: 22.90, ordem: 2, destaque: true },
    { nome: 'X-Egg', descricao: 'Hambúrguer, queijo, ovo frito', categoriaId: categoriasCreated[0].id, preco: 20.90, ordem: 3 },
    { nome: 'X-Tudo', descricao: 'Hambúrguer, queijo, bacon, ovo, alface, tomate', categoriaId: categoriasCreated[0].id, preco: 28.90, ordem: 4, destaque: true },
    
    // Bebidas
    { nome: 'Coca-Cola Lata', descricao: '350ml', categoriaId: categoriasCreated[1].id, preco: 5.00, ordem: 1 },
    { nome: 'Coca-Cola 600ml', descricao: '600ml', categoriaId: categoriasCreated[1].id, preco: 8.00, ordem: 2 },
    { nome: 'Guaraná Antarctica Lata', descricao: '350ml', categoriaId: categoriasCreated[1].id, preco: 5.00, ordem: 3 },
    { nome: 'Suco Natural Laranja', descricao: '500ml', categoriaId: categoriasCreated[1].id, preco: 10.00, ordem: 4 },
    { nome: 'Água Mineral', descricao: '500ml', categoriaId: categoriasCreated[1].id, preco: 3.00, ordem: 5 },
    
    // Acompanhamentos
    { nome: 'Batata Frita Pequena', descricao: '200g', categoriaId: categoriasCreated[2].id, preco: 12.00, ordem: 1 },
    { nome: 'Batata Frita Grande', descricao: '400g', categoriaId: categoriasCreated[2].id, preco: 18.00, ordem: 2 },
    { nome: 'Onion Rings', descricao: 'Porção de anéis de cebola', categoriaId: categoriasCreated[2].id, preco: 15.00, ordem: 3 },
    { nome: 'Nuggets (10un)', descricao: '10 unidades', categoriaId: categoriasCreated[2].id, preco: 16.00, ordem: 4 },
    
    // Sobremesas
    { nome: 'Sorvete 2 Bolas', descricao: 'Sabores variados', categoriaId: categoriasCreated[3].id, preco: 8.00, ordem: 1 },
    { nome: 'Brownie com Sorvete', descricao: 'Brownie quente com sorvete', categoriaId: categoriasCreated[3].id, preco: 14.00, ordem: 2 },
    { nome: 'Petit Gateau', descricao: 'Bolinho de chocolate com sorvete', categoriaId: categoriasCreated[3].id, preco: 16.00, ordem: 3 },
  ];

  let produtosCriados = 0;
  for (const prod of produtos) {
    try {
      await prisma.produto.create({ data: prod });
      produtosCriados++;
    } catch (error) {
      // Produto já existe, ignora
    }
  }
  
  console.log(`✅ ${produtosCriados} produtos criados\n`);

  // ============================================
  // 6. CRIAR MESAS
  // ============================================
  console.log('🪑 Criando mesas...');
  
  for (let i = 1; i <= 20; i++) {
    await prisma.mesa.upsert({
      where: { numero: i },
      update: {},
      create: {
        numero: i,
        capacidade: i <= 10 ? 4 : 6,
        localizacao: i <= 10 ? 'Salão Principal' : 'Área Externa',
      },
    });
  }
  
  console.log('✅ 20 mesas criadas\n');

  // ============================================
  // 7. CRIAR CONFIGURAÇÕES PADRÃO
  // ============================================
  console.log('⚙️ Criando configurações...');
  
  const configuracoes = [
    { chave: 'nome_estabelecimento', valor: 'Meu Restaurante', tipo: 'string', descricao: 'Nome do estabelecimento', categoria: 'geral' },
    { chave: 'telefone_estabelecimento', valor: '(62) 99999-9999', tipo: 'string', descricao: 'Telefone de contato', categoria: 'geral' },
    { chave: 'endereco_estabelecimento', valor: 'Rua Exemplo, 123 - Anápolis/GO', tipo: 'string', descricao: 'Endereço completo', categoria: 'geral' },
    { chave: 'logo_url', valor: '', tipo: 'string', descricao: 'URL da logo do estabelecimento', categoria: 'geral' },
    
    { chave: 'tempo_alerta_pedido', valor: '30', tipo: 'number', descricao: 'Tempo em minutos para alerta de pedido demorado', categoria: 'notificacoes' },
    { chave: 'som_novo_pedido', valor: 'true', tipo: 'boolean', descricao: 'Reproduzir som ao receber novo pedido', categoria: 'notificacoes' },
    { chave: 'som_pedido_pronto', valor: 'true', tipo: 'boolean', descricao: 'Reproduzir som quando pedido fica pronto', categoria: 'notificacoes' },
    
    { chave: 'impressora_interface', valor: 'tcp://192.168.1.100', tipo: 'string', descricao: 'Interface da impressora térmica', categoria: 'impressao' },
    { chave: 'impressora_tipo', valor: 'EPSON', tipo: 'string', descricao: 'Tipo da impressora (EPSON, STAR, etc)', categoria: 'impressao' },
    { chave: 'impressao_automatica', valor: 'true', tipo: 'boolean', descricao: 'Imprimir pedido automaticamente ao criar', categoria: 'impressao' },
    
    { chave: 'backup_ativo', valor: 'false', tipo: 'boolean', descricao: 'Backup automático ativo', categoria: 'backup' },
    { chave: 'backup_horario', valor: '23:00', tipo: 'string', descricao: 'Horário do backup diário (HH:MM)', categoria: 'backup' },
    { chave: 'backup_path', valor: './backups', tipo: 'string', descricao: 'Caminho para salvar backups', categoria: 'backup' },
    
    { chave: 'timezone', valor: 'America/Sao_Paulo', tipo: 'string', descricao: 'Fuso horário do sistema', categoria: 'sistema' },
    { chave: 'moeda', valor: 'BRL', tipo: 'string', descricao: 'Código da moeda', categoria: 'sistema' },
    { chave: 'locale', valor: 'pt-BR', tipo: 'string', descricao: 'Localização (idioma)', categoria: 'sistema' },
  ];

  for (const config of configuracoes) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      update: {},
      create: config,
    });
  }
  
  console.log(`✅ ${configuracoes.length} configurações criadas\n`);

  console.log('✅ Seed concluído com sucesso!\n');
  console.log('📊 Resumo:');
  console.log(`   - ${permissoes.length} permissões`);
  console.log(`   - ${grupos.length} grupos de usuários`);
  console.log(`   - 1 usuário admin`);
  console.log(`   - ${categorias.length} categorias`);
  console.log(`   - ${produtos.length} produtos`);
  console.log(`   - 20 mesas`);
  console.log(`   - ${configuracoes.length} configurações`);
  console.log('\n🔐 Login Admin:');
  console.log('   Email: admin@sistema.com');
  console.log('   Senha: admin123');
  console.log('\n⚠️  IMPORTANTE: Altere a senha padrão em produção!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
