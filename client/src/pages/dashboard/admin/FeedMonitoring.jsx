import React, { useState } from "react";
import {  IoFilterOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import FeedMonitoringTable from "../../../components/admin/tables/FeedMonitoringTable";
import { DatePicker } from "@mui/x-date-pickers";

export default function FeedMonitoring() {
  const [value, onChange] = useState(new Date());

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="col-span-1 flex flex-row items-center justify-end gap-5">
        <DatePicker
            label="Filter by Date"
            onChange={(newValue) => onChange(newValue)}
          />
        <div onClick={() => alert('Clicked')} className="flex items-center cursor-pointer rounded-xl px-5 py-3 transition-colors border-gray-300 border text-lg hover:border-primaryYellow hover:text-primaryYellow hover:font-bold">
          <IoFilterOutline />
        </div>
      </div>
      <div className="col-span-1 p-6 rounded-lg border border-gray-200 shadow-lg">
        <FeedMonitoringTable />
      </div>
    </div>
  );
}
