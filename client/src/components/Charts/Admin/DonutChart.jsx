import { Doughnut } from "react-chartjs-2";
import { orderStatusData, doughnutOptions } from "../../../constants/mockData";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function DoughnutChart() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col">
        <h1 className="font-bold text-2xl">Order Status</h1>
        <div className="flex flex-row gap-2 items-center text-gray-400 cursor-pointer">
          <p className="text-base">View More</p>
          <MdKeyboardArrowRight className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center justify-center h-75">
        <Doughnut data={orderStatusData} options={doughnutOptions} />
      </div>
    </div>
  );
}
