import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

/**
 * Instância global do Prisma Client (Singleton Pattern)
 * Evita múltiplas conexões em desenvolvimento com hot-reload
 */

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Logs do Prisma
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    logger.debug('Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma Info:', e.message);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning:', e.message);
});

// Salvar instância globalmente em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Testar conexão
prisma.$connect()
  .then(() => {
    logger.info('✅ Conexão com banco de dados estabelecida');
  })
  .catch((error) => {
    logger.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('🔌 Desconectado do banco de dados');
});

export default prisma;
