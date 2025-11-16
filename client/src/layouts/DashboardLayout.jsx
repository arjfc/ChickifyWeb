// DashboardLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation, useNavigate  } from "react-router-dom";
import { HiMagnifyingGlass, HiBars3 } from "react-icons/hi2";
import { IoMdOptions } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { LuBell, LuShoppingBag, LuTruck } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";


function hoursAgo(ts) {
  if (!ts) return "—";
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return "—";
  const diffMs = Date.now() - t;
  const hrs = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  return hrs < 1 ? "< 1 hr ago" : `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
}


export default function DashboardLayout() {
  const { user, getRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ---- sidebar (functional again)
  const [isOpen, setIsOpen] = useState(false);

  // ---- role
  const [role, setRole] = useState(null);
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

    // ---- notifications (mocked for now)
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: 1, title: "Order Placed", body: "Thank you for your order! We’re preparing it now. Stay tuned for updates.", time: "8hrs ago", icon: "bag", read: false },
    { id: 2, title: "Order Shipped", body: "Good news! Your order is on its way.", time: "8hrs ago", icon: "truck", read: false },
    { id: 3, title: "Order Shipped", body: "Good news! Your order is on its way.", time: "8hrs ago", icon: "truck", read: true },
  ]);
  const unread = notifs.filter(n => !n.read).length;

  const notifRef = useRef(null);

  const markAllAsRead = () => setNotifs((list) => list.map(n => ({ ...n, read: true })));
  const markOneAsRead = (id) => setNotifs((list) => list.map(n => (n.id === id ? { ...n, read: true } : n)));
  const markOneAsUnread = (id) => setNotifs((list) => list.map(n => (n.id === id ? { ...n, read: false } : n)));
  const removeOne = (id) => setNotifs((list) => list.filter(n => n.id !== id));

  useEffect(() => {
    const onClickAway = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("click", onClickAway);
    return () => document.removeEventListener("click", onClickAway);
  }, []);

  


  const pageTitles = {
    // superadmin
    "/super-admin": "Dashboard",
    "/super-admin/users": "User Management",
    "/super-admin/suspicious-activities": "Suspicious Activities",
    "/super-admin/product-management": "Product Management",
    "/super-admin/orders": "Orders",
    "/super-admin/pricing": "Pricing Management",
    "/super-admin/remittance": "Remittance",
    "/super-admin/activity-logs": "Activity Logs",
    "/super-admin/reports": "Reports",
    "/super-admin/settings": "Account Settings",
    "/super-admin/users/view-users": "Admin's Profile",
    "/super-admin/users/edit-users": "Edit Admin's Profile",
    "/super-admin/notifications": "Notifications",


    // admin
    "/admin/notifications": "Notifications",
    "/admin": "Dashboard",
    "/admin/users": "User Management",
    "/admin/users/view-users": "Farmer's Profile",
    "/admin/users/edit-users": "Edit Farmer's Profile",
    "/admin/products/egg-inventory": "Egg Inventory",
    "/admin/products/details": "Product Details",
    "/admin/products/discount-management": "Discount Management",
    "/admin/products/price-management": "Price Management",
    "/admin/expenses/business": "Business",
    "/admin/expenses/expense": "Expense",
    "/admin/expenses/feed-monitoring": "Feed Monitoring",
    "/admin/expenses/feed-entry": "Feed Entry",
    "/admin/order-status": "Order Status",
    "/admin/messages": "Messages",
    "/admin/complaints": "Refunds",
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
      {/* ✅ functional sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* shift content based on sidebar state */}
      <div className={`w-full px-20 py-10 transition-all duration-300 ease-in-out ${isOpen ? "ml-60" : "ml-20"}`}>
        {!hideHeader ? (
          <header className="flex flex-row mb-6 pb-3 w-full gap-4 items-center">
            {/* hamburger toggler */}
            {/* <button
              onClick={() => setIsOpen(v => !v)}
              className="grid place-items-center w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            > 
              <HiBars3 className="w-6 h-6 text-gray-700" />
            </button> */}

            <h1 className="text-4xl font-bold capitalize text-primaryYellow shrink-0">
              {currentTitle}
            </h1>

            {/* Search */}
            <div className="relative flex-grow">
              <HiMagnifyingGlass className="absolute inset-y-0 left-4 my-auto w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-gray-200 rounded-full bg-gray-50 pl-12 pr-12 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryYellow focus:border-primaryYellow transition"
              />
              <IoMdOptions className="absolute inset-y-0 right-4 my-auto w-5 h-5 text-gray-500 cursor-pointer hover:text-primaryYellow transition" />
            </div>

            {/* Bell + Profile (bell first, profile next) */}
            <div className="flex items-center gap-3">
              {/* Bell */}
              <div ref={notifRef} className="relative">
                <button
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative grid place-items-center w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                >
                  <LuBell className="w-6 h-6 text-gray-700" />
                  {unread > 0 && (
                    <span
                      className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primaryYellow ring-2 ring-white"
                      title={`${unread} unread`}
                    />
                  )}
                </button>

                {/* ⬇️ replace your dropdown JSX with this block */}
{notifOpen && (
  <div className="absolute right-0 mt-3 w-[520px] max-w-[90vw] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-50">
    <div className="flex items-start justify-between px-6 pt-5 pb-3">
      <div>
        <p className="text-xl font-semibold text-gray-900">Notifications</p>
        <p className="text-sm text-gray-500">
          You have {unread} unread notification{unread === 1 ? "" : "s"}
        </p>
      </div>
      <button
        onClick={markAllAsRead}
        disabled={unread === 0}
        className={`font-semibold text-sm hover:underline ${
          unread === 0 ? "text-gray-400 cursor-not-allowed" : "text-primaryYellow"
        }`}
      >
        Mark all as read
      </button>
    </div>

    <ul className="max-h-[360px] overflow-auto divide-y divide-gray-100">
      {notifs.map((n) => {
        const isUnread = !n.read;
        return (
          <li
            key={n.id}
            role="button"
            tabIndex={0}
            onClick={() => markOneAsRead(n.id)}
            onKeyDown={(e) => e.key === "Enter" && markOneAsRead(n.id)}
            className="flex gap-4 px-6 py-4 bg-white cursor-pointer hover:bg-gray-50 focus:outline-none"
            aria-label={`${n.title} - ${isUnread ? "unread" : "read"}`}
          >
            {/* left dot */}
            <span
              className={`mt-2 h-2.5 w-2.5 rounded-full ${
                isUnread ? "bg-primaryYellow" : "bg-gray-300"
              }`}
            />
            {/* icon */}
            <div
              className={`grid place-items-center w-11 h-11 rounded-xl ${
                isUnread ? "bg-yellow-50" : "bg-gray-100"
              }`}
            >
              {n.icon === "truck" ? (
                <LuTruck className={`w-6 h-6 ${isUnread ? "text-primaryYellow" : "text-gray-400"}`} />
              ) : (
                <LuShoppingBag className={`w-6 h-6 ${isUnread ? "text-primaryYellow" : "text-gray-400"}`} />
              )}
            </div>
            {/* text */}
            <div className="flex-1">
              <p className={`${isUnread ? "text-primaryYellow font-semibold" : "text-gray-800 font-medium"}`}>
                {n.title}
              </p>
              <p className={`text-sm leading-snug ${isUnread ? "text-gray-700" : "text-gray-600"}`}>
                {n.body}
              </p>
              <p className="text-gray-400 text-xs mt-1">{n.time}</p>
            </div>
          </li>
        );
      })}
    </ul>

          <button
  className="w-full text-center py-3 text-gray-700 font-medium hover:bg-gray-50"
onClick={() => {
  setNotifOpen(false);
      const base = role === "superadmin" ? "/super-admin" : "/admin";
     navigate(`${base}/notifications`);
   }}
 >
    View all Notifications
  </button>
       </div>
      )}
                
              </div>

              {/* Profile */}
              <div className="flex items-center gap-4 cursor-pointer rounded-xl px-3 py-2 hover:bg-gray-100 transition">
                <div className="flex flex-col leading-tight">
                  <h1 className="font-semibold text-gray-800">{displayName}</h1>
                  {!roleLoading && roleLabel && (
                    <p className="text-sm text-gray-500 capitalize">{roleLabel}</p>
                  )}
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
                  <MdAccountCircle className="w-10 h-10 text-gray-600" />
                </div>
              </div>
            </div>
          </header>
        ) : (
          // compact header
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-3">
              {/* <button
                onClick={() => setIsOpen(v => !v)}
                className="grid place-items-center w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
              >
                <HiBars3 className="w-6 h-6 text-gray-700" />
              </button> */}
              <div className="flex flex-col leading-tight">
                <p className="text-primaryYellow text-3xl font-bold">{currentTitle}</p>
             {(() => {
      const viewed = location.state?.user;          // passed from the list/table when you navigated
      const onProfileView = location.pathname.includes("view-users");
      const onProfileEdit = location.pathname.includes("edit-users");

  // choose a timestamp field that exists on your user
  const lastTs =
    viewed?.last_seen ||
    viewed?.lastSignInAt ||
    viewed?.last_sign_in_at ||
    viewed?.updated_at; 

  const subline = onProfileView
    ? `Last online: ${hoursAgo(lastTs)}`        // view page: with label
    : onProfileEdit
    ? `Last online: ${hoursAgo(lastTs)}`                       // edit page: hours only
    : (location.pathname.includes("super-admin") ? "Super Admin" : "Admin");

  return (
    <p className="text-lg text-gray-500 font-normal">{subline}</p>
  );
})()}
              </div>
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

        {/* Page Content */} <Outlet
          context={{
          notifs,
          setNotifs,
          markAllAsRead,
          markOneAsRead,
          markOneAsUnread,
          removeOne,
        }}/>
      </div>
    </div>
  );
}















// import React, { useState, useEffect } from "react";
// import Sidebar from "../components/Sidebar";
// import { Outlet, useLocation } from "react-router-dom";
// import { HiMagnifyingGlass } from "react-icons/hi2";
// import { IoMdOptions } from "react-icons/io";
// import { MdAccountCircle } from "react-icons/md";
// import { useAuth } from "../context/AuthContext";

// export default function DashboardLayout() {
//   const { user, getRole } = useAuth();
//   const location = useLocation();
//   const [role, setRole] = useState(null);          // "superadmin" | "admin" | null
//   const [isOpen, setIsOpen] = useState(false);
//   const [roleLoading, setRoleLoading] = useState(true);
//   useEffect(() => {
//     let on = true;
//     (async () => {
//       try {
//         const r = await getRole();
//         if (on) setRole(r);
//       } finally {
//         if (on) setRoleLoading(false);
//       }
//     })();
//     return () => { on = false; };
//   }, [getRole]);

//   const roleLabel =
//     role === "superadmin" ? "Super Admin" :
//     role === "admin"      ? "Admin" :
//     "";

//   const pageTitles = {
//     // superadmin
//     "/super-admin": "Dashboard",
//     "/super-admin/users": "User Management",
//     "/super-admin/suspicious-activities": "Suspicious Activities",
//     "/super-admin/product-management": "Product Management",
//     "/super-admin/orders": "Orders",
//     "/super-admin/pricing": "Pricing Management",
//     "/super-admin/activity-logs": "Activity Logs",
//     "/super-admin/reports": "Reports",
//     "/super-admin/settings": "Account Settings",
//     "/super-admin/users/view-users": "Admin's Profile",
//     "/super-admin/users/edit-users": "Edit Admin's Profile",

//     // admin
//     "/admin": "Dashboard",
//     "/admin/users": "User Management",
//     "/admin/users/view-users": "Farmer's Profile",
//     "/admin/users/edit-users": "Edit Farmer's Profile",
//     "/admin/products/egg-pickup": "Egg Pickup",
//     "/admin/products/details": "Product Details",
//     "/admin/products/discount-management": "Discount Management",
//     "/admin/products/price-management": "Price Management",
//     "/admin/expenses/business": "Business",
//     "/admin/expenses/feed-monitoring": "Feed Monitoring",
//     "/admin/order-status": "Order Status",
//     "/admin/messages": "Messages",
//     "/admin/complaints": "Complaints",
//     "/admin/payout-request": "Payout Request",
//     "/admin/reports": "Reports",
//     "/admin/settings": "Account Settings",
//   };

//   const excludedPaths = [
//     "/super-admin/settings",
//     "/super-admin/users/view-users",
//     "/super-admin/users/edit-users",
//     "/super-admin/reports/some-subpage",
//     "/admin/settings",
//     "/admin/users/view-users",
//     "/admin/users/edit-users",
//   ];

//   const hideHeader = excludedPaths.includes(location.pathname);
//   const currentTitle = pageTitles[location.pathname] || "Page";

//   const displayName =
//     user?.user_metadata?.firstName && user?.user_metadata?.lastName
//       ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
//       : user?.email || "Account";

//   return (
//     <div className="flex font-poppins" id="dashboard">
//       <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
//       <div className={`w-full px-20 py-10 transition-all duration-300 ease-in-out ${isOpen ? "ml-60" : "ml-20"}`}>
//         {!hideHeader ? (
//           <header className="flex flex-row mb-6 pb-3 w-full gap-4 items-center">
//             <h1 className="text-4xl font-bold capitalize text-primaryYellow shrink-0">
//               {currentTitle}
//             </h1>
//             <div className="relative flex-grow">
//               <HiMagnifyingGlass className="absolute inset-y-0 left-4 my-auto w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-full border border-gray-200 rounded-full bg-gray-50 pl-12 pr-12 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryYellow focus:border-primaryYellow transition"
//               />
//               <IoMdOptions className="absolute inset-y-0 right-4 my-auto w-5 h-5 text-gray-500 cursor-pointer hover:text-primaryYellow transition" />
//             </div>
//             <div className="flex items-center gap-4 cursor-pointer rounded-xl px-3 py-2 hover:bg-gray-100 transition">
//               <div className="flex flex-col leading-tight">
//                 <h1 className="font-semibold text-gray-800">{displayName}</h1>
//                {!roleLoading && roleLabel && (<p className="text-sm text-gray-500 capitalize">{roleLabel}</p>)}
//               </div>
//               <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
//                 <MdAccountCircle className="w-10 h-10 text-gray-600" />
//               </div>
//             </div>
//           </header>
//         ) : (
//           <div className="flex flex-row justify-between items-center">
//             <div className="flex flex-col leading-tight">
//               <p className="text-primaryYellow text-3xl font-bold">{currentTitle}</p>
//               <p className="font-semibold text-lg text-gray-500">
//                 {location.pathname.includes("super-admin") ? "Super Admin" : "Admin"}
//               </p>
//             </div>
//             <div className="flex flex-col leading-tight items-end">
//               {location.pathname.includes("edit-users") ? (
//                 <button className="cursor-pointer text-base rounded-lg text-white font-bold shadow-md bg-primaryYellow px-4 py-3">
//                   {location.pathname.includes("super-admin") ? "Remove Admin Access" : "Suspend"}
//                 </button>
//               ) : (
//                 <>
//                   <p className="text-gray-500 text-lg font-semibold">Registration Date</p>
//                   <p className="text-gray-500">Aug. 20, 2026</p>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Page Content */}
//         <Outlet />
//       </div>
//     </div>
//   );
// }
