import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import dayjs from "dayjs";
import { fetchLastSignins } from "@/services/activityLogs";

// PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TrackUserTable = forwardRef(function TrackUserTable(
  { limit = 20, userrole = "All", date = "all" },
  ref
) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  function computeRange(key) {
    const startToday = dayjs().startOf("day");
    switch (key) {
      case "today":
        return { start: startToday.toISOString(), end: startToday.add(1, "day").toISOString() };
      case "yesterday":
        return { start: startToday.subtract(1, "day").toISOString(), end: startToday.toISOString() };
      case "7":
        return { start: startToday.subtract(7, "day").toISOString(), end: null };
      case "30":
        return { start: startToday.subtract(30, "day").toISOString(), end: null };
      case "this_month":
        return {
          start: dayjs().startOf("month").toISOString(),
          end: dayjs().endOf("month").add(1, "millisecond").toISOString(),
        };
      case "last_month":
        return {
          start: dayjs().subtract(1, "month").startOf("month").toISOString(),
          end: dayjs().subtract(1, "month").endOf("month").add(1, "millisecond").toISOString(),
        };
      case "all":
      default:
        if (typeof key === "string" && key.includes("T")) return { start: key, end: null };
        return { start: null, end: null };
    }
  }

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true);
        const { start, end } = computeRange(date);
        const roleFilter = userrole && userrole !== "All" ? userrole : null;
        const data = await fetchLastSignins({
          limit,
          offset: 0,
          role: roleFilter,
          s_date: start,
          e_date: end,
        });
        if (!off) setRows(data ?? []);
      } catch (e) {
        console.error("Failed to fetch last sign-ins:", e);
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [limit, userrole, date]);

  const headers = ["LAST SIGN IN", "ROLE", "FULL NAME", "EMAIL", "CREATED ACCOUNT AT"];
  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })
      : "—";

  // ===== Unicode font (optional, consistent) =====
  const FONT_NAME = "NotoSans";
  const FONT_FILE = "NotoSans-Regular.ttf";
  const FONT_URL = "/fonts/NotoSans-Regular.ttf";

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
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
      console.warn("[TrackUserTable] Unicode font not loaded:", e?.message || e);
      return false;
    }
  };

  // ===== Expose export API =====
  useImperativeHandle(ref, () => ({
    async exportPdf(meta = {}) {
      const {
        title = "Chickify Track Last Sign-ins",
        subtitle = `${userrole} • ${date}`,
        filename = `user_signins_${userrole}_${date}.pdf`,
      } = meta;

      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
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

      const body = (rows || []).map((r) => [
        fmt(r.last_sign_in_at || r.created_at),
        r.role_name ?? "—",
        r.actor_user || "(no name)",
        r.email || "—",
        fmt(r.created_at),
      ]);

      autoTable(doc, {
        startY: cursorY + 8,
        head: [headers],
        body,
        styles: { font: hasUnicode ? FONT_NAME : "helvetica", fontSize: 9, cellPadding: 4, halign: "center" },
        headStyles: { fillColor: [255, 210, 77], textColor: [33, 33, 33] },
        didDrawPage: () => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.setFontSize(10);
          doc.text(`Page ${doc.getNumberOfPages()}`, marginX, pageHeight - 20);
        },
      });

      doc.save(filename);
    },
  }));

  if (loading) return <div className="text-center py-6">Loading user sign-ins…</div>;

  return (
    <div className="max-h:[480px] overflow-auto rounded-md border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 text-yellow-500 border-b border-gray-300">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-5 text-center font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-10 text-center text-gray-500">
                No users signed in with these filters.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.user_id} className="text-gray-700 border-b border-gray-200">
                <td className="px-4 py-3 text-center font-medium">
                  {fmt(r.last_sign_in_at || r.created_at)}
                </td>
                <td className="px-4 py-3 text-center">{r.role_name ?? "—"}</td>
                <td className="px-4 py-3 text-center">{r.actor_user || "(no name)"}</td>
                <td className="px-4 py-3 text-center">{r.email || "—"}</td>
                <td className="px-4 py-3 text-center">{fmt(r.created_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default TrackUserTable;
