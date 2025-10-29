import React, { useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import DashboardCard from "../../../components/DashboardCard";
import { insights } from "../../../constants/mockData";
import { LuUserRound, LuPackageOpen } from "react-icons/lu";
import { IoBarChartOutline, IoInformationCircleOutline } from "react-icons/io5";

import LineChart from "../../../components/Charts/Admin/LineChart";
import BarChart from "../../../components/Charts/Admin/BarChart";
import DonutChart from "../../../components/Charts/Admin/DonutChart";
import PriceForecastChart from "../../../components/Charts/Admin/PriceForecastChart";
import ProfitDonutChart from "../../../components/Charts/Admin/ProfitDonutChart";

export default function AdminDashboard() {
  // --- Local state for Remittance modal ---
  const [remitOpen, setRemitOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // TODO: Replace with real computed value from backend
  const remitBalance = 0; // e.g., total “payable to superadmin” for the current month

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSubmitRemit = (e) => {
    e.preventDefault();
    // TODO:
    // 1) Validate amount
    // 2) Upload proof image to Storage
    // 3) Call RPC to create remittance record
    // 4) Refresh dashboard
    setRemitOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Active Users"
          icon={<LuUserRound className="text-6xl text-primaryYellow" />}
          data={15300}
        />
        <DashboardCard
          title="Total Sales Today"
          icon={<IoBarChartOutline className="text-6xl text-primaryYellow" />}
          data={15300}
        />
        <DashboardCard
          title="Total Egg Trays"
          icon={<LuPackageOpen className="text-6xl text-primaryYellow" />}
          data={12345}
        />
      </div>

      {/* Section 2: Profit donuts + Remittance Balance (right card) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donuts (span 2 columns) */}
        <div className="col-span-1 lg:col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg flex flex-row justify-center">
          <ProfitDonutChart title="Gross Income" centerText="₱1M" />
          <ProfitDonutChart title="Net Income" centerText="₱0.3M" />
        </div>

        {/* Remittance Balance Card (right) */}
        <div className="col-span-1 p-6 rounded-lg border border-gray-200 shadow-lg h-full flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="text-primaryYellow leading-tight">
              <h2 className="text-2xl font-bold">Remittance Balance</h2>
              <p className="text-gray-400">
                Current total amount need to remit this month.
              </p>
            </div>

            {/* Info: hover tooltip + modal toggle */}
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="group relative inline-flex items-center"
              aria-label="What is Remittance Balance?"
              title="Click to learn more"
            >
              <IoInformationCircleOutline className="w-6 h-6 text-gray-400 group-hover:text-primaryYellow transition-colors" />
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">
                What is this?
              </span>
            </button>
          </div>

          <div className="mt-2">
            <div className="text-4xl font-extrabold tracking-tight">
              ₱{remitBalance.toLocaleString("en-PH", { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Based on this month’s cleared sales and ledger rules.
            </p>
          </div>

          <div className="mt-auto">
            <button
              type="button"
              onClick={() => setRemitOpen(true)}
              className="w-full rounded-xl bg-primaryYellow px-4 py-3 font-semibold text-black hover:brightness-95 transition"
            >
              Remit
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Sales Trend + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <LineChart />
        </div>

        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
          <div className="text-primaryYellow flex flex-col gap-2 leading-tight">
            <h1 className="text-2xl font-bold">View Insights</h1>
            <p className="text-gray-400">There are more to view</p>
          </div>
          {insights.slice(0, 3).map((data) => (
            <div
              className="relative bg-softPrimaryYelllow p-4 rounded-xl cursor-pointer text-xs flex items-center"
              key={data.id}
            >
              {data.title}
              <MdKeyboardArrowRight className="absolute top-3 right-3 w-8 h-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Bar + Donut + Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <BarChart />
        </div>
        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
          <DonutChart />
        </div>
        <div className="col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <PriceForecastChart />
        </div>
      </div>

      {/* ---------- INFO MODAL ---------- */}
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
              Remittance Balance is the total amount your co-op (you) 
              needs to remit to the Super Admin this month. 
              It includes fees from farmer payouts, buyer orders, 
              and platform charges tracked in the cash ledger.    
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
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setRemitOpen(false)}
          />
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
                  // <div className="mt-3">
                  //   <img
                  //     src={preview}
                  //     alt="Remittance proof preview"
                  //     className="max-h-56 w-auto rounded-lg border object-contain"
                  //   />
                  // </div>

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
