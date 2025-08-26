import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { salesTrendData, salesTrendOptions } from "../../constants/mockData";
import { IoChevronDown } from "react-icons/io5";

export default function SalesTrendChart() {
  const [view, setView] = useState("weekly"); // default
  const [isOpen, setIsOpen] = useState(false);

  const options = ["weekly", "monthly"];

  const handleSelect = (option) => {
    setView(option);
    setIsOpen(false);
  };

  return (
    <div className="w-full h-full">
      {/* Filter buttons */}
      <div className="flex items-center justify-between">
        <div className=""></div>
        <h1 className="text-lg font-bold">Sales Trend Chart</h1>
        <div className="relative inline-block text-left mb-3">
          {/* Dropdown Trigger */}
          <div
            className="flex items-center justify-between gap-2 px-4 py-2 bg-primaryYellow text-black hover:bg-gray-300 rounded-lg cursor-pointer font-semibold text-sm min-w-[120px]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="capitalize">{view}</span>
            <IoChevronDown
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 text-sm capitalize cursor-pointer transition hover:bg-gray-100 ${
                    view === option
                      ? "bg-primaryYellow text-white"
                      : "text-gray-700"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-100 w-full">
        <Bar
          data={salesTrendData[view]}
          options={salesTrendOptions}
        />
      </div>
    </div>
  );
}
