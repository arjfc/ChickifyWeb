import React, { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoFilterSharp } from "react-icons/io5";
import ReportTable from "../../../components/admin/tables/ReportTable";
import { DatePicker } from "@mui/x-date-pickers";

export default function Reports() {
  const options = ["Payout History", "Seller Sales", "Transaction Records"];
  const [selectedOption, setSelectedOption] = useState("Payout History");

  const [value, onChange] = useState(new Date());

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row justify-between items-center border-b border-gray-300 gap-5">
          {options.map((data) => (
            <div
              key={data}
              onClick={() => setSelectedOption(data)}
              className={`text-fluid-xl font-semibold px-4 py-2 cursor-pointer transition-colors duration-200 ${
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
          <div
            onClick={() => {}}
            className="flex gap-3 font-medium rounded-lg px-5 py-3 cursor-pointer hover:opacity-90 border border-gray-400 text-gray-400"
          >
            <IoFilterSharp
              onClick={() => alert("clicked")}
              className="text-lg"
            />
          </div>
          <DatePicker
            label="Filter by Date"
            onChange={(newValue) => onChange(newValue)}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 200 }, 
              },
            }}
          />
          <div
            onClick={() => alert("clicked")}
            className="bg-primaryYellow cursor-pointer text-white text-lg font-bold rounded-lg px-5 py-3"
          >
            Generate Report
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ReportTable selectedOption={selectedOption} />
      </div>
    </div>
  );
}
