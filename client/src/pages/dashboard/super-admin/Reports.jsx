import { useState } from "react";
import ReportsTable from "../../../components/super-admin/tables/ReportsTable";
import { LuCalendar } from "react-icons/lu";
// import { BsGrid } from "react-icons/bs";

export default function Reports() {
  const options = ["Platform", "Transaction", "Service"];
  const [selectedOption, setSelectedOption] = useState(options[0]); 

  const dateOptions = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "last_month", label: "Last month" },
  ];

  // Filters
  const [reportDateRange, setReportDateRange] = useState("all"); 

  return (
    <div className="flex flex-col gap-6">
  
      <div className="flex items-center border-b border-gray-300">
        {options.map((label) => (
          <button
            key={label}
            onClick={() => setSelectedOption(label)}
            className={`px-4 py-2 text-base md:text-lg transition-colors ${
              selectedOption === label
                ? "text-primaryYellow font-semibold border-b-4 border-primaryYellow"
                : "text-gray-400 hover:text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 [&_svg]:w-4 [&_svg]:h-4">
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
            <LuCalendar className="text-gray-600" />
            <select
              value={reportDateRange}
              onChange={(e) => setReportDateRange(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Right: Generate button */}
        <button
          onClick={() => alert("clicked")}
          className="bg-primaryYellow text-white text-sm font-semibold rounded-lg px-4 py-2"
        >
          Generate Report
        </button>
      </div>

      {/* Table */}
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ReportsTable
          tab={selectedOption}
          dateRange={reportDateRange}
        />
      </div>
    </div>
  );
}
