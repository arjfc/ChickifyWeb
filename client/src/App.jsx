import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import RequireRole from "./context/RequireRole";
import { useAuth } from "@/context/AuthContext";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));

const SuperAdminDashboard = lazy(() => import("./pages/dashboard/super-admin"));
const UserManagement = lazy(() => import("./pages/dashboard/super-admin/UserManagement"));
const ProductManagement = lazy(() => import("./pages/dashboard/super-admin/ProductManagement"));
const Orders = lazy(() => import("./pages/dashboard/super-admin/Orders"));
const PricingManagement = lazy(() => import("./pages/dashboard/super-admin/PricingManagement"));
const ActivityLogs = lazy(() => import("./pages/dashboard/super-admin/ActivityLogs"));
const Reports = lazy(() => import("./pages/dashboard/super-admin/Reports"));
const Settings = lazy(() => import("./pages/dashboard/super-admin/Settings"));
const SuspiciousActivities = lazy(() => import("./pages/dashboard/super-admin/SuspiciousActivities"));
const Remittance = lazy(() => import("./pages/dashboard/super-admin/Remittance"));

const AdminDashboard = lazy(() => import("./pages/dashboard/admin"));
const AdminUserManagement = lazy(() => import("./pages/dashboard/admin/UserManagement"));
const ProductDetails = lazy(() => import("./pages/dashboard/admin/ProductDetails"));
const DiscountManagement = lazy(() => import("./pages/dashboard/admin/DiscountManagement"));
const OrderStatus = lazy(() => import("./pages/dashboard/admin/OrderStatus"));
const Complaints = lazy(() => import("./pages/dashboard/admin/Complaints"));
const PayoutRequest = lazy(() => import("./pages/dashboard/admin/PayoutRequest"));
const AdminReports = lazy(() => import("./pages/dashboard/admin/Reports"));
const ServicePlan = lazy(() => import("./pages/dashboard/admin/ServicePlan"));
const CoopContract = lazy(() => import("./pages/dashboard/admin/CoopContract"));
const FeedGuide = lazy(() => import("./pages/dashboard/admin/FeedGuide"));
const CageManagement = lazy(() => import("./pages/dashboard/admin/CageManagement"));
const AllAboutEggs = lazy(() => import("./pages/dashboard/admin/AllAboutEggs"));
const HensHealth = lazy(() => import("./pages/dashboard/admin/HensHealth"));
const AdminSettings = lazy(() => import("./pages/dashboard/admin/Settings"));
const PriceManagement = lazy(() => import("./pages/dashboard/admin/PriceManagement"));
const EggInventory = lazy(() => import("./pages/dashboard/admin/EggInventory"));
const FeedMonitoring = lazy(() => import("./pages/dashboard/admin/FeedMonitoring"));
const FeedEntry = lazy(() => import("./pages/dashboard/admin/FeedEntry"));
const Expense = lazy(() => import("./pages/dashboard/admin/Expense"));
const Business = lazy(() => import("./pages/dashboard/admin/Business"));
const Messages = lazy(() => import("./pages/dashboard/admin/Messages"));
const Reviews = lazy(() => import("./pages/dashboard/admin/Reviews"));
const PriceForecastAnalysis = lazy(() => import("./pages/dashboard/admin/PriceForecastAnalysis"));

const SuperAdminUserView = lazy(() => import("./components/super-admin/users/ViewAdmin"));
const SuperAdminUserEdit = lazy(() => import("./components/super-admin/users/EditAdmin"));
const AdminUserView = lazy(() => import("./components/admin/users/ViewAdmin"));
const AdminUserEdit = lazy(() => import("./components/admin/users/EditAdmin"));
const NotificationsPage = lazy(() => import("./components/NotificationsPage"));

const NotFound = lazy(() => import("./pages/404"));
const NoAccess = lazy(() => import("./pages/NoAccess"));

function RouteFallback() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-gray-500">Loading page...</div>
    </div>
  );
}

function AuthGate({ children }) {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthGate>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Landing Page (standalone, has its own navbar/footer) */}
            <Route path="/" element={<LandingPage />} />

            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/home" element={<Home />} />
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
                <Route path="suspicious-activities" element={<SuspiciousActivities />} />
                <Route path="orders" element={<Orders />} />
                <Route path="product-management" element={<ProductManagement />} />
                <Route path="pricing" element={<PricingManagement />} />
                <Route path="remittance" element={<Remittance />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<NotificationsPage />} />
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
                <Route path="products/egg-inventory" element={<EggInventory />} />
                <Route path="products/details" element={<ProductDetails />} />
                <Route path="products/discount-management" element={<DiscountManagement />} />
                <Route path="products/price-management" element={<PriceManagement />} />
                <Route path="expenses/feed-monitoring" element={<FeedMonitoring />} />
                <Route path="expenses/feed-entry" element={<FeedEntry />} />
                <Route path="expenses/business" element={<Business />} />
                <Route path="expenses/expense" element={<Expense />} />
                <Route path="order-status" element={<OrderStatus />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="messages" element={<Messages />} />
                <Route path="payout-request" element={<PayoutRequest />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="price-forecast-analysis" element={<PriceForecastAnalysis />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="service-plan" element={<ServicePlan />} />
                <Route path="contract" element={<CoopContract />} />
                <Route path="feeds" element={<FeedGuide />} />
                <Route path="cagemanagement" element={<CageManagement />} />
                <Route path="allabouteggs" element={<AllAboutEggs />} />
                <Route path="henshealth" element={<HensHealth />} />
              </Route>
            </Route>

            <Route path="/no-access" element={<NoAccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthGate>
    </LocalizationProvider>
  );
}