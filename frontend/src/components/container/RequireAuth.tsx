import { useAppSelector } from "@/hooks/auth";
import { Navigate, Outlet } from "react-router";
import { toast } from "react-toastify";

export default function RequireAuth() {
  const { token } = useAppSelector((state) => state.auth);

  if (token) {
    return <Outlet />;
  } else {
    toast.error("You must be logged in to access this page.");
    return <Navigate to="/auth/login" replace />;
  }
}
