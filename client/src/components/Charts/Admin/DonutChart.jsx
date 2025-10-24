// components/Charts/Admin/DonutChart.jsx
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { MdKeyboardArrowRight } from "react-icons/md";

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom" } },
};

export default function DonutChart({ data }) {
  // debug
  console.log("[DonutChart] data:", data);

  const labels = data?.labels ?? ["pending", "on_delivery", "complete", "cancelled"];
  const values = data?.series ?? [0, 0, 0, 0];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Orders",
        data: values,
        backgroundColor: ["#fbbf24", "#60a5fa", "#22c55e", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col">
        <h1 className="font-bold text-2xl">Order Status</h1>
        <div className="flex flex-row gap-2 items-center text-gray-400 cursor-pointer">
          <p className="text-base">View More</p>
          <MdKeyboardArrowRight className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-center h-75 min-h-[260px]">
        <Doughnut data={chartData} options={doughnutOptions} />
      </div>
    </div>
  );
}
