import prisma from '../lib/prisma';

export const generateReceiptId = async (): Promise<string> => {
  const prefix = 'RCP';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  let receiptId = `${prefix}${timestamp}${random}`;
  
  // Check if receipt ID already exists
  let counter = 1;
  while (await prisma.bill.findUnique({ where: { bill_number: receiptId } })) {
    receiptId = `${prefix}${timestamp}${random}${counter.toString().padStart(2, '0')}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 99) {
      throw new Error('Unable to generate unique receipt ID');
    }
  }
  
  return receiptId;
}; 