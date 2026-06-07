import {
  IconLayoutDashboard,
  IconToolsKitchen2,
  IconSalad,
  IconTable,
  IconShoppingCart,
  IconReceipt,
  IconChefHat,
  IconCalendarEvent,
  IconUsers,
  IconUserCheck,
  IconBriefcase,
  IconPackage,
  IconTruck,
  IconFlask,
  IconReportMoney,
  IconCurrencyDollar,
  IconChartBar,
  IconQrcode,
  IconShield,
  IconSettings,
  IconMotorbike,
  IconStar,
} from "@tabler/icons-react";
import { uniqueId } from "lodash";
import type { NavHeaderItemType, NavItemType } from "./NavItem";
import type { AppRole } from "../../../config/roles";
import { ADMIN_ROLES, MANAGER_ROLES } from "../../../config/roles";

export type SidebarMenuItem = (NavHeaderItemType | NavItemType) & { roles?: AppRole[] };

const Menuitems: SidebarMenuItem[] = [
  // ─── HOME ──────────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Home",
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },

  // ─── OPERATIONS ────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Operations",
    // All staff need to see operations links in some capacity
  },
  {
    id: uniqueId(),
    title: "Point of Sale",
    icon: IconShoppingCart,
    href: "/pos",
    disabled: false,
    roles: [...MANAGER_ROLES, "CASHIER"],
  },
  {
    id: uniqueId(),
    title: "Orders",
    icon: IconReceipt,
    href: "/orders",
    disabled: false,
    roles: [...MANAGER_ROLES, "CASHIER"],
  },
  {
    id: uniqueId(),
    title: "Kitchen Display",
    icon: IconChefHat,
    href: "/kitchen",
    disabled: false,
    roles: [...MANAGER_ROLES, "CHEF"],
  },
  {
    id: uniqueId(),
    title: "Tables & Floor",
    icon: IconTable,
    href: "/tables",
    disabled: false,
    roles: [...MANAGER_ROLES, "WAITER", "CASHIER"],
  },
  {
    id: uniqueId(),
    title: "Reservations",
    icon: IconCalendarEvent,
    href: "/reservations",
    disabled: false,
    roles: [...MANAGER_ROLES, "CASHIER"],
  },

  // ─── MENU ──────────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Menu",
    roles: [...MANAGER_ROLES, "CHEF"],
  },
  {
    id: uniqueId(),
    title: "Categories",
    icon: IconSalad,
    href: "/menu/categories",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Menu Items",
    icon: IconToolsKitchen2,
    href: "/menu/items",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Recipes",
    icon: IconFlask,
    href: "/menu/recipes",
    disabled: false,
    roles: [...MANAGER_ROLES, "CHEF"],
  },

  // ─── CUSTOMERS ─────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Customers",
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Customers",
    icon: IconUsers,
    href: "/customers",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Loyalty Program",
    icon: IconStar,
    href: "/loyalty",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },

  // ─── INVENTORY ─────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Inventory",
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Stock",
    icon: IconPackage,
    href: "/inventory",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Suppliers",
    icon: IconTruck,
    href: "/suppliers",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },

  // ─── DELIVERY ──────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Delivery",
    roles: [...MANAGER_ROLES, "CASHIER"],
  },
  {
    id: uniqueId(),
    title: "Delivery Orders",
    icon: IconMotorbike,
    href: "/delivery",
    disabled: false,
    roles: [...MANAGER_ROLES, "CASHIER"],
  },

  // ─── HR ────────────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Human Resources",
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Employees",
    icon: IconUserCheck,
    href: "/employees",
    disabled: false,
    roles: [...ADMIN_ROLES, "BRANCH_MANAGER"],
  },
  {
    id: uniqueId(),
    title: "Departments",
    icon: IconBriefcase,
    href: "/departments",
    disabled: false,
    roles: [...ADMIN_ROLES, "BRANCH_MANAGER"],
  },
  {
    id: uniqueId(),
    title: "Attendance",
    icon: IconCalendarEvent,
    href: "/attendance",
    disabled: false,
    roles: [...ADMIN_ROLES, "BRANCH_MANAGER"],
  },

  // ─── FINANCE ───────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Finance",
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Revenue Reports",
    icon: IconChartBar,
    href: "/analytics/revenue",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Expenses",
    icon: IconCurrencyDollar,
    href: "/analytics/expenses",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },
  {
    id: uniqueId(),
    title: "Transactions",
    icon: IconReportMoney,
    href: "/analytics/transactions",
    disabled: false,
    roles: [...MANAGER_ROLES],
  },

  // ─── ADMIN ─────────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: "Administration",
    roles: [...ADMIN_ROLES],
  },
  {
    id: uniqueId(),
    title: "QR Codes",
    icon: IconQrcode,
    href: "/qr-codes",
    disabled: false,
    roles: [...ADMIN_ROLES, "BRANCH_MANAGER"],
  },
  {
    id: uniqueId(),
    title: "Branches",
    icon: IconLayoutDashboard,
    href: "/branches",
    disabled: false,
    roles: [...ADMIN_ROLES], // Only top-level admins can manage branches
  },
  {
    id: uniqueId(),
    title: "Roles & Permissions",
    icon: IconShield,
    href: "/roles",
    disabled: false,
    roles: [...ADMIN_ROLES],
  },
  {
    id: uniqueId(),
    title: "Users",
    icon: IconUsers,
    href: "/users",
    disabled: false,
    roles: [...ADMIN_ROLES],
  },
  {
    id: uniqueId(),
    title: "Settings",
    icon: IconSettings,
    href: "/settings",
    disabled: false,
    roles: [...ADMIN_ROLES],
  },
];

export default Menuitems;
