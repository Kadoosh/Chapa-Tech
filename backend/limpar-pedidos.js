import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpar() {
    console.log('Deletando itens de pedidos...');
    const itens = await prisma.itemPedido.deleteMany();
    console.log(`✅ ${itens.count} itens deletados`);

    console.log('Deletando pedidos...');
    const pedidos = await prisma.pedido.deleteMany();
    console.log(`✅ ${pedidos.count} pedidos deletados`);

    console.log('Liberando mesas...');
    await prisma.mesa.updateMany({ data: { status: 'livre' } });

    console.log('🎉 Tudo limpo!');
    await prisma.$disconnect();
    process.exit(0);
}

limpar().catch(e => {
    console.error(e);
    process.exit(1);
});
