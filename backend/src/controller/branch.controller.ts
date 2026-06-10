import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const create_branch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const branchData = req.body;

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const branch = await prisma.branch.create({
      data: {
        organization_id: orgId,
        name: branchData.name,
        code: branchData.code,
        address: branchData.address,
        phone: branchData.phone,
        email: branchData.email,
        latitude: branchData.latitude,
        longitude: branchData.longitude
      }
    });

    res.status(201).json({
      message: "Branch created successfully",
      data: branch
    });
  } catch (error) {
    next(error);
  }
};

export const get_branches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const whereClause: any = { organization_id: orgId, is_active: true };
    if (req.user?.role_name === 'BRANCH_MANAGER' && req.user?.branch_id) {
      whereClause.id = req.user.branch_id;
    }

    const branches = await prisma.branch.findMany({
      where: whereClause
    });

    res.status(200).json({
      message: "Branches retrieved successfully",
      data: branches
    });
  } catch (error) {
    next(error);
  }
};

export const get_public_branches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { is_active: true }
    });

    res.status(200).json({
      message: "Public branches retrieved successfully",
      data: branches
    });
  } catch (error) {
    next(error);
  }
};
