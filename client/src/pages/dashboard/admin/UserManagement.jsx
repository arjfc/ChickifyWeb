import React, { useState } from "react";
import UserTable from "../../../components/UserTable";
import SusActTable from "../../../components/admin/tables/SusActTable";
import { LuUserRound } from "react-icons/lu";
import DashboardCard from "../../../components/DashboardCard";
import {
  IoChevronDown,
  IoFilterOutline,
} from "react-icons/io5";
import { BsGrid } from "react-icons/bs";
import { PiSealWarningBold } from "react-icons/pi";
import { DatePicker } from "@mui/x-date-pickers";

export default function UserManagement() {
  // Tabs for Farmer / Buyer
  const userOptions = ["Farmer", "Buyer"];
  const [selectedUserOption, setSelectedUserOption] = useState("Farmer");

  // Main Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMainType, setSelectedMainType] = useState("All");
  const mainTypes = ["All", "Active", "Inactive", "Deactivated"];

  // Calendar
  const [value, onChange] = useState(new Date());

  // Type of Flag
  const [selectedFlagType, setSelectedFlagType] = useState("All");
  const flagTypes = ["All", "Payment Failures", "Multiple Complaints"];

  // Risk Level
  const [selectedRisk, setSelectedRisk] = useState("All");
  const riskLevels = ["All", "High", "Medium", "Low"];

  const handleMainSelect = (type) => {
    setSelectedMainType(type);
    setIsDropdownOpen(false);
  };

  return (
    <div className="grid grid-cols-2 gap-6 relative">
      {/* Cards */}
      <DashboardCard
        title="Total Active Farmer Users"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={15300}
      />
      <DashboardCard
        title="Total Active Buyer Users"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={15300}
      />

      {/* Filter Tabs */}
      <div className="col-span-2 flex flex-row justify-between items-center relative">
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
          <div
            onClick={() => alert("clicked")}
            className="flex items-center cursor-pointer rounded-xl px-5 py-2 transition-colors border-gray-300 border text-lg hover:border-primaryYellow hover:text-primaryYellow hover:font-bold"
          >
            <IoFilterOutline />
          </div>
        </div>

        {/* Main Dropdown */}
        <div className="relative">
          <div
            className="flex flex-row items-center gap-2 shadow-xl border bg-primaryYellow text-white border-gray-300 font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <p className="text-lg">{selectedMainType}</p>
            <IoChevronDown
              className={`transform transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isDropdownOpen && (
            <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {mainTypes.map((type, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                  onClick={() => handleMainSelect(type)}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Table */}
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
        <UserTable
          role={"admin"}
          option={selectedUserOption}
          type={selectedMainType}
        />
      </div>

      <div className="col-span-3">
        <h1 className="text-3xl font-bold text-primaryYellow">
          Suspicious Activities
        </h1>
      </div>
      {/* Suspicious Acts Filters */}
      <div className="col-span-3">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center relative gap-5">
            {/* Calendar Button */}
            <DatePicker
              label="Date Range"
              onChange={(newValue) => onChange(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 200 }, // 👈 set width here
                },
              }}
            />

            {/* Dropdown Filters */}
            <div className="flex flex-row items-center gap-3">
              {/* Type of Flag */}
              <div className="flex flex-row items-center gap-2 border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600">
                <BsGrid className="text-xl" />
                <select
                  value={selectedFlagType}
                  onChange={(e) => setSelectedFlagType(e.target.value)}
                  className="bg-transparent outline-none text-lg cursor-pointer"
                >
                  {flagTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Risk Level */}
              <div className="flex flex-row items-center gap-2 border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600">
                <PiSealWarningBold className="text-xl" />
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="bg-transparent outline-none text-lg cursor-pointer"
                >
                  {riskLevels.map((risk, index) => (
                    <option key={index} value={risk}>
                      {risk}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Button */}
              <div className="flex items-center cursor-pointer rounded-xl px-5 py-3 transition-colors border-gray-300 border text-lg hover:border-primaryYellow hover:text-primaryYellow hover:font-bold">
                <IoFilterOutline />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspicious Act Table */}
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
        <SusActTable
          role={"admin"}
          option={selectedUserOption}
          type={selectedFlagType}
          risk={selectedRisk}
        />
      </div>
    </div>
  );
}
