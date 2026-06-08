import api from "./client";

export const getBranchesApi = async () => {
  const { data } = await api.get("/branch");
  return data?.data ?? [];
};

export const getBranchByIdApi = async (id: string) => {
  // No dedicated single-branch endpoint — we fetch all and filter
  const { data } = await api.get("/branch");
  const branches: any[] = data?.data ?? [];
  return branches.find((b) => b.id === id) ?? null;
};
