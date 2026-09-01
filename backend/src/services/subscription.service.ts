import prisma from '../lib/prisma';

export class SubscriptionService {
  /**
   * Checks if an organization can create another user based on their subscription limits.
   * Throws an error if the limit is exceeded or the subscription is inactive.
   */
  static async checkUserLimit(organization_id: string): Promise<void> {
    const sub = await prisma.subscription.findUnique({
      where: { organization_id },
      include: { plan: true }
    });

    if (!sub) {
      throw new Error('No active subscription found for this organization.');
    }

    if (sub.status !== 'ACTIVE' && sub.status !== 'TRIAL' && sub.status !== 'LIFETIME') {
      throw new Error(`Subscription is currently ${sub.status}. Please renew to perform this action.`);
    }

    const currentUsersCount = await prisma.user.count({
      where: { organization_id, is_active: true }
    });

    if (currentUsersCount >= sub.plan.max_users) {
      throw new Error(`Subscription limit reached: You are allowed a maximum of ${sub.plan.max_users} active users on your current plan.`);
    }
  }

  /**
   * Checks if an organization can create another branch based on their subscription limits.
   * Throws an error if the limit is exceeded or the subscription is inactive.
   */
  static async checkBranchLimit(organization_id: string): Promise<void> {
    const sub = await prisma.subscription.findUnique({
      where: { organization_id },
      include: { plan: true }
    });

    if (!sub) {
      throw new Error('No active subscription found for this organization.');
    }

    if (sub.status !== 'ACTIVE' && sub.status !== 'TRIAL' && sub.status !== 'LIFETIME') {
      throw new Error(`Subscription is currently ${sub.status}. Please renew to perform this action.`);
    }

    const currentBranchesCount = await prisma.branch.count({
      where: { organization_id, is_active: true }
    });

    if (currentBranchesCount >= sub.plan.max_branches) {
      throw new Error(`Subscription limit reached: You are allowed a maximum of ${sub.plan.max_branches} active branches on your current plan.`);
    }
  }
}
