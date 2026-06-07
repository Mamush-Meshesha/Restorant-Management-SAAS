import api from ".";

export const getBillingSubscription = () => api.get("/billing/subscription");
export const getBillingPlans = () => api.get("/billing/plans");
export const getBillingInvoices = () => api.get("/billing/invoices");
export const upgradeSubscription = (plan_id: string, billing_cycle: string) =>
  api.post("/billing/upgrade", { plan_id, billing_cycle });
export const downloadInvoice = (invoice_id: string) =>
  api.get(`/billing/invoices/${invoice_id}/pdf`, { responseType: "blob" });
