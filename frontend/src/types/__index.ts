export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Export all module types
export * from "./__designation";
export * from "./__department";
export * from "./__contract_type";

export * from "./__payments";
export * from "./__users";
export * from "./__student";
export * from "./__employees";
export * from "./__guardians";
export * from "./__classes";

export * from "./__gradeLevels";
export * from "./__section";
export * from "./__rooms";
export * from "./__acedamic_year";
export * from "./__institute";
export * from "./__roles";
