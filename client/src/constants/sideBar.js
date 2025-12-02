// src/constants/sidebar.js

// Icons
import { FiSettings } from "react-icons/fi";
import { CiGrid42 } from "react-icons/ci";
import { LuUserCog, LuClock2, LuReceipt, LuMessageCircleMore,LuStar} from "react-icons/lu";
import { RiShoppingBag3Line } from "react-icons/ri";
import { GrBasket } from "react-icons/gr";
import { TbCoins } from "react-icons/tb";
import { IoFolderOpenOutline } from "react-icons/io5";
import { IoMdMegaphone } from "react-icons/io";


export const sidebarItems = [
  // Shared
  {
    label: "Dashboard",
    path: { "super-admin": "/super-admin", admin: "/admin" },
    icon: CiGrid42,
    roles: ["super-admin", "admin"],
  },

  // ---- User Management (split) ----
  // Super Admin: dropdown with children
  {
    label: "User Management",
    icon: LuUserCog,
    roles: ["super-admin"],
    children: [
      {
        label: "Manage Users",
        path: { "super-admin": "/super-admin/users" },
        roles: ["super-admin"],
      },
      {
        label: "Suspicious Activities",
        path: { "super-admin": "/super-admin/suspicious-activities" },
        roles: ["super-admin"],
      },
    ],
  },
  // Admin: single link (no dropdown)
  {
    label: "User Management",
    path: { admin: "/admin/users" },
    icon: LuUserCog,
    roles: ["admin"],
  },

  // Super Admin only
  {
    label: "Product Management",
    path: { "super-admin": "/super-admin/product-management" },
    icon: RiShoppingBag3Line,
    roles: ["super-admin"],
  },
  {
    label: "Orders",
    path: { "super-admin": "/super-admin/orders" },
    icon: GrBasket,
    roles: ["super-admin"],
  },
  {
    label: "Pricing Management",
    path: { "super-admin": "/super-admin/pricing" },
    icon: TbCoins,
    roles: ["super-admin"],
  },
  // ✅ NEW: Remittance for Super Admin
  {
    label: "Remittance",
    path: { "super-admin": "/super-admin/remittance" },
    icon: LuReceipt,
    roles: ["super-admin"],
  },
  {
    label: "Activity Logs",
    path: { "super-admin": "/super-admin/activity-logs" },
    icon: LuClock2,
    roles: ["super-admin"],
  },

  // Admin only
  {
    label: "Products",
    icon: RiShoppingBag3Line,
    roles: ["admin"],
    children: [
      {
        label: "Egg Inventory",
        path: { admin: "/admin/products/egg-inventory" },
      },
      { label: "Product Details", path: { admin: "/admin/products/details" } },
      // { label: "Discount Management", path: { admin: "/admin/products/discount-management" } },
      // {
      //   label: "Price Management",
      //   path: { admin: "/admin/products/price-management" },
      // },
    ],
  },
  // {
  //   label: "Expenses",
  //   icon: TbCoins,
  //   roles: ["admin"],
  //   children: [
  //     {
  //       label: "Feed Monitoring",
  //       path: { admin: "/admin/expenses/feed-monitoring" },
  //     },
  //     { label: "Feed Entry", path: { admin: "/admin/expenses/feed-entry" } },
  //     // { label: "Business",        path: { admin: "/admin/expenses/business" } },
  //     { label: "Expense", path: { admin: "/admin/expenses/expense" } },
  //   ],
  // },
    {
    label: "Expenses",
    icon: TbCoins,
    roles: ["admin"],
    path: { admin: "/admin/expenses/expense" } },
  
  {
    label: "Order Status",
    path: { admin: "/admin/order-status" },
    icon: GrBasket,
    roles: ["admin"],
  },
  {
    label: "Refunds",
    path: { admin: "/admin/complaints" },
    icon: IoMdMegaphone,
    roles: ["admin"],
  },
  {
    label: "Messages",
    path: { admin: "/admin/messages" },
    icon: LuMessageCircleMore,
    roles: ["admin"],
  },
  {
    label: "Payout Request",
    path: { admin: "/admin/payout-request" },
    icon: LuReceipt,
    roles: ["admin"],
  },
  {
    label: "Reviews",
    path: { admin: "/admin/reviews" }, 
    icon: LuStar,
    roles: ["admin"],
  },
  

  // Shared
  {
    label: "Reports",
    path: {
      "super-admin": "/super-admin/reports",
      admin: "/admin/reports",
    },
    icon: IoFolderOpenOutline,
    roles: ["super-admin", "admin"],
  },
  {
    label: "Account Settings",
    path: {
      "super-admin": "/super-admin/settings",
      admin: "/admin/settings",
    },
    icon: FiSettings,
    roles: ["super-admin", "admin"],
  },
];

export default sidebarItems;
