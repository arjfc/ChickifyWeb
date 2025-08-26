import { MdKeyboardArrowRight } from "react-icons/md";
import DashboardCard from "../../../components/DashboardCard";
import { insights } from "../../../constants/mockData";
import { LuUserRound, LuPackageOpen } from "react-icons/lu";
import { IoBarChartOutline } from "react-icons/io5";

import LineChart from "../../../components/Charts/Admin/LineChart";
import BarChart from "../../../components/Charts/Admin/BarChart";
import DonutChart from "../../../components/Charts/Admin/DonutChart";
import PriceForecastChart from "../../../components/Charts/Admin/PriceForecastChart";

export default function AdminDashboard() {
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sales Trend */}
        <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <LineChart />
        </div>

        {/* Insights */}
        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
          <div className="text-primaryYellow flex flex-col gap-2 leading-tight">
            <h1 className="text-2xl font-bold">View Insights</h1>
            <p className="text-gray-400">There are more to view</p>
          </div>
          {insights.slice(0, 3).map((data) => (
            <div
              className="relative bg-softPrimaryYelllow p-4 rounded-xl cursor-pointer text-xs flex items-center "
              key={data.id}
            >
              {data.title}
              <MdKeyboardArrowRight className="absolute top-3 right-3 w-8 h-8" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Customer Growth Analysis */}
        <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <BarChart />
        </div>

        {/* Insights */}
        <div className="col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
         <DonutChart/>
        </div>

         <div className="col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg w-full">
          <PriceForecastChart />
        </div>
      </div>
    </div>
  );
}
