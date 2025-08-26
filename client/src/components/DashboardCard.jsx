import React from "react";

export default function DashboardCard({title, data, icon}) {
  return (
    <div className="flex flex-row items-end gap-4 p-6 rounded-lg border border-gray-200 shadow-lg h-full">
      <div className="text-primaryYellow">{icon}</div>
      <div className="flex flex-col items-start justify-center">
        <p className="text-gray-500 font-semibold">{title}</p>
        <h1 className="text-4xl font-bold text-primaryYellow">{data.toLocaleString()}</h1>
      </div>
    </div>
  );
}
