import { useAppSelector } from "@/hooks/auth";
import { Navigate, Outlet } from "react-router";
import { toast } from "react-toastify";

export default function RequirePlan({ premiumOnly }: { premiumOnly?: boolean }) {
  const { subscription } = useAppSelector((state) => state.auth);

  const isFreePlan = subscription?.plan?.name === "Free" || !subscription;

  if (premiumOnly && isFreePlan) {
    // Timeout to avoid toast spam during initial render check
    setTimeout(() => toast.error("This feature requires a Premium Subscription.", { toastId: 'premium-locked' }), 100);
    return <Navigate to="/settings/billing" replace />;
  }

  return <Outlet />;
}
