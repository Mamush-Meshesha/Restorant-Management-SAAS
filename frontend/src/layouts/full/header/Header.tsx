import {
  AppBar,
  Box,
  Breadcrumbs,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  styled,
  InputBase,
  alpha,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";

// components
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { capitalize } from "@/lib/utils";

import { getRouteMeta } from "@/lib/hepers";
import { Helmet } from "react-helmet";
import Profile from "./Profile";
import Notifications from "./Notifications";
import { useAppSelector } from "@/hooks/auth";
import ClockInScanner from "@/components/ClockInScanner";

const Header = ({
  toggleMobileSidebar,
}: {
  toggleMobileSidebar: () => void;
  toggleSidebar: () => void;
}) => {
  const { currentUser } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: alpha(theme.palette.background.paper, 0.95),
    justifyContent: "center",
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up("lg")]: {
      minHeight: "80px",
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
    minHeight: "80px !important",
    padding: theme.spacing(0, 3),
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0, 2),
    },
  }));

  const SearchBox = styled(Box)(({ theme }) => ({
    position: "relative",
    borderRadius: 16,
    backgroundColor: alpha(theme.palette.common.white, 0.8),
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    "&:hover": {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.divider,
      boxShadow: "none",
    },
    "&:focus-within": {
      backgroundColor: theme.palette.common.white,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.info.main, 0.2)}`,
      borderColor: theme.palette.info.main,
    },
    marginLeft: 0,
    width: "100%",
    minWidth: 200,
    maxWidth: 300,
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
    [theme.breakpoints.down("lg")]: {
      minWidth: 180,
      maxWidth: 250,
    },
    [theme.breakpoints.down("md")]: {
      minWidth: 160,
      maxWidth: 220,
    },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("lg")]: {
        width: "25ch",
        "&:focus": {
          width: "30ch",
        },
      },
      [theme.breakpoints.down("lg")]: {
        width: "20ch",
        "&:focus": {
          width: "25ch",
        },
      },
      [theme.breakpoints.down("md")]: {
        width: "18ch",
        "&:focus": {
          width: "22ch",
        },
      },
    },
  }));

  const LogoContainer = styled(motion.div)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    cursor: "pointer",
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      gap: theme.spacing(1),
    },
  }));

  const BranchInfo = styled(Box)(({ theme }) => ({
    flex: 1,
    minWidth: 150,
    maxWidth: 300,
    [theme.breakpoints.down("lg")]: {
      maxWidth: 250,
    },
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <Helmet>
        <title>{getRouteMeta(location.pathname || "").title}</title>
        <meta
          name="description"
          content={getRouteMeta(location.pathname).description}
        />
      </Helmet>
      <Box sx={{ maxWidth: "100vw", overflow: "hidden" }}>
        <ToolbarStyled>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={toggleMobileSidebar}
            sx={{
              display: {
                lg: "none",
                xs: "inline",
              },
              mr: { xs: 0.5, sm: 1 },
              "&:hover": {
                backgroundColor: "rgba(93, 135, 255, 0.1)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Left Side - Logo and Branch Info */}
          <Stack
            direction={"row"}
            alignItems={"center"}
            spacing={{ xs: 1, sm: 1.5, md: 2 }}
            sx={{
              flex: 1,
              minWidth: 0, // Allow shrinking
              overflow: "hidden",
            }}
          >
            {/* Logo and Branch Info */}
            <LogoContainer
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Box
                sx={{
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "none",
                  border: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <img
                  src={
                    "https://cdn-icons-png.flaticon.com/512/3448/3448054.png"
                  }
                  alt="restaurant-logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            </LogoContainer>

            <BranchInfo>
              <Typography
                variant="h5"
                noWrap
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  lineHeight: 1.2,
                  mb: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
                title={
                  currentUser?.organization?.name === "Default Institute"
                    ? "Main Branch"
                    : currentUser?.organization?.name || "Restaurant Management Platform"
                }
              >
                {currentUser?.organization?.name === "Default Institute"
                  ? "Main Branch"
                  : currentUser?.organization?.name || "Restaurant Management Platform"}
              </Typography>

              <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                  "& .MuiBreadcrumbs-separator": {
                    color: "text.secondary",
                  },
                  "& .MuiBreadcrumbs-li": {
                    fontSize: { xs: "0.75rem", md: "0.875rem" },
                  },
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                <Link
                  to="/"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    textTransform: "capitalize",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.color = "#5D87FF";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.color = "inherit";
                  }}
                >
                  Home
                </Link>
                {location.pathname
                  .split("/")
                  .slice(1)
                  .map((path, i, arr) => {
                    const to = "/" + arr.slice(0, i + 1).join("/");
                    const isLast = i === arr.length - 1;
                    return isLast ? (
                      <Chip
                        key={to}
                        label={capitalize(path.replaceAll("-", " "))}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: "0.75rem", height: 24 }}
                      />
                    ) : (
                      <Link
                        key={to}
                        to={to}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          textTransform: "capitalize",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.color = "#5D87FF";
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.color = "inherit";
                        }}
                      >
                        {capitalize(path.replaceAll("-", " "))}
                      </Link>
                    );
                  })}
              </Breadcrumbs>
            </BranchInfo>
          </Stack>

          {/* Right Side - Search, Notifications, and Profile */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, sm: 1.5, md: 2 }}
            sx={{
              flexShrink: 0,
              ml: "auto", // Push to the right
            }}
          >
            {/* Search Box */}
            <SearchBox
              sx={{
                display: { xs: "none", sm: "block" },
                flexShrink: 0,
              }}
            >
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </SearchBox>

            {/* Removed Academic Year Selector */}
            <Box sx={{ flexShrink: 0 }}>
            </Box>

            {/* Actions */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.5, sm: 1 }}
              sx={{ flexShrink: 0 }}
            >
              {/* Clock In Scanner */}
              <ClockInScanner />

              {/* Notifications */}
              <Notifications />

              {/* Profile */}
              <Profile />
            </Stack>
          </Stack>
        </ToolbarStyled>
      </Box>
    </AppBarStyled>
  );
};

export default Header;
