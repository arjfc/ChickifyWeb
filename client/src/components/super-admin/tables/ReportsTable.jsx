import React, { useEffect, useState } from "react";
import Table from "../../Table";
import { fetchTransactions } from "@/services/Transactionlogs";
import dayjs from "dayjs";

export default function ReportsTable({ tab = "Transaction", dateRange = "all" }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchTransactions();
        setLogs(data || []);
      } catch (err) {
        console.error("Failed to fetch transaction logs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const dateMatch = inRange(log.created_at, dateRange);
    const typeMatch = log.fee_type?.toLowerCase() === tab.toLowerCase();
    return dateMatch && typeMatch;
  });

  const headers = [
    "Timestamp",
    "Order ID",
    "Coop Name",
    "Fee Type",
    "Method",
    "Amount",
    "Memo",
  ];

  return (
    <Table headers={headers}>
      {loading ? (
        <tr>
          <td colSpan={headers.length} className="text-center py-4">
            Loading transactions...
          </td>
        </tr>
      ) : filteredLogs.length === 0 ? (
        <tr>
          <td colSpan={headers.length} className="text-center py-4">
            No matching records found.
          </td>
        </tr>
      ) : (
        filteredLogs.map((item, index) => (
          <tr
            key={index}
            className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
          >
            <td className="px-4 py-3 text-center font-medium">
              {dayjs(item.created_at).format("MMM D, YYYY h:mm A")}
            </td>
            <td className="px-4 py-3 text-center">{item.order_id}</td>
            <td className="px-4 py-3 text-center">{item.owner_name}</td>
            <td className="px-4 py-3 text-center">{item.fee_type}</td>
            <td className="px-4 py-3 text-center">{item.method}</td>
            <td className="px-4 py-3 text-center">₱{Number(item.amount).toFixed(2)}</td>
            <td className="px-4 py-3 text-center">{item.memo}</td>
          </tr>
        ))
      )}
    </Table>
  );
}
