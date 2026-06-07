import { styled } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { Outlet } from "react-router";
import Header from "./header/Header";
import MSidebar from "./sidebar/Sidebar";
import GlobalSubscriptionBanner from "../../components/widgets/GlobalSubscriptionBanner";

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
  overflow: "auto",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
  // Premium scrollbar
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.divider,
    borderRadius: "8px",
  },
}));

const FullLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
          <Outlet />
        </ContentArea>
      </PageWrapper>
    </MainWrapper>
  );
};

export default FullLayout;
