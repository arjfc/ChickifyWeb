//COMPLAINTS
import React, { useState } from "react";
import ComplaintTable from "../../../components/admin/tables/ComplaintTable";
import { DatePicker } from "@mui/x-date-pickers";

export default function Complaints() {
  // Removed "Resolved"
  const options = ["In Review", "Refunded"];
  const [selectedOption, setSelectedOption] = useState("In Review");

  const [value, onChange] = useState(new Date());

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

        <div className="flex flex-row justify-between items-center gap-5">
          <DatePicker
            label="Filter by Date"
            onChange={(newValue) => onChange(newValue)}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 180 },
              },
            }}
          />
          {/* Keep only Refund */}
          <div
            onClick={() => {
              // 🔹 ADDED: trigger the refund modal in ComplaintTable
              window.dispatchEvent(new CustomEvent("openRefundModal"));
            }}
            className="cursor-pointer bg-gray-600 text-white text-md font-bold rounded-lg px-5 py-2"
          >
            Refund
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ComplaintTable selectedOption={selectedOption} />
      </div>
    </div>
  );
}
