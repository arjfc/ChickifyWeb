import { FiSettings, FiBookOpen } from "react-icons/fi";
import { CiGrid42 } from "react-icons/ci";
import {
  LuUserCog,
  LuClock2,
  LuReceipt,
  LuMessageCircleMore,
  LuStar,
  LuPackage,
  LuFileText,
} from "react-icons/lu";
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

  {
    label: "User Management",
    icon: LuUserCog,
    roles: ["super-admin", "admin"],
    path: {
      "super-admin": "/super-admin/users",
      admin: "/admin/users",
    },
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
    ],
  },
  {
    label: "Expenses",
    icon: TbCoins,
    roles: ["admin"],
    children: [
      {
        label: "Feed Monitoring",
        path: { admin: "/admin/expenses/feed-monitoring" },
      },
      { label: "Feed Entry", path: { admin: "/admin/expenses/feed-entry" } },
      { label: "Expense", path: { admin: "/admin/expenses/expense" } },
    ],
  },
  {
    label: "Service Plan",
    icon: LuPackage,
    roles: ["admin"],
    path: { admin: "/admin/service-plan" },
  },

  {
    label: "Poultry Guide",
    icon: FiBookOpen,
    roles: ["admin"],
    children: [
      {
        label: "Feeds",
        path: {
          "super-admin": "/admin/feeds",
          admin: "/admin/feeds",
        },
        roles: ["super-admin", "admin"],
      },
      {
        label: "All About Eggs",
        path: {
          "super-admin": "/admin/allabouteggs",
          admin: "/admin/allabouteggs",
        },
        roles: ["super-admin", "admin"],
      },
      {
        label: "Cage Management",
        path: {
          "super-admin": "/admin/cagemanagement",
          admin: "/admin/cagemanagement",
        },
        roles: ["super-admin", "admin"],
      },
      {
        label: "Hen's Health",
        path: {
          "super-admin": "/admin/henshealth",
          admin: "/admin/henshealth",
        },
        roles: ["super-admin", "admin"],
      },
    ],
  },

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
  {
    label: "Contract",
    path: {admin: "/admin/contract"},
    icon: LuFileText,
    roles: ["admin"]
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