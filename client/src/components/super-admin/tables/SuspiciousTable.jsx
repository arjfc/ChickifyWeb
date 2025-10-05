import React from "react";

const RISK_ROW_COLORS = {
  High: "bg-yellow-200",   // bright yellow
  Medium: "bg-amber-100",  // light tan
  Low: "bg-gray-100",      // light gray
};

export default function SuspiciousTable({ rows = [], loading = false }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full table-fixed border-separate border-spacing-y-3">
            <thead className="relative after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px after:bg-gray-500">
                <tr className="text-center text-[16px] font-bold text-yellow-500 border-b border-gray-300">
                  <th className="pb-3 px-3">User</th>
                  <th className="pb-3 px-3">Type of Flag</th>
                  <th className="pb-3 px-3">Details</th>
                  <th className="pb-3 px-3">Risk</th>
                  <th className="pb-3 px-3">Date Flagged</th>
                  <th className="pb-3 px-3">Status</th>
              </tr>
           </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[15px] text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[15px] text-gray-500">
                  No records.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className={`text-[15px] text-gray-800 text-center rounded-lg ${RISK_ROW_COLORS[row.risk] ?? "bg-white"}`}
                >
                  <td className="py-4 px-3 font-medium">{row.user}</td>
                  <td className="py-4 px-3">{row.type}</td>
                  <td className="py-4 px-3">{row.details}</td>
                  <td className="py-4 px-3">{row.risk}</td>
                  <td className="py-4 px-3">
                    {row.dateFlagged ? new Date(row.dateFlagged).toLocaleDateString("en-US") : ""}
                  </td>
                  <td className="py-4 px-3">{row.status}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
