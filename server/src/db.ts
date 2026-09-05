import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pgPool: Pool;
};

function buildPrisma(): { prisma: PrismaClient; pgPool: Pool } {
  const raw = process.env.DATABASE_URL ?? '';

  // Configure pg.Pool with explicit lifecycle limits for Neon serverless Postgres
  const pgPool = new Pool({
    connectionString: raw,
    max: 10,                        // Maximum connections in the pool
    idleTimeoutMillis: 30000,      // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10s if pool is full
  });

  // Gracefully handle unexpected errors on idle pool connections
  pgPool.on('error', (err) => {
    console.error('Unexpected error on idle pg client:', err.message);
  });

  const adapter = new PrismaPg(pgPool);

  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  return { prisma, pgPool };
}

if (!globalForPrisma.prisma) {
  const setup = buildPrisma();
  globalForPrisma.prisma = setup.prisma;
  globalForPrisma.pgPool = setup.pgPool;
}

export const prisma = globalForPrisma.prisma;