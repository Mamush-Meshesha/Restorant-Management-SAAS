import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { AppRole } from "@/config/roles";
import DataTablePage, { renderStatusPill } from "./DataTablePage";
import { getOrders, cancelOrder } from "@/api/_orders";
import { getUsers, createUser, updateUser, deleteUser } from "@/api/_users";
import { getBranches, createBranch, updateBranch } from "@/api/_branches";
import { getAllRoles, createRole, updateRole, deleteRole } from "@/api/_role";
import { getRevenueReport } from "@/api/_analytics";
import { getCustomers, createCustomer } from "@/api/_customer";
import { getReservations, createReservation, updateReservationStatus } from "@/api/_reservations";
import { getKitchenStations, createKitchenStation, updateKitchenStation, deleteKitchenStation } from "@/api/_kitchenStations";
import { getDiningAreas, createDiningArea, updateDiningArea, deleteDiningArea, getTables, createTable, updateTable, deleteTable } from "@/api/_tables";

// RBAC Helper Hook
const useRoleAccess = () => {
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name) as AppRole | undefined;
  return {
    isSuperAdmin: roleName === "SUPERADMIN",
    isCompanyAdmin: roleName === "COMPANY_ADMIN",
    isManager: roleName === "BRANCH_MANAGER",
    isAdminOrManager: ["SUPERADMIN", "COMPANY_ADMIN", "BRANCH_MANAGER"].includes(roleName || ""),
    roleName
  };
};

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

export const OrdersPage = () => {
  const { isAdminOrManager } = useRoleAccess();
  
  return (
    <DataTablePage
      config={{
        title: "Orders",
        description: "All restaurant orders",
        noun: "Order",
        columns: [
          { field: "order_number", headerName: "Order #", width: 140 },
          { field: "order_type", headerName: "Type", width: 120 },
          { field: "table_name", headerName: "Table", width: 120,
            valueGetter: (value: any, row: any) => row?.table?.name || "Takeaway" },
          { field: "items_count", headerName: "Items", width: 80,
            valueGetter: (value: any, row: any) => (row?.items?.length ?? 0) },
          { field: "total_amount", headerName: "Total", width: 120,
            valueFormatter: (value: any) => `$${Number(value || 0).toFixed(2)}` },
          { field: "status", headerName: "Status", width: 140, renderCell: renderStatusPill },
          { field: "created_at", headerName: "Date", flex: 1,
            valueFormatter: (value: any) => value ? new Date(value).toLocaleString() : "" },
          actionCol,
        ],
        fetchFn: () => getOrders({ limit: 100 }),
        deleteFn: isAdminOrManager ? (id) => cancelOrder(id) : undefined,
        transformFn: (raw) => (raw.data ?? []).map((o: any) => ({
          ...o,
          id: o.id,
          table_name: o.table?.name || "Takeaway",
          items_count: o.items?.length ?? 0,
        })),
      }}
    />
  );
};

// ─── RESERVATIONS ────────────────────────────────────────────────────────────

export const ReservationsPage = () => {
  const [tables, setTables] = React.useState<{label: string, value: string}[]>([]);
  React.useEffect(() => {
    // In a real app we need branchId
    getTables().then(res => setTables((res.data?.data || [])
      .filter((t: any) => t.status === "AVAILABLE")
      .map((t: any) => ({ label: t.table_number, value: t.id }))))
      .catch(console.error);
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

export const KitchenStationsPage_old = () => {
  const [branches, setBranches] = React.useState<{label: string, value: string}[]>([]);
  const { isAdminOrManager } = useRoleAccess();

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
        createFn: isAdminOrManager ? createKitchenStation : undefined,
        updateFn: isAdminOrManager ? updateKitchenStation : undefined,
        deleteFn: isAdminOrManager ? deleteKitchenStation : undefined,
        transformFn: (raw) => raw.data ?? [],
        formSchema: [
          { field: "name", label: "Station Name", required: true },
          { field: "branch_id", label: "Branch", options: branches, required: true }
        ]
      }}
    />
  );
};



// ─── CUSTOMERS ───────────────────────────────────────────────────────────────

// Placeholder removed, CustomersPage is now its own component

// ─── LOYALTY ─────────────────────────────────────────────────────────────────

// Placeholder removed, LoyaltyPage is now its own component





// ─── DELIVERY ────────────────────────────────────────────────────────────────

export const DeliveryPage = () => (
  <DataTablePage
    config={{
      title: "Delivery Orders",
      description: "Outbound deliveries",
      noun: "Delivery",
      columns: [
        { field: "order_number", headerName: "Order #", width: 140 },
        { field: "total_amount", headerName: "Total", width: 120, valueFormatter: (value: any) => `$${Number(value || 0).toFixed(2)}` },
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






// ─── REVENUE ─────────────────────────────────────────────────────────────────

// ─── REVENUE (REPLACED) ────────────────────────────────────────────────────────

// ─── EXPENSES (REPLACED) ──────────────────────────────────────────────────────

// ─── TRANSACTIONS (REPLACED) ──────────────────────────────────────────────────

// ─── BRANCHES ────────────────────────────────────────────────────────────────

export const BranchesPage_old = () => {
  const { isSuperAdmin, isCompanyAdmin } = useRoleAccess();
  const canManage = isSuperAdmin || isCompanyAdmin;

  return (
    <DataTablePage
      config={{
        title: "Branches",
        description: "Location management",
        noun: "Branch",
        columns: [nameCol,
          { field: "code", headerName: "Code", width: 120 },
          { field: "address", headerName: "Address", flex: 1 },
          { field: "phone", headerName: "Phone", width: 140 },
          activeStatusCol,
          actionCol,
        ],
        fetchFn: getBranches,
        createFn: canManage ? createBranch : undefined,
        updateFn: canManage ? (id, data) => updateBranch(id, data) : undefined,
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
};

// ─── ROLES ────────────────────────────────────────────────────────────────────

export const RolesPage_old = () => {
  const { isSuperAdmin, isCompanyAdmin } = useRoleAccess();
  const canManage = isSuperAdmin || isCompanyAdmin;

  return (
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
        createFn: canManage ? (data) => createRole({ name: data.name, description: data.description }) : undefined,
        updateFn: canManage ? (id, data) => updateRole(id, { name: data.name, description: data.description }) : undefined,
        deleteFn: canManage ? deleteRole : undefined,
        transformFn: (raw) => (raw.roles ?? raw.data ?? []).map((r: any) => ({ id: r.id, name: r.name, description: r.description ?? "—" })),
        formSchema: [
          { field: "name", label: "Role Name", required: true },
          { field: "description", label: "Description" },
        ],
      }}
    />
  );
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export const UsersPage_old = () => {
  const [roles, setRoles] = React.useState<{label: string, value: string}[]>([]);
  const { isAdminOrManager } = useRoleAccess();

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
        columns: [
          nameCol,
          { field: "email", headerName: "Email", flex: 1 },
          { field: "username", headerName: "Username", width: 140 },
          { field: "role_name", headerName: "Role", width: 140 },
          activeStatusCol,
          actionCol,
        ],
        fetchFn: getUsers,
        createFn: isAdminOrManager ? createUser : undefined,
        updateFn: isAdminOrManager ? (id, data) => updateUser(id, data) : undefined,
        deleteFn: isAdminOrManager ? deleteUser : undefined,
        transformFn: (raw) =>
          (raw.data ?? []).map((u: any) => ({
            ...u,
            name: `${u.first_name} ${u.last_name}`,
            role_name: u.role?.name ?? u.role?.role_name ?? "—",
            branch_name: u.branch?.name ?? "—",
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

export const SettingsPage_old = () => (
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
