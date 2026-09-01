import api from ".";

export const getLoyaltyData = async () => {
  return await api.get("/loyalty");
};

export const updateLoyaltySettings = async (data: any) => {
  return await api.put("/loyalty/settings", data);
};

export const createTier = async (data: any) => {
  return await api.post("/loyalty/tiers", data);
};

export const deleteTier = async (id: string) => {
  return await api.delete(`/loyalty/tiers/${id}`);
};
