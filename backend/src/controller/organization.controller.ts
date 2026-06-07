import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';

export const get_organization_profile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId; // Handle old token struct if present

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID not found in token" });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        branches: true
      }
    });

    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json({
      message: "Organization profile retrieved successfully",
      data: org
    });
  } catch (error) {
    next(error);
  }
};

export const update_organization_profile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.instituteId;
    const updateData = req.body;

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID not found in token" });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        name: updateData.name,
        address: updateData.address,
        phone: updateData.phone,
        email: updateData.email,
        website: updateData.website,
        tax_id: updateData.tax_id
      }
    });

    res.status(200).json({
      message: "Organization updated successfully",
      data: updatedOrg
    });
  } catch (error) {
    next(error);
  }
};
