const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function main() {
  const user = await prisma.user.findFirst({ include: { role: true } });
  if (!user) { console.log("No user found"); return; }
  
  const payload = {
    id: user.id,
    email: user.email,
    role_id: user.role_id,
    role_name: user.role.name,
    organization_id: user.organization_id,
    branch_id: user.branch_id
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
  
  console.log("Token:", token);
}
main();
