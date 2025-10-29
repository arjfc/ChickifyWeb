// components/admin/tables/ReportTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import Table from "../../Table";
import {
  fetchEggProduction,
  fetchEggBatch,
  fetchAdminSalesRecords,
  // ⬇️ existing client for payouts (approved only)
  fetchPayoutOverviewList,
} from "@/services/Reports";
// ⬇️ bring in your Transaction Records RPC
import { fetchTransactionsByAdmin } from "@/services/TransactionLogs";

export default function ReportTable({ selectedOption, dateRange = "all" }) {
  // ===== Shared helpers =====
  const peso = (n) =>
    typeof n === "number"
      ? `₱${n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "₱0.00";

  // Supabase typically returns ISO (e.g., "2025-10-02").
  // Keep support for mm/dd/yy just in case.
  const parseDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;

    const s = String(d).trim();

    // Only treat as date-only if it is EXACTLY YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(`${s}T00:00:00`);
    }

    // mm/dd/yy support (UI/mock)
    const mdy = s.split("/");
    if (mdy.length === 3) {
      const [mm, dd, yy] = mdy.map((x) => parseInt(x, 10));
      const fullY = yy < 100 ? 2000 + yy : yy;
      return new Date(fullY, (mm || 1) - 1, dd || 1);
    }

    // Let JS handle full ISO timestamps (with time & timezone)
    const t = new Date(s);
    return Number.isNaN(t.getTime()) ? null : t;
  };


  // UI date range helper (inclusive)
  const getRange = (key) => {
    const now = new Date();
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23, 59, 59, 999
    );
    if (key === "all") return { from: null, to: null };

    if (key === "today") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0
      );
      return { from: start, to: end };
    }
    if (key === "yesterday") {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      const start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      const stop = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
      return { from: start, to: stop };
    }
    if (key === "7" || key === "30") {
      const days = parseInt(key, 10);
      const start = new Date(now);
      start.setDate(now.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);
      return { from: start, to: end };
    }
    if (key === "last_month") {
      const firstOfThis = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastOfPrev = new Date(firstOfThis - 1);
      const start = new Date(lastOfPrev.getFullYear(), lastOfPrev.getMonth(), 1, 0, 0, 0, 0);
      const stop = new Date(lastOfPrev.getFullYear(), lastOfPrev.getMonth(), lastOfPrev.getDate(), 23, 59, 59, 999);
      return { from: start, to: stop };
    }
    return { from: null, to: null };
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

  // ===== Egg Production =====
  const [eggRows, setEggRows] = useState([]);
  const [eggLoading, setEggLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Egg Production") return;
    (async () => {
      try {
        setEggLoading(true);
        const data = await fetchEggProduction({ dateRange });
        if (!alive) return;
        const mapped = (data || []).map((r) => ({
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
  }, [selectedOption, dateRange]);

  // ===== Egg Stock =====
  const [batchRows, setBatchRows] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Egg Stock") return;
    (async () => {
      try {
        setBatchLoading(true);
        const data = await fetchEggBatch({ dateRange });
        if (!alive) return;
        const mapped = (data || []).map((r) => ({
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
  }, [selectedOption, dateRange]);

  // ===== Sales Records =====
  const [salesRows, setSalesRows] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Sales Records") return;
    (async () => {
      try {
        setSalesLoading(true);
        const data = await fetchAdminSalesRecords({ dateRange });
        if (!alive) return;
        const mapped = (data || []).map((r) => ({
          orderID: r.order_id,
          buyerName: r.buyer_name || "—",
          productName: r.product_name || "—",
          variant: r.size || "—",
          quantity: r.quantity_sold ?? 0,
          pricePerTray: r.price_per_tray ?? 0,
          totalAmount: r.total_amount ?? 0,
          orderDate: mmddyy(r.order_date),
          fulfillmentDate: r.fulfillment_date ? mmddyy(r.fulfillment_date) : "—",
          orderStatus: r.order_status || "—",
          paymentStatus: r.payment_status ?? "—",
        }));
        setSalesRows(mapped);
      } catch (e) {
        console.error("[ReportTable] view_admin_sales_records:", e?.message || e);
        setSalesRows([]);
      } finally {
        if (alive) setSalesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedOption, dateRange]);

  // ===== Payout History (Approved only) =====
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

        const mapped = approvedOnly.map((r) => ({
          payoutID: r.payout_id,
          sellerName: r.requestor_name || "—",
          amount: Number(r.amount ?? 0),
          requestDate: mmddyy(r.request_date),
          processDate: r.processed_at ? mmddyy(r.processed_at) : "—",
          status: "Approved",
        }));

        setPayoutRows(mapped);
      } catch (e) {
        console.error("[ReportTable] view_payout_overview_admin:", e?.message || e);
        setPayoutRows([]);
      } finally {
        if (alive) setPayoutLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedOption]);

  // ===== Transaction Records (RPC + UI date filter) =====
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
        const rows = await fetchTransactionsByAdmin(); // your existing RPC client
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

  // Map RPC → table shape
  const txMapped = useMemo(() => {
    return (txRawRows || []).map((r) => ({
      orderID: r.order_code ?? `ORD-${String(r.order_id ?? "").padStart(4, "0")}`,
      transactionDate: r.transaction_date, // keep raw; filter/format below
      paymentMethod: r.payment_method || "",
      grossAmount: Number(r.gross_amount ?? 0),
      platformFee: Number(r.platform_fee ?? 0),
      netToCoop: Number(r.net_to_coop ?? 0),
      // use provided platform_earnings if exists; else fall back to platform_fee
      platformEarnings: Number(
        r.platform_earnings ?? r.platform_fee ?? 0
      ),
      memo: r.memo ?? "",
    }));
  }, [txRawRows]);

  // Apply UI-only date filter to Transaction Records
  const txFiltered = useMemo(() => {
    const { from, to } = getRange(dateRange || "all");
    if (!from && !to) return txMapped;
    const within = (d) => {
      const dt = parseDate(d);
      if (!dt) return false;
      if (from && dt < from) return false;
      if (to && dt > to) return false;
      return true;
    };
    return txMapped.filter((row) => within(row.transactionDate));
  }, [txMapped, dateRange]);

  // Pretty date for Transaction Records display
  const txVisible = useMemo(
    () =>
      txFiltered.map((r) => ({
        ...r,
        transactionDate: mmddyy(r.transactionDate),
      })),
    [txFiltered]
  );

  // ===== Headers =====
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
  };

  // ===== Source rows by tab (with loading skeleton rows) =====
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
      default:
        return [];
    }
  }, [
    selectedOption,
    // payouts
    payoutRows,
    payoutLoading,
    // sales
    salesRows,
    salesLoading,
    // tx
    txVisible,
    txLoading,
    // stock
    batchRows,
    batchLoading,
    // production
    eggRows,
    eggLoading,
  ]);

  // ===== Loading flags and pagination =====
  const isLoading =
    (selectedOption === "Payout History" && payoutLoading) ||
    (selectedOption === "Sales Records" && salesLoading) ||
    (selectedOption === "Transaction Records" && txLoading) ||
    (selectedOption === "Egg Stock" && batchLoading) ||
    (selectedOption === "Egg Production" && eggLoading);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // Reset page on tab/date changes
  useEffect(() => {
    setPage(1);
  }, [selectedOption, dateRange]);

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

  return (
    <div className="[&_thead_th]:text-base [&_thead_th]:py-1 [&_thead_tr]:h-9 [&_thead_th]:font-bold">
      {/* Transactions error banner (only for that tab) */}
      {selectedOption === "Transaction Records" && txErr && (
        <div className="mb-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2">
          Error: {String(txErr)}
        </div>
      )}

      <Table headers={headers}>
        {visibleData.map((item, index) => (
          <tr key={index} className="bg-[#faf4df] text-gray-700 rounded-lg shadow-sm">
            {/* Payout History (Approved only) */}
            {selectedOption === "Payout History" && (
              <>
                <td className="px-4 py-3 text-center font-medium">{item.payoutID}</td>
                <td className="px-4 py-3 text-center">{item.sellerName}</td>
                <td className="px-4 py-3 text-center">
                  {typeof item.amount === "number" ? peso(item.amount) : item.amount}
                </td>
                <td className="px-4 py-3 text-center">{item.requestDate}</td>
                <td className="px-4 py-3 text-center">{item.processDate}</td>
                <td className="px-4 py-3 text-center font-medium text-green-600">Approved</td>
              </>
            )}

            {/* Sales Records */}
            {selectedOption === "Sales Records" && (
              <>
                <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
                <td className="px-4 py-3 text-center">{item.buyerName}</td>
                <td className="px-4 py-3 text-center">{item.productName}</td>
                <td className="px-4 py-3 text-center">{item.variant}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-center">{peso(item.pricePerTray)}</td>
                <td className="px-4 py-3 text-center">{peso(item.totalAmount)}</td>
                <td className="px-4 py-3 text-center">{item.orderDate}</td>
                <td className="px-4 py-3 text-center">{item.fulfillmentDate}</td>
                <td
                  className={`px-4 py-3 text-center font-medium ${
                    item.orderStatus === "Delivered"
                      ? "text-green-600"
                      : item.orderStatus === "Pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {item.orderStatus}
                </td>
                <td
                  className={`px-4 py-3 text-center font-medium ${
                    item.paymentStatus === "Paid" ? "text-green-600" : "text-yellow-500"
                  }`}
                >
                  {item.paymentStatus}
                </td>
              </>
            )}

            {/* Transaction Records (RPC + filters) */}
            {selectedOption === "Transaction Records" && (
              <>
                <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
                <td className="px-4 py-3 text-center">{item.transactionDate}</td>
                <td className="px-4 py-3 text-center">{item.paymentMethod}</td>
                <td className="px-4 py-3 text-center">
                  {typeof item.grossAmount === "number" ? peso(item.grossAmount) : item.grossAmount}
                </td>
                <td className="px-4 py-3 text-center">
                  {typeof item.platformFee === "number" ? peso(item.platformFee) : item.platformFee}
                </td>
                <td className="px-4 py-3 text-center">
                  {typeof item.netToCoop === "number" ? peso(item.netToCoop) : item.netToCoop}
                </td>
                <td className="px-4 py-3 text-center">
                  {typeof item.platformEarnings === "number" ? peso(item.platformEarnings) : item.platformEarnings}
                </td>
                <td className="px-4 py-3 text-center">{item.memo}</td>
              </>
            )}

            {/* Egg Stock */}
            {selectedOption === "Egg Stock" && (
              <>
                <td className="px-4 py-3 text-center font-medium">{item.batchID}</td>
                <td className="px-4 py-3 text-center">{item.farmerName}</td>
                <td className="px-4 py-3 text-center">{item.productID}</td>
                <td className="px-4 py-3 text-center">{item.eggQuantity}</td>
                <td className="px-4 py-3 text-center">{item.dateCollected}</td>
                <td className="px-4 py-3 text-center">{item.expiryDate}</td>
                <td className="px-4 py-3 text-center">{item.size}</td>
                <td className="px-4 py-3 text-center">{item.sold}</td>
                <td className="px-4 py-3 text-center">{item.created}</td>
              </>
            )}

            {/* Egg Production */}
            {selectedOption === "Egg Production" && (
              <>
                <td className="px-4 py-3 text-center font-medium">{item.productionID}</td>
                <td className="px-4 py-3 text-center">{item.farmerName}</td>
                <td className="px-4 py-3 text-center">{item.flockID}</td>
                <td className="px-4 py-3 text-center">{item.productionDate}</td>
                <td className="px-4 py-3 text-center">{item.size}</td>
                <td className="px-4 py-3 text-center">{item.totalEggs}</td>
                <td className="px-4 py-3 text-center">{item.sellableEggs}</td>
                <td className="px-4 py-3 text-center">{item.rejectEggs}</td>
                <td className="px-4 py-3 text-center">{item.notes}</td>
                <td className="px-4 py-3 text-center">{item.created}</td>
              </>
            )}
          </tr>
        ))}
      </Table>

      {/* Pagination */}
      {!isLoading && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {sourceData.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min((page - 1) * PAGE_SIZE + PAGE_SIZE, sourceData.length)}
            </span>{" "}
            of <span className="font-medium">{sourceData.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>

            {/* Compact numbered pages */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                .map((p) => (
                  <button
                    key={p}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      p === page ? "bg-primaryYellow text-white border-primaryYellow" : ""
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
            </div>

            <button
              className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
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
}
