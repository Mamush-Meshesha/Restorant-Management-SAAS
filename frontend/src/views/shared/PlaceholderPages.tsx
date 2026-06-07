import React from "react";
import DataTablePage, { renderStatusPill } from "./DataTablePage";
import { getOrders, cancelOrder } from "@/api/_orders";
import { getCategories, createCategory, updateCategory, deleteCategory, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/api/_menu";
import { getInventory, addInventoryItem } from "@/api/_inventory";
import { getUsers, createUser, updateUser, deleteUser } from "@/api/_users";
import { getBranches, createBranch, updateBranch } from "@/api/_branches";
import { getAllRoles, createRole, updateRole, deleteRole } from "@/api/_role";
import { getRevenueReport } from "@/api/_analytics";
import { getCustomers, createCustomer } from "@/api/_customer";
import { getReservations, createReservation, updateReservationStatus } from "@/api/_reservations";
import { getKitchenStations, createKitchenStation, updateKitchenStation, deleteKitchenStation } from "@/api/_kitchenStations";
import { getDiningAreas, createDiningArea, updateDiningArea, deleteDiningArea, getTables, createTable, updateTable, deleteTable, updateTableStatus } from "@/api/_tables";

// Reusable column definitions

const nameCol = { field: "name", headerName: "Name", flex: 1, minWidth: 150 };
const actionCol = { field: "actions", headerName: "", width: 60, sortable: false };

const activeStatusCol = {
  field: "is_active",
  headerName: "Status",
  width: 120,
  renderCell: (p: any) => renderStatusPill({ ...p, value: p.value ? "Active" : "Inactive" }),
};

// ─── ORDERS ─────────────────────────────────────────────────────────────────

export const OrdersPage = () => (
  <DataTablePage
    config={{
      title: "Orders",
      description: "All restaurant orders",
      noun: "Order",
      columns: [
        { field: "order_number", headerName: "Order #", width: 140 },
        { field: "order_type", headerName: "Type", width: 120 },
        { field: "table_name", headerName: "Table", width: 120,
          valueGetter: (p: any) => p?.row?.table?.name || "Takeaway" },
        { field: "items_count", headerName: "Items", width: 80,
          valueGetter: (p: any) => (p?.row?.items?.length ?? 0) },
        { field: "total_amount", headerName: "Total", width: 120,
          valueFormatter: (v: any) => `$${Number(v || 0).toFixed(2)}` },
        { field: "status", headerName: "Status", width: 140, renderCell: renderStatusPill },
        { field: "created_at", headerName: "Date", flex: 1,
          valueFormatter: (v: any) => v ? new Date(v).toLocaleString() : "" },
        actionCol,
      ],
      fetchFn: () => getOrders({ limit: 100 }),
      deleteFn: (id) => cancelOrder(id),
      transformFn: (raw) => (raw.data ?? []).map((o: any) => ({
        ...o,
        id: o.id,
        table_name: o.table?.name || "Takeaway",
        items_count: o.items?.length ?? 0,
      })),
    }}
  />
);

// ─── RESERVATIONS ────────────────────────────────────────────────────────────

export const ReservationsPage = () => {
  const [tables, setTables] = React.useState<{label: string, value: string}[]>([]);
  React.useEffect(() => {
    // In a real app we need branchId
    getTables().then(res => setTables((res.data?.data || []).map(t => ({ label: t.table_number, value: t.id })))).catch(console.error);
  }, []);

  return (
    <DataTablePage
      config={{
        title: "Reservations",
        description: "Manage table reservations",
        noun: "Reservation",
        columns: [
          { field: "customer_name", headerName: "Customer", flex: 1 },
          { field: "customer_phone", headerName: "Phone", width: 140 },
          { field: "guest_count", headerName: "Guests", width: 100 },
          { field: "reservation_time", headerName: "Time", width: 180, valueFormatter: (v: any) => v ? new Date(v).toLocaleString() : "" },
          { field: "status", headerName: "Status", width: 140, renderCell: renderStatusPill },
          actionCol,
        ],
        fetchFn: getReservations,
        createFn: createReservation,
        updateFn: (id, data) => updateReservationStatus(id, data.status),
        transformFn: (raw) => (raw.data ?? []).map((r: any) => ({
          id: r.id,
          customer_name: r.customer_name,
          customer_phone: r.customer_phone,
          guest_count: r.guest_count,
          reservation_time: r.reservation_time,
          status: r.status,
          table_id: r.table_id
        })),
        formSchema: [
          { field: "customer_name", label: "Customer Name", required: true },
          { field: "customer_phone", label: "Phone Number" },
          { field: "guest_count", label: "Guest Count", type: "number", required: true },
          { field: "reservation_time", label: "Date & Time", type: "datetime-local", required: true },
          { field: "table_id", label: "Table", options: tables, required: true },
          { field: "status", label: "Status", options: [
            { label: "Pending", value: "PENDING" },
            { label: "Confirmed", value: "CONFIRMED" },
            { label: "Seated", value: "SEATED" },
            { label: "Cancelled", value: "CANCELLED" }
          ] }
        ],
      }}
    />
  );
};

// ─── TABLES & FLOORS ─────────────────────────────────────────────────────────

export const DiningAreasPage = () => {
  const [branches, setBranches] = React.useState<{label: string, value: string}[]>([]);
  React.useEffect(() => {
    getBranches().then(res => setBranches((res.data?.data || []).map((b: any) => ({ label: b.name, value: b.id })))).catch(console.error);
  }, []);

  return (
    <DataTablePage
      config={{
        title: "Dining Areas",
        description: "Manage restaurant floors and areas",
        noun: "Area",
        columns: [
          nameCol,
          { field: "description", headerName: "Description", flex: 1 },
          activeStatusCol,
          actionCol,
        ],
        fetchFn: () => getDiningAreas(branches[0]?.value || ""), // Simplification for demo
        createFn: createDiningArea,
        updateFn: updateDiningArea,
        deleteFn: deleteDiningArea,
        transformFn: (raw) => raw.data ?? [],
        formSchema: [
          { field: "name", label: "Area Name", required: true },
          { field: "description", label: "Description" },
          { field: "branch_id", label: "Branch", options: branches, required: true }
        ]
      }}
    />
  );
};

export const TablesPage = () => {
  const [areas, setAreas] = React.useState<{label: string, value: string}[]>([]);
  const [branches, setBranches] = React.useState<{label: string, value: string}[]>([]);
  
  React.useEffect(() => {
    getBranches().then(res => setBranches((res.data?.data || []).map((b: any) => ({ label: b.name, value: b.id })))).catch(console.error);
    // Ideally fetch areas for a specific branch. For demo we fetch empty branchId which might fail unless API supports it.
    getDiningAreas("").catch(() => {}).then((res: any) => {
      if(res) setAreas((res.data?.data || []).map((a: any) => ({ label: a.name, value: a.id })));
    });
  }, []);

  return (
    <DataTablePage
      config={{
        title: "Tables",
        description: "Manage individual tables",
        noun: "Table",
        columns: [
          { field: "table_number", headerName: "Table Number", width: 150 },
          { field: "capacity", headerName: "Capacity", width: 100 },
          { field: "status", headerName: "Status", width: 140, renderCell: renderStatusPill },
          actionCol,
        ],
        fetchFn: getTables,
        createFn: createTable,
        updateFn: updateTable,
        deleteFn: deleteTable,
        transformFn: (raw) => raw.data ?? [],
        formSchema: [
          { field: "name", label: "Table Number", required: true }, // 'name' corresponds to table_number in creation
          { field: "capacity", label: "Capacity", type: "number", required: true },
          { field: "branch_id", label: "Branch", options: branches, required: true },
          { field: "dining_area_id", label: "Dining Area", options: areas, required: true },
          { field: "status", label: "Status", options: [
            { label: "Available", value: "AVAILABLE" },
            { label: "Occupied", value: "OCCUPIED" },
            { label: "Reserved", value: "RESERVED" }
          ] }
        ]
      }}
    />
  );
};

// ─── KITCHEN STATIONS ────────────────────────────────────────────────────────

export const KitchenStationsPage = () => {
  const [branches, setBranches] = React.useState<{label: string, value: string}[]>([]);
  React.useEffect(() => {
    getBranches().then(res => setBranches((res.data?.data || []).map((b: any) => ({ label: b.name, value: b.id })))).catch(console.error);
  }, []);

  return (
    <DataTablePage
      config={{
        title: "Kitchen Stations",
        description: "Manage kitchen prep stations",
        noun: "Station",
        columns: [
          nameCol,
          activeStatusCol,
          actionCol,
        ],
        fetchFn: getKitchenStations,
        createFn: createKitchenStation,
        updateFn: updateKitchenStation,
        deleteFn: deleteKitchenStation,
        transformFn: (raw) => raw.data ?? [],
        formSchema: [
          { field: "name", label: "Station Name", required: true },
          { field: "branch_id", label: "Branch", options: branches, required: true }
        ]
      }}
    />
  );
};

// ─── MENU CATEGORIES ─────────────────────────────────────────────────────────

export const CategoriesPage = () => {
  const [categories, setCategories] = React.useState<{label: string, value: string}[]>([]);
  
  React.useEffect(() => {
    getCategories().then(res => {
      // Flatten hierarchy for dropdown
      const mapCategories = (cats: any[], prefix = ""): {label: string, value: string}[] => {
        let result: {label: string, value: string}[] = [];
        cats.forEach(c => {
          result.push({ label: `${prefix}${c.name}`, value: c.id });
          if (c.subcategories && c.subcategories.length > 0) {
            result = result.concat(mapCategories(c.subcategories, `${prefix}-- `));
          }
        });
        return result;
      };
      setCategories([{ label: "None (Top Level)", value: "" }, ...mapCategories(res.data?.data || [])]);
    }).catch(console.error);
  }, []);

  return (
    <DataTablePage
      config={{
        title: "Menu Categories",
        description: "Manage menu groupings and subcategories",
        noun: "Category",
        columns: [,
          { 
            field: "name", 
            headerName: "Name", 
            flex: 1, 
            minWidth: 200,
            renderCell: (params: any) => (
              <div style={{ paddingLeft: `${(params.row.level || 0) * 20}px`, display: 'flex', alignItems: 'center' }}>
                {params.row.level > 0 && <span style={{ marginRight: 8, color: '#999' }}>↳</span>}
                {params.value}
              </div>
            )
          },
          { field: "parent_name", headerName: "Parent Category", width: 160 },
          { field: "description", headerName: "Description", flex: 1 },
          { field: "display_order", headerName: "Order", width: 90 },
          activeStatusCol,
          actionCol,
        ],
        fetchFn: getCategories,
        createFn: createCategory,
        updateFn: updateCategory,
        deleteFn: deleteCategory,
        transformFn: (raw) => {
          // Flatten the hierarchy for the table view
          const flatten = (cats: any[], parentName = "", level = 0): any[] => {
            let result: any[] = [];
            cats.forEach(c => {
              result.push({ ...c, parent_name: parentName || "—", level });
              if (c.subcategories && c.subcategories.length > 0) {
                result = result.concat(flatten(c.subcategories, c.name, level + 1));
              }
            });
            return result;
          };
          return flatten(raw.data ?? []);
        },
        formSchema: [
          { field: "name", label: "Category Name", required: true },
          { field: "parent_id", label: "Parent Category", options: categories },
          { field: "description", label: "Description" },
          { field: "display_order", label: "Display Order", type: "number" },
          { field: "image_url", label: "Category Image", type: "image" },
        ],
      }}
    />
  );
};

// ─── MENU ITEMS ───────────────────────────────────────────────────────────────

export const MenuItemsPage = () => {
  const [categories, setCategories] = React.useState<{label: string, value: string}[]>([]);
  React.useEffect(() => {
    getCategories().then(res => {
      setCategories((res.data?.data || []).map((c: any) => ({ label: c.name, value: c.id })));
    }).catch(console.error);
  }, []);

  return (
    <DataTablePage
      config={{
        title: "Menu Items",
        description: "All available dishes and drinks",
        noun: "Item",
        columns: [,
          nameCol,
          { field: "base_price", headerName: "Price", width: 110, valueFormatter: (v: any) => `$${Number(v).toFixed(2)}` },
          { field: "category_name", headerName: "Category", width: 150 },
          { field: "is_available", headerName: "Status", width: 120, renderCell: (p: any) => renderStatusPill({ ...p, value: p.value ? "Active" : "Inactive" }) },
          actionCol,
        ],
        fetchFn: getMenuItems,
        createFn: createMenuItem,
        updateFn: updateMenuItem,
        deleteFn: deleteMenuItem,
        transformFn: (raw) =>
          (raw.data ?? []).map((i: any) => ({
            ...i,
            category_name: i.category?.name ?? "",
          })),
        formSchema: [
          { field: "name", label: "Item Name", required: true },
          { field: "description", label: "Description" },
          { field: "base_price", label: "Base Price", type: "number", required: true },
          { field: "category_id", label: "Category", required: true, options: categories.length ? categories : undefined },
          { field: "image_url", label: "Item Image", type: "image" },
        ],
      }}
    />
  );
};

// ─── RECIPES ──────────────────────────────────────────────────────────────────

export const RecipesPage = () => (
  <DataTablePage
    config={{
      title: "Recipes",
      description: "Kitchen recipes and preparations",
      noun: "Recipe",
      columns: [nameCol, { field: "description", headerName: "Description", flex: 1 }, actionCol],
      // Recipes share menu items endpoint for now
      fetchFn: getMenuItems,
      transformFn: (raw) =>
        (raw.data ?? []).map((i: any) => ({
          id: i.id,
          name: i.name,
          description: i.description ?? "—",
        })),
    }}
  />
);

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────

export const CustomersPage = () => (
  <DataTablePage
    config={{
      title: "Customers",
      description: "Customer directory",
      noun: "Customer",
      columns: [, nameCol,
        { field: "email", headerName: "Email", flex: 1 },
        { field: "phone", headerName: "Phone", width: 140 },
        actionCol,
      ],
      fetchFn: getCustomers,
      createFn: (data) => createCustomer({ name: data.name, email: data.email, phone: data.phone }),
      transformFn: (raw) => (raw.data ?? []).map((c: any) => ({ ...c })),
      formSchema: [
        { field: "name", label: "Customer Name", required: true },
        { field: "email", label: "Email", type: "email" },
        { field: "phone", label: "Phone" },
      ],
    }}
  />
);

// ─── LOYALTY ─────────────────────────────────────────────────────────────────

export const LoyaltyPage = () => (
  <DataTablePage
    config={{
      title: "Loyalty Program",
      description: "Customer rewards and points",
      noun: "Program",
      columns: [nameCol, { field: "description", headerName: "Details", flex: 1 }, actionCol],
      data: [], // Placeholder until loyalty API is built
    }}
  />
);

// ─── INVENTORY ────────────────────────────────────────────────────────────────

export const InventoryPage = () => (
  <DataTablePage
    config={{
      title: "Inventory",
      description: "Stock and ingredient management",
      noun: "Item",
      columns: [, nameCol,
        { field: "unit", headerName: "Unit", width: 100 },
        { field: "current_stock", headerName: "Stock Level", width: 120 },
        { field: "minimum_stock", headerName: "Min. Stock", width: 120 },
        { field: "cost_per_unit", headerName: "Cost/Unit", width: 120, valueFormatter: (v: any) => `$${Number(v).toFixed(2)}` },
        {
          field: "stock_status",
          headerName: "Status",
          width: 120,
          renderCell: (p: any) => renderStatusPill({ ...p }),
        },
        actionCol,
      ],
      fetchFn: getInventory,
      createFn: addInventoryItem,
      transformFn: (raw) =>
        (raw.data ?? []).map((i: any) => ({
          ...i,
          stock_status: i.current_stock <= i.minimum_stock ? "Low Stock" : "In Stock",
        })),
      formSchema: [
        { field: "name", label: "Item Name", required: true },
        { field: "unit", label: "Unit (kg, liters, etc.)", required: true },
        { field: "current_stock", label: "Current Stock", type: "number", required: true },
        { field: "minimum_stock", label: "Minimum Stock", type: "number", required: true },
        { field: "cost_per_unit", label: "Cost per Unit", type: "number" },
      ],
    }}
  />
);

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────

export const SuppliersPage = () => (
  <DataTablePage
    config={{
      title: "Suppliers",
      description: "Vendor contacts",
      noun: "Supplier",
      columns: [nameCol, { field: "detail", headerName: "Contact", flex: 1 }, actionCol],
      data: [], // Placeholder until supplier API is built
    }}
  />
);

// ─── DELIVERY ────────────────────────────────────────────────────────────────

export const DeliveryPage = () => (
  <DataTablePage
    config={{
      title: "Delivery Orders",
      description: "Outbound deliveries",
      noun: "Delivery",
      columns: [
        { field: "order_number", headerName: "Order #", width: 140 },
        { field: "total_amount", headerName: "Total", width: 120, valueFormatter: (v: any) => `$${Number(v).toFixed(2)}` },
        { field: "status", headerName: "Status", width: 140, renderCell: renderStatusPill },
        { field: "created_at", headerName: "Date", flex: 1, valueFormatter: (v: any) => v ? new Date(v).toLocaleString() : "" },
        actionCol,
      ],
      fetchFn: () => getOrders({ limit: 100 }),
      transformFn: (raw) =>
        (raw.data ?? [])
          .filter((o: any) => o.order_type === "DELIVERY")
          .map((o: any) => ({ ...o })),
    }}
  />
);

// ─── EMPLOYEES ───────────────────────────────────────────────────────────────

export const EmployeesPage = () => {
  const [roles, setRoles] = React.useState<{label: string, value: string}[]>([]);
  React.useEffect(() => {
    getAllRoles().then(res => {
      setRoles((res.data?.data || []).map((r: any) => ({ label: r.name, value: r.id || r.role_id })));
    }).catch(console.error);
  }, []);

  return (
    <DataTablePage
      config={{
        title: "Employees",
        description: "Staff directory",
        noun: "Employee",
        columns: [,
          nameCol,
          { field: "email", headerName: "Email", flex: 1 },
          { field: "role_name", headerName: "Role", width: 160 },
          activeStatusCol,
          actionCol,
        ],
        fetchFn: getUsers,
        createFn: createUser,
        updateFn: (id, data) => updateUser(id, data),
        deleteFn: deleteUser,
        transformFn: (raw) =>
          (raw.data ?? []).map((u: any) => ({
            ...u,
            name: `${u.first_name} ${u.last_name}`,
            role_name: u.role?.name ?? u.role?.role_name ?? "—",
          })),
        formSchema: [
          { field: "first_name", label: "First Name", required: true },
          { field: "last_name", label: "Last Name", required: true },
          { field: "email", label: "Email", type: "email", required: true },
          { field: "username", label: "Username", required: true },
          { field: "password", label: "Password", type: "password" },
          { field: "role_id", label: "Role", required: true, options: roles.length ? roles : undefined },
        ],
      }}
    />
  );
};

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────

export const DepartmentsPage = () => (
  <DataTablePage
    config={{
      title: "Departments",
      description: "Company structure",
      noun: "Department",
      columns: [nameCol, { field: "description", headerName: "Description", flex: 1 }, actionCol],
      data: [], // Placeholder until department API is built
    }}
  />
);

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

export const AttendancePage = () => (
  <DataTablePage
    config={{
      title: "Attendance",
      description: "Staff timesheets",
      noun: "Record",
      columns: [nameCol, { field: "detail", headerName: "Hours", flex: 1 }, actionCol],
      data: [], // Placeholder until attendance API is built
    }}
  />
);

// ─── REVENUE ─────────────────────────────────────────────────────────────────

export const RevenuePage = () => (
  <DataTablePage
    config={{
      title: "Revenue Reports",
      description: "Financial analytics",
      noun: "Report",
      columns: [
        { field: "date", headerName: "Date", width: 140 },
        { field: "total_revenue", headerName: "Revenue", flex: 1, valueFormatter: (v: any) => `$${Number(v || 0).toFixed(2)}` },
        { field: "order_count", headerName: "Orders", width: 120 },
        { field: "avg_order_value", headerName: "Avg. Order", width: 140, valueFormatter: (v: any) => `$${Number(v || 0).toFixed(2)}` },
        actionCol,
      ],
      fetchFn: getRevenueReport,
      transformFn: (raw) =>
        (raw.data ?? []).map((r: any, i: number) => ({ id: r.id ?? i.toString(), ...r })),
    }}
  />
);

// ─── EXPENSES ────────────────────────────────────────────────────────────────

export const ExpensesPage = () => (
  <DataTablePage
    config={{
      title: "Expenses",
      description: "Outbound cashflow",
      noun: "Expense",
      columns: [nameCol, { field: "amount", headerName: "Amount", flex: 1 }, { field: "status", headerName: "Status", width: 120, renderCell: renderStatusPill }, actionCol],
      data: [],
    }}
  />
);

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

export const TransactionsPage = () => (
  <DataTablePage
    config={{
      title: "Transactions",
      description: "Detailed payment history",
      noun: "Transaction",
      columns: [
        { field: "order_number", headerName: "Order #", width: 140 },
        { field: "total_amount", headerName: "Amount", width: 140, valueFormatter: (v: any) => `$${Number(v).toFixed(2)}` },
        { field: "status", headerName: "Status", width: 140, renderCell: renderStatusPill },
        { field: "created_at", headerName: "Date", flex: 1, valueFormatter: (v: any) => v ? new Date(v).toLocaleString() : "" },
        actionCol,
      ],
      fetchFn: () => getOrders({ status: "SERVED,CANCELLED", limit: 100 }),
      transformFn: (raw) => (raw.data ?? []).map((o: any) => ({ ...o })),
    }}
  />
);

// ─── BRANCHES ────────────────────────────────────────────────────────────────

export const BranchesPage = () => (
  <DataTablePage
    config={{
      title: "Branches",
      description: "Location management",
      noun: "Branch",
      columns: [, nameCol,
        { field: "code", headerName: "Code", width: 120 },
        { field: "address", headerName: "Address", flex: 1 },
        { field: "phone", headerName: "Phone", width: 140 },
        activeStatusCol,
        actionCol,
      ],
      fetchFn: getBranches,
      createFn: createBranch,
      updateFn: (id, data) => updateBranch(id, data),
      transformFn: (raw) => raw.data ?? [],
      formSchema: [
        { field: "name", label: "Branch Name", required: true },
        { field: "code", label: "Branch Code", required: true },
        { field: "address", label: "Address" },
        { field: "phone", label: "Phone" },
        { field: "email", label: "Email", type: "email" },
      ],
    }}
  />
);

// ─── ROLES ────────────────────────────────────────────────────────────────────

export const RolesPage = () => (
  <DataTablePage
    config={{
      title: "Roles & Permissions",
      description: "Access control",
      noun: "Role",
      columns: [
        { field: "id", headerName: "ID", width: 140 },
        nameCol,
        { field: "description", headerName: "Description", flex: 1 },
        actionCol,
      ],
      fetchFn: getAllRoles,
      createFn: (data) => createRole({ name: data.name, description: data.description }),
      updateFn: (id, data) => updateRole(id, { name: data.name, description: data.description }),
      deleteFn: deleteRole,
      transformFn: (raw) => (raw.roles ?? raw.data ?? []).map((r: any) => ({ id: r.id, name: r.name, description: r.description ?? "—" })),
      formSchema: [
        { field: "name", label: "Role Name", required: true },
        { field: "description", label: "Description" },
      ],
    }}
  />
);

// ─── USERS ────────────────────────────────────────────────────────────────────

export const UsersPage = () => {
  const [roles, setRoles] = React.useState<{label: string, value: string}[]>([]);
  React.useEffect(() => {
    getAllRoles().then(res => {
      setRoles((res.data?.data || []).map((r: any) => ({ label: r.name, value: r.id || r.role_id })));
    }).catch(console.error);
  }, []);

  return (
    <DataTablePage
      config={{
        title: "Users",
        description: "System accounts",
        noun: "User",
        columns: [,
          nameCol,
          { field: "email", headerName: "Email", flex: 1 },
          { field: "username", headerName: "Username", width: 140 },
          { field: "role_name", headerName: "Role", width: 140 },
          activeStatusCol,
          actionCol,
        ],
        fetchFn: getUsers,
        createFn: createUser,
        updateFn: (id, data) => updateUser(id, data),
        deleteFn: deleteUser,
        transformFn: (raw) =>
          (raw.data ?? []).map((u: any) => ({
            ...u,
            name: `${u.first_name} ${u.last_name}`,
            role_name: u.role?.name ?? u.role?.role_name ?? "—",
          })),
        formSchema: [
          { field: "first_name", label: "First Name", required: true },
          { field: "last_name", label: "Last Name", required: true },
          { field: "email", label: "Email", type: "email", required: true },
          { field: "username", label: "Username", required: true },
          { field: "password", label: "Password", type: "password", required: true },
          { field: "role_id", label: "Role", required: true, options: roles.length ? roles : undefined },
        ],
      }}
    />
  );
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export const SettingsPage = () => (
  <DataTablePage
    config={{
      title: "Settings",
      description: "System configuration",
      noun: "Setting",
      columns: [nameCol, { field: "detail", headerName: "Value", flex: 1 }, actionCol],
      data: [],
    }}
  />
);
