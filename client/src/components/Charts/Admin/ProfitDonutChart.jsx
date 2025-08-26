import { Doughnut } from "react-chartjs-2";
import { orderStatusData, getDoughnutOptions } from "../../../constants/mockData";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function ProfitDonutChart({ title, centerText }) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="font-bold text-2xl">{title}</h1>
        <div className="flex flex-row gap-2 items-center text-gray-400 cursor-pointer">
          <p className="text-base">View More</p>
          <MdKeyboardArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* Chart with overlay text */}
      <div className="relative flex items-center justify-center h-75">
        <Doughnut data={orderStatusData} options={getDoughnutOptions()} />
        
        {/* Normal label in the middle */}
        {centerText && (
          <div className="absolute text-xl font-bold text-gray-700">
            {centerText}
          </div>
        )}
      </div>
    </div>
  );
}
