import { Request, Response, NextFunction } from 'express';
import * as QRService from '../services/qr.service';
import { AuthenticatedRequest } from '../middleware/institute.middleware'; // Reuse existing auth middleware

export const generate_menu_qr = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId, tableId } = req.body;
    
    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const qrCode = await QRService.generateMenuQRCode(branchId, tableId);
    
    res.status(201).json({
      message: "Menu QR Code generated successfully",
      data: qrCode
    });
  } catch (error) {
    next(error);
  }
};

export const generate_payment_qr = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { billId, amount } = req.body;
    
    if (!billId || !amount) {
      return res.status(400).json({ message: "Bill ID and amount are required" });
    }

    const qrCode = await QRService.generatePaymentQRCode(billId, amount);
    
    res.status(201).json({
      message: "Payment QR Code generated successfully",
      data: qrCode
    });
  } catch (error) {
    next(error);
  }
};

export const scan_qr = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, token } = req.params;
    const deviceType = req.headers['user-agent'];
    const ipAddress = req.ip;

    if (type !== 'MENU' && type !== 'PAYMENT') {
      return res.status(400).json({ message: "Invalid QR code type" });
    }

    const qrData = await QRService.logQRScan(type, token, deviceType, ipAddress);

    if (!qrData) {
      return res.status(404).json({ message: "QR code not found or invalid" });
    }

    res.status(200).json({
      message: "QR Code scanned successfully",
      data: qrData
    });
  } catch (error) {
    next(error);
  }
};
