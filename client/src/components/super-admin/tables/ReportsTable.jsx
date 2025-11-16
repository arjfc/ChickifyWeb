import React, {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
} from "react";
import Table from "../../Table";
import { fetchTransactions } from "@/services/Transactionlogs";
import dayjs from "dayjs";

// PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportsTable = forwardRef(function ReportsTable(
  {
    tab = "Transaction",
    dateRange = "all",
    dateFrom = "",
    dateTo = "",
  },
  ref
) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== Helpers (explicit date range) =====
  const parseDate = (d) => {
    if (!d) return null;
    const t = dayjs(d);
    return t.isValid() ? t : null;
  };
  const toStartOfDay = (d) => (d ? parseDate(d)?.startOf("day") ?? null : null);
  const toEndOfDay = (d) => (d ? parseDate(d)?.endOf("day") ?? null : null);

  const FROM = toStartOfDay(dateFrom || null);
  const TO = toEndOfDay(dateTo || null);

  const withinRange = (iso) => {
    if (!dateFrom && !dateTo) return true;
    const d = parseDate(iso);
    if (!d) return false;
    if (FROM && d.isBefore(FROM)) return false;
    if (TO && d.isAfter(TO)) return false;
    return true;
  };

  // Preset quick filters (fallback)
  function inRangePreset(iso, key) {
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
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch transaction logs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  // If explicit dates exist, they override the preset
  const dateCheck = (iso) =>
    dateFrom || dateTo ? withinRange(iso) : inRangePreset(iso, dateRange);

  const filteredLogs = useMemo(() => {
    return (logs || []).filter((log) => {
      const dateMatch = dateCheck(log.created_at);
      const typeMatch = (log.fee_type || "").toLowerCase() === tab.toLowerCase();
      return dateMatch && typeMatch;
    });
  }, [logs, tab, dateRange, dateFrom, dateTo]);

  const headers = [
    "Timestamp",
    "Order ID",
    "Coop Name",
    "Fee Type",
    "Method",
    "Amount",
    "Memo",
  ];

  // ===== Peso formatting + export mapping =====
  const pesoStrict = (v) => {
    if (typeof v === "string" && v.trim().startsWith("₱")) return v;
    const num =
      typeof v === "number"
        ? v
        : Number(String(v ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(num)
      ? `₱${num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "₱0.00";
  };

  const rowsForExport = useMemo(
    () =>
      (filteredLogs || []).map((item) => [
        dayjs(item.created_at).format("MMM D, YYYY h:mm A"),
        item.order_id ?? "—",
        item.owner_name ?? "—",
        item.fee_type ?? "—",
        item.method ?? "—",
        Number(item.amount ?? 0), // keep numeric first; we’ll format + right-align via colStyles
        item.memo ?? "",
      ]),
    [filteredLogs]
  );

  // ===== Unicode font loader for jsPDF (to render ₱) =====
  const FONT_NAME = "NotoSans";
  const FONT_FILE = "NotoSans-Regular.ttf";
  const FONT_URL = "/fonts/NotoSans-Regular.ttf"; // place TTF at public/fonts/

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
      console.warn("[ReportsTable] Unicode font not loaded:", e?.message || e);
      return false;
    }
  };

  // ===== Expose export API =====
  useImperativeHandle(ref, () => ({
    async exportPdf(meta = {}) {
      const {
        title = "Chickify Super Admin Reports",
        subtitle = tab,
        dateFrom: from = dateFrom,
        dateTo: to = dateTo,
        filename,
      } = meta;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const hasUnicode = await ensureUnicodeFont(doc);

      // Header
      const marginX = 40;
      let cursorY = 40;

      doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "bold");
      doc.setFontSize(18);
      doc.text(title, marginX, cursorY);
      cursorY += 22;

      doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
      doc.setFontSize(12);
      const rangeTxt =
        from || to ? `Date range: ${from || "—"} to ${to || "—"}` : "Date range: All";
      doc.text(`${subtitle}`, marginX, cursorY);
      cursorY += 16;
      doc.text(rangeTxt, marginX, cursorY);
      cursorY += 12;

      // Build table rows with formatted money
      const amtColIndex = 5; // "Amount"
      const bodyRaw = rowsForExport.map((row) =>
        row.map((val, idx) => (idx === amtColIndex ? pesoStrict(val) : val))
      );

      const bodySafe = hasUnicode
        ? bodyRaw
        : bodyRaw.map((r) =>
            r.map((c) => (typeof c === "string" ? c.replace(/₱/g, "PHP ") : c))
          );

      const columnStyles = {
        [amtColIndex]: { halign: "right" },
      };

      autoTable(doc, {
        startY: cursorY + 8,
        head: [headers],
        body: bodySafe,
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
        columnStyles,
        didDrawPage: () => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.setFontSize(10);
          doc.text(`Page ${doc.getNumberOfPages()}`, marginX, pageHeight - 20);
        },
      });

      const safeName =
        filename ||
        `${String(subtitle).replace(/\s+/g, "_").toLowerCase()}_${from || "all"}_${to || "all"}.pdf`;
      doc.save(safeName);
    },
  }));

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
            <td className="px-4 py-3 text-center">
              ₱{Number(item.amount ?? 0).toFixed(2)}
            </td>
            <td className="px-4 py-3 text-center">{item.memo}</td>
          </tr>
        ))
      )}
    </Table>
  );
});

export default ReportsTable;
