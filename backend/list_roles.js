const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const roles = await prisma.role.findMany();
  console.log("Total roles:", roles.length);
  roles.forEach(r => console.log(r.name));
}
main().catch(console.error).finally(() => prisma.$disconnect());
