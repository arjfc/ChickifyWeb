// pages/admin/dashboard/index.jsx
import React, { useEffect, useState } from "react";
import { LuUserRound, LuPackageOpen } from "react-icons/lu";
import { IoBarChartOutline } from "react-icons/io5";

import DashboardCard from "@/components/DashboardCard";
import LineChart from "@/components/Charts/Admin/LineChart";
import BarChart from "@/components/Charts/Admin/BarChart";
import DonutChart from "@/components/Charts/Admin/DonutChart";
import PriceForecastChart from "@/components/Charts/Admin/PriceForecastChart";

import {
  getDashboardSummary,
  getCustomerGrowth,
  getSalesTimeseriesAdmin,
  getTopProductAdmin,
  getAdminOrderStatusBuckets,
  getCebuSeasonalPricesLocal,
} from "@/services/analytics";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({ total_active_users: 0, total_sales_today: 0, total_egg_trays: 0 });
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProduct, setTopProduct] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [orderStatus, setOrderStatus] = useState({ labels: [], series: [], raw: [] });
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await getDashboardSummary();
        setSummary({
          total_active_users: s.total_active_users,
          total_sales_today: s.total_sales_today,
          total_egg_trays: s.total_egg_trays,
        });
      } catch (e) {
        console.error("[summary] error:", e);
      }

      try {
        const ts = await getSalesTimeseriesAdmin(7);
        setSalesTrend(ts);
      } catch (e) {
        console.error("[sales] error:", e);
        setSalesTrend([]);
      }

      try {
        const top = await getTopProductAdmin(30);
        setTopProduct(top);
      } catch (e) {
        console.error("[top-product] error:", e);
        setTopProduct(null);
      }

      try {
        const g = await getCustomerGrowth(30);
        setGrowth(g);
      } catch (e) {
        console.error("[growth] error:", e);
        setGrowth([]);
      }

      try {
        const donut = await getAdminOrderStatusBuckets();
        setOrderStatus(donut);
      } catch (e) {
        console.error("[donut] error:", e);
        setOrderStatus({ labels: ["pending","on_delivery","complete","cancelled"], series: [0,0,0,0], raw: [] });
      }

      const yr = new Date().getFullYear();
      setForecast(getCebuSeasonalPricesLocal(yr, 300));
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Customers" icon={<LuUserRound className="text-6xl text-primaryYellow" />} data={summary.total_active_users} />
        <DashboardCard title="Total Sales Today" icon={<IoBarChartOutline className="text-6xl text-primaryYellow" />} data={summary.total_sales_today} />
        <DashboardCard title="Total Egg Trays" icon={<LuPackageOpen className="text-6xl text-primaryYellow" />} data={summary.total_egg_trays} />
      </div>

      {/* SALES TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <LineChart data={salesTrend} bestProduct={topProduct} />
        </div>
        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
          {/* insights … */}
        </div>
      </div>

      {/* CUSTOMER GROWTH + DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <BarChart data={growth} />
        </div>
        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
          <DonutChart data={orderStatus} />
        </div>
      </div>

      {/* PRICE FORECAST */}
      <div className="col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
        <PriceForecastChart data={forecast} />
      </div>
    </div>
  );
}
