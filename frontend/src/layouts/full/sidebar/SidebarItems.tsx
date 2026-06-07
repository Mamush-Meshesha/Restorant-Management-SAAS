import { Box, List } from "@mui/material";
import { useLocation } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import Menuitems, { type SidebarMenuItem } from "./MenuItems";
import NavGroup from "./NavGroup/NavGroup";
import type { NavHeaderItemType } from "./NavItem";
import NavItem from "./NavItem";
import type { AppRole } from "../../../config/roles";

function isNavHeaderItem(item: SidebarMenuItem): item is NavHeaderItemType {
  return "navlabel" in item;
}

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  
  // Get current user role from Redux
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name) as AppRole | undefined;

  // Filter items based on role
  const filteredItems = Menuitems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true; // Show if no roles specified
    if (!roleName) return false; // Hide if user has no role but item requires one
    return item.roles.includes(roleName);
  });

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {filteredItems.map((item) =>
          isNavHeaderItem(item) ? (
            <NavGroup item={item} key={item.subheader} />
          ) : (
            <NavItem
              item={item}
              disabled={item.disabled}
              pathDirect={pathDirect}
              key={item.id}
              level={1}
            />
          )
        )}
      </List>
    </Box>
  );
};

export default SidebarItems;
