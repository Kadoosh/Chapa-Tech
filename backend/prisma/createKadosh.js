import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function criarUsuario() {
    const hash = await bcrypt.hash('Ceha@4500', 10);

    const grupoAdmin = await prisma.grupoUsuario.findFirst({
        where: { nome: 'Admin' }
    });

    const user = await prisma.usuario.create({
        data: {
            nome: 'Kadosh',
            email: 'kadosh@sistema.com',
            senha: hash,
            grupoId: grupoAdmin.id
        }
    });

    console.log('✅ Usuário criado:', user.nome);
}

criarUsuario()
    .catch(e => console.error('Erro:', e))
    .finally(() => prisma.$disconnect());
