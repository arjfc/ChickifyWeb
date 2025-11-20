// pages/admin/dashboard/index.jsx
import React, { useEffect, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { LuUserRound, LuPackageOpen } from "react-icons/lu";
import { IoBarChartOutline, IoInformationCircleOutline } from "react-icons/io5";

import DashboardCard from "@/components/DashboardCard";
import LineChart from "@/components/Charts/Admin/LineChart";
import BarChart from "@/components/Charts/Admin/BarChart";
import DonutChart from "@/components/Charts/Admin/DonutChart";
import PriceForecastChart from "@/components/Charts/Admin/PriceForecastChart";

import { insights } from "@/constants/mockData";
import {
  getDashboardSummary,
  getCustomerGrowth,
  getSalesTimeseriesAdmin,
  getTopProductAdmin,
  getAdminOrderStatusBuckets,
  getCebuSeasonalPricesLocal,
} from "@/services/analytics";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    total_active_users: 0,
    total_sales_today: 0,
    total_egg_trays: 0,
  });

  const [salesTrend, setSalesTrend] = useState([]);
  const [topProduct, setTopProduct] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [orderStatus, setOrderStatus] = useState({ labels: [], series: [], raw: [] });
  const [forecast, setForecast] = useState([]);

  // Optional: if you already compute this from ledger elsewhere, wire it here.
  const [remitBalance] = useState(0);

  // Info & Remit modals
  const [infoOpen, setInfoOpen] = useState(false);
  const [remitOpen, setRemitOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

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
        setOrderStatus({
          labels: ["pending", "on_delivery", "complete", "cancelled"],
          series: [0, 0, 0, 0],
          raw: [],
        });
      }

      const yr = new Date().getFullYear();
      setForecast(getCebuSeasonalPricesLocal(yr, 300));
    })();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const onSubmitRemit = async (e) => {
    e.preventDefault();
    // TODO: call your remittance-posting endpoint/RPC here with `amount` and `file`.
    alert("Remittance submitted!");
    setRemitOpen(false);
    setAmount("");
    setFile(null);
    setPreview("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Customers"
          icon={<LuUserRound className="text-6xl text-primaryYellow" />}
          data={summary.total_active_users}
        />
        <DashboardCard
          title="Total Sales Today"
          icon={<IoBarChartOutline className="text-6xl text-primaryYellow" />}
          data={summary.total_sales_today}
        />
        <DashboardCard
          title="Total Egg Trays"
          icon={<LuPackageOpen className="text-6xl text-primaryYellow" />}
          data={summary.total_egg_trays}
        />
      </div>

      {/* ROW 2: TWO DONUTS + REMITTANCE CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Gross Income donut */}
        <div className="col-span-1 lg:col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
          <div className="mb-3 font-semibold text-gray-700">Gross Income</div>
          {/* Pass your series/labels appropriate for gross income */}
          <DonutChart
            data={{
              labels: ["Source A", "Source B", "Source C"],
              series: [55, 30, 15],
            }}
          />
        </div>

        {/* Net Income donut */}
        <div className="col-span-1 lg:col-span-1 p-6 rounded-lg border border-gray-200 shadow-lg">
          <div className="mb-3 font-semibold text-gray-700">Net Income</div>
          {/* Pass your series/labels appropriate for net income */}
          <DonutChart
            data={{
              labels: ["After Fees", "Adjustments"],
              series: [75, 25],
            }}
          />
        </div>

        {/* Remittance Balance card (Info icon here, not in Insights) */}
        <div className="col-span-1 p-6 rounded-lg border border-gray-200 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold text-gray-800">Remittance Balance</div>
              <div className="text-xs text-gray-500">
                Current total amount need to remit this month.
              </div>
            </div>
            <button
              onClick={() => setInfoOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
              title="What is this?"
            >
              <IoInformationCircleOutline className="text-xl" />
              Info
            </button>
          </div>

          <div className="mt-6">
            <div className="text-4xl font-extrabold">₱{Number(remitBalance).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              Based on this month’s cleared sales and ledger rules.
            </div>
          </div>

          
          <button
            onClick={() => setRemitOpen(true)}
            className="mt-auto w-full rounded-lg bg-primaryYellow py-2 font-semibold text-black hover:brightness-95"
          >
            Submit Remittance
          </button>
        </div>
      </div>

      {/* ROW 3: Sales Trend + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <LineChart data={salesTrend} bestProduct={topProduct} />
        </div>

        {/* Insights card (right sidebar) */}
        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
          <div className="text-primaryYellow flex flex-col gap-2 leading-tight">
            <h1 className="text-2xl font-bold">View Insights</h1>
            <p className="text-gray-400">There are more to view</p>
          </div>

          {insights.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="relative bg-softPrimaryYelllow p-4 rounded-xl cursor-pointer text-xs flex items-center"
            >
              {d.title}
              <MdKeyboardArrowRight className="absolute top-3 right-3 w-8 h-8" />
            </div>
          ))}
        </div>
      </div>

      {/* ROW 4: Customer Growth + Order Status donut */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <BarChart data={growth} />
        </div>
        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
          <DonutChart data={orderStatus} />
        </div>
      </div>

      {/* ROW 5: Price Forecast */}
      <div className="col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
        <PriceForecastChart data={forecast} />
      </div>

      {/* ---------- INFO MODAL ---------- */}
      {infoOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInfoOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">What is Remittance Balance?</h3>
              <button
                className="text-gray-500 hover:text-black"
                onClick={() => setInfoOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Remittance Balance is the total amount your co-op (you) needs to remit to the Super
              Admin this month. It includes fees from farmer payouts, buyer orders, and platform
              charges tracked in the cash ledger.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInfoOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- REMIT MODAL ---------- */}
      {remitOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRemitOpen(false)} />
          <form
            onSubmit={onSubmitRemit}
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primaryYellow">Submit Remittance</h3>
              <button
                className="text-gray-500 hover:text-black"
                onClick={() => setRemitOpen(false)}
                type="button"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount Remitted (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000.00"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primaryYellow"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tip: You can remit partially. Remaining balance will be updated after posting.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Proof of Remittance (image)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-gray-200 file:bg-gray-50 file:px-3 file:py-2 file:text-sm hover:file:bg-gray-100"
                />
                {preview && (
                  <div className="mt-3 w-full">
                    <img
                      src={preview}
                      alt="Remittance proof preview"
                      className="w-full h-auto max-h-[60vh] rounded-lg border object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex w-full gap-3">
              <button
                type="button"
                onClick={() => setRemitOpen(false)}
                className="flex-1 basis-0 rounded-lg border py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 basis-0 rounded-lg bg-primaryYellow py-2 font-semibold text-black hover:brightness-95"
                disabled={!amount || Number(amount) <= 0}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
