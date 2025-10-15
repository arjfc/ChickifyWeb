import React, { useState } from "react";
import ComplaintTable from "../../../components/admin/tables/ComplaintTable";
import { LuCalendar } from "react-icons/lu";

export default function Complaints() {
  // Removed "Resolved"
  const options = ["Pending", "Approved", "Rejected"];
  const [selectedOption, setSelectedOption] = useState("Pending");

  // ⬇️ Date range copied from FIRST CODE
  const [dateRange, setDateRange] = useState("all");
  const dateOptions = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "last_month", label: "Last month" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row justify-between items-center border-b border-gray-300 gap-20">
          {options.map((data) => (
            <div
              key={data}
              onClick={() => setSelectedOption(data)}
              className={`text-xl font-semibold px-4 py-2 cursor-pointer transition-colors duration-200 ${
                selectedOption === data
                  ? "text-primaryYellow font-semibold border-b-4 border-primaryYellow"
                  : "text-gray-400"
              }`}
            >
              {data}
            </div>
          ))}
        </div>

        <div className="flex flex-row justify-between items-center gap-4">
          {/* ⬇️ Date Range filter (copied pattern) */}
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-2">
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

          {/* Approve → let table decide if modal should open (needs checkbox selected) */}
          <div
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openRefundModal"));
            }}
            className="cursor-pointer bg-yellow-500 text-white text-md font-bold rounded-lg px-5 py-2"
          >
            Approve
          </div>

          {/* Reject → let table decide if modal should open (needs checkbox selected) */}
          <div
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openRejectModal"));
            }}
            className="cursor-pointer bg-gray-600 text-white text-md font-bold rounded-lg px-5 py-2"
          >
            Reject
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ComplaintTable selectedOption={selectedOption} date={dateRange} />
      </div>
    </div>
  );
}
