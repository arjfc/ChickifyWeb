import { useMemo, useState } from "react";
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
    // if you prefer Sunday-start weeks, change the math above accordingly
  };

  // ---- build Monthly series ------------------------------------------------
  const monthly = useMemo(() => {
    const map = new Map(); // key = YYYY-MM
    data.forEach((raw) => {
      const p = parsePoint(raw);
      if (!p) return;
      if (p.date) {
        const key = `${p.date.getUTCFullYear()}-${String(p.date.getUTCMonth() + 1).padStart(2, "0")}`;
        map.set(key, (map.get(key) || 0) + p.value);
      } else if (p.label) {
        map.set(p.label, (map.get(p.label) || 0) + p.value);
      }
    });

    const keys = Array.from(map.keys()).sort(); // YYYY-MM sorts fine
    const labels = keys.map((k) => {
      const [y, m] = k.split("-").map(Number);
      return new Intl.DateTimeFormat("en", { month: "short", year: "2-digit" }).format(
        new Date(Date.UTC(y, m - 1, 1))
      );
    });

    const values = keys.map((k) => map.get(k) || 0);
    return { labels, values };
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
    const labels = keys.map((k) => {
      const d = new Date(k + "T00:00:00Z");
      const month = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
      const day = d.getUTCDate();
      return `${month} ${String(day).padStart(2, "0")}`; // e.g., "Oct 07"
    });

    const values = keys.map((k) => map.get(k) || 0);
    return { labels, values };
  }, [data]);

  // ---- pick view -----------------------------------------------------------
  const series = view === "weekly" ? weekly : monthly;

  const chartData = useMemo(
    () => ({
      labels: series.labels,
      datasets: [
        {
          label: "New Customers",
          data: series.values,
          backgroundColor: "rgba(252, 191, 73, 0.35)", // soft primary yellow
          borderColor: "rgba(252, 191, 73, 1)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }),
    [series]
  );

  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-primaryYellow font-bold text-2xl">Customer Growth Analysis</h1>
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
            <IoChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
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
      <div className="h-64 w-full">
        <Bar data={chartData} options={analysisOptions} />
      </div>
    </div>
  );
}
