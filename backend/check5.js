const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, organization_id: true } });
  console.log("Users:", users);
  
  const subs = await prisma.subscription.findMany({ select: { id: true, organization_id: true } });
  console.log("Subs:", subs);
}
main();
