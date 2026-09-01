const { get_subscription_status, get_available_plans, get_billing_history } = require('./dist/controller/billing.controller.js');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const req = { user: { organization_id: '20cde46a-4657-4815-832c-bdfc4e7ee189' } };
  const res = (name) => ({
    status: (code) => ({
      json: (data) => console.log(`[${name}] Response ${code}:`, JSON.stringify(data).slice(0, 100))
    })
  });
  const next = (name) => (err) => console.error(`[${name}] Error:`, err);
  
  await get_subscription_status(req, res('SUB'), next('SUB'));
  await get_available_plans(req, res('PLANS'), next('PLANS'));
  await get_billing_history(req, res('INVOICES'), next('INVOICES'));
}
main();
