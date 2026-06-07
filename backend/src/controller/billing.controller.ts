import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/institute.middleware';
import PDFDocument from 'pdfkit';

// ─── GET CURRENT SUBSCRIPTION STATUS ──────────────────────────────────────────
export const get_subscription_status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    if (!orgId) return res.status(400).json({ message: "Organization ID missing" });

    let subscription = await prisma.subscription.findUnique({
      where: { organization_id: orgId },
      include: { plan: true, usage: true }
    });

    // Auto-provision free plan if no subscription exists
    if (!subscription) {
      const freePlan = await prisma.subscriptionPlan.findFirst({ where: { name: "Free", is_active: true } });
      if (freePlan) {
        subscription = await prisma.subscription.create({
          data: {
            organization_id: orgId,
            plan_id: freePlan.id,
            status: "ACTIVE",
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            is_auto_renew: false,
            usage: { create: {} }
          },
          include: { plan: true, usage: true }
        });

        await prisma.subscriptionHistory.create({
          data: {
            subscription_id: subscription.id,
            event_type: "CREATED",
            new_plan_id: freePlan.id,
            notes: "Auto-enrolled in Free plan"
          }
        });
      }
    }

    res.status(200).json({ data: subscription });
  } catch (error) { next(error); }
};

// ─── GET ALL AVAILABLE PLANS ──────────────────────────────────────────────────
export const get_available_plans = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' }
    });
    res.status(200).json({ data: plans });
  } catch (error) { next(error); }
};

// ─── UPGRADE/DOWNGRADE SUBSCRIPTION ──────────────────────────────────────────
export const upgrade_subscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    const { plan_id, billing_cycle } = req.body;

    if (!orgId) return res.status(400).json({ message: "Organization ID missing" });
    if (!plan_id) return res.status(400).json({ message: "plan_id is required" });

    const newPlan = await prisma.subscriptionPlan.findUnique({ where: { id: plan_id } });
    if (!newPlan) return res.status(404).json({ message: "Plan not found" });

    let subscription = await prisma.subscription.findUnique({ where: { organization_id: orgId } });
    if (!subscription) return res.status(404).json({ message: "No active subscription found" });

    const oldPlanId = subscription.plan_id;
    const cycle = billing_cycle || newPlan.billing_cycle;

    let endDate: Date | null = null;
    if (cycle === 'YEARLY') {
      endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    } else if (cycle === 'MONTHLY') {
      endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
    }
    // LIFETIME has no end date (null)

    subscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan_id: newPlan.id,
        status: newPlan.name === "Lifetime" ? "LIFETIME" : "ACTIVE",
        start_date: new Date(),
        end_date: endDate,
        is_auto_renew: cycle !== 'LIFETIME'
      }
    });

    await prisma.subscriptionHistory.create({
      data: {
        subscription_id: subscription.id,
        event_type: "UPGRADED",
        old_plan_id: oldPlanId,
        new_plan_id: newPlan.id,
        notes: `Changed to ${newPlan.name} (${cycle})`
      }
    });

    // Generate invoice record
    const invoiceNum = `INV-${Date.now()}`;
    const invoice = await prisma.subscriptionInvoice.create({
      data: {
        subscription_id: subscription.id,
        invoice_number: invoiceNum,
        amount: newPlan.price,
        status: "PAID",
        billing_cycle: cycle,
        paid_at: new Date(),
        due_date: new Date()
      }
    });

    // Log mock payment
    await prisma.subscriptionPayment.create({
      data: {
        invoice_id: invoice.id,
        payment_method: "OFFLINE",
        amount: newPlan.price,
        status: "SUCCESS",
        transaction_ref: `MOCK_TXN_${Date.now()}`
      }
    });

    res.status(200).json({ message: "Subscription updated successfully", data: subscription });
  } catch (error) { next(error); }
};

// ─── GET BILLING HISTORY ──────────────────────────────────────────────────────
export const get_billing_history = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organization_id;
    if (!orgId) return res.status(400).json({ message: "Organization ID missing" });

    const subscription = await prisma.subscription.findUnique({ where: { organization_id: orgId } });
    if (!subscription) return res.status(200).json({ data: [] });

    const invoices = await prisma.subscriptionInvoice.findMany({
      where: { subscription_id: subscription.id },
      include: { payments: true },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ data: invoices });
  } catch (error) { next(error); }
};

// ─── GENERATE INVOICE PDF ─────────────────────────────────────────────────────
export const download_invoice_pdf = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization_id;
    if (!orgId) return res.status(400).json({ message: "Organization ID missing" });

    const invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            plan: true,
            organization: true
          }
        },
        payments: true
      }
    });

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Verify belongs to this org
    if (invoice.subscription.organization_id !== orgId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const org = invoice.subscription.organization;
    const plan = invoice.subscription.plan;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);
    doc.pipe(res);

    // ── HEADER ──────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill('#1a1a2e');
    doc.fillColor('white')
       .font('Helvetica-Bold')
       .fontSize(26)
       .text('INVOICE', 50, 30);
    doc.fillColor('#a0aec0')
       .font('Helvetica')
       .fontSize(11)
       .text(`Restaurant Management Platform`, 50, 62);

    // Invoice number badge (top right)
    doc.fillColor('white')
       .font('Helvetica-Bold')
       .fontSize(12)
       .text(invoice.invoice_number, 0, 38, { align: 'right', width: doc.page.width - 50 });

    doc.moveDown(3);

    // ── STATUS BADGE ──────────────────────────────────
    const statusColor = invoice.status === 'PAID' ? '#48bb78' : '#f6ad55';
    doc.roundedRect(50, 110, 70, 22, 4).fill(statusColor);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
       .text(invoice.status, 50, 115, { width: 70, align: 'center' });

    // ── BILLING FROM / TO ────────────────────────────
    doc.fillColor('#2d3748').font('Helvetica-Bold').fontSize(10)
       .text('FROM', 50, 150);
    doc.fillColor('#4a5568').font('Helvetica').fontSize(10)
       .text('Restaurant Management Platform', 50, 163)
       .text('Subscription Services', 50, 176)
       .text('billing@restaurantpos.com', 50, 189);

    doc.fillColor('#2d3748').font('Helvetica-Bold').fontSize(10)
       .text('BILLED TO', 300, 150);
    doc.fillColor('#4a5568').font('Helvetica').fontSize(10)
       .text(org.name, 300, 163)
       .text(org.address || '—', 300, 176)
       .text(org.email || '—', 300, 189);

    // ── DIVIDER ──────────────────────────────────────
    doc.moveTo(50, 215).lineTo(doc.page.width - 50, 215).strokeColor('#e2e8f0').stroke();

    // ── DATES ────────────────────────────────────────
    doc.fillColor('#718096').font('Helvetica').fontSize(9)
       .text(`Invoice Date: ${new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 225)
       .text(`Billing Cycle: ${invoice.billing_cycle}`, 50, 240)
       .text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}`, 50, 255)
       .text(`Paid At: ${invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : 'Unpaid'}`, 300, 225);

    // ── LINE ITEMS TABLE ──────────────────────────────
    const tableTop = 290;
    doc.rect(50, tableTop, doc.page.width - 100, 24).fill('#f7fafc');
    doc.fillColor('#4a5568').font('Helvetica-Bold').fontSize(9)
       .text('DESCRIPTION', 60, tableTop + 8)
       .text('PLAN', 280, tableTop + 8)
       .text('CYCLE', 370, tableTop + 8)
       .text('AMOUNT', 0, tableTop + 8, { align: 'right', width: doc.page.width - 60 });

    doc.moveTo(50, tableTop + 24).lineTo(doc.page.width - 50, tableTop + 24).strokeColor('#e2e8f0').stroke();

    const rowY = tableTop + 36;
    doc.fillColor('#2d3748').font('Helvetica').fontSize(10)
       .text(`${plan.name} Subscription`, 60, rowY)
       .text(plan.name, 280, rowY)
       .text(invoice.billing_cycle, 370, rowY);
    doc.font('Helvetica-Bold')
       .text(`$${invoice.amount.toFixed(2)}`, 0, rowY, { align: 'right', width: doc.page.width - 60 });

    doc.moveTo(50, rowY + 24).lineTo(doc.page.width - 50, rowY + 24).strokeColor('#e2e8f0').stroke();

    // ── TOTAL BOX ─────────────────────────────────────
    const totalY = rowY + 40;
    doc.rect(doc.page.width - 200, totalY, 150, 40).fill('#1a1a2e');
    doc.fillColor('#a0aec0').font('Helvetica').fontSize(9)
       .text('TOTAL AMOUNT', doc.page.width - 195, totalY + 6, { width: 140, align: 'center' });
    doc.fillColor('white').font('Helvetica-Bold').fontSize(16)
       .text(`$${invoice.amount.toFixed(2)}`, doc.page.width - 195, totalY + 18, { width: 140, align: 'center' });

    // ── PAYMENT DETAILS ──────────────────────────────
    if (invoice.payments.length > 0) {
      const pay = invoice.payments[0];
      doc.fillColor('#4a5568').font('Helvetica').fontSize(9)
         .text(`Payment Method: ${pay.payment_method.replace(/_/g, ' ')}`, 50, totalY + 6)
         .text(`Transaction Ref: ${pay.transaction_ref || 'N/A'}`, 50, totalY + 20)
         .text(`Payment Status: ${pay.status}`, 50, totalY + 34);
    }

    // ── FOOTER ───────────────────────────────────────
    const footerY = doc.page.height - 70;
    doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).strokeColor('#e2e8f0').stroke();
    doc.fillColor('#a0aec0').font('Helvetica').fontSize(8)
       .text('Thank you for your business. For support, contact billing@restaurantpos.com', 50, footerY + 10, {
         align: 'center', width: doc.page.width - 100
       })
       .text(`© ${new Date().getFullYear()} Restaurant Management Platform. All rights reserved.`, 50, footerY + 24, {
         align: 'center', width: doc.page.width - 100
       });

    doc.end();
  } catch (error) { next(error); }
};
