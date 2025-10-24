import React, { useMemo } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";

/**
 * props:
 *  - data: [{ d: 'YYYY-MM-DD', revenue: number }]
 *  - bestProduct?: { prod_id:number, prod_name:string, trays:number, revenue:number }
 */
export default function LineChart({ data = [], bestProduct = null }) {
  const chartData = useMemo(() => {
    const fmtDay = new Intl.DateTimeFormat("en", { weekday: "short" });
    const labels = data.map((r) => fmtDay.format(new Date(r.d)));
    const values = data.map((r) => Number(r.revenue || 0));
    return {
      labels,
      datasets: [
        {
          label: "Revenue (₱/day)",
          data: values,
          borderColor: "#b91c1c",
          backgroundColor: "rgba(185, 28, 28, .15)",
          borderWidth: 2,
          tension: 0.25,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [data]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ₱${Number(ctx.parsed.y ?? 0).toFixed(2)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: { callback: (v) => `₱${v}` },
        },
      },
    }),
    []
  );

  return (
    <div className="w-full h-80">
      {bestProduct && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-gray-600">Top product:</span>
          <span className="px-2 py-1 rounded-full bg-softSecondaryYellow text-primaryYellow font-semibold">
            {bestProduct.prod_name}
          </span>
          <span className="text-gray-500">
            • {bestProduct.trays} trays • ₱{Number(bestProduct.revenue).toFixed(2)}
          </span>
        </div>
      )}
      <Line data={chartData} options={options} />
    </div>
  );
}
