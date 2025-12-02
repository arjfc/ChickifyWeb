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
import EggProductionChart from "@/components/Charts/Admin/EggProductionChart";
import Sales30Chart from "@/components/Charts/Admin/Sales30Chart";
import IncomeDonutChart from "@/components/Charts/Admin/IncomeDonutChart";

import { insights } from "@/constants/mockData";

import {
  getDashboardSummary,
  getCustomerGrowth,
  getSalesTimeseriesAdmin,
  getTopProductAdmin,
  getAdminOrderStatusBuckets,
  getCebuSeasonalPricesLocal,
  getEggProductionTimeseries,
  getAdminGrossIncomeBreakdown,
  getAdminNetIncomeBreakdown,
} from "@/services/analytics";

// 🔁 Remittance services
import {
  fetchAdminFees,
  adminSubmitRemittance,
  uploadRemittanceProof,
} from "@/services/Remittance";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    total_active_users: 0,
    total_sales_today: 0,
    total_egg_trays: 0,
    total_farmers: 0,
  });

  const [salesTrend, setSalesTrend] = useState([]);
  const [sales30, setSales30] = useState([]);
  const [topProduct, setTopProduct] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [orderStatus, setOrderStatus] = useState({
    labels: [],
    series: [],
    raw: [],
  });

  const [eggProduction, setEggProduction] = useState([]);
  const [forecast, setForecast] = useState([]);

  // Gross & net income donut data
  const [grossIncomeDonut, setGrossIncomeDonut] = useState({
    labels: [],
    series: [],
    raw: [],
  });
  const [netIncomeDonut, setNetIncomeDonut] = useState({
    labels: [],
    series: [],
    raw: [],
  });

  // Remittance state (from Remittance index)
  const [remitBalance, setRemitBalance] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [remitOpen, setRemitOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submittingRemit, setSubmittingRemit] = useState(false);

  // Pretty label for "this month"
  const monthLabel = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Totals from donut data
  const grossTotal = (grossIncomeDonut.series || []).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );
  const netTotal = (netIncomeDonut.series || []).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );

  useEffect(() => {
    (async () => {
      try {
        const s = await getDashboardSummary();
        setSummary((prev) => ({ ...prev, ...s }));
      } catch (e) {
        console.error("[summary] error:", e);
      }

      try {
        const ts7 = await getSalesTimeseriesAdmin(7);
        setSalesTrend(ts7 || []);
      } catch (e) {
        console.error("[7d sales error]:", e);
      }

      try {
        const ts30 = await getSalesTimeseriesAdmin(30);
        setSales30(ts30 || []);
      } catch (e) {
        console.error("[30d sales error]:", e);
      }

      try {
        const top = await getTopProductAdmin(30);
        setTopProduct(top);
      } catch (e) {
        console.error("[top product error]:", e);
      }

      try {
        const g = await getCustomerGrowth(30);
        setGrowth(g || []);
      } catch (e) {
        console.error("[growth error]:", e);
      }

      try {
        const donut = await getAdminOrderStatusBuckets();
        setOrderStatus(donut);
      } catch (e) {
        console.error("[donut error]:", e);
        setOrderStatus({
          labels: ["pending", "on_delivery", "complete", "cancelled"],
          series: [0, 0, 0, 0],
          raw: [],
        });
      }

      // Egg production
      try {
        const ep = await getEggProductionTimeseries(30);
        setEggProduction(ep || []);
      } catch (e) {
        console.error("[egg-production error]:", e);
      }

      // Gross income donut – current month
      try {
        const gi = await getAdminGrossIncomeBreakdown();
        setGrossIncomeDonut(gi);
      } catch (e) {
        console.error("[gross income donut error]:", e);
        setGrossIncomeDonut({ labels: [], series: [], raw: [] });
      }

      // Net income donut – current month
      try {
        const ni = await getAdminNetIncomeBreakdown();
        setNetIncomeDonut(ni);
      } catch (e) {
        console.error("[net income donut error]:", e);
        setNetIncomeDonut({ labels: [], series: [], raw: [] });
      }

      // Remittance balance from view_admin_fees
      try {
        const { totalFees } = await fetchAdminFees();
        setRemitBalance(totalFees);
      } catch (e) {
        console.error("[admin-fees] error:", e);
        setRemitBalance(0);
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

  // ✅ full remittance submit logic using RPC + storage
  const onSubmitRemit = async (e) => {
    e.preventDefault();

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid remittance amount.");
      return;
    }

    setSubmittingRemit(true);

    try {
      // 1) Upload file
      let imgUrl = null;
      if (file) {
        imgUrl = await uploadRemittanceProof(file);
      }

      // 2) Call RPC to record remittance
      await adminSubmitRemittance({
        amount: amt,
        img: imgUrl,
      });

      // 3) Refresh balance
      const { totalFees } = await fetchAdminFees();
      setRemitBalance(totalFees);

      // 4) Reset UI
      setRemitOpen(false);
      setAmount("");
      setFile(null);
      setPreview("");
    } catch (err) {
      alert(`Remittance failed. ${err?.message ?? ""}`);
    } finally {
      setSubmittingRemit(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Customers"
          icon={<LuUserRound className="text-6xl text-primaryYellow" />}
          data={summary.total_active_users}
        />
        <DashboardCard
          title="Total Farmers"
          icon={<LuUserRound className="text-6xl text-primaryYellow" />}
          data={summary.total_farmers}
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

      {/* GROSS + NET INCOME + REMITTANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* GROSS INCOME */}
        <div className="col-span-1 lg:col-span-2 p-6 rounded-lg border shadow-lg">
          <div className="mb-1 text-sm text-gray-500">
            Gross Income – {monthLabel}
          </div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-800">
              Gross Income 
            </h3>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total this month</div>
              <div className="text-lg font-bold text-emerald-700">
                ₱{grossTotal.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          <IncomeDonutChart data={grossIncomeDonut} />
        </div>

        {/* NET INCOME */}
        <div className="col-span-1 p-6 rounded-lg border shadow-lg">
          <div className="mb-1 text-sm text-gray-500">
            Net Income – {monthLabel}
          </div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-800">
              Net Income 
            </h3>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total this month</div>
              <div className="text-lg font-bold text-emerald-700">
                ₱{netTotal.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          <IncomeDonutChart data={netIncomeDonut} />
        </div>

        {/* REMITTANCE CARD */}
        <div className="col-span-1 p-6 rounded-lg border shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold">Remittance Balance</div>
              <div className="text-xs text-gray-500">
                Current total amount need to remit this month.
              </div>
            </div>

            <button
              onClick={() => setInfoOpen(true)}
              className="text-xs text-gray-500 hover:text-black"
            >
              <IoInformationCircleOutline className="text-xl" />
            </button>
          </div>

          <div className="mt-6">
            <div className="text-4xl font-extrabold">
              ₱{Number(remitBalance).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on this month’s cleared sales and ledger rules.
            </div>
          </div>

          <button
            onClick={() => setRemitOpen(true)}
            className="mt-6 w-full rounded-lg bg-primaryYellow py-2 font-semibold hover:brightness-95"
          >
            Submit Remittance
          </button>
        </div>
      </div>

      {/* SALES TREND + INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-3 p-6 rounded-lg border shadow-lg">
          <div className="mb-3 font-semibold">Sales Trend (Last 7 Days)</div>
          <LineChart data={salesTrend} bestProduct={topProduct} />
        </div>

        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border shadow-lg">
          <div className="text-primaryYellow">
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

      {/* GROWTH + ORDER STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:grid-cols-3 lg:col-span-3 p-6 rounded-lg border shadow-lg">
          <BarChart data={growth} />
        </div>
        <div className="col-span-1 flex flex-col p-6 rounded-lg border shadow-lg">
          <DonutChart data={orderStatus} />
        </div>
      </div>

      {/* EGG PRODUCTION + SALES 30 DAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border shadow-lg">
          <div className="mb-3 font-semibold">
            Egg Production (Last 30 Days)
          </div>
          <EggProductionChart data={eggProduction} />
        </div>

        <div className="p-6 rounded-lg border shadow-lg">
          <div className="mb-3 font-semibold">Sales (Last 30 Days)</div>
          <Sales30Chart data={sales30} />
        </div>
      </div>

      {/* PRICE FORECAST */}
      <div className="p-6 rounded-lg border shadow-lg">
        <PriceForecastChart data={forecast} />
      </div>

      {/* INFO MODAL */}
      {infoOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setInfoOpen(false)}
          />
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
              Remittance Balance is the total amount your co-op (you) needs to
              remit to the Super Admin this month. It includes fees from farmer
              payouts, buyer orders, and platform charges tracked in the cash
              ledger.
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

      {/* REMITTANCE MODAL */}
      {remitOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setRemitOpen(false)}
          />
          <form
            onSubmit={onSubmitRemit}
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primaryYellow">
                Submit Remittance
              </h3>
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
                <label className="block text-sm font-medium mb-1">
                  Amount Remitted (₱)
                </label>
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
                  Tip: You can remit partially. Remaining balance will be
                  updated after posting.
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
                disabled={submittingRemit}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 basis-0 rounded-lg bg-primaryYellow py-2 font-semibold text-black hover:brightness-95 disabled:opacity-60"
                disabled={
                  !amount || Number(amount) <= 0 || submittingRemit
                }
              >
                {submittingRemit ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
