import { lazy } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";

import RequireAuth from "./components/container/RequireAuth";
import BlankLayout from "./layouts/blank/BlankLayout";
import FullLayout from "./layouts/full/FullLayout";
import { baselightTheme } from "./theme/DefaultColors";

// Auth
const LoginPage = lazy(() => import("./views/authentication/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./views/authentication/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./views/authentication/ResetPasswordPage"));

// Core
const Dashboard = lazy(() => import("./views/dashboard/Dashboard"));
const POS = lazy(() => import("./views/pos/POS"));
const KitchenDisplay = lazy(() => import("./views/kitchen/KitchenDisplay"));
const TablesFloor = lazy(() => import("./views/tables/TablesFloor"));

// Settings/QR
const QRGenerator = lazy(() => import("./views/settings/QRGenerator"));
const MenuViewer = lazy(() => import("./views/public/MenuViewer"));

import {
  OrdersPage, ReservationsPage, CategoriesPage, MenuItemsPage, RecipesPage,
  CustomersPage, LoyaltyPage, InventoryPage, SuppliersPage, DeliveryPage,
  EmployeesPage, DepartmentsPage, AttendancePage, RevenuePage, ExpensesPage,
  TransactionsPage, BranchesPage, RolesPage, UsersPage, SettingsPage
} from "./views/shared/PlaceholderPages";

import RequireRole from "./components/container/RequireRole";
import { MANAGER_ROLES, ADMIN_ROLES, ROLE_DEFAULT_PATHS } from "./config/roles";
import type { AppRole } from "./config/roles";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";

const RootRedirect = () => {
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name) as AppRole | undefined;
  if (!roleName) return <Navigate to="/auth/login" replace />;
  const path = ROLE_DEFAULT_PATHS[roleName] || "/dashboard";
  return <Navigate to={path} replace />;
};

function App() {
  const theme = baselightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<BlankLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<LoginPage />} />
          <Route path="404" element={<div style={{ padding: '24px' }}><h2>404 Not Found</h2></div>} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Public Menu QR Route */}
        <Route path="/menu/scan/:token" element={<MenuViewer />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<FullLayout />}>
            {/* Dynamic Root Redirect */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Shared Dashboard (Admins & Managers) */}
            <Route element={<RequireRole allowedRoles={[...MANAGER_ROLES]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            
            {/* Operations */}
            <Route path="/pos" element={<RequireRole allowedRoles={[...MANAGER_ROLES, "CASHIER"]}><POS /></RequireRole>} />
            <Route path="/orders" element={<RequireRole allowedRoles={[...MANAGER_ROLES, "CASHIER"]}><OrdersPage /></RequireRole>} />
            <Route path="/kitchen" element={<RequireRole allowedRoles={[...MANAGER_ROLES, "CHEF"]}><KitchenDisplay /></RequireRole>} />
            <Route path="/tables" element={<RequireRole allowedRoles={[...MANAGER_ROLES, "WAITER", "CASHIER"]}><TablesFloor /></RequireRole>} />
            <Route path="/reservations" element={<RequireRole allowedRoles={[...MANAGER_ROLES, "CASHIER"]}><ReservationsPage /></RequireRole>} />
            
            {/* Menu */}
            <Route element={<RequireRole allowedRoles={[...MANAGER_ROLES, "CHEF"]} />}>
              <Route path="/menu/categories" element={<CategoriesPage />} />
              <Route path="/menu/items" element={<MenuItemsPage />} />
              <Route path="/menu/recipes" element={<RecipesPage />} />
            </Route>
            
            {/* Shared Manager/Admin Links (Customers, Inventory, Finance, HR) */}
            <Route element={<RequireRole allowedRoles={[...MANAGER_ROLES]} />}>
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/loyalty" element={<LoyaltyPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/analytics/revenue" element={<RevenuePage />} />
              <Route path="/analytics/expenses" element={<ExpensesPage />} />
              <Route path="/analytics/transactions" element={<TransactionsPage />} />
            </Route>

            {/* Delivery */}
            <Route element={<RequireRole allowedRoles={[...MANAGER_ROLES, "CASHIER"]} />}>
              <Route path="/delivery" element={<DeliveryPage />} />
            </Route>
            
            {/* HR - Admin & Branch Manager */}
            <Route element={<RequireRole allowedRoles={[...ADMIN_ROLES, "BRANCH_MANAGER"]} />}>
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
            </Route>
            
            {/* Admin Only */}
            <Route element={<RequireRole allowedRoles={[...ADMIN_ROLES, "BRANCH_MANAGER"]} />}>
              <Route path="/qr-codes" element={<QRGenerator />} />
            </Route>
            <Route element={<RequireRole allowedRoles={[...ADMIN_ROLES]} />}>
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Route>
        </Route>
        
        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/auth/404" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
