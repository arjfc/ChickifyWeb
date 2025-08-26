import React, { useState } from "react";
import { BsGrid } from "react-icons/bs";
import { FaRegUser } from "react-icons/fa";
import ReportsTable from "../../../components/super-admin/tables/ReportsTable";
import { DatePicker } from "@mui/x-date-pickers";

export default function Reports() {
  const options = [
    "Admin Activity",
    "Fraud Detection",
    "Payout Reports",
    "Financial Summaries",
    "User Logs",
  ];
  const [selectedOption, setSelectedOption] = useState("Admin Activity");

  const [value, onChange] = useState(new Date());

  const [selectedType, setSelectedType] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const types = ["All", "Approved Listing", "Rejected Listing"];
  const typesUsers = ["All", "Admin", "Farmer", "Alien"];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center border-b border-gray-300">
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

      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center relative gap-5">
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
          <div className="flex flex-row items-center gap-2 border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600">
            <FaRegUser className="text-xl" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent outline-none text-lg cursor-pointer"
            >
              <option value="" disabled>
                User Role
              </option>
              {typesUsers.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div
          onClick={() => alert("clicked")}
          className="cursor-pointer bg-primaryYellow text-white text-lg font-bold rounded-lg p-3"
        >
          Generate Report
        </div>
      </div>
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ReportsTable type={selectedType} role={selectedRole} />
      </div>
    </div>
  );
}
