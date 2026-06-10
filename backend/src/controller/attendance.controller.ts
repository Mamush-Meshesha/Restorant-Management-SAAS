import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import { getDistanceFromLatLonInMeters } from '../utils/distance';

export const clock_in = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user?.branch_id || req.body.branch_id;
    const { employee_id } = req.body;

    const attendance = await prisma.staffAttendance.create({
      data: {
        employee_id,
        branch_id: branchId,
        date: new Date(),
        clock_in: new Date(),
        status: 'PRESENT'
      }
    });

    res.status(201).json({ message: "Clocked in successfully", data: attendance });
  } catch (error) { next(error); }
};

export const clock_out = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { attendance_id } = req.body;

    const attendance = await prisma.staffAttendance.update({
      where: { id: attendance_id },
      data: { clock_out: new Date() }
    });

    res.status(200).json({ message: "Clocked out successfully", data: attendance });
  } catch (error) { next(error); }
};

export const clock_in_qr = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.id;
    const { branch_id, token, lat, lng } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // In a real app, validate that `token` is the current rolling QR token for the branch.
    if (!token) return res.status(400).json({ message: "QR token required" });

    // Fetch branch to get its coordinates and WiFi IP
    const branch = await prisma.branch.findUnique({ where: { id: branch_id } });
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    let isLocationValid = false;

    // 1. IP Network Whitelisting
    if (branch.wifi_ip && clientIp === branch.wifi_ip) {
      isLocationValid = true;
    }

    // 2. GPS Fallback
    if (!isLocationValid && branch.latitude && branch.longitude && lat && lng) {
      const distance = getDistanceFromLatLonInMeters(
        branch.latitude, branch.longitude,
        parseFloat(lat), parseFloat(lng)
      );
      if (distance <= 100) {
        isLocationValid = true;
      }
    }

    // 3. Optional Geofencing: If the branch hasn't configured any geofencing (no IP, no GPS coordinates), we allow the clock in.
    if (!branch.wifi_ip && !branch.latitude && !branch.longitude) {
      isLocationValid = true;
    }

    if (!isLocationValid) {
      return res.status(403).json({
        message: "Clock-in rejected. You must be connected to the restaurant WiFi or be within the GPS geofence."
      });
    }

    const attendance = await prisma.staffAttendance.create({
      data: {
        employee_id: employeeId!,
        branch_id,
        date: new Date(),
        clock_in: new Date(),
        status: 'PRESENT',
        clock_in_ip: clientIp,
        clock_in_lat: lat ? parseFloat(lat) : null,
        clock_in_lng: lng ? parseFloat(lng) : null
      }
    });

    res.status(201).json({ message: "Geofenced Clock-In successful", data: attendance });
  } catch (error) { next(error); }
};
