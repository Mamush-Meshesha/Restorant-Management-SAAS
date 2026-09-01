const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const subs = await prisma.subscription.findMany({ include: { plan: true } });
  console.log(JSON.stringify(subs, null, 2));
}
main();
