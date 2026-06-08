import api from "./client";

export interface CreateOrderPayload {
  branch_id: string;
  table_id?: string;
  order_type: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  notes?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }[];
}

export const createOrderApi = async (payload: CreateOrderPayload) => {
  const { data } = await api.post("/order", payload);
  return data;
};

export const getOrdersApi = async () => {
  const { data } = await api.get("/order");
  return data?.data ?? [];
};

export const updateOrderStatusApi = async (id: string, status: string) => {
  const { data } = await api.put(`/order/${id}/status`, { status });
  return data;
};

export const cancelOrderApi = async (id: string) => {
  const { data } = await api.put(`/order/${id}/cancel`);
  return data;
};
