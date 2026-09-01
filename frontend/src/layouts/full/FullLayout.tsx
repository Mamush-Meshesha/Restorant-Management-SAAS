import { styled } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Header from "./header/Header";
import MSidebar from "./sidebar/Sidebar";
import GlobalSubscriptionBanner from "../../components/widgets/GlobalSubscriptionBanner";
import { useEffect, Suspense } from "react";
import { getBillingSubscription } from "../../api/_billing";
import { useAppDispatch, useAppSelector } from "../../hooks/auth";
import { setSubscription } from "../../redux/slices/authSlice";

const MainWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100vh",
  width: "100%",
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
  height: "100%",
  overflow: "hidden",
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const FullLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const subscription = useAppSelector((state) => state.auth.subscription);

  useEffect(() => {
    // Fetch subscription on app load if we haven't already
    if (subscription === undefined) {
      getBillingSubscription()
        .then((res) => dispatch(setSubscription(res.data.data)))
        .catch(() => dispatch(setSubscription(null)));
    }
  }, [subscription, dispatch]);

  useEffect(() => {
    // If subscription is strictly CANCELED, force redirect to billing page
    if (subscription && subscription.status === 'CANCELED' && location.pathname !== '/settings/billing') {
      navigate('/settings/billing', { replace: true });
    }
  }, [subscription, location, navigate]);

  // If subscription is strictly CANCELED, do not render Outlet except for billing
  // Actually, we can just let Outlet render because the useEffect will redirect.
  // But to avoid flicker of restricted pages, we can conditionally render:
  const isCanceled = subscription?.status === 'CANCELED';
  const canRenderContent = !isCanceled || location.pathname === '/settings/billing';

  return (
    <MainWrapper className="mainwrapper">
      <MSidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <PageWrapper className="page-wrapper">
        <Header
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          toggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <GlobalSubscriptionBanner />
        <ContentArea>
          {canRenderContent ? (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading...</Box>}>
                <Outlet />
              </Suspense>
            </Box>
          ) : (
            <Box p={4}>Redirecting to billing...</Box>
          )}
        </ContentArea>
      </PageWrapper>
    </MainWrapper>
  );
};

export default FullLayout;
