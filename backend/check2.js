const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const org = await prisma.organization.findFirst();
    const freePlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Free' } });
    console.log("Org ID:", org.id);
    console.log("Plan ID:", freePlan.id);
    
    const sub = await prisma.subscription.create({
      data: {
        organization_id: org.id,
        plan_id: freePlan.id,
        status: "ACTIVE",
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        is_auto_renew: false,
        usage: { create: {} }
      }
    });
    console.log("Created sub:", sub);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
main();
