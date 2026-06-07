import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { ROLE_DEFAULT_PATHS } from "../../config/roles";
import type { AppRole } from "../../config/roles";

interface RequireRoleProps {
  allowedRoles: AppRole[];
  children?: React.ReactNode;
}

const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name) as AppRole | undefined;

  if (!roleName) {
    // Should be handled by RequireAuth, but just in case
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(roleName)) {
    // If user tries to access a forbidden route, bounce them to their role's default landing page
    const fallbackPath = ROLE_DEFAULT_PATHS[roleName] || "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RequireRole;
