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
  website?: string;
  tax_id?: string;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  organization_id: string;
  address?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  wifi_ip?: string;
  qr_secret_key?: string;
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
  is_gluten_free: boolean;
  allergens?: string[];
  category_id: string;
  category?: MenuCategory;
  variants?: MenuVariant[];
  addons?: MenuAddon[];
}

export interface MenuVariant {
  id: string;
  menu_item_id?: string;
  name: string;
  price_adjustment: number;
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
  name?: string;
  x_pos?: number;
  y_pos?: number;
  rotation?: number;
  scale_x?: number;
  scale_y?: number;
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
  order?: Order;
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
  payment_method?: string;
  payment_status?: string;
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

export interface KitchenStation {
  id: string;
  branch_id: string;
  name: string;
  is_active: boolean;
}

export interface KitchenOrder {
  id: string;
  order_item_id: string;
  station_id?: string;
  status: KitchenOrderStatus;
  started_at?: string;
  completed_at?: string;
  orderItem?: OrderItem;
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

// =============================================
// Recipe Types
// =============================================

export interface RecipeIngredient {
  id?: string;
  recipe_id?: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  inventoryItem?: InventoryItem;
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  instructions?: string;
  prep_time?: number;
  cook_time?: number;
  menuItem?: MenuItem;
  ingredients?: RecipeIngredient[];
}
// =============================================
// Inventory, Suppliers & Delivery Types
// =============================================

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price: number;
  item?: InventoryItem;
}

export interface PurchaseOrder {
  id: string;
  branch_id: string;
  supplier_id: string;
  status: string;
  total_amount: number;
  expected_date?: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface DeliveryZone {
  id: string;
  branch_id: string;
  name: string;
  radius_km: number;
  delivery_fee: number;
  min_order_amount: number;
  is_active: boolean;
}

export interface Driver {
  id: string;
  organization_id: string;
  name: string;
  phone: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  is_active: boolean;
}

export interface DeliveryOrder {
  id: string;
  order_id: string;
  driver_id?: string;
  customer_address: string;
  delivery_fee: number;
  status: string;
  estimated_time?: string;
  delivered_at?: string;
  order?: Order;
  driver?: Driver;
}

// =============================================
// HR & Employees Types
// =============================================

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  is_active: boolean;
}

export interface Position {
  id: string;
  organization_id: string;
  name: string;
  base_salary?: number;
  is_active: boolean;
}

export interface EmploymentType {
  id: string;
  organization_id: string;
  name: string;
}

export interface Employee {
  id: string;
  organization_id: string;
  department_id: string;
  position_id: string;
  employment_type_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  hire_date: string;
  is_active: boolean;
  department?: Department;
  position?: Position;
  employmentType?: EmploymentType;
}
