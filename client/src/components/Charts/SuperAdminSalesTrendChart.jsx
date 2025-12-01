// src/components/Charts/SuperAdminSalesTrendChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function SuperAdminSalesTrendChart({
  data = [],
  rangeDays = 7,
  onChangeRangeDays = () => {},
}) {
  return (
    <div className="w-full">
      {/* Header + Filter Buttons */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-primaryYellow">
          Overall Sales Trend (Super Admin)
        </h2>

        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => onChangeRangeDays(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                rangeDays === days
                  ? "bg-primaryYellow text-black"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="d"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => (val ? String(val).slice(5) : "")}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => `₱${val}`}
            />
            <Tooltip
              formatter={(value) => [`₱${value}`, "Revenue"]}
              labelFormatter={(label) => `Date: ${label}`}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#FEC619"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
