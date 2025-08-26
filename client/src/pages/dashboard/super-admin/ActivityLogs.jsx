import React, { useState } from "react";
import LogsTable from "../../../components/super-admin/tables/LogsTable";
import { BsGrid } from "react-icons/bs";
import { DatePicker } from "@mui/x-date-pickers";
import { IoFilterSharp } from "react-icons/io5";

export default function ActivityLogs() {
  const adminOptions = ["Admin", "Payment Status", "Order Status"];
  const [selectedAdminOption, setSelectedAdminOption] = useState("Admin");

  const [value, onChange] = useState(new Date());

  const types = ["All", "Approved Listing", "Rejected Listing"];
  const [selectedType, setSelectedType] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center bg-primaryYellow p-3 rounded-2xl">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-5 items-center">
            {adminOptions.map((data) => (
              <div
                onClick={() => setSelectedAdminOption(data)}
                className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
                  selectedAdminOption === data
                    ? "border border-primaryYellow text-black  bg-yellow-50"
                    : " text-black hover:border-primaryYellow hover:text-yellow-100"
                }`}
                key={data}
              >
                {data}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-row items-center relative gap-5">
        {/* Date Range Picker */}
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

        <div className="flex flex-row items-center gap-2 border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600">
          <BsGrid className="text-xl" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent outline-none text-lg cursor-pointer"
          >
            <option value="" disabled>
              Action Type
            </option>
            {types.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Icon */}
        <div
          onClick={() => {}}
          className="flex gap-3 font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90 border border-gray-400 text-gray-400"
        >
          <IoFilterSharp onClick={() => alert("clicked")} className="text-xl" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <LogsTable selectedOption={selectedAdminOption} type={selectedType} />
      </div>
    </div>
  );
}
