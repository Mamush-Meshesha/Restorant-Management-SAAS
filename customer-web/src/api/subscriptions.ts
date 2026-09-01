import api from "./client";

export const getSubscriptionPlansApi = async () => {
  const { data } = await api.get("/customer-subscription/plans");
  return data?.data ?? [];
};

export const getMySubscriptionsApi = async () => {
  const { data } = await api.get("/customer-subscription/my-subscriptions");
  return data?.data ?? [];
};

export const subscribeApi = async (plan_id: string) => {
  const { data } = await api.post("/customer-subscription/subscribe", { plan_id });
  return data;
};
