import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { IoMdOptions } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, getRole } = useAuth();
  const location = useLocation();
  const [role, setRole] = useState(null);          // "superadmin" | "admin" | null
  const [isOpen, setIsOpen] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const r = await getRole();
        if (on) setRole(r);
      } finally {
        if (on) setRoleLoading(false);
      }
    })();
    return () => { on = false; };
  }, [getRole]);

  const roleLabel =
    role === "superadmin" ? "Super Admin" :
    role === "admin"      ? "Admin" :
    "";

  const pageTitles = {
    // superadmin
    "/super-admin": "Dashboard",
    "/super-admin/users": "User Management",
    "/super-admin/product-management": "Product Management",
    "/super-admin/orders": "Orders",
    "/super-admin/pricing": "Pricing Management",
    "/super-admin/activity-logs": "Activity Logs",
    "/super-admin/reports": "Reports",
    "/super-admin/settings": "Account Settings",
    "/super-admin/users/view-users": "Admin's Profile",
    "/super-admin/users/edit-users": "Edit Admin's Profile",

    // admin
    "/admin": "Dashboard",
    "/admin/users": "User Management",
    "/admin/users/view-users": "Farmer's Profile",
    "/admin/users/edit-users": "Edit Farmer's Profile",
    "/admin/products/egg-pickup": "Egg Pickup",
    "/admin/products/details": "Product Details",
    "/admin/products/discount-management": "Discount Management",
    "/admin/products/price-management": "Price Management",
    "/admin/expenses/business": "Business",
    "/admin/expenses/feed-monitoring": "Feed Monitoring",
    "/admin/order-status": "Order Status",
    "/admin/messages": "Messages",
    "/admin/complaints": "Complaints",
    "/admin/payout-request": "Payout Request",
    "/admin/reports": "Reports",
    "/admin/settings": "Account Settings",
  };

  const excludedPaths = [
    "/super-admin/settings",
    "/super-admin/users/view-users",
    "/super-admin/users/edit-users",
    "/super-admin/reports/some-subpage",
    "/admin/settings",
    "/admin/users/view-users",
    "/admin/users/edit-users",
  ];

  const hideHeader = excludedPaths.includes(location.pathname);
  const currentTitle = pageTitles[location.pathname] || "Page";

  const displayName =
    user?.user_metadata?.firstName && user?.user_metadata?.lastName
      ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
      : user?.email || "Account";

  return (
    <div className="flex font-poppins" id="dashboard">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`w-full px-20 py-10 transition-all duration-300 ease-in-out ${isOpen ? "ml-60" : "ml-20"}`}>
        {!hideHeader ? (
          <header className="flex flex-row mb-6 pb-3 w-full gap-4 items-center">
            <h1 className="text-4xl font-bold capitalize text-primaryYellow shrink-0">
              {currentTitle}
            </h1>
            <div className="relative flex-grow">
              <HiMagnifyingGlass className="absolute inset-y-0 left-4 my-auto w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-gray-200 rounded-full bg-gray-50 pl-12 pr-12 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryYellow focus:border-primaryYellow transition"
              />
              <IoMdOptions className="absolute inset-y-0 right-4 my-auto w-5 h-5 text-gray-500 cursor-pointer hover:text-primaryYellow transition" />
            </div>
            <div className="flex items-center gap-4 cursor-pointer rounded-xl px-3 py-2 hover:bg-gray-100 transition">
              <div className="flex flex-col leading-tight">
                <h1 className="font-semibold text-gray-800">{displayName}</h1>
               {!roleLoading && roleLabel && (<p className="text-sm text-gray-500 capitalize">{roleLabel}</p>)}
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
                <MdAccountCircle className="w-10 h-10 text-gray-600" />
              </div>
            </div>
          </header>
        ) : (
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col leading-tight">
              <p className="text-primaryYellow text-3xl font-bold">{currentTitle}</p>
              <p className="font-semibold text-lg text-gray-500">
                {location.pathname.includes("super-admin") ? "Super Admin" : "Admin"}
              </p>
            </div>
            <div className="flex flex-col leading-tight items-end">
              {location.pathname.includes("edit-users") ? (
                <button className="cursor-pointer text-base rounded-lg text-white font-bold shadow-md bg-primaryYellow px-4 py-3">
                  {location.pathname.includes("super-admin") ? "Remove Admin Access" : "Suspend"}
                </button>
              ) : (
                <>
                  <p className="text-gray-500 text-lg font-semibold">Registration Date</p>
                  <p className="text-gray-500">Aug. 20, 2026</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
}
