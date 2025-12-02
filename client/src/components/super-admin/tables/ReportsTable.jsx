import React, {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
} from "react";
import Table from "../../Table";
import {
  fetchTransactions,
  fetchCoopsOrAdmins,
  fetchBuyersList,
} from "@/services/Transactionlogs";
import dayjs from "dayjs";

// PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportsTable = forwardRef(function ReportsTable(
  {
    tab = "Transaction", // "Transaction" | "List of Coops" | "List of Buyers"
    dateRange = "all",
    dateFrom = "",
    dateTo = "",
  },
  ref
) {
  const [logs, setLogs] = useState([]);
  const [coops, setCoops] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCoopsTab = tab === "List of Coops";
  const isBuyersTab = tab === "List of Buyers";
  const isTransactionTab = !isCoopsTab && !isBuyersTab; // default

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
        return (
          d.isAfter(todayStart.subtract(1, "day")) && d.isBefore(todayStart)
        );
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
    const loadAll = async () => {
      try {
        const [txData, coopData, buyerData] = await Promise.all([
          fetchTransactions(),
          fetchCoopsOrAdmins(),
          fetchBuyersList(), // ⬅️ buyers from RPC
        ]);

        setLogs(Array.isArray(txData) ? txData : []);
        setCoops(Array.isArray(coopData) ? coopData : []);
        setBuyers(Array.isArray(buyerData) ? buyerData : []);
      } catch (err) {
        console.error("Failed to fetch reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // If explicit dates exist, they override the preset (only relevant for Transaction tab)
  const dateCheck = (iso) =>
    dateFrom || dateTo ? withinRange(iso) : inRangePreset(iso, dateRange);

  const filteredLogs = useMemo(() => {
    if (!isTransactionTab) return [];
    return (logs || []).filter((log) => {
      const dateMatch = dateCheck(log.created_at);
      const typeMatch =
        (log.fee_type || "").toLowerCase() === tab.toLowerCase() ||
        tab === "Transaction";
      return dateMatch && typeMatch;
    });
  }, [logs, tab, dateRange, dateFrom, dateTo, isTransactionTab]);

  // ===== Headers for each tab =====
  const txHeaders = [
    "Timestamp",
    "Order ID",
    "Coop Name",
    "Fee Type",
    "Method",
    "Amount",
    "Memo",
  ];

  const coopHeaders = ["Name", "Address", "Contact No."]; // for List of Coops
  const buyerHeaders = ["Name", "Address", "Contact No."]; // for List of Buyers

  const activeHeaders = isTransactionTab
    ? txHeaders
    : isCoopsTab
    ? coopHeaders
    : buyerHeaders;

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

  // Rows used for export depending on tab
  const transactionRowsForExport = useMemo(
    () =>
      (filteredLogs || []).map((item) => [
        dayjs(item.created_at).format("MMM D, YYYY h:mm A"),
        item.order_id ?? "—",
        item.owner_name ?? "—",
        item.fee_type ?? "—",
        item.method ?? "—",
        Number(item.amount ?? 0),
        item.memo ?? "",
      ]),
    [filteredLogs]
  );

  const coopRowsForExport = useMemo(
    () =>
      (coops || []).map((item) => [
        item.name ?? "—",
        item.address || "—",
        item.contact_no || "—",
      ]),
    [coops]
  );

  const buyerRowsForExport = useMemo(
    () =>
      (buyers || []).map((item) => [
        item.buyer_name ?? "—",
        item.full_address || "—",
        item.contact_no || "—",
      ]),
    [buyers]
  );

  const rowsForExport = isTransactionTab
    ? transactionRowsForExport
    : isCoopsTab
    ? coopRowsForExport
    : buyerRowsForExport;

  // ===== Unicode font loader for jsPDF (to render ₱) =====
  const FONT_NAME = "NotoSans";
  const FONT_FILE = "NotoSans-Regular.ttf";
  const FONT_URL = "/fonts/NotoSans-Regular.ttf";

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
      doc.addFont(FONT_FILE, FONT_NAME, "bold");

      doc.setFont(FONT_NAME, "normal");
      return true;
    } catch (e) {
      console.warn("[ReportsTable] Unicode font not loaded:", e?.message || e);
      return false;
    }
  };

  // ===== Background image loader (from public) =====
  const BG_URL = "/background.png";

  const loadBgImageAsDataUrl = async () => {
    try {
      const res = await fetch(BG_URL);
      if (!res.ok) throw new Error(`BG fetch failed (${res.status})`);
      const blob = await res.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn(
        "[ReportsTable] Failed to load PDF background:",
        e?.message || e
      );
      return null;
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
    const bgDataUrl = await loadBgImageAsDataUrl();

    const pageSize = doc.internal.pageSize;
    const pageWidth = pageSize.width || pageSize.getWidth();
    const pageHeight = pageSize.height || pageSize.getHeight();
    const centerX = pageWidth / 2;

    // 🔹 Background first (behind everything)
    if (bgDataUrl) {
      doc.addImage(bgDataUrl, "PNG", 0, 0, pageWidth, pageHeight);
    }

    // 👉 TOP MARGINS
    const firstPageTop = 158; // 1st page "margin"
    const otherPagesTop = 72; // 2nd+ page top margin
    const marginBottom = 72;
    const marginX = 40;

    // Header starts at firstPageTop
    let cursorY = firstPageTop;

    // === Normalize subtitle so we can append "Fee" nicely ===
    const normalizedSubtitle = String(subtitle || "").toLowerCase().trim();
    let subtitleLabel = subtitle;

    if (isTransactionTab) {
      if (["platform", "transaction", "service"].includes(normalizedSubtitle)) {
        subtitleLabel = `${subtitle} Fee`;
      }
    }

    const subtitleHeader = String(subtitleLabel || "").toUpperCase();

    // Helper to pretty-format dates: "November 27, 2025"
    const formatPrettyDate = (raw) => {
      if (!raw) return null;
      const d = dayjs(raw);
      return d.isValid() ? d.format("MMMM D, YYYY") : null;
    };

    const prettyFrom = formatPrettyDate(from);
    const prettyTo = formatPrettyDate(to);

    const rangeTxt =
      isTransactionTab && (from || to)
        ? `Date range: ${prettyFrom || "—"} to ${prettyTo || "—"}`
        : "Date range: All";

    // 🔹 NEW: Generated on
    const generatedNow = dayjs();
    const generatedTxt = `Generated on: ${generatedNow.format(
      "MMMM D, YYYY h:mm A"
    )}`;

    // ===== HEADER =====

    // Title – centered
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, centerX, cursorY, { align: "center" });
    cursorY += 22;

    // Subtitle – centered
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(subtitleHeader, centerX, cursorY, { align: "center" });
    cursorY += 40;

    // Date range – right aligned
    doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
    doc.setFontSize(11);
    doc.text(rangeTxt, pageWidth - marginX, cursorY, { align: "right" });
    cursorY += 14;

    // 🔹 Generated on – right aligned under date range
    doc.text(generatedTxt, pageWidth - marginX, cursorY, {
      align: "right",
    });

    // Extra space between header and table
    cursorY += 16;

    // ===== Build table rows with proper formatting =====
    let bodyRaw;

    if (isTransactionTab) {
      const amtColIndex = 5;
      bodyRaw = rowsForExport.map((row) =>
        row.map((val, idx) => (idx === amtColIndex ? pesoStrict(val) : val))
      );
    } else {
      bodyRaw = rowsForExport;
    }

    const bodySafe = hasUnicode
      ? bodyRaw
      : bodyRaw.map((r) =>
          r.map((c) =>
            typeof c === "string" ? c.replace(/₱/g, "PHP ") : c
          )
        );

    const columnStyles = isTransactionTab
      ? {
          5: { halign: "right" },
        }
      : {};

    autoTable(doc, {
      // 👉 First page table starts from cursorY (≈158) + 8,
      // but next pages will use margin.top = otherPagesTop (72)
      startY: cursorY + 8,
      head: [activeHeaders],
      body: bodySafe,
      styles: {
        font: hasUnicode ? FONT_NAME : "helvetica",
        fontSize: 9,
        cellPadding: 6,
        minCellHeight: 18,
        halign: "center",
      },
      headStyles: {
        font: "helvetica",
        fontSize: 9,
        fillColor: [255, 210, 77],
        textColor: [33, 33, 33],
      },
      columnStyles,
      margin: {
        top: otherPagesTop, // ✅ 2nd page and beyond: 72
        bottom: marginBottom, // 72
        left: marginX,
        right: marginX,
      },
      didDrawPage: () => {
        const pageSizeInner = doc.internal.pageSize;
        const pageHeightInner =
          pageSizeInner.height || pageSizeInner.getHeight();
        doc.setFontSize(10);
        doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          marginX,
          pageHeightInner - marginBottom / 2
        );
      },
    });

    const safeName =
      filename ||
      `${String(subtitleHeader)
        .replace(/\s+/g, "_")
        .toLowerCase()}_${prettyFrom || "all"}_${prettyTo || "all"}.pdf`;
    doc.save(safeName);
  },
}));


  // ===== Render (UI unchanged) =====
  return (
    <Table headers={activeHeaders}>
      {loading ? (
        <tr>
          <td colSpan={activeHeaders.length} className="text-center py-4">
            Loading reports...
          </td>
        </tr>
      ) : isCoopsTab ? (
        coops.length === 0 ? (
          <tr>
            <td colSpan={activeHeaders.length} className="text-center py-4">
              No coops/admins found.
            </td>
          </tr>
        ) : (
          coops.map((item, index) => (
            <tr
              key={item.coop_id || index}
              className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
            >
              <td className="px-4 py-3 text-center font-medium">
                {item.name}
              </td>
              <td className="px-4 py-3 text-center">
                {item.address || "—"}
              </td>
              <td className="px-4 py-3 text-center">
                {item.contact_no || "—"}
              </td>
            </tr>
          ))
        )
      ) : isBuyersTab ? (
        buyers.length === 0 ? (
          <tr>
            <td colSpan={activeHeaders.length} className="text-center py-4">
              No buyers found.
            </td>
          </tr>
        ) : (
          buyers.map((item, index) => (
            <tr
              key={index}
              className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
            >
              <td className="px-4 py-3 text-center font-medium">
                {item.buyer_name}
              </td>
              <td className="px-4 py-3 text-center">
                {item.full_address || "—"}
              </td>
              <td className="px-4 py-3 text-center">
                {item.contact_no || "—"}
              </td>
            </tr>
          ))
        )
      ) : filteredLogs.length === 0 ? (
        <tr>
          <td colSpan={activeHeaders.length} className="text-center py-4">
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
