import { ListSubheader, styled, type ListSubheaderProps } from "@mui/material";
import type { FC } from "react";
import type { NavHeaderItemType } from "../NavItem";

export interface NavGroupProps {
  item: NavHeaderItemType;
}

const ListSubheaderStyle = styled((props: ListSubheaderProps) => (
  <ListSubheader disableSticky {...props} />
))(({ theme }) => ({
  ...theme.typography.overline,
  fontWeight: "700",
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(0),
  color: theme.palette.text.primary,
  lineHeight: "26px",
  padding: "3px 12px",
}));

const NavGroup: FC<NavGroupProps> = ({ item }) => {
  return <ListSubheaderStyle>{item.subheader}</ListSubheaderStyle>;
};

export default NavGroup;
