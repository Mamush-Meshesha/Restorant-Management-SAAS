require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

const plans = [
  {
    name: 'Free',
    description: 'Basic plan for small single-branch restaurants.',
    billing_cycle: 'MONTHLY',
    price: 0,
    max_branches: 1,
    max_users: 5,
    max_storage_mb: 500,
    features: JSON.stringify(["Basic POS", "Table Management", "Kitchen Display", "Basic Reporting"])
  },
  {
    name: 'Starter',
    description: 'For growing restaurants needing more capacity.',
    billing_cycle: 'MONTHLY',
    price: 49.99,
    max_branches: 2,
    max_users: 15,
    max_storage_mb: 5000,
    features: JSON.stringify(["Advanced POS", "Table Management", "Kitchen Display", "Advanced Reporting", "Inventory Management"])
  },
  {
    name: 'Professional',
    description: 'Comprehensive tools for multi-branch operations.',
    billing_cycle: 'MONTHLY',
    price: 99.99,
    max_branches: 5,
    max_users: 50,
    max_storage_mb: 20000,
    features: JSON.stringify(["Everything in Starter", "Multi-branch Management", "Employee Attendance", "API Access", "Priority Support"])
  },
  {
    name: 'Enterprise',
    description: 'Unlimited potential for large restaurant chains.',
    billing_cycle: 'YEARLY',
    price: 999.99,
    max_branches: 20,
    max_users: 500,
    max_storage_mb: 100000,
    features: JSON.stringify(["Everything in Professional", "Custom Integrations", "Dedicated Account Manager", "White-labeling"])
  },
  {
    name: 'Lifetime',
    description: 'One-time payment for perpetual access.',
    billing_cycle: 'LIFETIME',
    price: 2999.99,
    max_branches: 5,
    max_users: 100,
    max_storage_mb: 50000,
    features: JSON.stringify(["Everything in Professional", "Lifetime Updates", "VIP Support"])
  }
];

async function main() {
  await client.connect();
  console.log('Connected to database.');

  // Check if already seeded
  const { rows } = await client.query('SELECT COUNT(*) FROM subscription_plans');
  if (parseInt(rows[0].count) > 0) {
    console.log(`Already seeded (${rows[0].count} plans found). Skipping.`);
    await client.end();
    return;
  }

  for (const plan of plans) {
    await client.query(
      `INSERT INTO subscription_plans 
        (id, name, description, billing_cycle, price, is_active, max_branches, max_users, max_storage_mb, features, created_at, updated_at)
       VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, true, $5, $6, $7, $8::jsonb, NOW(), NOW())`,
      [plan.name, plan.description, plan.billing_cycle, plan.price, plan.max_branches, plan.max_users, plan.max_storage_mb, plan.features]
    );
    console.log(`  ✓ Created: ${plan.name} Plan`);
  }

  console.log('\nSubscription plans seeded successfully!');
  await client.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
