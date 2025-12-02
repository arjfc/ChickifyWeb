// components/admin/tables/ReportTable.jsx
"use client";
import React, {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Table from "../../Table";
import {
  fetchEggProduction,
  fetchEggBatch,
  fetchAdminSalesRecords,
  fetchPayoutOverviewList,
  fetchMyFarmersList,
  fetchAdminProfile,
} from "@/services/Reports";
import {
  fetchTransactionsByAdmin,
  fetchFeesCollectedByAdmin,
} from "@/services/TransactionLogs";
import { fetchAdminRemittanceHistory } from "@/services/Remittance"; // ⬅️ NEW

// pdf libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportTable = forwardRef(function ReportTable(
  { selectedOption, dateFrom = "", dateTo = "" },
  ref
) {
  /* ======================== helpers ======================== */
  const peso = (n) =>
    typeof n === "number"
      ? `₱${n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "₱0.00";

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

  const MONEY_COLS = {
    "Payout History": new Set([2]),
    "Sales Records": new Set([5, 6]),
    "Transaction Records": new Set([3, 4, 5, 6]),
    "Egg Stock": new Set(),
    "Egg Production": new Set(),
    "List of Farmers": new Set(),
    // ⬇️ NEW
    "Fees Collected": new Set([6]), // amount col
    "Remittance Records": new Set([1]), // Date(0), Total Remitted(1), Remitted To(2)
  };

  /* ======================== Unicode font ======================== */
  const FONT_NAME = "NotoSans";
  const FONT_FILE = "NotoSans-Regular.ttf";
  const FONT_URL = "/fonts/NotoSans-Regular.ttf";
  let FONT_READY = false;

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  async function ensureUnicodeFont(doc) {
    if (FONT_READY) {
      doc.setFont(FONT_NAME, "normal");
      return true;
    }
    try {
      const res = await fetch(FONT_URL, { cache: "force-cache" });
      if (!res.ok) throw new Error(`Font fetch failed (${res.status})`);
      const buf = await res.arrayBuffer();
      const base64 = arrayBufferToBase64(buf);
      doc.addFileToVFS(FONT_FILE, base64);
      doc.addFont(FONT_FILE, FONT_NAME, "normal");
      doc.addFont(FONT_FILE, FONT_NAME, "bold");
      doc.setFont(FONT_NAME, "normal");
      FONT_READY = true;
      return true;
    } catch (e) {
      console.warn("[ReportTable] Unicode font not loaded:", e);
      return false;
    }
  }

  /* ======================== Background image (from public) ======================== */
  const BG_URL = "/background.png";
  const COOP_ICON_URL = "/icons/chicken-coop.png";
  const ADMIN_ICON_URL = "/icons/user.png";
  const ADDRESS_ICON_URL = "/icons/pin.png";
  const PHONE_ICON_URL = "/icons/telephone.png";
  const EMAIL_ICON_URL = "/icons/email.png";

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
        "[ReportTable] Failed to load PDF background:",
        e?.message || e
      );
      return null;
    }
  };

  // Generic loader for any image → DataURL
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
      console.warn("[ReportTable] Failed to load icon:", url, e?.message || e);
      return null;
    }
  };

  /* ======================== date helpers ======================== */
  const parseDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    const s = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
    const mdy = s.split("/");
    if (mdy.length === 3) {
      const [mm, dd, yy] = mdy.map((x) => parseInt(x, 10));
      const fullY = yy < 100 ? 2000 + yy : yy;
      return new Date(fullY, (mm || 1) - 1, dd || 1);
    }
    const t = new Date(s);
    return Number.isNaN(t.getTime()) ? null : t;
  };

  const toStartOfDay = (d) => {
    if (!d) return null;
    const dt = parseDate(d);
    if (!dt) return null;
    dt.setHours(0, 0, 0, 0);
    return dt;
  };
  const toEndOfDay = (d) => {
    if (!d) return null;
    const dt = parseDate(d);
    if (!dt) return null;
    dt.setHours(23, 59, 59, 999);
    return dt;
  };

  const FROM = toStartOfDay(dateFrom || null);
  const TO = toEndOfDay(dateTo || null);

  const withinRange = (dateValue) => {
    if (!dateFrom && !dateTo) return true;
    const dt = parseDate(dateValue);
    if (!dt) return false;
    if (FROM && dt < FROM) return false;
    if (TO && dt > TO) return false;
    return true;
  };

  const mmddyy = (d) => {
    if (!d) return "—";
    const dt = parseDate(d);
    if (!dt) return "—";
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const yy = String(dt.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };

  /* ======================== data loads ======================== */
  const [eggRows, setEggRows] = useState([]);
  const [eggLoading, setEggLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Egg Production") return;
    (async () => {
      try {
        setEggLoading(true);
        const data = await fetchEggProduction({ dateRange: "all" });
        if (!alive) return;
        const filtered = (data || []).filter((r) => withinRange(r.prod_date));
        const mapped = filtered.map((r) => ({
          productionID: r.egg_prod,
          farmerName: r.farmer_name || "—",
          flockID: r.flock_id ?? "—",
          productionDate: mmddyy(r.prod_date),
          size: r.size_description || "—",
          totalEggs: r.qty_eggs_total ?? 0,
          sellableEggs: r.qty_eggs_sellable ?? 0,
          rejectEggs: r.qty_eggs_rejects ?? 0,
          notes: r.notes || "—",
          created: mmddyy(r.created_at),
        }));
        setEggRows(mapped);
      } catch (e) {
        console.error("[ReportTable] view_egg_production:", e?.message || e);
        setEggRows([]);
      } finally {
        if (alive) setEggLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption, dateFrom, dateTo]);

  const [batchRows, setBatchRows] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Egg Stock") return;
    (async () => {
      try {
        setBatchLoading(true);
        const data = await fetchEggBatch({ dateRange: "all" });
        if (!alive) return;
        const filtered = (data || []).filter((r) =>
          withinRange(r.date_collected)
        );
        const mapped = filtered.map((r) => ({
          batchID: r.batch_id,
          farmerName: r.farmer_name || "—",
          productID: r.product_id || "—",
          eggQuantity: r.egg_quantity ?? 0,
          dateCollected: mmddyy(r.date_collected),
          expiryDate: mmddyy(r.expiry_date),
          size: r.size_description || "—",
          sold: r.sold ?? 0,
          created: mmddyy(r.created_at),
        }));
        setBatchRows(mapped);
      } catch (e) {
        console.error("[ReportTable] view_egg_batch:", e?.message || e);
        setBatchRows([]);
      } finally {
        if (alive) setBatchLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption, dateFrom, dateTo]);

  const [salesRows, setSalesRows] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Sales Records") return;
    (async () => {
      try {
        setSalesLoading(true);
        const data = await fetchAdminSalesRecords({ dateRange: "all" });
        if (!alive) return;
        const filtered = (data || []).filter((r) =>
          withinRange(r.order_date)
        );
        const mapped = filtered.map((r) => ({
          orderID: r.order_id,
          buyerName: r.buyer_name || "—",
          productName: r.product_name || "—",
          variant: r.size || "—",
          quantity: r.quantity_sold ?? 0,
          pricePerTray: r.price_per_tray ?? 0,
          totalAmount: r.total_amount ?? 0,
          orderDate: mmddyy(r.order_date),
          fulfillmentDate: r.fulfillment_date
            ? mmddyy(r.fulfillment_date)
            : "—",
          orderStatus: r.order_status || "—",
          paymentStatus: r.payment_status ?? "—",
        }));
        setSalesRows(mapped);
      } catch (e) {
        console.error(
          "[ReportTable] view_admin_sales_records:",
          e?.message || e
        );
        setSalesRows([]);
      } finally {
        if (alive) setSalesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption, dateFrom, dateTo]);

  const [payoutRows, setPayoutRows] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Payout History") return;
    (async () => {
      try {
        setPayoutLoading(true);
        const list = await fetchPayoutOverviewList();
        if (!alive) return;
        const approvedOnly = (list || []).filter(
          (r) => (r?.status || "").toLowerCase() === "approved"
        );
        const filtered = approvedOnly.filter((r) =>
          withinRange(r.request_date)
        );
        const mapped = filtered.map((r) => ({
          payoutID: r.payout_id,
          sellerName: r.requestor_name || "—",
          amount: Number(r.amount ?? 0),
          requestDate: mmddyy(r.request_date),
          processDate: r.processed_at ? mmddyy(r.processed_at) : "—",
          status: "Approved",
        }));
        setPayoutRows(mapped);
      } catch (e) {
        console.error(
          "[ReportTable] view_payout_overview_admin:",
          e?.message || e
        );
        setPayoutRows([]);
      } finally {
        if (alive) setPayoutLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption, dateFrom, dateTo]);

  const [txRawRows, setTxRawRows] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txErr, setTxErr] = useState(null);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Transaction Records") return;
    (async () => {
      try {
        setTxErr(null);
        setTxLoading(true);
        const rows = await fetchTransactionsByAdmin();
        if (!alive) return;
        setTxRawRows(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!alive) return;
        setTxErr(e?.message || "Failed to load transactions");
        setTxRawRows([]);
      } finally {
        if (alive) setTxLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption]);

  const txMapped = useMemo(() => {
    return (txRawRows || []).map((r) => ({
      orderID:
        r.order_code ?? `ORD-${String(r.order_id ?? "").padStart(4, "0")}`,
      transactionDate: r.transaction_date,
      paymentMethod: r.payment_method || "",
      grossAmount: Number(r.gross_amount ?? 0),
      platformFee: Number(r.platform_fee ?? 0),
      netToCoop: Number(r.net_to_coop ?? 0),
      platformEarnings: Number(
        r.platform_earnings ?? r.platform_fee ?? 0
      ),
      memo: r.memo ?? "",
    }));
  }, [txRawRows]);

  const txFiltered = useMemo(() => {
    if (!dateFrom && !dateTo) return txMapped;
    const from = toStartOfDay(dateFrom || null);
    const to = toEndOfDay(dateTo || null);
    return txMapped.filter((row) => {
      const dt = parseDate(row.transactionDate);
      if (!dt) return false;
      if (from && dt < from) return false;
      if (to && dt > to) return false;
      return true;
    });
  }, [txMapped, dateFrom, dateTo]);

  const txVisible = useMemo(
    () =>
      txFiltered.map((r) => ({
        ...r,
        transactionDate: mmddyy(r.transactionDate),
      })),
    [txFiltered]
  );

  /* ======================== NEW: Fees collected ======================== */
  const [feesRows, setFeesRows] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesErr, setFeesErr] = useState(null);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Fees Collected") return;
    (async () => {
      try {
        setFeesErr(null);
        setFeesLoading(true);
        const rows = await fetchFeesCollectedByAdmin({
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
        });
        if (!alive) return;
        const safe = Array.isArray(rows) ? rows : [];
        const mapped = safe.map((r) => ({
          transactionID: r.transaction_id,
          orderID: r.order_id ?? "—",
          transactionDate: mmddyy(r.transaction_date),
          feeType: r.fee_type || "—",
          collectedFrom: r.collected_from || "—",
          userRole: r.user_role || "—",
          amount: Number(r.amount ?? 0),
        }));
        setFeesRows(mapped);
      } catch (e) {
        if (!alive) return;
        console.error(
          "[ReportTable] view_fees_collected_admin:",
          e?.message || e
        );
        setFeesErr(e?.message || "Failed to load fees collected");
        setFeesRows([]);
      } finally {
        if (alive) setFeesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption, dateFrom, dateTo]);

  /* ======================== ⬇️ NEW: Farmers list ======================== */
  const [farmersRows, setFarmersRows] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "List of Farmers") return;
    (async () => {
      try {
        setFarmersLoading(true);
        const rows = await fetchMyFarmersList(null); // null => ignore status filter
        if (!alive) return;
        const safe = Array.isArray(rows) ? rows : [];
        const mapped = safe.map((r) => ({
          fullName: r.full_name || r.name || "—",
          address: r.address || "—",
          contactNo: r.contact_no || r.phone || "—",
          gcashNo: r.gcash_no || r.gcashNo || "—",
        }));
        setFarmersRows(mapped);
      } catch (e) {
        console.error(
          "[ReportTable] view_farmers_under_coop:",
          e?.message || e
        );
        setFarmersRows([]);
      } finally {
        if (alive) setFarmersLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption]);

  /* ======================== NEW: Remittance Records ======================== */
  const [remitRows, setRemitRows] = useState([]);
  const [remitLoading, setRemitLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Remittance Records") return;
    (async () => {
      try {
        setRemitLoading(true);
        const rows = await fetchAdminRemittanceHistory({
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
        });
        if (!alive) return;
        const safe = Array.isArray(rows) ? rows : [];
        const mapped = safe.map((r) => ({
          date: mmddyy(r.remittance_date),
          totalRemitted: Number(r.total_remitted ?? 0),
          remittedTo: r.remitted_to || "—",
        }));
        setRemitRows(mapped);
      } catch (e) {
        console.error(
          "[ReportTable] view_admin_remittance_historyy:",
          e?.message || e
        );
        setRemitRows([]);
      } finally {
        if (alive) setRemitLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption, dateFrom, dateTo]);

  /* ======================== headers ======================== */
  const headerMap = {
    "Payout History": [
      "Payout ID",
      "Seller Name",
      "Amount",
      "Request Date",
      "Processed Date",
      "Status",
    ],
    "Sales Records": [
      "Order ID",
      "Buyer Name",
      "Product Name",
      "Size",
      "Quantity Sold",
      "Price per tray",
      "Total Amount",
      "Order Date",
      "Fulfillment Date",
      "Order Status",
      "Payment Status",
    ],
    "Transaction Records": [
      "Order ID",
      "Transaction Date",
      "Payment Method",
      "Gross Amount",
      "Platform Fee",
      "Net To Coop",
      "Platform Earnings",
      "Memo",
    ],
    "Egg Stock": [
      "Batch ID",
      "Farmer Name",
      "Product ID",
      "Egg Quantity",
      "Date Collected",
      "Expiry Date",
      "Size",
      "Sold",
      "Created",
    ],
    "Egg Production": [
      "Egg Production ID",
      "Farmer Name",
      "Flock ID",
      "Production Date",
      "Size",
      "Total Eggs",
      "Sellable Eggs",
      "Reject Eggs",
      "Notes",
      "Created",
    ],
    "List of Farmers": ["Full Name", "Address", "Contact No.", "GCash No."],
    // ⬇️ NEW
    "Fees Collected": [
      "Transaction ID",
      "Order ID",
      "Transaction Date",
      "Fee Type",
      "Collected From",
      "User Role",
      "Amount",
    ],
    "Remittance Records": ["Date", "Total Remitted", "Remitted To"],
  };

  /* ======================== paging ======================== */
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const sourceData = useMemo(() => {
    switch (selectedOption) {
      case "Payout History":
        return payoutLoading
          ? [
              {
                payoutID: "Loading…",
                sellerName: "",
                amount: "",
                requestDate: "",
                processDate: "",
                status: "",
              },
            ]
          : payoutRows;
      case "Sales Records":
        return salesLoading
          ? [
              {
                orderID: "Loading…",
                buyerName: "",
                productName: "",
                variant: "",
                quantity: "",
                pricePerTray: "",
                totalAmount: "",
                orderDate: "",
                fulfillmentDate: "",
                orderStatus: "",
                paymentStatus: "",
              },
            ]
          : salesRows;
      case "Transaction Records":
        return txLoading
          ? [
              {
                orderID: "Loading…",
                transactionDate: "",
                paymentMethod: "",
                grossAmount: "",
                platformFee: "",
                netToCoop: "",
                platformEarnings: "",
                memo: "",
              },
            ]
          : txVisible;
      case "Egg Stock":
        return batchLoading
          ? [
              {
                batchID: "Loading…",
                farmerName: "",
                productID: "",
                eggQuantity: "",
                dateCollected: "",
                expiryDate: "",
                size: "",
                sold: "",
                created: "",
              },
            ]
          : batchRows;
      case "Egg Production":
        return eggLoading
          ? [
              {
                productionID: "Loading…",
                farmerName: "",
                flockID: "",
                productionDate: "",
                size: "",
                totalEggs: "",
                sellableEggs: "",
                rejectEggs: "",
                notes: "",
                created: "",
              },
            ]
          : eggRows;
      case "List of Farmers":
        return farmersLoading
          ? [
              {
                fullName: "Loading…",
                address: "",
                contactNo: "",
                gcashNo: "",
              },
            ]
          : farmersRows;
      case "Fees Collected":
        return feesLoading
          ? [
              {
                transactionID: "Loading…",
                orderID: "",
                transactionDate: "",
                feeType: "",
                collectedFrom: "",
                userRole: "",
                amount: "",
              },
            ]
          : feesRows;
      case "Remittance Records":
        return remitLoading
          ? [
              {
                date: "Loading…",
                totalRemitted: "",
                remittedTo: "",
              },
            ]
          : remitRows;
      default:
        return [];
    }
  }, [
    selectedOption,
    payoutRows,
    payoutLoading,
    salesRows,
    salesLoading,
    txVisible,
    txLoading,
    batchRows,
    batchLoading,
    eggRows,
    eggLoading,
    farmersRows,
    farmersLoading,
    feesRows,
    feesLoading,
    remitRows,
    remitLoading,
  ]);

  useEffect(() => {
    setPage(1);
  }, [selectedOption, dateFrom, dateTo]);

  const isLoading =
    (selectedOption === "Payout History" && payoutLoading) ||
    (selectedOption === "Sales Records" && salesLoading) ||
    (selectedOption === "Transaction Records" && txLoading) ||
    (selectedOption === "Egg Stock" && batchLoading) ||
    (selectedOption === "Egg Production" && eggLoading) ||
    (selectedOption === "List of Farmers" && farmersLoading) ||
    (selectedOption === "Fees Collected" && feesLoading) ||
    (selectedOption === "Remittance Records" && remitLoading);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((sourceData?.length || 0) / PAGE_SIZE)),
    [sourceData]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageStart = (page - 1) * PAGE_SIZE;
  const visibleData = isLoading
    ? sourceData
    : (sourceData || []).slice(pageStart, pageStart + PAGE_SIZE);
  const headers = headerMap[selectedOption] || [];

  /* ======================== export prep ======================== */
  const rowsForExport = useMemo(() => {
    const rows = sourceData || [];
    const mapRow = (item) => {
      switch (selectedOption) {
        case "Payout History":
          return [
            item.payoutID,
            item.sellerName,
            item.amount,
            item.requestDate,
            item.processDate,
            "Approved",
          ];
        case "Sales Records":
          return [
            item.orderID,
            item.buyerName,
            item.productName,
            item.variant,
            item.quantity,
            item.pricePerTray,
            item.totalAmount,
            item.orderDate,
            item.fulfillmentDate,
            item.orderStatus,
            item.paymentStatus,
          ];
        case "Transaction Records":
          return [
            item.orderID,
            item.transactionDate,
            item.paymentMethod,
            item.grossAmount,
            item.platformFee,
            item.netToCoop,
            item.platformEarnings,
            item.memo ?? "",
          ];
        case "Egg Stock":
          return [
            item.batchID,
            item.farmerName,
            item.productID,
            item.eggQuantity,
            item.dateCollected,
            item.expiryDate,
            item.size,
            item.sold,
            item.created,
          ];
        case "Egg Production":
          return [
            item.productionID,
            item.farmerName,
            item.flockID,
            item.productionDate,
            item.size,
            item.totalEggs,
            item.sellableEggs,
            item.rejectEggs,
            item.notes,
            item.created,
          ];
        case "List of Farmers":
          return [item.fullName, item.address, item.contactNo, item.gcashNo];
        case "Fees Collected":
          return [
            item.transactionID,
            item.orderID,
            item.transactionDate,
            item.feeType,
            item.collectedFrom,
            item.userRole,
            item.amount,
          ];
        case "Remittance Records":
          return [item.date, item.totalRemitted, item.remittedTo];
        default:
          return [];
      }
    };
    const moneyCols = MONEY_COLS[selectedOption] || new Set();
    return rows.map((row) =>
      mapRow(row).map((val, idx) =>
        moneyCols.has(idx) ? pesoStrict(val) : val
      )
    );
  }, [sourceData, selectedOption]);

  /* ======================== export PDF (fonts now match 1st code) ======================== */
  useImperativeHandle(ref, () => ({
    async exportPdf(meta = {}) {
      const {
        title = "Chickify Admin Reports",
        subtitle = selectedOption,
        dateFrom: fromProp = dateFrom,
        dateTo: toProp = dateTo,
        filename,
      } = meta;

      const rawFrom = fromProp;
      const rawTo = toProp;

      // 🔹 Fetch admin/coop info via RPC
      let coopName = "—";
      let adminName = "—";
      let adminAddress = "—";
      let adminContact = "—";
      let adminEmail = " ";

      try {
        const adminProfile = await fetchAdminProfile();
        if (adminProfile) {
          coopName = adminProfile.coop_name || "—";
          adminName = adminProfile.admin_full_name || "—";
          adminAddress = adminProfile.address || "—";
          adminContact = adminProfile.contact_no || "—";
          adminEmail = adminProfile.admin_email || "—";
        }
      } catch (e) {
        console.warn("[ReportTable] Failed to load admin profile for PDF:", e);
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const hasUnicode = await ensureUnicodeFont(doc);

      // 🔹 Load background + icon images (PNG)
      const [
        bgDataUrl,
        coopIcon,
        adminIcon,
        addressIcon,
        phoneIcon,
        emailIcon,
      ] = await Promise.all([
        loadBgImageAsDataUrl(),
        loadImageAsDataUrl(COOP_ICON_URL),
        loadImageAsDataUrl(ADMIN_ICON_URL),
        loadImageAsDataUrl(ADDRESS_ICON_URL),
        loadImageAsDataUrl(PHONE_ICON_URL),
        loadImageAsDataUrl(EMAIL_ICON_URL),
      ]);

      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width || pageSize.getWidth();
      const pageHeight = pageSize.height || pageSize.getHeight();
      const centerX = pageWidth / 2;

      // 🔹 Background first
      if (bgDataUrl) {
        doc.addImage(bgDataUrl, "PNG", 0, 0, pageWidth, pageHeight);
      }

      // 👉 TOP/BOTTOM MARGINS
      const firstPageTop = 158;
      const otherPagesTop = 72;
      const marginBottom = 72;
      const marginX = 40;

      let cursorY = firstPageTop;

      // 👉 UPPERCASE SUBTITLE
      const subtitleHeader = String(subtitle || "").toUpperCase();

      // Helper: "November 27, 2025"
      const formatPrettyDate = (dRaw) => {
        if (!dRaw) return null;
        const dt = parseDate(dRaw);
        if (!dt) return null;
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const month = monthNames[dt.getMonth()];
        const day = dt.getDate();
        const year = dt.getFullYear();
        return `${month} ${day}, ${year}`;
      };

      const prettyFrom = formatPrettyDate(rawFrom);
      const prettyTo = formatPrettyDate(rawTo);

      const rangeTxt =
        prettyFrom || prettyTo
          ? `Date range: ${prettyFrom || "—"} to ${prettyTo || "—"}`
          : "Date range: All";

      // 🔹 "Generated on" date/time
      const formatDateTimeLong = (dt) => {
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const month = monthNames[dt.getMonth()];
        const day = dt.getDate();
        const year = dt.getFullYear();

        let hours = dt.getHours();
        const minutes = String(dt.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
      };

      const generatedNow = new Date();
      const generatedTxt = `Generated on: ${formatDateTimeLong(generatedNow)}`;

      // ===== HEADER (same as 2nd code) =====
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

      const moneyCols = MONEY_COLS[subtitle] || new Set();
      const columnStyles = {};
      Array.from(moneyCols).forEach((colIdx) => {
        columnStyles[colIdx] = { halign: "right" };
      });

      const bodySafe = rowsForExport;

      // ===== Sales Records footer (unchanged) =====
      let footRows = undefined;
      if (subtitle === "Sales Records") {
        const completedRows = (sourceData || []).filter(
          (r) =>
            String(r?.paymentStatus || "").trim().toLowerCase() === "completed"
        );
        const totalCompleted = completedRows.reduce(
          (s, r) => s + Number(r?.totalAmount ?? 0),
          0
        );
        const COLS = headers.length;
        const TARGET_COL = 10;
        const COLSPAN = TARGET_COL;
        const trailing = new Array(COLS - COLSPAN).fill("");
        trailing[0] = {
          content: peso(totalCompleted),
          styles: {
            fontStyle: "bold",
            fontSize: 11,
            halign: "right",
            textColor: [33, 33, 33],
          },
        };
        footRows = [
          [
            {
              content: "TOTAL (Completed payments): ",
              colSpan: COLSPAN,
              styles: {
                halign: "right",
                fontStyle: "bold",
                fontSize: 10,
                textColor: [0, 0, 0],
              },
            },
            ...trailing,
          ],
        ];
      }
      const isSales = subtitle === "Sales Records";

      autoTable(doc, {
        // first page = cursorY (~158) + header; next pages use margin.top below
        startY: cursorY + 8,
        head: [headers],
        body: bodySafe,
        styles: {
          font: hasUnicode ? FONT_NAME : "helvetica",
          fontSize: isSales ? 8 : 9, // 👈 body font size: 8 for Sales, 9 for others
          cellPadding: 4,
          halign: "center",
          textColor: [33, 33, 33],
        },
        headStyles: {
          font: "helvetica",
          fontSize: isSales ? 9 : 10, // 👈 header font size: 9 for Sales, 10 for others
          fillColor: [255, 210, 77],
          textColor: [33, 33, 33],
        },
        columnStyles,
        foot: footRows,
        footStyles: {
          font: hasUnicode ? FONT_NAME : "helvetica",
          fontStyle: "bold",
          fillColor: [255, 248, 225],
          textColor: [17, 24, 39],
          halign: "right",
        },
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

          // 🔹 Footer area
          const footerTopY = pageHeightInner - marginBottom + 16;
          const pageLabelY = pageHeightInner - marginBottom / 2;

          const iconSize = 12;
          const iconTextGap = 6;
          const groupGap = 24; // space between each icon+label group

          doc.setFont(
            hasUnicode ? FONT_NAME : "helvetica",
            "normal"
          );
          doc.setFontSize(9);

          const rowY = footerTopY;
          let x = marginX;

          // helper: draw one "icon + label" group horizontally
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

            x += totalWidth; // move x for next group
          };

          // 🔹 All icons + infos in ONE ROW
          // drawIconLabel(coopIcon, `Coop: ${coopName}`);
          drawIconLabel(adminIcon, `${adminName}`);
          drawIconLabel(
            addressIcon,
            adminAddress ? `${adminAddress}` : ""
          );
          drawIconLabel(
            phoneIcon,
            adminContact ? `${adminContact}` : ""
          );
          // drawIconLabel(
          //   emailIcon,
          //   adminEmail ? `${adminEmail}` : ""
          // );

          // Page number on the right
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
        `${String(subtitle || "")
          .replace(/\s+/g, "_")
          .toLowerCase()}_${rawFrom || "all"}_${rawTo || "all"}.pdf`;
      doc.save(safeName);
    },
  }));

  /* ======================== UI ======================== */
  return (
    <div className="[&_thead_th]:text-sm [&_thead_th]:py-1.5 [&_thead_tr]:h-8 [&_thead_th]:font-bold">
      {selectedOption === "Transaction Records" && txErr && (
        <div className="mb-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          Error: {String(txErr)}
        </div>
      )}

      {selectedOption === "Fees Collected" && feesErr && (
        <div className="mb-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          Error: {String(feesErr)}
        </div>
      )}

      <Table headers={headerMap[selectedOption] || []}>
        {(isLoading ? sourceData : visibleData || []).map((item, index) => (
          <tr
            key={index}
            className="bg-[#faf4df] text-gray-700 rounded-lg shadow-sm"
          >
            {/* Payout History */}
            {selectedOption === "Payout History" && (
              <>
                <td className="px-3 py-2 text-center font-medium">
                  {item.payoutID}
                </td>
                <td className="px-3 py-2 text-center">{item.sellerName}</td>
                <td className="px-3 py-2 text-center">
                  {typeof item.amount === "number"
                    ? peso(item.amount)
                    : item.amount}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.requestDate}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.processDate}
                </td>
                <td className="px-3 py-2 text-center font-medium text-green-600">
                  Approved
                </td>
              </>
            )}

            {/* Sales Records */}
            {selectedOption === "Sales Records" && (
              <>
                <td className="px-3 py-2 text-center font-medium">
                  {item.orderID}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.buyerName}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.productName}
                </td>
                <td className="px-3 py-2 text-center">{item.variant}</td>
                <td className="px-3 py-2 text-center">{item.quantity}</td>
                <td className="px-3 py-2 text-center">
                  {peso(item.pricePerTray)}
                </td>
                <td className="px-3 py-2 text-center">
                  {peso(item.totalAmount)}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.orderDate}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.fulfillmentDate}
                </td>
                <td
                  className={`px-3 py-2 text-center font-medium ${
                    (() => {
                      const s = (item.orderStatus || "").toLowerCase();
                      return s === "delivered" || s === "completed"
                        ? "text-green-600"
                        : s === "pending"
                        ? "text-yellow-500"
                        : s === "processing" ||
                          s === "confirmed" ||
                          s === "preparing" ||
                          s === "packed"
                        ? "text-blue-600"
                        : s === "shipped" || s === "out for delivery"
                        ? "text-sky-600"
                        : s === "cancelled" ||
                          s === "canceled" ||
                          s === "rejected" ||
                          s === "returned"
                        ? "text-red-600"
                        : "text-gray-600";
                    })()
                  }`}
                >
                  {item.orderStatus}
                </td>
                <td
                  className={`px-3 py-2 text-center font-medium ${
                    item.paymentStatus === "Completed"
                      ? "text-green-600"
                      : "text-yellow-500"
                  }`}
                >
                  {item.paymentStatus}
                </td>
              </>
            )}

            {/* Transaction Records */}
            {selectedOption === "Transaction Records" && (
              <>
                <td className="px-3 py-2 text-center font-medium">
                  {item.orderID}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.transactionDate}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.paymentMethod}
                </td>
                <td className="px-3 py-2 text-center">
                  {typeof item.grossAmount === "number"
                    ? peso(item.grossAmount)
                    : item.grossAmount}
                </td>
                <td className="px-3 py-2 text-center">
                  {typeof item.platformFee === "number"
                    ? peso(item.platformFee)
                    : item.platformFee}
                </td>
                <td className="px-3 py-2 text-center">
                  {typeof item.netToCoop === "number"
                    ? peso(item.netTof)
                    : item.netToCoop}
                </td>
                <td className="px-3 py-2 text-center">
                  {typeof item.platformEarnings === "number"
                    ? peso(item.platformEarnings)
                    : item.platformEarnings}
                </td>
                <td className="px-3 py-2 text-center">{item.memo}</td>
              </>
            )}

            {/* Egg Stock */}
            {selectedOption === "Egg Stock" && (
              <>
                <td className="px-3 py-2 text-center font-medium">
                  {item.batchID}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.farmerName}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.productID}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.eggQuantity}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.dateCollected}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.expiryDate}
                </td>
                <td className="px-3 py-2 text-center">{item.size}</td>
                <td className="px-3 py-2 text-center">{item.sold}</td>
                <td className="px-3 py-2 text-center">{item.created}</td>
              </>
            )}

            {/* Egg Production */}
            {selectedOption === "Egg Production" && (
              <>
                <td className="px-3 py-2 text-center font-medium">
                  {item.productionID}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.farmerName}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.flockID}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.productionDate}
                </td>
                <td className="px-3 py-2 text-center">{item.size}</td>
                <td className="px-3 py-2 text-center">
                  {item.totalEggs}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.sellableEggs}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.rejectEggs}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.notes}
                </td>
                <td className="px-3 py-2 text-center">{item.created}</td>
              </>
            )}

            {/* List of Farmers */}
            {selectedOption === "List of Farmers" && (
              <>
                <td className="px-3 py-2 text-center font-medium">
                  {item.fullName}
                </td>
                <td className="px-3 py-2 text-center">{item.address}</td>
                <td className="px-3 py-2 text-center">
                  {item.contactNo}
                </td>
                <td className="px-3 py-2 text-center">{item.gcashNo}</td>
              </>
            )}

            {/* Fees Collected */}
            {selectedOption === "Fees Collected" && (
              <>
                <td className="px-3 py-2 text-center font-medium">
                  {item.transactionID}
                </td>
                <td className="px-3 py-2 text-center">{item.orderID}</td>
                <td className="px-3 py-2 text-center">
                  {item.transactionDate}
                </td>
                <td className="px-3 py-2 text-center">{item.feeType}</td>
                <td className="px-3 py-2 text-center">
                  {item.collectedFrom}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.userRole}
                </td>
                <td className="px-3 py-2 text-center">
                  {typeof item.amount === "number"
                    ? peso(item.amount)
                    : item.amount}
                </td>
              </>
            )}

            {/* Remittance Records */}
            {selectedOption === "Remittance Records" && (
              <>
                <td className="px-3 py-2 text-center">
                  {item.date}
                </td>
                <td className="px-3 py-2 text-center">
                  {typeof item.totalRemitted === "number"
                    ? peso(item.totalRemitted)
                    : item.totalRemitted}
                </td>
                <td className="px-3 py-2 text-center">
                  {item.remittedTo}
                </td>
              </>
            )}
          </tr>
        ))}
      </Table>

      {!isLoading && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {sourceData.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                (page - 1) * PAGE_SIZE + PAGE_SIZE,
                sourceData.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium">{sourceData.length}</span> results
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
    </div>
  );
});

export default ReportTable;
