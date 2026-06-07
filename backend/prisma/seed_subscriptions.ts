import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

// Use the same pattern as src/lib/prisma.ts
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding subscription plans...");

  // Check if plans already exist to avoid duplicates
  const existing = await prisma.subscriptionPlan.count();
  if (existing > 0) {
    console.log(`Plans already seeded (${existing} found). Skipping.`);
    return;
  }

  const plans = [
    {
      name: "Free",
      description: "Basic plan for small single-branch restaurants.",
      billing_cycle: "MONTHLY",
      price: 0,
      max_branches: 1,
      max_users: 5,
      max_storage_mb: 500,
      features: ["Basic POS", "Table Management", "Kitchen Display", "Basic Reporting"]
    },
    {
      name: "Starter",
      description: "For growing restaurants needing more capacity.",
      billing_cycle: "MONTHLY",
      price: 49.99,
      max_branches: 2,
      max_users: 15,
      max_storage_mb: 5000,
      features: ["Advanced POS", "Table Management", "Kitchen Display", "Advanced Reporting", "Inventory Management"]
    },
    {
      name: "Professional",
      description: "Comprehensive tools for multi-branch operations.",
      billing_cycle: "MONTHLY",
      price: 99.99,
      max_branches: 5,
      max_users: 50,
      max_storage_mb: 20000,
      features: ["Everything in Starter", "Multi-branch Management", "Employee Attendance", "API Access", "Priority Support"]
    },
    {
      name: "Enterprise",
      description: "Unlimited potential for large restaurant chains.",
      billing_cycle: "YEARLY",
      price: 999.99,
      max_branches: 20,
      max_users: 500,
      max_storage_mb: 100000,
      features: ["Everything in Professional", "Custom Integrations", "Dedicated Account Manager", "White-labeling"]
    },
    {
      name: "Lifetime",
      description: "One-time payment for perpetual access.",
      billing_cycle: "LIFETIME",
      price: 2999.99,
      max_branches: 5,
      max_users: 100,
      max_storage_mb: 50000,
      features: ["Everything in Professional", "Lifetime Updates", "VIP Support"]
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.create({ data: plan });
    console.log(`  ✓ Created: ${plan.name} Plan`);
  }

  console.log("\nSubscription plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
