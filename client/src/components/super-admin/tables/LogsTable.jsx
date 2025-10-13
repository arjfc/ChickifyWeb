import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Table from "../../Table";
import { fetchActivityLogs } from "@/services/activityLogs";

export default function LogsTable({ selectedOption, type, dateRange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("Date Range: ", dateRange)

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchActivityLogs({
          action_type: type && type !== "All" ? type : null,
        });
        if (!off) setRows(data ?? []);
      } catch (e) {
        console.error("Failed to fetch activity logs:", e);
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [type]);

  // Local date-range checker (client-side)
  function inRange(iso, key) {
    if (!key || key === "all") return true;
    const d = dayjs(iso);
    const todayStart = dayjs().startOf("day");

    switch (key) {
      case "today":
        return d.isAfter(todayStart) && d.isBefore(todayStart.add(1, "day"));
      case "yesterday":
        return d.isAfter(todayStart.subtract(1, "day")) && d.isBefore(todayStart);
      case "7":
        return d.isAfter(todayStart.subtract(7, "day"));
      case "30":
        return d.isAfter(todayStart.subtract(30, "day"));
      case "last_month": {
        const s = dayjs().subtract(1, "month").startOf("month");
        const e = dayjs().subtract(1, "month").endOf("month").add(1, "ms");
        return d.isAfter(s) && d.isBefore(e);
      }
      default:
        return true;
    }
  }

  // Client filters: role (from UI) + dateRange
  const filtered = useMemo(() => {
    return (rows ?? []).filter((r) => {
      const roleMatch =
        !selectedOption || selectedOption === "All"
          ? true
          : (r.actor_role || "").toLowerCase() === selectedOption.toLowerCase();

      const dateMatch = inRange(r.created_at, dateRange);

      return roleMatch && dateMatch;
    });
  }, [rows, selectedOption, dateRange]);

  const headers = ["Timestamp", "User", "Role", "Action Type", "Order ID", "Details"];
  const fmt = (iso) =>
    new Date(iso).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

  if (loading) return <div className="text-center py-6">Loading logs…</div>;

  return (
    <div className="max-h-[480px] overflow-auto rounded-md border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="text-yellow-500 border-b border-gray-300">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-5 text-center font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.activity_id} className="text-gray-700 border-b border-gray-200">
              <td className="px-4 py-3 text-center font-medium">{fmt(r.created_at)}</td>
              <td className="px-4 py-3 text-center">{r.actor_user ?? "(no name)"}</td>
              <td className="px-4 py-3 text-center">{r.actor_role}</td>
              <td className="px-4 py-3 text-center">{r.action_type}</td>
              <td className="px-4 py-3 text-center">{r.order_id}</td>
              <td className="px-4 py-3 text-center">{r.description ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
