const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function run() {
  const tables = await prisma.table.findMany({ include: { reservations: true }});
  for (const t of tables) {
    const activeRes = t.reservations.find(r => ["PENDING", "PENDING_PAYMENT", "CONFIRMED"].includes(r.status));
    const seatedRes = t.reservations.find(r => r.status === "SEATED");
    let newStatus = "AVAILABLE";
    if (seatedRes) newStatus = "OCCUPIED";
    else if (activeRes) newStatus = "RESERVED";
    
    if (t.status !== newStatus) {
      await prisma.table.update({ where: { id: t.id }, data: { status: newStatus } });
      console.log(`Updated table ${t.name} to ${newStatus}`);
    }
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
