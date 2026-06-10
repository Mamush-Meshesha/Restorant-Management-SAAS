import api from "./client";

export const getBranchesApi = async () => {
  const { data } = await api.get("/branch/public");
  return data?.data ?? [];
};

export const getBranchByIdApi = async (id: string) => {
  const { data } = await api.get("/branch/public");
  const branches: any[] = data?.data ?? [];
  return branches.find((b) => b.id === id) ?? null;
};
