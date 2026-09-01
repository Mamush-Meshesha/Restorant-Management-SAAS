import { lazy, useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";

import RequireAuth from "./components/container/RequireAuth";
import BlankLayout from "./layouts/blank/BlankLayout";
import FullLayout from "./layouts/full/FullLayout";
import { createAppTheme } from "./theme/DefaultColors";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";

// Auth
const LoginPage = lazy(() => import("./views/authentication/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./views/authentication/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./views/authentication/ResetPasswordPage"));

// Core
const Dashboard = lazy(() => import("./views/dashboard/Dashboard"));
const POS = lazy(() => import("./views/pos/POS"));
const KitchenDisplay = lazy(() => import("./views/kitchen/KitchenDisplay"));
const TablesFloor = lazy(() => import("./views/tables/TablesFloor"));
const FloorPlanEditor = lazy(() => import("./views/tables/FloorPlanEditor"));

// Settings/QR
const QRGenerator = lazy(() => import("./views/settings/QRGenerator"));
const MenuViewer = lazy(() => import("./views/public/MenuViewer"));

// Enterprise QR
const WaitlistDashboard = lazy(() => import("./views/dashboard/WaitlistDashboard"));
const AttendanceQRGenerator = lazy(() => import("./views/dashboard/AttendanceQRGenerator"));

// New Pages
const ProfilePage = lazy(() => import("./views/profile/ProfilePage"));
const BranchesPage = lazy(() => import("./views/settings/BranchesPage"));
const KitchenStationsPage = lazy(() => import("./views/settings/KitchenStationsPage"));
const RolesPage = lazy(() => import("./views/settings/RolesPage"));
const UsersPage = lazy(() => import("./views/settings/UsersPage"));
const SettingsPage = lazy(() => import("./views/settings/SettingsPage"));
const AppSettingsPage = lazy(() => import("./views/settings/AppSettingsPage"));
const BillingSubscriptionPage = lazy(() => import("./views/settings/BillingSubscriptionPage"));
const MessagesPage = lazy(() => import("./views/messages/MessagesPage"));
const OrdersPage = lazy(() => import("./views/orders/OrdersPage"));

const ReservationsPage = lazy(() => import("./views/reservations/ReservationsPage"));
const CategoriesPage = lazy(() => import("./views/menu/CategoriesPage"));
const MenuItemsPage = lazy(() => import("./views/menu/MenuItemsPage"));
const RecipesPage = lazy(() => import("./views/menu/RecipesPage"));
const InventoryPage = lazy(() => import("./views/inventory/InventoryPage"));
const SuppliersPage = lazy(() => import("./views/inventory/SuppliersPage"));
const DeliveryPage = lazy(() => import("./views/delivery/DeliveryPage"));
const EmployeesPage = lazy(() => import("./views/employees/EmployeesPage"));
const AttendancePage = lazy(() => import("./views/employees/AttendancePage"));

const CustomersPage = lazy(() => import("./views/customers/CustomersPage"));
const LoyaltyPage = lazy(() => import("./views/customers/LoyaltyPage"));
const TransactionsPage = lazy(() => import("./views/analytics/TransactionsPage"));
const ExpensesPage = lazy(() => import("./views/analytics/ExpensesPage"));
const RevenuePage = lazy(() => import("./views/analytics/RevenuePage"));

import RequireRole from "./components/container/RequireRole";
import RequirePlan from "./components/container/RequirePlan";
import { MANAGER_ROLES, ADMIN_ROLES, ROLE_DEFAULT_PATHS } from "./config/roles";
import type { AppRole } from "./config/roles";


const RootRedirect = () => {
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name) as AppRole | undefined;
  if (!roleName) return <Navigate to="/auth/login" replace />;
  const path = ROLE_DEFAULT_PATHS[roleName] || "/dashboard";
  return <Navigate to={path} replace />;
};

function App() {
  const mode = useSelector((state: RootState) => state.theme?.mode || "light");
  const primaryColor = useSelector((state: RootState) => state.theme?.primaryColor || "espresso");
  const fontSize = useSelector((state: RootState) => state.theme?.fontSize || "medium");
  const theme = useMemo(() => createAppTheme(mode, primaryColor, fontSize as any), [mode, primaryColor, fontSize]);

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
              <Route element={<RequirePlan premiumOnly />}>
                <Route path="/menu/recipes" element={<RecipesPage />} />
              </Route>
            </Route>
            
            {/* Shared Manager/Admin Links (Customers, Inventory, Finance, HR) */}
            <Route element={<RequireRole allowedRoles={[...MANAGER_ROLES]} />}>
              <Route element={<RequirePlan premiumOnly />}>
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/loyalty" element={<LoyaltyPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/analytics/expenses" element={<ExpensesPage />} />
                <Route path="/analytics/transactions" element={<TransactionsPage />} />
              </Route>
              <Route path="/analytics/revenue" element={<RevenuePage />} />
            </Route>

            {/* Delivery */}
            <Route element={<RequireRole allowedRoles={[...MANAGER_ROLES, "CASHIER"]} />}>
              <Route element={<RequirePlan premiumOnly />}>
                <Route path="/delivery" element={<DeliveryPage />} />
              </Route>
            </Route>
            
            {/* Admin & Branch Manager */}
            <Route element={<RequireRole allowedRoles={[...ADMIN_ROLES, "BRANCH_MANAGER"]} />}>
              <Route element={<RequirePlan premiumOnly />}>
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/waitlist" element={<WaitlistDashboard />} />
                <Route path="/attendance/qr" element={<AttendanceQRGenerator />} />
              </Route>
              <Route path="/floor-plan" element={<FloorPlanEditor />} />
              <Route path="/kitchen-stations" element={<KitchenStationsPage />} />
            </Route>

            {/* Admin Only */}
            <Route element={<RequireRole allowedRoles={[...ADMIN_ROLES, "BRANCH_MANAGER"]} />}>
              <Route path="/qr-codes" element={<QRGenerator />} />
            </Route>
            <Route element={<RequireRole allowedRoles={[...ADMIN_ROLES]} />}>
              <Route element={<RequirePlan premiumOnly />}>
                <Route path="/branches" element={<BranchesPage />} />
              </Route>
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/billing" element={<BillingSubscriptionPage />} />
            </Route>

            {/* Profile, Messages, App Settings — available to all authenticated users */}
            <Route path="/my-profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/app-settings" element={<AppSettingsPage />} />

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
