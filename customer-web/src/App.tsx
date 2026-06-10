import { Routes, Route } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout/CustomerLayout";
import HomePage from "./views/home/HomePage";
import LocationsPage from "./views/locations/LocationsPage";
import LocationDetailsPage from "./views/locations/LocationDetailsPage";
import MenuPage from "./views/menu/MenuPage";
import ReservationPage from "./views/reservations/ReservationPage";
import OrderPage from "./views/order/OrderPage";
import AccountPage from "./views/account/AccountPage";

import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import LoginPage from "./views/auth/LoginPage";
import RegisterPage from "./views/auth/RegisterPage";
import ForgotPasswordPage from "./views/auth/ForgotPasswordPage";
import ResetPasswordPage from "./views/auth/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";

// QR Mobile Views
import { WaitlistJoin } from "./views/public/WaitlistJoin";
import { WaitlistStatus } from "./views/public/WaitlistStatus";
import TableSessionMenu from "./views/public/TableSessionMenu";
import { StaffClockIn } from "./views/public/StaffClockIn";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="locations/:id" element={<LocationDetailsPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="reservations" element={<ProtectedRoute><ReservationPage /></ProtectedRoute>} />
        <Route path="order" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
        <Route path="account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Standalone Mobile QR Routes (Full Screen) */}
      <Route path="/waitlist/join/:branchId" element={<WaitlistJoin />} />
      <Route path="/waitlist/status/:id" element={<WaitlistStatus />} />
      <Route path="/session/:token" element={<TableSessionMenu />} />
      <Route path="/attendance/clock-in/:branchId" element={<StaffClockIn />} />
    </Routes>
  );
}

export default App;
