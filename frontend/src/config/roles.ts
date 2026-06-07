export type AppRole = 
  | "SUPERADMIN" 
  | "COMPANY_ADMIN" 
  | "BRANCH_MANAGER" 
  | "CASHIER" 
  | "CHEF" 
  | "WAITER";

// Define the default landing page for each role upon successful login
export const ROLE_DEFAULT_PATHS: Record<string, string> = {
  SUPERADMIN: "/dashboard",
  COMPANY_ADMIN: "/dashboard",
  BRANCH_MANAGER: "/dashboard",
  CASHIER: "/pos",
  CHEF: "/kitchen",
  WAITER: "/tables",
};

// Common groups
export const ALL_ROLES: AppRole[] = [
  "SUPERADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER", "CASHIER", "CHEF", "WAITER"
];

export const ADMIN_ROLES: AppRole[] = [
  "SUPERADMIN", "COMPANY_ADMIN"
];

export const MANAGER_ROLES: AppRole[] = [
  ...ADMIN_ROLES, "BRANCH_MANAGER"
];

export const STAFF_ROLES: AppRole[] = [
  "CASHIER", "CHEF", "WAITER"
];
