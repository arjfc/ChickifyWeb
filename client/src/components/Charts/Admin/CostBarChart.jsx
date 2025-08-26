import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  customerGrowthData,
  analysisOptions,
} from "../../../constants/mockData";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

export default function CostBarChart() {
  const [view, setView] = useState("weekly"); 
  const [isOpen, setIsOpen] = useState(false);

  const options = ["weekly", "monthly"];

  const handleSelect = (option) => {
    setView(option);
    setIsOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-primaryYellow font-bold text-2xl">
            Cost Breakdown Analysis
          </h1>
          <div className="flex flex-row gap-2 items-center text-gray-400 cursor-pointer">
            <p className="text-base">View More</p>
            <MdKeyboardArrowRight className="w-5 h-5" />
          </div>
        </div>
        {/* Filter buttons */}
        <div className="relative inline-block text-left mb-3">
          {/* Dropdown Trigger */}
          <div
            className="flex items-center justify-between gap-2 px-4 py-2 bg-black text-white hover:bg-gray-300 rounded-lg cursor-pointer font-semibold text-sm min-w-[120px]"
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
      <div className="h-64 w-full">
        <Bar data={customerGrowthData[view]} options={analysisOptions} />
      </div>
    </div>
  );
}
