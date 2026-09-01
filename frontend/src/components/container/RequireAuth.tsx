import { useAppSelector } from "@/hooks/auth";
import { Navigate, Outlet } from "react-router";

export default function RequireAuth() {
  const { token } = useAppSelector((state) => state.auth);

  if (token) {
    return <Outlet />;
  } else {
    return <Navigate to="/auth/login" replace />;
  }
}
