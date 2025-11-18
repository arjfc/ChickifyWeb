// components/Charts/Admin/DonutChart.jsx
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { MdKeyboardArrowRight, MdTrendingUp, MdTrendingDown } from "react-icons/md";

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom" } },
};

export default function DonutChart({ data, trend = 0 }) {
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

  const positive = trend >= 0;
  const pillCls = positive
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col">
        <h1 className="font-bold text-2xl">Order Status</h1>

        {/* replaced "View More" with ONE pill, same wrapper classes kept */}
        <div className="flex flex-row gap-2 items-center text-gray-400 cursor-pointer">
          <div className={`flex items-center gap-1 px-2.5 mt-1 py-1 rounded-md text-xs font-semibold ${pillCls}`}>
            {positive ? (
              <MdTrendingUp className="w-4 h-4" />
            ) : (
              <MdTrendingDown className="w-4 h-4" />
            )}
            <span>
              {positive ? "+" : "-"}
              {Math.abs(Math.round(trend))}%
            </span>
          </div>

          {/* keeping the existing import is harmless; remove arrow visually if you want
              or leave it commented to preserve UI structure */}
          {/* <MdKeyboardArrowRight className="w-5 h-5" /> */}
        </div>
      </div>

      <div className="flex items-center justify-center h-75 min-h-[260px]">
        <Doughnut data={chartData} options={doughnutOptions} />
      </div>
    </div>
  );
}
