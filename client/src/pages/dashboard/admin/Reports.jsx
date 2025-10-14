import React, { useState } from "react";
import ReportTable from "../../../components/admin/tables/ReportTable";
import { DatePicker } from "@mui/x-date-pickers";

export default function Reports() {
  const options = [
    "Payout History",
    "Sales Records",
    "Transaction Records",
    "Egg Stock",
    "Egg Production",
  ];

  const [selectedOption, setSelectedOption] = useState("Payout History");
  const [value, onChange] = useState(new Date());

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
          <DatePicker
            label="Date Range"
            onChange={(newValue) => onChange(newValue)}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 200 },
              },
            }}
          />
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
