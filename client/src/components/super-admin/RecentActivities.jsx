import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import Table from "../Table";
export default function RecentActivities() {
  const activities = [
    {
      time: "10:45 AM",
      activity: "Approved egg listing",
      user: "Admin - Maria Lopez",
      details: `"Farm Fresh Eggs Bantayan Batch #1023" approved.`,
    },
    {
      time: "10:00 AM",
      activity: "New farmer account registered",
      user: "Farmer - Bantayan Eggs Corp",
      details: "Account pending verification.",
    },
    {
      time: "10:00 AM",
      activity: "New farmer account registered",
      user: "Farmer - Bantayan Eggs Corp",
      details: "Account pending verification.",
    },
    {
      time: "10:00 AM",
      activity: "New farmer account registered",
      user: "Farmer - Bantayan Eggs Corp",
      details: "Account pending verification.",
    },
  ];

  const headers = ["Time", "Activity", "User", "Details"];

  return (
    <div className="flex flex-col">
     <div className="flex flex-row items-center justify-between mb-2 px-6 py-2">
        <h1 className="text-gray-400">Recent Activities</h1>
        <div onClick={() => alert('clicked')} className="flex flex-row gap-2 items-center justify-center text-gray-400 cursor-pointer">
          <p className="text-base">View More</p>
          <MdKeyboardArrowRight className="w-5 h-5" />
        </div>
      </div>
    <Table headers={headers}>
        {activities.map((item, index) => (
          <tr
            key={index}
            className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm  transition"
          >
            <td className="px-4 py-3 text-center font-medium">
              {item.time}
            </td>
            <td className="px-4 py-3 text-center">{item.activity}</td>
            <td className="px-4 py-3 text-center">{item.user}</td>
            <td className="px-4 py-3 text-center">{item.details}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
