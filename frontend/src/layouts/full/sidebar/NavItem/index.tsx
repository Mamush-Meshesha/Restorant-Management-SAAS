import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
  Tooltip,
  Collapse,
} from "@mui/material";
import React, { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
export interface NavHeaderItemType {
  navlabel: true;
  subheader: string;
  disabled?: boolean;
}
export interface NavItemType {
  id: string | number;
  icon: React.FC<{ stroke?: number; size?: number | string }>;
  href: string;
  title: string;
  external?: boolean;
  disabled?: boolean;
  children?: NavItemType[];
}

interface NavItemProps {
  item: NavItemType;
  pathDirect: string;
  level: number;
  onClick?: () => void;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  level,
  pathDirect,
  onClick,
}) => {
  const Icon = item.icon;
  const theme = useTheme();
  const sidebarCompact = useSelector((state: RootState) => state.theme?.sidebarCompact ?? false);
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (item.children) {
      setOpen(!open);
    } else if (onClick) {
      onClick();
    }
  };

  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: "nowrap",
    marginBottom: "2px",
    padding: sidebarCompact ? "10px" : "7px 10px",
    justifyContent: sidebarCompact ? "center" : "flex-start",
    borderRadius: "6px",
    backgroundColor: level > 1 ? "transparent !important" : "inherit",
    color: theme.palette.text.secondary,
    paddingLeft: sidebarCompact ? "10px" : "10px",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "background-color 150ms ease, color 150ms ease",
    "&:hover": {
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.text.primary,
    },
    "&.Mui-selected": {
      color: "#ffffff",
      backgroundColor: theme.palette.primary.main,
      boxShadow: "none",
      transform: "none",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: "#ffffff",
      },
    },
  }));

  const isExternal = item.external;

  const listItemProps = item.children
    ? { component: "div" }
    : isExternal
    ? {
        component: "a",
        href: item.href,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {
        component: NavLink,
        to: item.href,
      };

  return (
    <List component="li" disablePadding key={item.id}>
      <Tooltip title={sidebarCompact ? item.title : ""} placement="right">
        <ListItemStyled
          {...listItemProps}
          disabled={item.disabled}
          selected={pathDirect === item.href}
          onClick={handleClick}
        >
          <ListItemIcon
            sx={{
              minWidth: sidebarCompact ? 0 : "36px",
              p: "3px 0",
              color: "inherit",
            }}
          >
            {itemIcon}
          </ListItemIcon>
          {!sidebarCompact && <ListItemText primary={item.title} />}
          {!sidebarCompact && item.children && (
            open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
          )}
        </ListItemStyled>
      </Tooltip>
      {item.children && !sidebarCompact && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="ul" disablePadding sx={{ pl: 2 }}>
            {item.children.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                level={level + 1}
                pathDirect={pathDirect}
                onClick={onClick}
                disabled={child.disabled}
              />
            ))}
          </List>
        </Collapse>
      )}
    </List>
  );
};

export default NavItem;
