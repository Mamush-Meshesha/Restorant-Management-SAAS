import api from "./client";

export interface CustomerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  loyalty_points: number;
  total_visits: number;
  total_spent: number;
  tier: {
    name: string;
    min_points: number;
    discount_rate?: number;
  } | null;
}

export const getMyProfileApi = async (): Promise<CustomerProfile> => {
  const { data } = await api.get("/customer/me");
  return data?.data;
};
