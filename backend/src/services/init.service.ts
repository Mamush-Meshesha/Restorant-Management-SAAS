import prisma from '../lib/prisma';
import { hashPassword } from '../lib/password';

const initializeSystem = async () => {
  try {
    console.log('Starting system initialization...');

    // 1. Create Default Organization
    let defaultOrg = await prisma.organization.findFirst({
      where: { name: 'Default Restaurant Group' }
    });

    if (!defaultOrg) {
      defaultOrg = await prisma.organization.create({
        data: {
          name: 'Default Restaurant Group',
          email: 'admin@restaurant.com',
          phone: '+1234567890',
        }
      });
      console.log('Created Default Organization');
    }

    // 1.5 Create Default Branch
    let defaultBranch = await prisma.branch.findFirst({
      where: { organization_id: defaultOrg.id, name: 'Main Branch' }
    });

    if (!defaultBranch) {
      defaultBranch = await prisma.branch.create({
        data: {
          organization_id: defaultOrg.id,
          name: 'Main Branch',
          code: 'MAIN-01',
        }
      });
      console.log('Created Default Branch');
    }

    // 2. Create Core Roles
    const coreRoles = [
      { name: 'SUPERADMIN',     description: 'Full system access across all organizations' },
      { name: 'COMPANY_ADMIN',  description: 'Full access within the organization' },
      { name: 'BRANCH_MANAGER', description: 'Full branch operational access' },
      { name: 'CASHIER',        description: 'POS, orders, and billing' },
      { name: 'WAITER',         description: 'Order taking and table management' },
      { name: 'CHEF',           description: 'Kitchen display and recipes' },
    ];

    for (const roleData of coreRoles) {
      const existingRole = await prisma.role.findFirst({
        where: { name: roleData.name, organization_id: defaultOrg.id }
      });

      if (!existingRole) {
        await prisma.role.create({
          data: {
            ...roleData,
            organization_id: defaultOrg.id
          }
        });
        console.log(`Created Role: ${roleData.name}`);
      }
    }

    // 3. Create Super Admin User
    const superAdminRole = await prisma.role.findFirst({
      where: { name: 'SUPERADMIN', organization_id: defaultOrg.id }
    });

    if (superAdminRole) {
      const adminExists = await prisma.user.findUnique({
        where: { email: 'admin@restaurant.com' }
      });

      if (!adminExists) {
        const passwordHash = await hashPassword('admin123'); // Default password
        await prisma.user.create({
          data: {
            organization_id: defaultOrg.id,
            branch_id: defaultBranch.id,
            role_id: superAdminRole.id,
            username: 'admin',
            email: 'admin@restaurant.com',
            password_hash: passwordHash,
            first_name: 'Super',
            last_name: 'Admin',
          }
        });
        console.log('Created Super Admin User (admin@restaurant.com / admin123)');
      }
    }

    // 4. Set Current Fiscal Year
    const currentYear = new Date().getFullYear();
    const currentFiscalYear = await prisma.fiscalYear.findFirst({
      where: { organization_id: defaultOrg.id, name: `${currentYear}` }
    });

    if (!currentFiscalYear) {
      await prisma.fiscalYear.create({
        data: {
          organization_id: defaultOrg.id,
          name: `${currentYear}`,
          start_date: new Date(`${currentYear}-01-01`),
          end_date: new Date(`${currentYear}-12-31`),
          is_current: true
        }
      });
      console.log('Created Current Fiscal Year');
    }

    console.log('System initialization completed successfully.');
  } catch (error) {
    console.error('Error during system initialization:', error);
    throw error;
  }
};

// Named export (for direct usage)
export { initializeSystem };

// Class wrapper (matches app.ts import style)
export class InitService {
  static initializeSystem = initializeSystem;
}
