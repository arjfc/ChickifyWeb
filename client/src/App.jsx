// import { Routes, Route } from "react-router-dom";
// import PublicLayout from "./layouts/PublicLayout";
// import DashboardLayout from "./layouts/DashboardLayout";
// import { AuthProvider } from "./context/AuthContext";
// import RequireRole from "./context/RequireRole";
// import {
//   Home, SignIn, SignUp,
//   // SuperAdmin
//   ProductManagement, SuperAdminDashboard, UserManagement, Orders,
//   PricingManagement, ActivityLogs, Reports, Settings,
//   // Admin
//   AdminDashboard, AdminUserManagement, ProductDetails, DiscountManagement,
//   OrderStatus, Complaints, PayoutRequest, AdminReports, AdminSettings
// } from "./pages";
// import { default as SuperAdminUserView } from "./components/super-admin/users/ViewAdmin";
// import { default as SuperAdminUserEdit } from "./components/super-admin/users/EditAdmin";
// import { default as AdminUserView } from "./components/admin/users/ViewAdmin";
// import { default as AdminUserEdit } from "./components/admin/users/EditAdmin";
// import PriceManagement from "./pages/dashboard/admin/PriceManagement";
// import EggPickUp from "./pages/dashboard/admin/EggPickUp";
// import FeedMonitoring from "./pages/dashboard/admin/FeedMonitoring";
// import Business from "./pages/dashboard/admin/Business";
// import Messages from "./pages/dashboard/admin/Messages";
// import NotFound from "./pages/404";
// import NoAccess from "./pages/NoAccess"; // <- make sure this file exists
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// function App() {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <AuthProvider>
//         <Routes>
//           {/* Public */}
//           <Route element={<PublicLayout />}>
//             <Route path="/" element={<Home />} />
//             <Route path="/signin" element={<SignIn />} />
//             <Route path="/signup" element={<SignUp />} />
//             <Route path="/no-access" element={<NoAccess />} />
//           </Route>


//           {/* SUPERADMIN area (role = "superadmin") */}
//           <Route element={<RequireRole allow={["superadmin"]} />}>
//             <Route element={<DashboardLayout />}>
//               <Route index element={<SuperAdminDashboard />} />      {/* /super-admin */}
//               <Route path="users" element={<UserManagement />} />    {/* /super-admin/users */}
//               <Route path="users/view-users" element={<SuperAdminUserView />} />
//               <Route path="users/edit-users" element={<SuperAdminUserEdit />} />
//               <Route path="orders" element={<Orders />} />
//               <Route path="product-management" element={<ProductManagement />} />
//               <Route path="pricing" element={<PricingManagement />} />
//               <Route path="activity-logs" element={<ActivityLogs />} />
//               <Route path="reports" element={<Reports />} />
//               <Route path="settings" element={<Settings />} />
//             </Route>
//           </Route>

//           {/* ADMIN area (role = "admin") */}
//           <Route element={<RequireRole allow={["admin"]} />}>
//             <Route element={<DashboardLayout />}>
//               <Route index element={<AdminDashboard />} />           {/* /admin */}
//               <Route path="users" element={<AdminUserManagement />} />
//               <Route path="users/view-users" element={<AdminUserView />} />
//               <Route path="users/edit-users" element={<AdminUserEdit />} />
//               <Route path="products/product-details" element={<ProductDetails />} />
//               <Route path="products/egg-pickup" element={<EggPickUp />} />
//               <Route path="products/details" element={<ProductDetails />} />
//               <Route path="products/discount-management" element={<DiscountManagement />} />
//               <Route path="products/price-management" element={<PriceManagement />} />
//               <Route path="expenses/feed-monitoring" element={<FeedMonitoring />} />
//               <Route path="expenses/business" element={<Business />} />
//               <Route path="order-status" element={<OrderStatus />} />
//               <Route path="complaints" element={<Complaints />} />
//               <Route path="messages" element={<Messages />} />
//               <Route path="payout-request" element={<PayoutRequest />} />
//               <Route path="reports" element={<AdminReports />} />
//               <Route path="settings" element={<AdminSettings />} />
//             </Route>
//           </Route>
//         </Routes>
//       </AuthProvider>
//     </LocalizationProvider>
//   );
// }

// export default App;
// src/App.jsx


// App.jsx
import { Routes, Route } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import RequireRole from "./context/RequireRole";
import { useAuth } from "@/context/AuthContext";

import {
  Home, SignIn, SignUp,
  // SuperAdmin
  ProductManagement, SuperAdminDashboard, UserManagement, Orders,
  PricingManagement, ActivityLogs, Reports, Settings,
  // Admin
  AdminDashboard, AdminUserManagement, ProductDetails, DiscountManagement,
  OrderStatus, Complaints, PayoutRequest, AdminReports, AdminSettings
} from "./pages";

import SuperAdminUserView from "./components/super-admin/users/ViewAdmin";
import SuperAdminUserEdit from "./components/super-admin/users/EditAdmin";
import AdminUserView from "./components/admin/users/ViewAdmin";
import AdminUserEdit from "./components/admin/users/EditAdmin";
import PriceManagement from "./pages/dashboard/admin/PriceManagement";
import EggPickUp from "./pages/dashboard/admin/EggPickUp";
import FeedMonitoring from "./pages/dashboard/admin/FeedMonitoring";
import Business from "./pages/dashboard/admin/Business";
import Messages from "./pages/dashboard/admin/Messages";
import NotFound from "./pages/404";
import NoAccess from "./pages/NoAccess";

function AuthGate({ children }) {
  // ⛔️ Don’t render any routes until AuthProvider has restored the session.
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthGate>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Super Admin area (DB role is "superadmin") */}
          <Route element={<RequireRole allow={["superadmin"]} />}>
            <Route path="/super-admin" element={<DashboardLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/view-users" element={<SuperAdminUserView />} />
              <Route path="users/edit-users" element={<SuperAdminUserEdit />} />
              <Route path="orders" element={<Orders />} />
              <Route path="product-management" element={<ProductManagement />} />
              <Route path="pricing" element={<PricingManagement />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Admin area */}
          <Route element={<RequireRole allow={["admin"]} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="users/view-users" element={<AdminUserView />} />
              <Route path="users/edit-users" element={<AdminUserEdit />} />
              <Route path="products/product-details" element={<ProductDetails />} />
              <Route path="products/egg-pickup" element={<EggPickUp />} />
              <Route path="products/details" element={<ProductDetails />} />
              <Route path="products/discount-management" element={<DiscountManagement />} />
              <Route path="products/price-management" element={<PriceManagement />} />
              <Route path="expenses/feed-monitoring" element={<FeedMonitoring />} />
              <Route path="expenses/business" element={<Business />} />
              <Route path="order-status" element={<OrderStatus />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="messages" element={<Messages />} />
              <Route path="payout-request" element={<PayoutRequest />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="/no-access" element={<NoAccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthGate>
    </LocalizationProvider>
  );
}

