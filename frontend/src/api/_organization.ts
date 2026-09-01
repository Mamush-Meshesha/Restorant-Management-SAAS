import type { Organization } from "@/types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

export interface UpdateOrganizationData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_id?: string;
  logo?: string;
}

export const getOrganizationProfile = (): Promise<AxiosResponse<{ message: string; data: Organization }>> => {
  return api.get("/organization/profile");
};

export const updateOrganizationProfile = (
  data: UpdateOrganizationData
): Promise<AxiosResponse<{ message: string; data: Organization }>> => {
  return api.put("/organization/profile", data);
};
