import React, { useMemo, useState, useEffect } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";

/**
 * props:
 *  - data:
 *      usually [{ d: 'YYYY-MM-DD', <valueKey>: number }]
 *      but if an object is passed, will try data.raw
 *  - bestProduct?: { prod_id, prod_name, trays, revenue }
 *  - valueKey?: string          // field to read values from (default 'revenue')
 *  - valueType?: 'peso' | 'int' // formatting for Y axis & tooltip
 *  - datasetLabel?: string      // label shown in legend / tooltip
 */
export default function LineChart({
  data = [],
  bestProduct = null,
  valueKey = "revenue",
  valueType = "peso",
  datasetLabel,
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // normalize data
  const rows = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.raw)) return data.raw;
    return [];
  }, [data]);

  // 🔹 When data changes, auto-set range to min/max date in data
  useEffect(() => {
    if (!rows.length) return;
    // assume rows are already sorted by date; if not, you can sort here
    const first = rows[0];
    const last = rows[rows.length - 1];

    // only set if user hasn't picked anything yet
    if (!from) setFrom(first.d);
    if (!to) setTo(last.d);
  }, [rows, from, to]);

  const { fromDate, toDate } = useMemo(() => {
    const f = from ? new Date(from) : null;
    const t = to ? new Date(to) : null;
    if (f) f.setHours(0, 0, 0, 0);
    if (t) t.setHours(23, 59, 59, 999);
    return { fromDate: f, toDate: t };
  }, [from, to]);

  const chartData = useMemo(() => {
    // show month+day so user sees real dates
    const fmtDay = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    });

    const labels = rows.map((r) => fmtDay.format(new Date(r.d)));
    const baseValues = rows.map((r) => Number(r[valueKey] ?? 0));

    const highlightValues = rows.map((r) => {
      const dt = new Date(r.d);
      dt.setHours(12, 0, 0, 0);

      const inRange =
        (!fromDate || dt >= fromDate) && (!toDate || dt <= toDate);

      return inRange ? Number(r[valueKey] ?? 0) : null;
    });

    const baseLabel =
      datasetLabel ||
      (valueType === "peso" ? "Revenue (₱/day)" : "Value per day");

    return {
      labels,
      datasets: [
        {
          label: baseLabel,
          data: baseValues,
          borderColor: "rgba(148,163,184,1)", // slate-400
          backgroundColor: "rgba(148,163,184,.15)",
          borderWidth: 1.5,
          tension: 0.25,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: `${baseLabel} (Selected range)`,
          data: highlightValues,
          borderColor: "#b91c1c",
          backgroundColor: "rgba(185, 28, 28, .25)",
          borderWidth: 2,
          tension: 0.25,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [rows, valueKey, valueType, datasetLabel, fromDate, toDate]);

  const options = useMemo(() => {
    const formatY = (v) => {
      const num = Number(v) || 0;
      if (valueType === "peso") return `₱${num}`;
      return `${num}`;
    };

    const formatTooltip = (v) => {
      const num = Number(v) || 0;
      if (valueType === "peso") return ` ₱${num.toFixed(2)}`;
      return ` ${num.toLocaleString()}`;
    };

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => formatTooltip(ctx.parsed.y),
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: { callback: (v) => formatY(v) },
        },
      },
    };
  }, [valueType]);

  return (
    <div className="w-full h-80 flex flex-col gap-3">
      {/* Date-range controls */}
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        <span className="font-semibold text-gray-600">Highlight range:</span>

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

        {/* Legend for the two datasets */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
            <span className="inline-block w-3 h-2 rounded-sm bg-slate-300" />
            All days
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
            <span className="inline-block w-3 h-2 rounded-sm bg-red-500" />
            Selected range
          </div>
        </div>
      </div>

      {bestProduct && valueType === "peso" && (
        <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-gray-600">Top product:</span>
          <span className="px-2 py-1 rounded-full bg-softSecondaryYellow text-primaryYellow font-semibold">
            {bestProduct.prod_name}
          </span>
          <span className="text-gray-500">
            • {bestProduct.trays} trays • ₱
            {Number(bestProduct.revenue).toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex-1">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
