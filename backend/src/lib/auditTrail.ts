import prisma from './prisma';

export interface AuditLogData {
  entity_type: string;
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | string;
  user_id?: string;
  organization_id: string;
  details?: any;
  ip_address?: string;
}

export const createAuditLog = async (auditData: AuditLogData): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        entity_type: auditData.entity_type,
        entity_id: auditData.entity_id,
        action: auditData.action,
        user_id: auditData.user_id,
        organization_id: auditData.organization_id,
        details: auditData.details ? auditData.details : null,
        ip_address: auditData.ip_address || null,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export const getAuditLogs = async (
  entityType?: string,
  entityId?: string,
  organizationId?: string,
  userId?: string,
  action?: string,
  limit: number = 100,
  offset: number = 0
) => {
  const where: any = {};
  
  if (entityType) where.entity_type = entityType;
  if (entityId) where.entity_id = entityId;
  if (organizationId) where.organization_id = organizationId;
  if (userId) where.user_id = userId;
  if (action) where.action = action;

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    auditLogs,
    total,
    limit,
    offset,
  };
};
