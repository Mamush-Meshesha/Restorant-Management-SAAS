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
  IconCreditCard,
  IconListCheck,
  IconFingerprint,
  IconBuildingStore,
  IconChartPie,
  IconTool,
} from "@tabler/icons-react";
import { uniqueId } from "lodash";
import type { AppRole } from "../../../config/roles";
import { ADMIN_ROLES, MANAGER_ROLES } from "../../../config/roles";

// ─── Item Types ──────────────────────────────────────────────────────────────

export interface NavItemType {
  id: string;
  title: string;
  icon: any;
  href: string;
  disabled?: boolean;
  premiumOnly?: boolean;
  roles?: AppRole[];
}

export interface NavGroupType {
  id: string;
  title: string;
  icon: any;
  roles?: AppRole[];
  children: NavItemType[];
}

export type SidebarItem = NavGroupType;

// ─── Menu Definition ─────────────────────────────────────────────────────────

const Menuitems: SidebarItem[] = [
  // ── Overview ──────────────────────────────────────────────────────────────
  {
    id: "group-overview",
    title: "Overview",
    icon: IconLayoutDashboard,
    roles: [...MANAGER_ROLES],
    children: [
      {
        id: uniqueId(),
        title: "Dashboard",
        icon: IconLayoutDashboard,
        href: "/dashboard",
        roles: [...MANAGER_ROLES],
      },
    ],
  },

  // ── Operations ────────────────────────────────────────────────────────────
  {
    id: "group-operations",
    title: "Operations",
    icon: IconShoppingCart,
    children: [
      {
        id: uniqueId(),
        title: "Point of Sale",
        icon: IconShoppingCart,
        href: "/pos",
        roles: [...MANAGER_ROLES, "CASHIER"],
      },
      {
        id: uniqueId(),
        title: "Orders",
        icon: IconReceipt,
        href: "/orders",
        roles: [...MANAGER_ROLES, "CASHIER"],
      },
      {
        id: uniqueId(),
        title: "Waitlist",
        icon: IconListCheck,
        href: "/waitlist",
        premiumOnly: true,
        roles: [...MANAGER_ROLES],
      },
      {
        id: uniqueId(),
        title: "Tables & Floor",
        icon: IconTable,
        href: "/tables",
        roles: [...MANAGER_ROLES, "WAITER", "CASHIER"],
      },
      {
        id: uniqueId(),
        title: "Reservations",
        icon: IconCalendarEvent,
        href: "/reservations",
        roles: [...MANAGER_ROLES, "CASHIER"],
      },
      {
        id: uniqueId(),
        title: "Kitchen Display",
        icon: IconChefHat,
        href: "/kitchen",
        roles: [...MANAGER_ROLES, "CHEF"],
      },
    ],
  },

  // ── Menu Management ───────────────────────────────────────────────────────
  {
    id: "group-menu",
    title: "Menu",
    icon: IconSalad,
    roles: [...MANAGER_ROLES, "CHEF"] as AppRole[],
    children: [
      {
        id: uniqueId(),
        title: "Categories",
        icon: IconSalad,
        href: "/menu/categories",
        roles: [...MANAGER_ROLES],
      },
      {
        id: uniqueId(),
        title: "Menu Items",
        icon: IconToolsKitchen2,
        href: "/menu/items",
        roles: [...MANAGER_ROLES],
      },
      {
        id: uniqueId(),
        title: "Recipes",
        icon: IconFlask,
        href: "/menu/recipes",
        premiumOnly: true,
        roles: [...MANAGER_ROLES, "CHEF"] as AppRole[],
      },
    ],
  },

  // ── Customers ─────────────────────────────────────────────────────────────
  {
    id: "group-customers",
    title: "Customers",
    icon: IconUsers,
    roles: [...MANAGER_ROLES],
    children: [
      {
        id: uniqueId(),
        title: "Customers",
        icon: IconUsers,
        href: "/customers",
        premiumOnly: true,
        roles: [...MANAGER_ROLES],
      },
      {
        id: uniqueId(),
        title: "Loyalty Program",
        icon: IconStar,
        href: "/loyalty",
        premiumOnly: true,
        roles: [...MANAGER_ROLES],
      },
    ],
  },

  // ── Inventory ─────────────────────────────────────────────────────────────
  {
    id: "group-inventory",
    title: "Inventory",
    icon: IconPackage,
    roles: [...MANAGER_ROLES],
    children: [
      {
        id: uniqueId(),
        title: "Inventory",
        icon: IconPackage,
        href: "/inventory",
        premiumOnly: true,
        roles: [...MANAGER_ROLES],
      },
      {
        id: uniqueId(),
        title: "Suppliers",
        icon: IconTruck,
        href: "/suppliers",
        premiumOnly: true,
        roles: [...MANAGER_ROLES],
      },
    ],
  },

  // ── Delivery ──────────────────────────────────────────────────────────────
  {
    id: "group-delivery",
    title: "Delivery",
    icon: IconMotorbike,
    roles: [...MANAGER_ROLES, "CASHIER"] as AppRole[],
    children: [
      {
        id: uniqueId(),
        title: "Delivery Orders",
        icon: IconMotorbike,
        href: "/delivery",
        premiumOnly: true,
        roles: [...MANAGER_ROLES, "CASHIER"] as AppRole[],
      },
    ],
  },

  // ── Human Resources ───────────────────────────────────────────────────────
  {
    id: "group-hr",
    title: "Human Resources",
    icon: IconUserCheck,
    roles: [...MANAGER_ROLES],
    children: [
      {
        id: uniqueId(),
        title: "Employees",
        icon: IconUserCheck,
        href: "/employees",
        premiumOnly: true,
        roles: [...ADMIN_ROLES, "BRANCH_MANAGER"] as AppRole[],
      },
      {
        id: uniqueId(),
        title: "Attendance",
        icon: IconCalendarEvent,
        href: "/attendance",
        premiumOnly: true,
        roles: [...ADMIN_ROLES, "BRANCH_MANAGER"] as AppRole[],
      },
      {
        id: uniqueId(),
        title: "Staff Clock-In QR",
        icon: IconFingerprint,
        href: "/attendance/qr",
        premiumOnly: true,
        roles: [...ADMIN_ROLES, "BRANCH_MANAGER"] as AppRole[],
      },
    ],
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  {
    id: "group-finance",
    title: "Finance",
    icon: IconChartPie,
    roles: [...MANAGER_ROLES],
    children: [
      {
        id: uniqueId(),
        title: "Revenue Reports",
        icon: IconChartBar,
        href: "/analytics/revenue",
        roles: [...MANAGER_ROLES],
      },
      {
        id: uniqueId(),
        title: "Expenses",
        icon: IconCurrencyDollar,
        href: "/analytics/expenses",
        premiumOnly: true,
        roles: [...MANAGER_ROLES],
      },
      {
        id: uniqueId(),
        title: "Transactions",
        icon: IconReportMoney,
        href: "/analytics/transactions",
        premiumOnly: true,
        roles: [...MANAGER_ROLES],
      },
    ],
  },

  // ── Administration ────────────────────────────────────────────────────────
  {
    id: "group-admin",
    title: "Administration",
    icon: IconTool,
    roles: [...ADMIN_ROLES],
    children: [
      {
        id: uniqueId(),
        title: "Branches",
        icon: IconBuildingStore,
        href: "/branches",
        premiumOnly: true,
        roles: [...ADMIN_ROLES],
      },
      {
        id: uniqueId(),
        title: "QR Codes",
        icon: IconQrcode,
        href: "/qr-codes",
        roles: [...ADMIN_ROLES, "BRANCH_MANAGER"] as AppRole[],
      },
      {
        id: uniqueId(),
        title: "Floor Plan Editor",
        icon: IconLayoutDashboard,
        href: "/floor-plan",
        roles: [...ADMIN_ROLES, "BRANCH_MANAGER"] as AppRole[],
      },
      {
        id: uniqueId(),
        title: "Kitchen Stations",
        icon: IconToolsKitchen2,
        href: "/kitchen-stations",
        roles: [...ADMIN_ROLES, "BRANCH_MANAGER"] as AppRole[],
      },
      {
        id: uniqueId(),
        title: "Roles & Permissions",
        icon: IconShield,
        href: "/roles",
        roles: [...ADMIN_ROLES],
      },
      {
        id: uniqueId(),
        title: "Users",
        icon: IconUsers,
        href: "/users",
        roles: [...ADMIN_ROLES],
      },
      {
        id: uniqueId(),
        title: "Settings",
        icon: IconSettings,
        href: "/settings",
        roles: [...ADMIN_ROLES],
      },
      {
        id: uniqueId(),
        title: "Billing & Subscription",
        icon: IconCreditCard,
        href: "/settings/billing",
        roles: [...ADMIN_ROLES],
      },
    ],
  },
];

export default Menuitems;
