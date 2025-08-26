import React, { useState } from "react";
import DashboardCard from "../../../components/DashboardCard";
import { LuUsers } from "react-icons/lu";
import { GiFarmTractor } from "react-icons/gi";
import { FaUserLock } from "react-icons/fa";
import AdminVerTable from "../../../components/super-admin/tables/AdminVerTable";
import UserTable from "../../../components/UserTable";
import { DatePicker } from "@mui/x-date-pickers";

export default function UserManagement() {
  const userOptions = ["Admin", "Farmer", "Buyer"];
  const adminOptions = ["Pending", "Approved", "Rejected"];

  const [selectedUserOption, setSelectedUserOption] = useState("Admin");
  const [selectedAdminOption, setSelectedAdminOption] = useState("Pending");

  const [value, onChange] = useState(new Date());

  return (
    <div className="grid grid-cols-3 gap-6 relative">
      {/* Cards */}
      <DashboardCard
        title="Total Active Admin Users"
        icon={<FaUserLock className="text-6xl text-primaryYellow" />}
        data={15300}
      />
      <DashboardCard
        title="Total Active Farmer Users"
        icon={<GiFarmTractor className="text-6xl text-primaryYellow" />}
        data={15300}
      />
      <DashboardCard
        title="Total Active Buyer Users"
        icon={<LuUsers className="text-6xl text-primaryYellow" />}
        data={15300}
      />

      {/* Filter Tabs */}
      <div className="col-span-3 flex flex-row justify-between items-center relative">
        <div className="flex flex-row gap-5">
          {userOptions.map((data) => (
            <div
              onClick={() => setSelectedUserOption(data)}
              className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
                selectedUserOption === data
                  ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
                  : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
              }`}
              key={data}
            >
              {data}
            </div>
          ))}
        </div>

        {/* Filter by Date Button */}
        <DatePicker
          label="Filter by Date"
          onChange={(newValue) => onChange(newValue)}
          slotProps={{
            textField: {
              size: "small",
              sx: { width: 200 }, // 👈 set width here
            },
          }}
        />
      </div>

      {/* User Table */}
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
        <UserTable role="super-admin" option={selectedUserOption} />
      </div>

      {/* Admin Verification Section */}
      <div className="col-span-3 flex flex-row justify-between items-center">
        <div className="flex flex-col gap-5">
          <h1 className="font-bold text-primaryYellow text-2xl">
            Admin Verification
          </h1>
          <div className="flex flex-row gap-5">
            {adminOptions.map((data) => (
              <div
                onClick={() => setSelectedAdminOption(data)}
                className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
                  selectedAdminOption === data
                    ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
                    : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
                }`}
                key={data}
              >
                {data}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-5 h-full items-end">
          <div
            onClick={() => alert("clicked")}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-lg">Approve</p>
          </div>
          <div
            onClick={() => alert("clicked")}
            className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-lg">Reject</p>
          </div>
        </div>
      </div>

      {/* Admin Verification Table */}
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
        <AdminVerTable option={selectedAdminOption} />
      </div>
    </div>
  );
}
