import { Box, List } from "@mui/material";
import { useLocation } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import Menuitems, { type SidebarMenuItem } from "./MenuItems";
import NavGroup from "./NavGroup/NavGroup";
import type { NavHeaderItemType } from "./NavItem";
import NavItem from "./NavItem";
import type { AppRole } from "../../../config/roles";
import { useState, useEffect } from "react";
import { getCategories } from "../../../api/_menu";
import { IconSalad } from "@tabler/icons-react";

function isNavHeaderItem(item: SidebarMenuItem): item is NavHeaderItemType {
  return "navlabel" in item;
}

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  
  // Get current user role and compact state from Redux
  const roleName = useSelector((state: RootState) => state.auth.currentUser?.role?.name) as AppRole | undefined;
  const sidebarCompact = useSelector((state: RootState) => state.theme?.sidebarCompact ?? false);

  const [dynamicCategories, setDynamicCategories] = useState<SidebarMenuItem[]>([]);

  useEffect(() => {
    getCategories().then(res => {
      const buildTree = (cats: any[]): any[] => {
        return cats.map(c => ({
          id: `cat-${c.id}`,
          title: c.name,
          icon: IconSalad,
          href: `/menu/items?category=${c.id}`, // Filter menu items by this category
          children: c.subcategories && c.subcategories.length > 0 ? buildTree(c.subcategories) : undefined
        }));
      };
      setDynamicCategories(buildTree(res.data?.data || []));
    }).catch(console.error);
  }, []);

  // Filter items based on role and inject dynamic categories
  let filteredItems = Menuitems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true; // Show if no roles specified
    if (!roleName) return false; // Hide if user has no role but item requires one
    return item.roles.includes(roleName);
  }).map((item) => {
    // Inject dynamic categories into the "Categories" tab children
    if (!isNavHeaderItem(item) && item.title === "Categories" && dynamicCategories.length > 0) {
      return { ...item, children: dynamicCategories };
    }
    return item;
  });

  return (
    <Box sx={{ px: sidebarCompact ? 1 : 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {filteredItems.map((item) =>
          isNavHeaderItem(item) ? (
            !sidebarCompact && <NavGroup item={item} key={item.subheader} />
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
