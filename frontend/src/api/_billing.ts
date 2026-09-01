import api from ".";

export const getBillingSubscription = () => api.get("/billing/subscription");
export const getBillingPlans = () => api.get("/billing/plans");
export const getBillingInvoices = () => api.get("/billing/invoices");
export const upgradeSubscription = (plan_id: string, billing_cycle: string) =>
  api.post("/billing/upgrade", { plan_id, billing_cycle });
export const cancelSubscription = () => api.post("/billing/cancel");
export const downloadInvoice = (invoice_id: string) =>
  api.get(`/billing/invoices/${invoice_id}/pdf`, { responseType: "blob" });

// Superadmin Plan Management
export const createBillingPlan = (data: any) => api.post("/billing/plans", data);
export const updateBillingPlan = (id: string, data: any) => api.put(`/billing/plans/${id}`, data);
export const deleteBillingPlan = (id: string) => api.delete(`/billing/plans/${id}`);
