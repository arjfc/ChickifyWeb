import React, { useMemo, useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";

/**
 * Expects data like:
 *   [{ d: 'YYYY-MM-DD', size_id: number, size_description: string, eggs: number }]
 */
export default function EggProductionChart({ data = [] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedSize, setSelectedSize] = useState("all"); // "all" or size_id as string

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Build distinct (size_id, label) options from the data
  const sizeOptions = useMemo(() => {
    const map = new Map(); // size_id -> label
    for (const r of rows) {
      if (r.size_id == null) continue;
      const label =
        r.size_description || `Size ${r.size_id}`;
      if (!map.has(r.size_id)) {
        map.set(r.size_id, label);
      }
    }
    return Array.from(map.entries()).sort(
      (a, b) => Number(a[0]) - Number(b[0])
    ); // [ [size_id, label], ... ]
  }, [rows]);

  const { fromDate, toDate } = useMemo(() => {
    const f = from ? new Date(from) : null;
    const t = to ? new Date(to) : null;
    if (f) f.setHours(0, 0, 0, 0);
    if (t) t.setHours(23, 59, 59, 999);
    return { fromDate: f, toDate: t };
  }, [from, to]);

  // Filter by selected size
  const filteredBySize = useMemo(() => {
    if (selectedSize === "all") return rows;
    const sizeNum = Number(selectedSize);
    return rows.filter((r) => Number(r.size_id) === sizeNum);
  }, [rows, selectedSize]);

  const chartData = useMemo(() => {
    const fmtDay = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    });

    const labels = filteredBySize.map((r) =>
      fmtDay.format(new Date(r.d))
    );

    const allValues = filteredBySize.map((r) =>
      Number(r.eggs ?? 0)
    );

    const highlightValues = filteredBySize.map((r) => {
      const dt = new Date(r.d);
      dt.setHours(12, 0, 0, 0);

      const inRange =
        (!fromDate || dt >= fromDate) && (!toDate || dt <= toDate);

      return inRange ? Number(r.eggs ?? 0) : null;
    });

    return {
      labels,
      datasets: [
        {
          label: "Eggs (all days)",
          data: allValues,
          borderColor: "rgba(148,163,184,1)", // slate-400
          backgroundColor: "rgba(148,163,184,.15)",
          borderWidth: 1,
          tension: 0.25,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: "Selected range",
          data: highlightValues,
          borderColor: "#b91c1c",
          backgroundColor: "rgba(185,28,28,.25)",
          borderWidth: 2,
          tension: 0.25,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [filteredBySize, fromDate, toDate]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ${Number(
                ctx.parsed.y ?? 0
              ).toLocaleString()} eggs`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            callback: (v) => `${v}`, // integers, no ₱
          },
        },
      },
    }),
    []
  );

  return (
    <div className="w-full h-80 flex flex-col gap-3">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        <span className="font-semibold text-gray-600">Size:</span>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primaryYellow"
        >
          <option value="all">All sizes</option>
          {sizeOptions.map(([id, label]) => (
            <option key={id} value={String(id)}>
              {label}
            </option>
          ))}
        </select>

        <span className="font-semibold text-gray-600 ml-2">
          Highlight range:
        </span>

        <label className="flex items-center gap-1">
          <span className="text-gray-500">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primaryYellow"
          />
        </label>

        <label className="flex items-center gap-1">
          <span className="text-gray-500">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primaryYellow"
          />
        </label>

        {(from || to) && (
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
