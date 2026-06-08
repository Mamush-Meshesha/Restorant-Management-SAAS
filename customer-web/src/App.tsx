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
    </Routes>
  );
}

export default App;
