import { 
  FiHome, 
  FiUsers, 
  FiShoppingCart, 
  FiTag, 
  FiActivity, 
  FiBarChart2, 
  FiSettings 
} from "react-icons/fi";

import {CiGrid42} from "react-icons/ci"
import { LuUserCog } from "react-icons/lu"
import { RiShoppingBag3Line } from "react-icons/ri";
import { GrBasket } from "react-icons/gr";
import { TbCoins } from "react-icons/tb";
import { LuClock2, LuReceipt } from "react-icons/lu";
import { IoFolderOpenOutline } from "react-icons/io5";
import { IoMdMegaphone } from "react-icons/io";
import { LuTriangleAlert, LuMessageCircleMore } from "react-icons/lu";


export const sidebarItems = [
  {
    label: "Dashboard",
    path: {
      "super-admin": "/super-admin",
      admin: "/admin",
    },
    icon: CiGrid42,
    roles: ["super-admin", "admin"],
  },
  {
    label: "User Management",
    path: {
      "super-admin": "/super-admin/users",
      admin: "/admin/users",
    },
    icon: LuUserCog,
    roles: ["super-admin", "admin"],
  },
  // Items only for super-admin
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
  {
    label: "Activity Logs",
    path: { "super-admin": "/super-admin/activity-logs" },
    icon: LuClock2,
    roles: ["super-admin"],
  },
  // Items only for admin
  {
    label: "Products",
    icon: RiShoppingBag3Line,
    roles: ["admin"],
    children: [
      {
        label: "Egg Pick-up",
        path: { admin: "/admin/products/egg-pickup" },
      },
      {
        label: "Product Details",
        path: { admin: "/admin/products/details" },
      },
      {
        label: "Discount Management",
        path: { admin: "/admin/products/discount-management" },
      },
      {
        label: "Price Management",
        path: { admin: "/admin/products/price-management" },
      },
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
      {
        label: "Business",
        path: { admin: "/admin/expenses/business" },
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
    label: "Complaints",
    path: { admin: "/admin/complaints" },
    icon: IoMdMegaphone,
    roles: ["admin"],
  },
  {
    label: "Messagess",
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


