import api from "./client";

export const getMenuCategoriesApi = async () => {
  const { data } = await api.get("/menu/categories");
  return data?.data ?? [];
};

export const getMenuItemsApi = async () => {
  const { data } = await api.get("/menu/items");
  return data?.data ?? [];
};
