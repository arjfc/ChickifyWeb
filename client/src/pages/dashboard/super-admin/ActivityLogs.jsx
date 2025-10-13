import { useState, useEffect } from "react";
import LogsTable from "../../../components/super-admin/tables/LogsTable";
import { BsGrid } from "react-icons/bs";
import { fetchAllActionType } from "@/services/activityLogs";
import { LuCalendar } from "react-icons/lu";

export default function ActivityLogs() {
  const adminOptions = ["Admin", "Farmer", "Buyer"];
  const [selectedAdminOption, setSelectedAdminOption] = useState("Admin");

  // dropdown states
  const [dateRange, setDateRange] = useState("all"); 
  const [types, setTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");

  const dateOptions = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "last_month", label: "Last month" },
  ];

  useEffect(() => {
    (async () => {
      try {
        const actionTypes = await fetchAllActionType();
        setTypes(["All", ...actionTypes]);
      } catch (err) {
        console.error("Failed to load action types:", err);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs (compact) */}
      <div className="flex items-center bg-primaryYellow p-2 rounded-xl">
        <div className="flex gap-2">
          {adminOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedAdminOption(opt)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedAdminOption === opt
                  ? "border border-primaryYellow text-black bg-yellow-50"
                  : "text-black hover:bg-yellow-100/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Row (compact; clamp svg sizes) */}
      <div className="flex items-center gap-3 [&_svg]:w-4 [&_svg]:h-4">
        {/* Date Range Dropdown — same UI as Action Type */}
        <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
          <LuCalendar className="text-gray-600" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Type Dropdown — unchanged */}
        <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
          <BsGrid className="text-gray-600" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700"
          >
            {types.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Logs Table */}
        <LogsTable
          selectedOption={selectedAdminOption}
          type={selectedType}
          dateRange={dateRange}   
        />
    </div>
  );
}
