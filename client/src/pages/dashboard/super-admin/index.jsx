// pages/super-admin/dashboard/index.jsx
import { useEffect, useState } from "react";

import DashboardCard from "../../../components/DashboardCard";
import { LuPackageOpen, LuUserRound } from "react-icons/lu";
import { IoBarChartOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";

import SalesTrendChart from "../../../components/Charts/SalesTrend";
import RecentActivities from "../../../components/super-admin/RecentActivities";

import {
  getUserCounts,
  getTotalProducts,
  getSalesToday,
  getCompletedOrders,
  getTotalAdminFees,
} from "@/services/SuperAdminAnalytics";

// small helper to be extra-safe
const asNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [stats, setStats] = useState({
    admins: 0,
    farmers: 0,
    buyers: 0,
    products: 0,
    salesToday: 0,
    completedOrders: 0,
   
    adminFees: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setLoadError(null);

        const [
          userCounts,
          totalProducts,
          salesToday,
          completedOrders,
          adminFees,
        ] = await Promise.all([
          getUserCounts(),
          getTotalProducts(),
          getSalesToday(),
          getCompletedOrders(),
          getTotalAdminFees(),
        ]);

        if (cancelled) return;

        setStats({
          admins: asNumber(userCounts.admins),
          farmers: asNumber(userCounts.farmers),
          buyers: asNumber(userCounts.buyers),
          products: asNumber(totalProducts),
          salesToday: asNumber(salesToday),
          completedOrders: asNumber(completedOrders),
         
          adminFees: asNumber(adminFees),
        });
      } catch (err) {
        if (cancelled) return;
        console.error("[SuperAdminDashboard] analytics error:", err);
        setLoadError(err.message || "Failed to load analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-10">
        <p className="text-gray-500 text-sm">Loading analytics…</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 xl:grid-rows-[auto_auto_1fr] gap-6">
      {loadError && (
        <div className="xl:col-span-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {loadError}
        </div>
      )}

      {/* Row 1 — user & product overview */}
      <DashboardCard
        title="Active Admin Users"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={stats.admins}
      />

      <DashboardCard
        title="Active Farmers"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={stats.farmers}
      />

      <DashboardCard
        title="Active Buyers"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={stats.buyers}
      />

      <DashboardCard
        title="Total Products"
        icon={<LuPackageOpen className="text-6xl text-primaryYellow" />}
        data={stats.products}
      />

      {/* Row 2 — revenue & payouts */}
      <DashboardCard
        title="Sales Today (₱)"
        icon={<IoBarChartOutline className="text-6xl text-primaryYellow" />}
        data={stats.salesToday}
      />

      <DashboardCard
        title="Total Completed Orders"
        icon={<MdKeyboardArrowRight className="text-6xl text-primaryYellow" />}
        data={stats.completedOrders}
      />

      <DashboardCard
        title="Pending Payout Requests"
        icon={<MdKeyboardArrowRight className="text-6xl text-primaryYellow" />}
        data={stats.completedOrders}
      />

      <DashboardCard
        title="Admin Fees Collected (₱)"
        icon={<IoBarChartOutline className="text-6xl text-primaryYellow" />}
        data={stats.adminFees}
      />

      {/* Row 3 — sales trend & activities */}
      <div className="col-span-1 xl:col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
        <SalesTrendChart />
      </div>

      <div className="col-span-1 xl:col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg">
        <RecentActivities />
      </div>
    </div>
  );
}
