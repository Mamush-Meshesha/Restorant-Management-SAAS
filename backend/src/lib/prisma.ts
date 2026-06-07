import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is missing. Update sm-system-backend/.env with valid PostgreSQL credentials before starting the app.'
  );
}

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

// Connect is handled lazily by Prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
