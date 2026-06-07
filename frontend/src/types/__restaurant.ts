// =============================================
// Restaurant Management System - Core Types
// =============================================

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  organization_id: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  permissions?: Record<string, boolean>;
}

// =============================================
// Menu Types
// =============================================

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  organization_id: string;
  parent_id?: string | null;
  subcategories?: MenuCategory[];
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergens?: string[];
  category_id: string;
  category?: MenuCategory;
  variants?: MenuVariant[];
  addons?: MenuAddon[];
}

export interface MenuVariant {
  id: string;
  menu_item_id: string;
  name: string;
  price_modifier: number;
}

export interface MenuAddon {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
}

// =============================================
// Table / Floor Types
// =============================================

export interface DiningArea {
  id: string;
  branch_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  tables?: Table[];
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export interface Table {
  id: string;
  branch_id: string;
  dining_area_id: string;
  table_number: string;
  capacity: number;
  status: TableStatus;
  is_active: boolean;
  branch?: Branch;
  diningArea?: DiningArea;
}

// =============================================
// Order Types
// =============================================

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'READY' | 'SERVED' | 'CLOSED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  status: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  order_number: string;
  branch_id: string;
  table_id?: string;
  waiter_id?: string;
  order_type: OrderType;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  table?: Table;
}

// =============================================
// Bill / POS Types
// =============================================

export type BillStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface Bill {
  id: string;
  order_id: string;
  bill_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  service_charge: number;
  total_amount: number;
  status: BillStatus;
  created_at: string;
  order?: Order;
}

// =============================================
// Kitchen Types
// =============================================

export type KitchenOrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';

export interface KitchenOrder {
  id: string;
  order_id: string;
  station_id?: string;
  status: KitchenOrderStatus;
  started_at?: string;
  completed_at?: string;
  order?: Order;
}

// =============================================
// Inventory Types
// =============================================

export interface InventoryItem {
  id: string;
  branch_id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  cost_per_unit: number;
  is_active: boolean;
  branch?: Branch;
}

// =============================================
// Employee / HR Types
// =============================================

export interface RestaurantEmployee {
  id: string;
  branch_id: string;
  position: string;
  hire_date: string;
  salary?: number;
  is_active: boolean;
  branch?: Branch;
}

// =============================================
// Analytics Types
// =============================================

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeTables: number;
  pendingKitchenOrders: number;
  lowStockItems: number;
  totalCustomers?: number;
  revenueChange?: number;
  ordersChange?: number;
}

// =============================================
// Pagination
// =============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
