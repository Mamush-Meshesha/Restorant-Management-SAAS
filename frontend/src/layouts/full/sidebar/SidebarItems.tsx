import { useState, useEffect } from "react";
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, useTheme, alpha, Typography, Badge
} from "@mui/material";
import { IconChevronDown, IconChevronRight, IconLock } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import Menuitems from "./MenuItems";
import type { NavGroupType, NavItemType } from "./MenuItems";
import type { AppRole } from "../../../config/roles";

// ─── Single Nav Item ─────────────────────────────────────────────────────────
const SidebarNavItem = ({
  item, pathDirect, locked, compact, isChild
}: {
  item: NavItemType;
  pathDirect: string;
  locked: boolean;
  compact: boolean;
  isChild?: boolean;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isActive = pathDirect === item.href;

  const handleClick = () => {
    if (locked) return;
    navigate(item.href);
  };

  return (
    <ListItemButton
      onClick={handleClick}
      selected={isActive}
      disabled={item.disabled}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        py: 0.75,
        px: compact ? 1.5 : 2,
        minHeight: 38,
        justifyContent: compact ? "center" : "flex-start",
        position: "relative",
        transition: "all 0.2s ease",
        "&.Mui-selected": {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
          "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
          "&::after": {
            content: '""',
            position: "absolute",
            right: 0,
            top: "20%",
            bottom: "20%",
            width: 3,
            borderRadius: "3px 0 0 3px",
            bgcolor: theme.palette.primary.main,
          },
        },
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
        opacity: locked ? 0.6 : 1,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: compact ? 0 : 36,
          mr: compact ? 0 : 1.5,
          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          transition: "color 0.2s",
          display: 'flex',
          alignItems: 'center',
          justifyContent: compact ? 'center' : 'flex-start',
        }}
      >
        {isChild && !compact ? (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: isActive ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.4),
              ml: 1,
              transition: "transform 0.2s, background-color 0.2s",
              transform: isActive ? "scale(1.5)" : "scale(1)",
            }}
          />
        ) : (
          <item.icon size={18} />
        )}
      </ListItemIcon>
      {!compact && (
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            fontSize: 13.5,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "primary.main" : "text.secondary",
          }}
        />
      )}
      {!compact && locked && (
        <IconLock size={13} color={theme.palette.warning.main} style={{ marginLeft: 4 }} />
      )}
    </ListItemButton>
  );
};

// ─── Collapsible Nav Group ────────────────────────────────────────────────────
const SidebarNavGroup = ({
  group, pathDirect, isFreePlan, compact, defaultOpen
}: {
  group: NavGroupType;
  pathDirect: string;
  isFreePlan: boolean;
  compact: boolean;
  defaultOpen: boolean;
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const hasActiveChild = group.children.some(c => pathDirect === c.href);

  // Auto-expand if a child becomes active
  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  return (
    <Box mb={1.5}>
      {/* Group Header */}
      <ListItemButton
        onClick={() => !compact && setOpen(!open)}
        sx={{
          borderRadius: 2,
          py: 1,
          px: compact ? 1.5 : 2,
          mb: 0.5,
          minHeight: 42,
          justifyContent: compact ? "center" : "flex-start",
          transition: "all 0.2s ease",
          bgcolor: open && !compact ? alpha(theme.palette.primary.main, 0.03) : "transparent",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.06),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: compact ? 0 : 36,
            mr: compact ? 0 : 1.5,
            color: hasActiveChild ? theme.palette.primary.main : theme.palette.text.primary,
            transition: "color 0.2s",
          }}
        >
          <group.icon size={20} stroke={2} />
        </ListItemIcon>
        {!compact && (
          <>
            <ListItemText
              primary={group.title}
              primaryTypographyProps={{
                fontSize: 12.5,
                fontWeight: 800,
                color: hasActiveChild ? "primary.main" : "text.primary",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            />
            <Box sx={{ color: "text.secondary", display: "flex", transition: "transform 0.2s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
              <IconChevronDown size={16} />
            </Box>
          </>
        )}
      </ListItemButton>

      {/* Children — collapsible */}
      {!compact && (
        <Collapse in={open} timeout={300}>
          <Box
            sx={{
              pl: 3.5,
              ml: 3,
              mt: 0.5,
              position: 'relative',
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 10,
                width: 1,
                bgcolor: alpha(theme.palette.divider, 0.8),
              }
            }}
          >
            <List disablePadding>
              {group.children.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  pathDirect={pathDirect}
                  locked={!!(item.premiumOnly && isFreePlan)}
                  compact={false}
                  isChild={true}
                />
              ))}
            </List>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;

  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name) as AppRole | undefined;
  const sidebarCompact = useSelector((state: RootState) => state.theme?.sidebarCompact ?? false);
  const subscription = useSelector((state: RootState) => state.auth.subscription);
  const isFreePlan = subscription?.plan?.name === "Free" || !subscription;

  // Filter groups based on role
  const filteredGroups = Menuitems.filter((group) => {
    if (!group.roles || group.roles.length === 0) return true;
    if (!roleName) return false;
    return group.roles.includes(roleName);
  }).map((group) => ({
    ...group,
    children: group.children.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      if (!roleName) return false;
      return item.roles.includes(roleName);
    }),
  })).filter((group) => group.children.length > 0);

  // Determine which group is active
  const activeGroupId = filteredGroups.find((g) =>
    g.children.some((c) => pathDirect === c.href)
  )?.id;

  return (
    <Box sx={{ px: sidebarCompact ? 1 : 2, py: 1 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {filteredGroups.map((group) => (
          <SidebarNavGroup
            key={group.id}
            group={group}
            pathDirect={pathDirect}
            isFreePlan={isFreePlan}
            compact={sidebarCompact}
            defaultOpen={group.id === activeGroupId || group.children.length === 1}
          />
        ))}
      </List>
    </Box>
  );
};

export default SidebarItems;
