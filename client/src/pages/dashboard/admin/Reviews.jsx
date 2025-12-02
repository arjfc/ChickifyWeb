import React from "react";
import CostBarChart from "../../../components/Charts/Admin/CostBarChart";
import ProfitDonutChart from "../../../components/Charts/Admin/ProfitDonutChart";

export default function Business() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg flex">
        <div onClick={() => alert('clicked')} className="cursor-pointer bg-primaryYellow text-white text-md font-bold rounded-lg px-5 py-3">
          Generate Report
        </div>
      </div>
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
        <CostBarChart/>
      </div>
      <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg flex flex-row justify-center">
        <ProfitDonutChart title="Gross Profit" centerText="₱1M" />
        <ProfitDonutChart title="Net Profit" centerText="₱0.3M" />
      </div>
      <div className="col-span-1 p-6 rounded-lg border border-gray-200 shadow-lg flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-primaryYellow">Gross Profit Margin</h1>
          <p className="text-5xl font-bold opacity-70">90.6543%</p>
        </div>
         <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-primaryYellow">Net Profit Margin</h1>
          <p className="text-5xl font-bold opacity-70">90.6543%</p>
        </div>
      </div>
    </div>
  );
}
