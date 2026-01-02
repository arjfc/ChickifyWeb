// Public
export { default as Home } from "./Home";

// Auth
export { default as SignIn } from "./auth/SignIn";
export { default as SignUp } from "./auth/SignUp";

// Dashboards
    // Admin
export { default as AdminDashboard } from "./dashboard/admin"; 
export { default as AdminUserManagement } from "./dashboard/admin/UserManagement"
export { default as ProductDetails } from "./dashboard/admin/ProductDetails"
export { default as DiscountManagement } from "./dashboard/admin/DiscountManagement"
export { default as OrderStatus } from "./dashboard/admin/OrderStatus"
export { default as Complaints } from "./dashboard/admin/Complaints"
export { default as PayoutRequest } from "./dashboard/admin/PayoutRequest"
export { default as AdminReports } from "./dashboard/admin/Reports"
export { default as ServicePlan } from "./dashboard/admin/ServicePlan"
export { default as AdminSettings } from "./dashboard/admin/Settings"


    // Super-Admin
export { default as SuperAdminDashboard } from "./dashboard/super-admin"; 
export { default as UserManagement } from "./dashboard/super-admin/UserManagement"
export { default as ProductManagement } from "./dashboard/super-admin/ProductManagement"
export { default as Orders } from "./dashboard/super-admin/Orders"
export { default as PricingManagement } from "./dashboard/super-admin/PricingManagement"
export { default as ActivityLogs } from "./dashboard/super-admin/ActivityLogs"
export { default as Reports } from "./dashboard/super-admin/Reports"
export { default as Settings } from "./dashboard/super-admin/Settings"

