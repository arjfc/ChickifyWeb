// components/Charts/Admin/PriceForecastChart.jsx
import React, { useMemo, useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

/**
 * props.data: Array<{ month_date: "YYYY-MM-DD", price: number, demand_tag: "in-demand"|"balanced"|"not-in-demand", note?: string }>
 * Example element:
 * { month_date: "2025-01-01", price: 300, demand_tag: "balanced", note: "post-holiday normalization" }
 */
export default function PriceForecastChart({ data = [] }) {
  const [view, setView] = useState("monthly");
  const [isOpen, setIsOpen] = useState(false);

  const options = ["weekly", "monthly"];

  const lineChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // show the demand tag + optional note in tooltip
            afterLabel: (ctx) => {
              const point = ctx?.raw?.__meta;
              if (!point) return "";
              const tag = point.demand_tag?.replaceAll("-", " ") || "";
              const note = point.note ? `\n${point.note}` : "";
              return ` ${tag}${note}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { autoSkip: false, maxRotation: 0 },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: "₱ per tray" },
          ticks: { callback: (v) => `₱${v}` },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
      elements: {
        point: { radius: 4, hoverRadius: 6 },
        line: { borderWidth: 2, tension: 0.25 },
      },
    }),
    []
  );

  // Map demand -> point color
  const colorForDemand = (tag) => {
    switch (tag) {
      case "in-demand":
        return "#198754"; // green
      case "not-in-demand":
        return "#dc3545"; // red
      default:
        return "#0d6efd"; // blue for balanced
    }
  };

  // MONTHLY SERIES (labels & values)
  const monthlySeries = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("en", { month: "short" });
    const labels = data.map((d) => {
      const dt = new Date(d.month_date);
      return fmt.format(dt); // Jan, Feb, ...
    });
    const values = data.map((d) => d.price);
    const pointColors = data.map((d) => colorForDemand(d.demand_tag));

    // attach meta so tooltip can read demand_tag/note
    const meta = data.map((d) => ({
      demand_tag: d.demand_tag,
      note: d.note,
    }));

    return { labels, values, pointColors, meta };
  }, [data]);

  // WEEKLY SERIES (expand each month to 4 weeks with same price)
  const weeklySeries = useMemo(() => {
    if (!data.length) return { labels: [], values: [], pointColors: [], meta: [] };

    const monthFmt = new Intl.DateTimeFormat("en", { month: "short" });
    const labels = [];
    const values = [];
    const pointColors = [];
    const meta = [];

    data.forEach((m) => {
      const dt = new Date(m.month_date);
      const monthName = monthFmt.format(dt);
      for (let w = 1; w <= 4; w++) {
        labels.push(`${monthName} W${w}`);
        values.push(m.price);
        pointColors.push(colorForDemand(m.demand_tag));
        meta.push({ demand_tag: m.demand_tag, note: m.note });
      }
    });

    return { labels, values, pointColors, meta };
  }, [data]);

  // Pick the view
  const series = view === "weekly" ? weeklySeries : monthlySeries;

  // Build chart.js dataset
  const chartData = useMemo(
    () => ({
      labels: series.labels,
      datasets: [
        {
          label: "Forecast Price (₱/tray)",
          data: series.values.map((y, i) => ({
            x: series.labels[i],
            y,
            __meta: series.meta[i],
          })),
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13,110,253,0.15)",
          fill: true,
          pointBackgroundColor: series.pointColors,
          pointBorderColor: series.pointColors,
        },
      ],
    }),
    [series]
  );

  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-primaryYellow font-bold text-2xl">Price Forecasting</h1>
          <div className="flex flex-row gap-2 items-center text-gray-400 cursor-pointer">
            <p className="text-base">View More</p>
            <MdKeyboardArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* View dropdown */}
        <div className="relative inline-block text-left mb-3">
          <div
            className="flex items-center justify-between gap-2 px-4 py-2 bg-primaryYellow text-gray-700 hover:bg-gray-300 rounded-lg cursor-pointer font-semibold text-sm min-w-[120px]"
            onClick={() => setIsOpen((s) => !s)}
          >
            <span className="capitalize">{view}</span>
            <IoChevronDown
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>

          {isOpen && (
            <div className="absolute mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setView(option);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-sm capitalize cursor-pointer transition hover:bg-gray-100 ${
                    view === option ? "bg-primaryYellow text-white" : "text-gray-700"
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
      <div className="h-80 w-full">
        <Line data={chartData} options={lineChartOptions} />
      </div>

      {/* Legend for demand coloring */}
      <div className="flex gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#198754" }} /> in-demand
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#0d6efd" }} /> balanced
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#dc3545" }} /> not-in-demand
        </span>
      </div>
    </div>
  );
}
