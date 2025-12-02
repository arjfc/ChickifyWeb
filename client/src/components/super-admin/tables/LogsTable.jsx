import React, {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import dayjs from "dayjs";
import { fetchActivityLogs } from "@/services/activityLogs";

// PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const LogsTable = forwardRef(function LogsTable(
  { selectedOption, type, fromDate, toDate, onCountChange },
  ref
) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch logs (filter by action type on backend)
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

  // From–To date checker (inclusive)
  function inDateRange(iso, from, to) {
    if (!from && !to) return true;
    const d = dayjs(iso);

    if (from) {
      const start = dayjs(from).startOf("day");
      if (d.isBefore(start)) return false;
    }

    if (to) {
      const end = dayjs(to).endOf("day");
      if (d.isAfter(end)) return false;
    }

    return true;
  }

  // Client filters: role (from UI) + from/to date
  const filtered = useMemo(() => {
    return (rows ?? []).filter((r) => {
      const roleMatch =
        !selectedOption || selectedOption === "All"
          ? true
          : (r.actor_role || "").toLowerCase() ===
            selectedOption.toLowerCase();

      const dateMatch = inDateRange(r.created_at, fromDate, toDate);

      return roleMatch && dateMatch;
    });
  }, [rows, selectedOption, fromDate, toDate]);

  // Notify parent about current count
  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(filtered.length);
    }
  }, [filtered.length, onCountChange]);

  const headers = [
    "TIMESTAMP",
    "FULLNAME",
    "ROLE",
    "ACTION TYPE",
    "ORDER ID",
    "DETAILS",
  ];

  const fmt = (iso) =>
    new Date(iso).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

  // ===== Unicode font (optional, keeps consistency with other exports) =====
  const FONT_NAME = "NotoSans";
  const FONT_FILE = "NotoSans-Regular.ttf";
  const FONT_URL = "/fonts/NotoSans-Regular.ttf"; // put TTF in public/fonts/

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const ensureUnicodeFont = async (doc) => {
    try {
      const res = await fetch(FONT_URL);
      if (!res.ok) throw new Error(`Font fetch failed (${res.status})`);
      const buf = await res.arrayBuffer();
      const base64 = arrayBufferToBase64(buf);
      doc.addFileToVFS(FONT_FILE, base64);
      doc.addFont(FONT_FILE, FONT_NAME, "normal");
      doc.setFont(FONT_NAME, "normal");
      return true;
    } catch (e) {
      console.warn("[LogsTable] Unicode font not loaded:", e?.message || e);
      return false;
    }
  };

  const buildDateLabel = (from, to) => {
    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Until ${to}`;
    return "All dates";
  };

  // ===== Expose export API =====
  useImperativeHandle(ref, () => ({
    async exportPdf(meta = {}) {
      const {
        title = "Chickify Activity Logs",
        subtitle = `${selectedOption} • ${type} • ${buildDateLabel(
          fromDate,
          toDate
        )}`,
        filename = `activity_logs_${selectedOption}_${type}_${
          fromDate || "all"
        }_${toDate || "all"}.pdf`,
      } = meta;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });
      const hasUnicode = await ensureUnicodeFont(doc);

      const marginX = 40;
      let cursorY = 40;

      // Title
      doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "bold");
      doc.setFontSize(18);
      doc.text(title, marginX, cursorY);
      cursorY += 22;

      // Subtitle
      doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
      doc.setFontSize(12);
      doc.text(subtitle, marginX, cursorY);
      cursorY += 12;

      // Build body from filtered rows
      const body = (filtered || []).map((r) => [
        fmt(r.created_at),
        r.actor_user ?? "(no name)",
        r.actor_role ?? "—",
        r.action_type ?? "—",
        r.order_id ?? "—",
        r.description ?? "",
      ]);

      autoTable(doc, {
        startY: cursorY + 8,
        head: [headers],
        body,
        styles: {
          font: hasUnicode ? FONT_NAME : "helvetica",
          fontSize: 9,
          cellPadding: 4,
          halign: "center",
        },
        headStyles: {
          fillColor: [255, 210, 77],
          textColor: [33, 33, 33],
        },
        didDrawPage: () => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.setFontSize(10);
          doc.text(
            `Page ${doc.getNumberOfPages()}`,
            marginX,
            pageHeight - 20
          );
        },
      });

      doc.save(filename);
    },
  }));

  if (loading)
    return <div className="text-center py-6">Loading logs…</div>;

  return (
    <div className="flex flex-col gap-2">
      {/* total logs text */}
      <div className="text-xs text-gray-500">
        Total logs displayed:{" "}
        <span className="font-semibold">{filtered.length}</span>
      </div>

      <div className="max-h-[480px] overflow-auto rounded-md border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-yellow-500 border-b border-gray-300">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-6 py-5 text-center font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No activity logs match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.activity_id}
                  className="text-gray-700 border-b border-gray-200"
                >
                  <td className="px-4 py-3 text-center font-medium">
                    {fmt(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.actor_user ?? "(no name)"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.actor_role}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.action_type}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.order_id ?? "--"}{" "}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.description ?? "(no description)"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default LogsTable;


// import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
// import dayjs from "dayjs";
// import Table from "../../Table";
// import { fetchActivityLogs } from "@/services/activityLogs";

// // PDF libs
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const LogsTable = forwardRef(function LogsTable({ selectedOption, type, dateRange }, ref) {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       try {
//         setLoading(true);
//         const data = await fetchActivityLogs({
//           action_type: type && type !== "All" ? type : null,
//         });
//         if (!off) setRows(data ?? []);
//       } catch (e) {
//         console.error("Failed to fetch activity logs:", e);
//       } finally {
//         if (!off) setLoading(false);
//       }
//     })();
//     return () => {
//       off = true;
//     };
//   }, [type]);

//   // Local date-range checker (client-side)
//   function inRange(iso, key) {
//     if (!key || key === "all") return true;
//     const d = dayjs(iso);
//     const todayStart = dayjs().startOf("day");

//     switch (key) {
//       case "today":
//         return d.isAfter(todayStart) && d.isBefore(todayStart.add(1, "day"));
//       case "yesterday":
//         return d.isAfter(todayStart.subtract(1, "day")) && d.isBefore(todayStart);
//       case "7":
//         return d.isAfter(todayStart.subtract(7, "day"));
//       case "30":
//         return d.isAfter(todayStart.subtract(30, "day"));
//       case "last_month": {
//         const s = dayjs().subtract(1, "month").startOf("month");
//         const e = dayjs().subtract(1, "month").endOf("month").add(1, "ms");
//         return d.isAfter(s) && d.isBefore(e);
//       }
//       default:
//         return true;
//     }
//   }

//   // Client filters: role (from UI) + dateRange
//   const filtered = useMemo(() => {
//     return (rows ?? []).filter((r) => {
//       const roleMatch =
//         !selectedOption || selectedOption === "All"
//           ? true
//           : (r.actor_role || "").toLowerCase() === selectedOption.toLowerCase();
//       const dateMatch = inRange(r.created_at, dateRange);
//       return roleMatch && dateMatch;
//     });
//   }, [rows, selectedOption, dateRange]);

//   const headers = ["TIMESTAMP", "FULLNAME", "ROLE", "ACTION TYPE", "ORDER ID", "DETAILS"];
//   const fmt = (iso) =>
//     new Date(iso).toLocaleString("en-US", {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//       hour: "numeric",
//       minute: "numeric",
//       hour12: true,
//     });

//   // ===== Unicode font (optional, keeps consistency with other exports) =====
//   const FONT_NAME = "NotoSans";
//   const FONT_FILE = "NotoSans-Regular.ttf";
//   const FONT_URL = "/fonts/NotoSans-Regular.ttf"; // put TTF in public/fonts/

//   const arrayBufferToBase64 = (buffer) => {
//     let binary = "";
//     const bytes = new Uint8Array(buffer);
//     for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
//     return btoa(binary);
//   };

//   const ensureUnicodeFont = async (doc) => {
//     try {
//       const res = await fetch(FONT_URL);
//       if (!res.ok) throw new Error(`Font fetch failed (${res.status})`);
//       const buf = await res.arrayBuffer();
//       const base64 = arrayBufferToBase64(buf);
//       doc.addFileToVFS(FONT_FILE, base64);
//       doc.addFont(FONT_FILE, FONT_NAME, "normal");
//       doc.setFont(FONT_NAME, "normal");
//       return true;
//     } catch (e) {
//       console.warn("[LogsTable] Unicode font not loaded:", e?.message || e);
//       return false;
//     }
//   };

//   // ===== Expose export API =====
//   useImperativeHandle(ref, () => ({
//     async exportPdf(meta = {}) {
//       const {
//         title = "Chickify Activity Logs",
//         subtitle = `${selectedOption} • ${type} • ${dateRange}`,
//         filename = `activity_logs_${selectedOption}_${type}_${dateRange}.pdf`,
//       } = meta;

//       const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
//       const hasUnicode = await ensureUnicodeFont(doc);

//       const marginX = 40;
//       let cursorY = 40;

//       // Title
//       doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "bold");
//       doc.setFontSize(18);
//       doc.text(title, marginX, cursorY);
//       cursorY += 22;

//       // Subtitle
//       doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
//       doc.setFontSize(12);
//       doc.text(subtitle, marginX, cursorY);
//       cursorY += 12;

//       // Build body from filtered rows
//       const body = (filtered || []).map((r) => [
//         fmt(r.created_at),
//         r.actor_user ?? "(no name)",
//         r.actor_role ?? "—",
//         r.action_type ?? "—",
//         r.order_id ?? "—",
//         r.description ?? "",
//       ]);

//       autoTable(doc, {
//         startY: cursorY + 8,
//         head: [headers],
//         body,
//         styles: { font: hasUnicode ? FONT_NAME : "helvetica", fontSize: 9, cellPadding: 4, halign: "center" },
//         headStyles: { fillColor: [255, 210, 77], textColor: [33, 33, 33] },
//         didDrawPage: () => {
//           const pageSize = doc.internal.pageSize;
//           const pageHeight = pageSize.height || pageSize.getHeight();
//           doc.setFontSize(10);
//           doc.text(`Page ${doc.getNumberOfPages()}`, marginX, pageHeight - 20);
//         },
//       });

//       doc.save(filename);
//     },
//   }));

//   if (loading) return <div className="text-center py-6">Loading logs…</div>;

//   return (
//     <div className="max-h-[480px] overflow-auto rounded-md border border-gray-200">
//       <table className="min-w-full text-sm">
//         <thead className="sticky top-0 bg-white z-10">
//           <tr className="text-yellow-500 border-b border-gray-300">
//             {headers.map((h, i) => (
//               <th key={i} className="px-6 py-5 text-center font-medium">
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {filtered.length === 0 ? (
//             <tr>
//               <td colSpan={headers.length} className="px-6 py-10 text-center text-gray-500">
//                 No activity logs match these filters.
//               </td>
//             </tr>
//           ) : (
//             filtered.map((r) => (
//               <tr key={r.activity_id} className="text-gray-700 border-b border-gray-200">
//                 <td className="px-4 py-3 text-center font-medium">{fmt(r.created_at)}</td>
//                 <td className="px-4 py-3 text-center">{r.actor_user ?? "(no name)"}</td>
//                 <td className="px-4 py-3 text-center">{r.actor_role}</td>
//                 <td className="px-4 py-3 text-center">{r.action_type}</td>
//                 <td className="px-4 py-3 text-center">{r.order_id ?? "--"} </td>
//                 <td className="px-4 py-3 text-center">{r.description ?? "(no description)"}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// });

// export default LogsTable;
