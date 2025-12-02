// pages/super-admin/dashboard/index.jsx
import { useEffect, useState } from "react";

import DashboardCard from "../../../components/DashboardCard";
import { LuPackageOpen, LuUserRound } from "react-icons/lu";
import { IoBarChartOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";

import SuperAdminSalesTrendChart from "../../../components/Charts/SuperAdminSalesTrendChart";
import RecentActivities from "../../../components/super-admin/RecentActivities";

import {
  getUserCounts,
  getTotalProducts,
  getSalesToday,
  getCompletedOrders,
  getTotalAdminFees,
  getSuperAdminSalesTimeseries,
  getRecentActivities,
} from "@/services/SuperAdminAnalytics";

// safer-number helper
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

  // Sales timeseries
  const [salesRangeDays, setSalesRangeDays] = useState(7);
  const [salesSeries, setSalesSeries] = useState([]);

  // Admin fees filter
  const [feesYear, setFeesYear] = useState(null); // or new Date().getFullYear()
  const [feesMonth, setFeesMonth] = useState(null); // 1-12 or null
  const [feesLoading, setFeesLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Recent activities
  const [activities, setActivities] = useState([]);
  const [actLoading, setActLoading] = useState(false);

  // --------------------------------
  // Initial dashboard load
  // --------------------------------
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
        getTotalAdminFees(selectedMonth, selectedYear), // 🔥 filters applied
      ]);

      if (cancelled) return;

      setStats({
        admins: Number(userCounts.admins) || 0,
        farmers: Number(userCounts.farmers) || 0,
        buyers: Number(userCounts.buyers) || 0,
        products: Number(totalProducts) || 0,
        salesToday: Number(salesToday) || 0,
        completedOrders: Number(completedOrders) || 0,
        adminFees: Number(adminFees) || 0,
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
  return () => (cancelled = true);
}, [selectedMonth, selectedYear]);

  // re-fetch sales trend when range changes only
  useEffect(() => {
    let cancelled = false;

    async function loadSeries() {
      try {
        const series = await getSuperAdminSalesTimeseries(salesRangeDays);
        if (!cancelled) setSalesSeries(series || []);
      } catch (err) {
        if (!cancelled) console.error("[SalesTimeseries] error:", err);
      }
    }

    loadSeries();
    return () => {
      cancelled = true;
    };
  }, [salesRangeDays]);

  // Re-fetch admin fees when year/month changes
  useEffect(() => {
    let cancelled = false;

    async function loadFees() {
      try {
        setFeesLoading(true);
        const fees = await getTotalAdminFees({
          year: feesYear,
          month: feesMonth,
        });
        if (!cancelled) {
          setStats((prev) => ({
            ...prev,
            adminFees: asNumber(fees),
          }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[AdminFees] load error:", err);
        }
      } finally {
        if (!cancelled) setFeesLoading(false);
      }
    }

    loadFees();
    return () => {
      cancelled = true;
    };
  }, [feesYear, feesMonth]);

  // Re-fetch activities periodically if you like (optional)
  useEffect(() => {
    let cancelled = false;

    async function loadActs() {
      try {
        setActLoading(true);
        const rows = await getRecentActivities(10);
        if (!cancelled) setActivities(rows || []);
      } catch (err) {
        if (!cancelled) console.error("[RecentActivities] error:", err);
      } finally {
        if (!cancelled) setActLoading(false);
      }
    }

    loadActs();
    // optional interval refresh:
    // const id = setInterval(loadActs, 60000);
    return () => {
      cancelled = true;
      // clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-10">
        <p className="text-gray-500 text-sm">Loading analytics…</p>
      </div>
    );
  }

  const adminCount = stats.admins ?? 0;
  const farmerCount = stats.farmers ?? 0;
  const buyerCount = stats.buyers ?? 0;

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
        data={adminCount}
      />
      <DashboardCard
        title="Active Farmers"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={farmerCount}
      />
      <DashboardCard
        title="Active Buyers"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={buyerCount}
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
        data={stats.completedOrders /* replace with real pending count later */}
      />

      {/* Admin Fees with month/year filter */}
      <DashboardCard
  title="Admin Fees Collected (₱)"
  icon={<IoBarChartOutline className="text-6xl text-primaryYellow" />}
  data={stats.adminFees}
  extra={
    <div className="flex gap-2 mt-2">
      <select
        className="border rounded px-2 py-1"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
      >
        {[
          { id: 1, name: "January" },
          { id: 2, name: "February" },
          { id: 3, name: "March" },
          { id: 4, name: "April" },
          { id: 5, name: "May" },
          { id: 6, name: "June" },
          { id: 7, name: "July" },
          { id: 8, name: "August" },
          { id: 9, name: "September" },
          { id: 10, name: "October" },
          { id: 11, name: "November" },
          { id: 12, name: "December" },
        ].map((m) => (
          <option value={m.id} key={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <select
        className="border rounded px-2 py-1"
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const year = 2023 + i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>
    </div>
  }
/>

      {/* Row 3 — sales trend & activities */}
      <div className="col-span-1 xl:col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
        <SuperAdminSalesTrendChart
          data={salesSeries}
          rangeDays={salesRangeDays}
          onChangeRangeDays={setSalesRangeDays}
        />
      </div>

      <div className="col-span-1 xl:col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg">
        <RecentActivities activities={activities} loading={actLoading} />
      </div>
    </div>
  );
}
