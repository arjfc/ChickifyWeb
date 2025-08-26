import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import {
  Home,
  SignIn,
  SignUp,
  // SuperAdmin
  ProductManagement,
  SuperAdminDashboard,
  UserManagement,
  Orders,
  PricingManagement,
  ActivityLogs,
  Reports,
  Settings,

  // Admin
  AdminDashboard,
  AdminUserManagement,
  ProductDetails,
  DiscountManagement,
  OrderStatus,
  Complaints,
  PayoutRequest,
  AdminReports,
  AdminSettings
} from "./pages";

import { default as SuperAdminUserView } from "./components/super-admin/users/ViewAdmin";
import { default as SuperAdminUserEdit } from "./components/super-admin/users/EditAdmin";
import { default as AdminUserView } from "./components/admin/users/ViewAdmin";
import { default as AdminUserEdit } from "./components/admin/users/EditAdmin";
import PriceManagement from "./pages/dashboard/admin/PriceManagement";
import EggPickUp from "./pages/dashboard/admin/EggPickUp";
import FeedMonitoring from "./pages/dashboard/admin/FeedMonitoring";
import Business from "./pages/dashboard/admin/Business";
import Messages from "./pages/dashboard/admin/Messages";
import NotFound from "./pages/404";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  return (
  <LocalizationProvider dateAdapter={AdapterDayjs}>

    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Dashboard Pages */}
      <Route element={<DashboardLayout />}>

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/users" element={<UserManagement />} />
        <Route path="/super-admin/users/view-users" element={<SuperAdminUserView />} />
        <Route path="/super-admin/users/edit-users" element={<SuperAdminUserEdit />} />
        <Route path="/super-admin/orders" element={<Orders />} />
        <Route
          path="/super-admin/product-management"
          element={<ProductManagement />}
        />
        <Route path="/super-admin/pricing" element={<PricingManagement />} />
        <Route path="/super-admin/activity-logs" element={<ActivityLogs />} />
        <Route path="/super-admin/reports" element={<Reports />} />
        <Route path="/super-admin/settings" element={<Settings />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/users/view-users" element={<AdminUserView />} />
        <Route path="/admin/users/edit-users" element={<AdminUserEdit />} />
        <Route path="/admin/products/product-details" element={<ProductDetails />} />
        <Route path="/admin/products/egg-pickup" element={<EggPickUp />} />
        <Route path="/admin/products/details" element={<ProductDetails />} />
        <Route path="/admin/products/discount-management" element={<DiscountManagement />} />
        <Route path="/admin/products/price-management" element={<PriceManagement />} />
        <Route path="/admin/expenses/feed-monitoring" element={<FeedMonitoring />} />
        <Route path="/admin/expenses/business" element={<Business />} />
        <Route path="/admin/order-status" element={<OrderStatus />} />
        <Route path="/admin/complaints" element={<Complaints />} />
        <Route path="/admin/messages" element={<Messages />} />
        <Route path="/admin/payout-request" element={<PayoutRequest />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

      </Route>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
  </LocalizationProvider>
  );
}

export default App;
