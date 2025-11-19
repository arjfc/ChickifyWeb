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

import { insights } from "@/constants/mockData";

import {
  getDashboardSummary,
  getCustomerGrowth,
  getSalesTimeseriesAdmin,
  getTopProductAdmin,
  getAdminOrderStatusBuckets,
  getCebuSeasonalPricesLocal,
  getEggProductionTimeseries,
} from "@/services/analytics";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    total_active_users: 0,
    total_sales_today: 0,
    total_egg_trays: 0,
    total_farmers: 0, // 👈 NEW
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

  const [remitBalance] = useState(0);

  const [infoOpen, setInfoOpen] = useState(false);
  const [remitOpen, setRemitOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

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

      try {
        const ep = await getEggProductionTimeseries(30);
        setEggProduction(ep || []);
      } catch (e) {
        console.error("[egg-production error]:", e);
      }

      const yr = new Date().getFullYear();
      setForecast(getCebuSeasonalPricesLocal(yr, 300));
    })();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const onSubmitRemit = (e) => {
    e.preventDefault();
    alert("Remittance submitted!");
    setRemitOpen(false);
    setAmount("");
    setFile(null);
    setPreview("");
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

      {/* DONUTS + REMIT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-2 p-6 rounded-lg border shadow-lg">
          <div className="mb-3 font-semibold text-gray-700">Gross Income</div>
          <DonutChart
            data={{
              labels: ["Source A", "Source B", "Source C"],
              series: [55, 30, 15],
            }}
          />
        </div>

        <div className="col-span-1 p-6 rounded-lg border shadow-lg">
          <div className="mb-3 font-semibold text-gray-700">Net Income</div>
          <DonutChart
            data={{
              labels: ["After Fees", "Adjustments"],
              series: [75, 25],
            }}
          />
        </div>

        <div className="col-span-1 p-6 rounded-lg border shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold">Remittance Balance</div>
              <div className="text-xs text-gray-500">
                Current total amount to remit this month.
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
              Updated based on ledger and cleared payouts.
            </div>
          </div>

          <button
            onClick={() => setRemitOpen(true)}
            className="mt-6 w-full rounded-lg bg-primaryYellow py-2 font-semibold hover:brightness-95"
          >
            Remit
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
        <div className="col-span-1 lg:col-span-3 p-6 rounded-lg border shadow-lg">
          <BarChart data={growth} />
        </div>
        <div className="col-span-1 flex flex-col p-6 rounded-lg border shadow-lg">
          <DonutChart data={orderStatus} />
        </div>
      </div>

      {/* EGG PRODUCTION + SALES 30 DAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border shadow-lg">
          <div className="mb-3 font-semibold">Egg Production (Last 30 Days)</div>
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

      {/* MODALS — INFO */}
      {infoOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setInfoOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-bold">What is Remittance Balance?</h3>
              <button onClick={() => setInfoOpen(false)}>✕</button>
            </div>

            <p className="text-sm text-gray-700">
              Remittance Balance is the total amount your co-op must remit to the
              Super Admin.
            </p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInfoOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS — REMITTANCE */}
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
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-primaryYellow">
                Submit Remittance
              </h3>
              <button onClick={() => setRemitOpen(false)} type="button">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Amount Remitted (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Proof of Remittance
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && (
                  <img
                    src={preview}
                    className="mt-3 w-full max-h-[60vh] rounded-lg border object-contain"
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setRemitOpen(false)}
                className="flex-1 rounded-lg border py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!amount || Number(amount) <= 0}
                className="flex-1 rounded-lg bg-primaryYellow py-2 font-semibold"
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
