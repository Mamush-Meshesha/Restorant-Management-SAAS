import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
} from "@mui/material";
import React from "react";
import { NavLink } from "react-router";
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
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: "nowrap",
    marginBottom: "2px",
    padding: "7px 10px",
    borderRadius: "6px",
    backgroundColor: level > 1 ? "transparent !important" : "inherit",
    color: theme.palette.text.secondary,
    paddingLeft: "10px",
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

  const listItemProps = isExternal
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
      <ListItemStyled
        {...listItemProps}
        disabled={item.disabled}
        selected={pathDirect === item.href}
        onClick={onClick}
      >
        <ListItemIcon
          sx={{
            minWidth: "36px",
            p: "3px 0",
            color: "inherit",
          }}
        >
          {itemIcon}
        </ListItemIcon>
        <ListItemText primary={item.title} />
      </ListItemStyled>
    </List>
  );
};

export default NavItem;
