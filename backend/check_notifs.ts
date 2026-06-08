import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany();
  console.log(JSON.stringify(notifs, null, 2));
  await prisma.notification.deleteMany(); // We can delete dummy notifs
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
