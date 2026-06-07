import QRCode from 'qrcode';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';

export const generateMenuQRCode = async (branchId: string, tableId?: string) => {
  const token = uuidv4().substring(0, 8); // Unique short token
  
  const qrData = {
    branch_id: branchId,
    table_id: tableId,
    token
  };

  const menuQRCode = await prisma.menuQRCode.create({
    data: qrData
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const urlToEncode = `${frontendUrl}/menu/scan/${token}`;

  const qrCodeDataUrl = await QRCode.toDataURL(urlToEncode, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  return {
    qrCodeDataUrl,
    token,
    menuQRCode
  };
};

export const generatePaymentQRCode = async (billId: string, amount: number) => {
  const token = uuidv4().substring(0, 12);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiry

  const paymentQRCode = await prisma.paymentQRCode.create({
    data: {
      bill_id: billId,
      token,
      amount,
      expires_at: expiresAt
    }
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const urlToEncode = `${frontendUrl}/pay/${token}`;

  const qrCodeDataUrl = await QRCode.toDataURL(urlToEncode, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  return {
    qrCodeDataUrl,
    token,
    expiresAt,
    paymentQRCode
  };
};

export const logQRScan = async (type: 'MENU' | 'PAYMENT', tokenId: string, deviceType?: string, ipAddress?: string) => {
  if (type === 'MENU') {
    const qrCode = await prisma.menuQRCode.findUnique({ where: { token: tokenId } });
    if (qrCode) {
      await prisma.qRScanLog.create({
        data: {
          menu_qr_code_id: qrCode.id,
          device_type: deviceType,
          ip_address: ipAddress
        }
      });
      return qrCode;
    }
  } else if (type === 'PAYMENT') {
    const qrCode = await prisma.paymentQRCode.findUnique({ where: { token: tokenId } });
    if (qrCode) {
      await prisma.qRScanLog.create({
        data: {
          payment_qr_code_id: qrCode.id,
          device_type: deviceType,
          ip_address: ipAddress
        }
      });
      return qrCode;
    }
  }
  return null;
};
