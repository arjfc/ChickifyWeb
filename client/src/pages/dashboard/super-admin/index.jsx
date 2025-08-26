import DashboardCard from "../../../components/DashboardCard";
import { LuPackageOpen, LuUserRound } from "react-icons/lu";
import { FaBell } from "react-icons/fa6";
import { SYSTEM_ALERTS } from "../../../constants/mockData";
import { MdKeyboardArrowRight } from "react-icons/md";
import SalesTrendChart from "../../../components/Charts/SalesTrend";
import RecentActivities from "../../../components/super-admin/RecentActivities";
import { IoBarChartOutline } from "react-icons/io5";

export default function SuperAdminDashboard() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 xl:grid-rows-[auto_1fr_auto]  gap-6">
      {/* Row 1 */}
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
        title="Total Product List"
        icon={<LuPackageOpen className="text-6xl text-primaryYellow" />}
        data={12345}
      />

      {/* System Alerts (row-span-3 works now) */}
      <div className="row-span-3 col-span-1 flex flex-col gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
        <div className="text-primaryYellow flex flex-row gap-2 items-center justify-center">
          <FaBell className="text-2xl" />
          <p className="text-2xl font-bold">System Alerts</p>
        </div>
        {SYSTEM_ALERTS.slice(0, 8).map((data) => (
          <div
            key={data.id}
            className="relative bg-softPrimaryYelllow p-4 rounded-xl cursor-pointer"
          >
            {data.title}
            <MdKeyboardArrowRight className="absolute top-3 right-3 w-8 h-8" />
          </div>
        ))}
        <div className="flex flex-row gap-2 items-center justify-center text-gray-400 cursor-pointer">
          <p className="text-base">View More</p>
          <MdKeyboardArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* Sales Chart (aligns with Alerts) */}
      <div className="col-span-1 xl:col-span-3 row-span-2 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
        <SalesTrendChart />
      </div>

      {/* Recent Activities (full width at bottom) */}
      <div className="col-span-1 xl:col-span-4 p-6 rounded-lg border border-gray-200 shadow-lg">
        <RecentActivities />
      </div>
    </div>
  );
}
