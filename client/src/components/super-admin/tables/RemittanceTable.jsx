import React, { useState, useEffect } from "react";
import Table from "../../Table";
import { fetchAdminsPendingRemittance } from "@/services/Remittance"; // ✅ NEW

const peso = (n) =>
  typeof n === "number"
    ? `₱${n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₱0.00";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PH") : "";

export default function ProofTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // For pending remittance list
  const headers = [
    "Coop Name",
    "Owner",
    "Total To Remit",
    "Last Remit Amount",
    "Last Remit Date",
  ];

  useEffect(() => {
    const loadPending = async () => {
      try {
        const data = await fetchAdminsPendingRemittance();
        setRows(data || []);
      } catch (err) {
        console.error(
          "[ProofTable] Failed to load pending remittances:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadPending();
  }, []);

  return (
    <>
      <Table headers={headers}>
        {loading ? (
          <tr>
            <td
              className="px-4 py-3 text-center text-gray-500"
              colSpan={headers.length}
            >
              Loading pending remittances…
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td
              className="px-4 py-3 text-center text-gray-500"
              colSpan={headers.length}
            >
              No pending remittances found.
            </td>
          </tr>
        ) : (
          rows.map((item) => (
            <tr
              key={item.coop_id}
              className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
            >
              {/* COOP NAME */}
              <td className="px-4 py-3 text-center font-medium">
                {item.coop_name || "—"}
              </td>

              {/* OWNER NAME */}
              <td className="px-4 py-3 text-center">
                {item.owner_full_name || "—"}
              </td>

              {/* TOTAL TO REMIT */}
              <td className="px-4 py-3 text-center font-semibold">
                {peso(Number(item.total_to_remit))}
              </td>

              {/* LAST REMIT AMOUNT */}
              <td className="px-4 py-3 text-center">
                {item.last_remit_amount != null
                  ? peso(Number(item.last_remit_amount))
                  : "—"}
              </td>

              {/* LAST REMIT DATE */}
              <td className="px-4 py-3 text-center">
                {item.last_remit_date
                  ? formatDate(item.last_remit_date)
                  : "—"}
              </td>
            </tr>
          ))
        )}
      </Table>
    </>
  );
}
