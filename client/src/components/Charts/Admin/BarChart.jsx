import { useMemo, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { analysisOptions } from "../../../constants/mockData";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

/**
 * Props:
 *  data: Array of either
 *    - { d: "YYYY-MM-DD", new_users: number }  (from rpc_customer_growth)
 *    - { label: string, value: number }        (generic shape – also supported)
 */
export default function BarChart({ data = [] }) {
  const [view, setView] = useState("weekly"); // "weekly" | "monthly"
  const [isOpen, setIsOpen] = useState(false);

  // date range (used for highlighting)
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // ---- helpers -------------------------------------------------------------
  const parsePoint = (p) => {
    // support both {d, new_users} and {label, value}
    if (p && p.d && typeof p.new_users !== "undefined") {
      return { date: new Date(p.d), value: Number(p.new_users) || 0 };
    }
    if (p && p.label && typeof p.value !== "undefined") {
      // label might be YYYY-MM or any string; best effort for date
      const maybe = new Date(p.label);
      const valid = !isNaN(maybe.getTime());
      return { date: valid ? maybe : null, value: Number(p.value) || 0, label: p.label };
    }
    return null;
  };

  const startOfWeek = (dt) => {
    // Monday as week start
    const d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
    const day = d.getUTCDay() || 7; // Sun=0 => 7
    if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  // all raw dates (for default range)
  const allDates = useMemo(() => {
    const arr = [];
    data.forEach((raw) => {
      const p = parsePoint(raw);
      if (p?.date) arr.push(p.date);
    });
    arr.sort((a, b) => a - b);
    return arr;
  }, [data]);

  // when data changes, default range = min..max of data
  useEffect(() => {
    if (!allDates.length) return;
    const first = allDates[0];
    const last = allDates[allDates.length - 1];
    if (!from) setFrom(first.toISOString().slice(0, 10));
    if (!to) setTo(last.toISOString().slice(0, 10));
  }, [allDates, from, to]);

  const { fromDate, toDate } = useMemo(() => {
    const f = from ? new Date(from) : null;
    const t = to ? new Date(to) : null;
    if (f) f.setHours(0, 0, 0, 0);
    if (t) t.setHours(23, 59, 59, 999);
    return { fromDate: f, toDate: t };
  }, [from, to]);

  // ---- build Monthly series ------------------------------------------------
  const monthly = useMemo(() => {
    const map = new Map(); // key = YYYY-MM
    data.forEach((raw) => {
      const p = parsePoint(raw);
      if (!p) return;
      if (p.date) {
        const key = `${p.date.getUTCFullYear()}-${String(
          p.date.getUTCMonth() + 1
        ).padStart(2, "0")}`;
        map.set(key, (map.get(key) || 0) + p.value);
      } else if (p.label) {
        map.set(p.label, (map.get(p.label) || 0) + p.value);
      }
    });

    const keys = Array.from(map.keys()).sort(); // YYYY-MM sorts fine
    const labels = [];
    const values = [];
    const dates = [];

    keys.forEach((k) => {
      const [y, m] = k.split("-").map(Number);
      const dt = new Date(Date.UTC(y, (m || 1) - 1, 1));
      dates.push(dt);
      labels.push(
        new Intl.DateTimeFormat("en", {
          month: "short",
          year: "2-digit",
        }).format(dt)
      );
      values.push(map.get(k) || 0);
    });

    return { labels, values, dates };
  }, [data]);

  // ---- build Weekly series -------------------------------------------------
  const weekly = useMemo(() => {
    const map = new Map(); // key = YYYY-MM-DD (Mon)
    data.forEach((raw) => {
      const p = parsePoint(raw);
      if (!p || !p.date) return;
      const wk = startOfWeek(p.date);
      const key = wk.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + p.value);
    });

    const keys = Array.from(map.keys()).sort();
    const labels = [];
    const values = [];
    const dates = [];

    keys.forEach((k) => {
      const d = new Date(k + "T00:00:00Z");
      dates.push(d);
      const month = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
      const day = d.getUTCDate();
      labels.push(`${month} ${String(day).padStart(2, "0")}`); // e.g., "Oct 07"
      values.push(map.get(k) || 0);
    });

    return { labels, values, dates };
  }, [data]);

  // ---- pick view -----------------------------------------------------------
  const series = view === "weekly" ? weekly : monthly;

  const chartData = useMemo(() => {
    const { labels, values, dates } = series;

    // color bars based on date range
    const bgColors = (dates || []).map((dt) => {
      if (!dt) return "rgba(252, 191, 73, 0.35)"; // no date -> default
      const inRange =
        (!fromDate || dt >= fromDate) && (!toDate || dt <= toDate);
      return inRange
        ? "rgba(185, 28, 28, 0.7)" // highlighted
        : "rgba(252, 191, 73, 0.35)"; // normal
    });

    const borderColors = (dates || []).map((dt) => {
      if (!dt) return "rgba(252, 191, 73, 1)";
      const inRange =
        (!fromDate || dt >= fromDate) && (!toDate || dt <= toDate);
      return inRange ? "rgba(185, 28, 28, 1)" : "rgba(252, 191, 73, 1)";
    });

    return {
      labels,
      datasets: [
        {
          label: "New Customers",
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [series, fromDate, toDate]);

  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-primaryYellow font-bold text-2xl">
            Customer Growth Analysis
          </h1>
          <div className="flex flex-row gap-2 items-center text-gray-400 cursor-pointer">
            <p className="text-base">View More</p>
            <MdKeyboardArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* View dropdown */}
        <div className="relative inline-block text-left mb-3">
          <div
            className="flex items-center justify-between gap-2 px-4 py-2 bg-black text-white rounded-lg cursor-pointer font-semibold text-sm min-w-[120px]"
            onClick={() => setIsOpen((s) => !s)}
          >
            <span className="capitalize">{view}</span>
            <IoChevronDown
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isOpen && (
            <div className="absolute mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {["weekly", "monthly"].map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setView(option);
                    setIsOpen(false);
                  }}
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

      {/* Date range controls */}
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

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
            <span className="inline-block w-3 h-2 rounded-sm bg-[rgba(252,191,73,0.8)]" />
            Inactive range
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
            <span className="inline-block w-3 h-2 rounded-sm bg-red-500" />
            Selected range
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <Bar data={chartData} options={analysisOptions} />
      </div>
    </div>
  );
}
