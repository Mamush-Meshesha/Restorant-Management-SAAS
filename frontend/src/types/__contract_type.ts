export interface ContractType {
  contract_type_id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  is_active?: boolean;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

export interface CreateContractTypeData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateContractTypeData {
  name?: string;
  description?: string;
  is_active?: boolean;
}
