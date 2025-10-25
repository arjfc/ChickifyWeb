// 2ND CODE (date range copied from FIRST CODE)
import React, { useState } from "react";
import ReportTable from "../../../components/admin/tables/ReportTable";
import { LuCalendar } from "react-icons/lu";

export default function Reports() {
  const options = [
    "Payout History",
    "Sales Records",
    "Transaction Records",
    "Egg Stock",
    "Egg Production",
  ];

  const [selectedOption, setSelectedOption] = useState("Payout History");

  // 🔽 Copied date-range state + options from FIRST CODE
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
      {/* Tabs (line ends after Egg Production) */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-9 border-b border-gray-300 flex-grow-0">
          {options.map((data) => (
            <div
              key={data}
              onClick={() => setSelectedOption(data)}
              className={`text-lg font-semibold cursor-pointer transition-colors duration-200 pb-2 ${
                selectedOption === data
                  ? "text-primaryYellow border-b-4 border-primaryYellow"
                  : "text-gray-400"
              }`}
            >
              {data}
            </div>
          ))}
        </div>

        {/* Date + Button (not underlined) */}
        <div className="flex flex-row items-center gap-4">
          {/* 🔽 Replaced MUI DatePicker with the same dropdown from FIRST CODE */}
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

          <div
            onClick={() => alert("Generate Report clicked")}
            className="cursor-pointer bg-primaryYellow text-white text-base font-semibold rounded-lg px-4 py-2"
          >
            Generate Report
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ReportTable selectedOption={selectedOption} />
      </div>
    </div>
  );
}
