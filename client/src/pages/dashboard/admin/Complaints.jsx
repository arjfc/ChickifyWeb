import React, { useState } from "react";
import ComplaintTable from "../../../components/admin/tables/ComplaintTable";
import { DatePicker } from "@mui/x-date-pickers";

export default function Complaints() {
  const options = ["In Review", "Resolved", "Refunded"];
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
              className={`text-2xl font-semibold px-4 py-2 cursor-pointer transition-colors duration-200 ${
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
          />
          <div
            onClick={() => alert("clicked")}
            className="cursor-pointer bg-gray-600 text-white text-lg font-bold rounded-lg px-5 py-3"
          >
            Refund
          </div>
          <div
            onClick={() => alert("clicked")}
            className="cursor-pointer bg-primaryYellow text-white text-lg font-bold rounded-lg px-5 py-3"
          >
            Resolve
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ComplaintTable selectedOption={selectedOption} />
      </div>
    </div>
  );
}
