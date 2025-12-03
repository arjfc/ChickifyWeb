import React, {forwardRef,useEffect,useMemo,useState,useImperativeHandle,} from "react";
import Table from "../../Table";
import {fetchTransactions,fetchCoopsOrAdmins,fetchBuyersList,} from "@/services/Transactionlogs";
import { fetchSuperadminProfile } from "@/services/Reports";
import { fetchAdminRemittanceHistory } from "@/services/Remittance"; // ✅
import dayjs from "dayjs";

// PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportsTable = forwardRef(function ReportsTable(
  {
    tab = "Transaction", // "Transaction" | "List of Coops" | "List of Buyers" | "Remittance Reports"
    dateRange = "all",
    dateFrom = "",
    dateTo = "",
  },
  ref
) {
  const [logs, setLogs] = useState([]);
  const [coops, setCoops] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [remits, setRemits] = useState([]); // ✅
  const [loading, setLoading] = useState(true);

  const isCoopsTab = tab === "List of Coops";
  const isBuyersTab = tab === "List of Buyers";
  const isRemittanceTab = tab === "Remittance Reports"; // ✅ match tab label
  const isTransactionTab = !isCoopsTab && !isBuyersTab && !isRemittanceTab;

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

  // Preset quick filters
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

  const dateCheck = (iso) =>
    dateFrom || dateTo ? withinRange(iso) : inRangePreset(iso, dateRange);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [txData, coopData, buyerData, remitsData] = await Promise.all([
          fetchTransactions(),
          fetchCoopsOrAdmins(),
          fetchBuyersList(),
          fetchAdminRemittanceHistory(), // ✅ we filter client-side
        ]);

        setLogs(Array.isArray(txData) ? txData : []);
        setCoops(Array.isArray(coopData) ? coopData : []);
        setBuyers(Array.isArray(buyerData) ? buyerData : []);
        setRemits(Array.isArray(remitsData) ? remitsData : []);
      } catch (err) {
        console.error("Failed to fetch reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

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

  const filteredRemits = useMemo(() => {
    if (!isRemittanceTab && !remits.length) return remits;
    return (remits || []).filter((r) => dateCheck(r.remittance_date));
  }, [remits, dateRange, dateFrom, dateTo, isRemittanceTab]);

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

  // 🔹 Updated: added Email column
  const coopHeaders = ["Name", "Email", "Address", "Contact No."]; // List of Coops
  const buyerHeaders = ["Name", "Email", "Address", "Contact No."]; // List of Buyers

  // ✅ GCash columns removed
  const remitHeaders = [
    "Remittance Date",
    "Coop Name",
    "Admin Name",
    "Total Remitted",
    "Payment Method",
    "Remitted To",
  ];

  const activeHeaders = isTransactionTab
    ? txHeaders
    : isCoopsTab
    ? coopHeaders
    : isBuyersTab
    ? buyerHeaders
    : remitHeaders; // Remittance

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

  // 🔹 Updated: email included (assuming `item.email` from RPC)
  const coopRowsForExport = useMemo(
    () =>
      (coops || []).map((item) => [
        item.name ?? "—",
        item.email || "—",
        item.address || "—",
        item.contact_no || "—",
      ]),
    [coops]
  );

  // 🔹 Updated: email included (assuming `item.email` from RPC)
  const buyerRowsForExport = useMemo(
    () =>
      (buyers || []).map((item) => [
        item.buyer_name ?? "—",
        item.email || "—",
        item.full_address || "—",
        item.contact_no || "—",
      ]),
    [buyers]
  );

  // ✅ GCash columns removed here too
  const remittanceRowsForExport = useMemo(
    () =>
      (filteredRemits || []).map((item) => [
        dayjs(item.remittance_date).format("MMM D, YYYY"),
        item.coop_name ?? "—",
        item.admin_name ?? "—",
        Number(item.total_remitted ?? 0),
        item.payment_method ?? "—",
        item.remitted_to ?? "—",
      ]),
    [filteredRemits]
  );

  const rowsForExport = isTransactionTab
    ? transactionRowsForExport
    : isCoopsTab
    ? coopRowsForExport
    : isBuyersTab
    ? buyerRowsForExport
    : remittanceRowsForExport;

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

  // ===== Background + ICONS =====
  const BG_URL = "/background.png";
  const ADMIN_ICON_URL = "/icons/user.png";
  const ADDRESS_ICON_URL = "/icons/pin.png";
  const PHONE_ICON_URL = "/icons/telephone.png";
  // const EMAIL_ICON_URL = "/icons/email.png";

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

  const loadImageAsDataUrl = async (url) => {
    if (!url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Image fetch failed (${res.status})`);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn(
        "[ReportsTable] Failed to load icon:",
        url,
        e?.message || e
      );
      return null;
    }
  };

  /* ======================== paging ======================== */
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const activeSourceData = useMemo(() => {
    if (isTransactionTab) return filteredLogs;
    if (isCoopsTab) return coops;
    if (isBuyersTab) return buyers;
    if (isRemittanceTab) return filteredRemits;
    return [];
  }, [
    isTransactionTab,
    isCoopsTab,
    isBuyersTab,
    isRemittanceTab,
    filteredLogs,
    coops,
    buyers,
    filteredRemits,
  ]);

  useEffect(() => {
    setPage(1);
  }, [tab, dateRange, dateFrom, dateTo]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((activeSourceData?.length || 0) / PAGE_SIZE)),
    [activeSourceData]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageStart = (page - 1) * PAGE_SIZE;
  const visibleData = loading
    ? activeSourceData
    : (activeSourceData || []).slice(pageStart, pageStart + PAGE_SIZE);

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

      // 🔹 Super Admin profile
      let superadminName = "—";
      let superadminAddress = "—";
      let superadminContact = "—";
      let superadminEmail = "—";

      try {
        const profile = await fetchSuperadminProfile();
        if (profile) {
          superadminName = profile.superadmin_full_name || "—";
          superadminAddress = profile.address || "—";
          superadminContact = profile.contact_no || "—";
          superadminEmail = profile.superadmin_email || "—";
        }
      } catch (e) {
        console.warn(
          "[ReportsTable] Failed to load superadmin profile for PDF:",
          e
        );
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const hasUnicode = await ensureUnicodeFont(doc);

      const [
        bgDataUrl,
        adminIcon,
        addressIcon,
        phoneIcon,
        // emailIcon,
      ] = await Promise.all([
        loadBgImageAsDataUrl(),
        loadImageAsDataUrl(ADMIN_ICON_URL),
        loadImageAsDataUrl(ADDRESS_ICON_URL),
        loadImageAsDataUrl(PHONE_ICON_URL),
        // loadImageAsDataUrl(EMAIL_ICON_URL),
      ]);

      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width || pageSize.getWidth();
      const pageHeight = pageSize.height || pageSize.getHeight();
      const centerX = pageWidth / 2;

      if (bgDataUrl) {
        doc.addImage(bgDataUrl, "PNG", 0, 0, pageWidth, pageHeight);
      }

      const firstPageTop = 158;
      const otherPagesTop = 72;
      const marginBottom = 72;
      const marginX = 40;

      let cursorY = firstPageTop;

      const normalizedSubtitle = String(subtitle || "").toLowerCase().trim();
      let subtitleLabel = subtitle;

      if (isTransactionTab) {
        if (["platform", "transaction", "service"].includes(normalizedSubtitle)) {
          subtitleLabel = `${subtitle} Fee`;
        }
      }

      const subtitleHeader = String(subtitleLabel || "").toUpperCase();

      const formatPrettyDate = (raw) => {
        if (!raw) return null;
        const d = dayjs(raw);
        return d.isValid() ? d.format("MMMM D, YYYY") : null;
      };

      const prettyFrom = formatPrettyDate(from);
      const prettyTo = formatPrettyDate(to);

      const rangeTxt =
        (isTransactionTab || isRemittanceTab) && (from || to)
          ? `Date range: ${prettyFrom || "—"} to ${prettyTo || "—"}`
          : "Date range: All";

      const generatedNow = dayjs();
      const generatedTxt = `Generated on: ${generatedNow.format(
        "MMMM D, YYYY h:mm A"
      )}`;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(title, centerX, cursorY, { align: "center" });
      cursorY += 22;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(subtitleHeader, centerX, cursorY, { align: "center" });
      cursorY += 40;

      doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
      doc.setFontSize(11);
      doc.text(rangeTxt, pageWidth - marginX, cursorY, { align: "right" });
      cursorY += 14;

      doc.text(generatedTxt, pageWidth - marginX, cursorY, { align: "right" });
      cursorY += 16;

      // Table body
      let bodyRaw;

      if (isTransactionTab) {
        const amtColIndex = 5;
        bodyRaw = rowsForExport.map((row) =>
          row.map((val, idx) => (idx === amtColIndex ? pesoStrict(val) : val))
        );
      } else if (isRemittanceTab) {
        const amtColIndex = 3;
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
        ? { 5: { halign: "right" } }
        : isRemittanceTab
        ? { 3: { halign: "right" } }
        : {};

      autoTable(doc, {
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
          top: otherPagesTop,
          bottom: marginBottom,
          left: marginX,
          right: marginX,
        },
        didDrawPage: () => {
          const pageSizeInner = doc.internal.pageSize;
          const pageWidthInner =
            pageSizeInner.width || pageSizeInner.getWidth();
          const pageHeightInner =
            pageSizeInner.height || pageSizeInner.getHeight();

          const footerTopY = pageHeightInner - marginBottom + 16;
          const pageLabelY = pageHeightInner - marginBottom / 2;

          const iconSize = 12;
          const iconTextGap = 6;
          const groupGap = 24;

          doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
          doc.setFontSize(9);

          const rowY = footerTopY;
          let x = marginX;

          const drawIconLabel = (icon, label) => {
            if (!label) return;

            if (icon) {
              doc.addImage(
                icon,
                "PNG",
                x,
                rowY - iconSize + 2,
                iconSize,
                iconSize
              );
            }

            const textX = x + (icon ? iconSize + iconTextGap : 0);
            doc.text(label, textX, rowY);

            const textWidth = doc.getTextWidth(label);
            const totalWidth =
              (icon ? iconSize + iconTextGap : 0) +
              textWidth +
              groupGap;

            x += totalWidth;
          };

          drawIconLabel(adminIcon, `${superadminName}`);
          drawIconLabel(
            addressIcon,
            superadminAddress ? `${superadminAddress}` : ""
          );
          drawIconLabel(
            phoneIcon,
            superadminContact ? `${superadminContact}` : ""
          );
          // drawIconLabel(emailIcon, superadminEmail ? `${superadminEmail}` : "");

          doc.text(
            `Page ${doc.getNumberOfPages()}`,
            pageWidthInner - marginX,
            pageLabelY,
            { align: "right" }
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

  // ===== Render (UI + PAGINATION) =====
  return (
    <>
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
            visibleData.map((item, index) => (
              <tr
                key={item.coop_id || index}
                className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
              >
                <td className="px-4 py-3 text-center font-medium">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.coop_email || "—"}
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
            visibleData.map((item, index) => (
              <tr
                key={index}
                className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
              >
                <td className="px-4 py-3 text-center font-medium">
                  {item.buyer_name}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.buyer_email || "—"}
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
        ) : isRemittanceTab ? (
          filteredRemits.length === 0 ? (
            <tr>
              <td colSpan={activeHeaders.length} className="text-center py-4">
                No remittance records found.
              </td>
            </tr>
          ) : (
            visibleData.map((item, index) => (
              <tr
                key={index}
                className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
              >
                <td className="px-4 py-3 text-center font-medium">
                  {dayjs(item.remittance_date).format("MMM D, YYYY")}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.coop_name || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.admin_name || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  ₱{Number(item.total_remitted ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.payment_method || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.remitted_to || "—"}
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
          visibleData.map((item, index) => (
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

      {!loading && activeSourceData.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {activeSourceData.length === 0
                ? 0
                : (page - 1) * PAGE_SIZE + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                (page - 1) * PAGE_SIZE + PAGE_SIZE,
                activeSourceData.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium">{activeSourceData.length}</span>{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-2.5 py-1 rounded-md border text-xs disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                .map((p) => (
                  <button
                    key={p}
                    className={`px-2.5 py-1 rounded-md border text-xs ${
                      p === page
                        ? "bg-primaryYellow text-white border-primaryYellow"
                        : ""
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
            </div>

            <button
              className="px-2.5 py-1 rounded-md border text-xs disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default ReportsTable;
