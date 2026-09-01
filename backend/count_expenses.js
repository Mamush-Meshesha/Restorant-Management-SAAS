const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.expense.count();
  console.log("Total Expenses:", count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
