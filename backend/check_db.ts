import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const inv = await prisma.inventoryItem.findMany();
  console.log("Inventory:", inv);
  
  const menu = await prisma.menuItem.findMany();
  console.log("Menu:", menu);
}

main().catch(console.error).finally(() => prisma.$disconnect());
