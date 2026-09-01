const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const plans = await prisma.subscriptionPlan.findMany();
  console.log("Plans:", plans.map(p => p.name));
  const subs = await prisma.subscription.findMany();
  console.log("Subs:", subs);
}
main();
