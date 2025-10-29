// components/admin/tables/ReportTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import Table from "../../Table";
import {
  fetchEggProduction,
  fetchEggBatch,
  fetchAdminSalesRecords,
  // ⬇️ NEW: use the client you added in services/Reports.js
  fetchPayoutOverviewList,
} from "@/services/Reports";

export default function ReportTable({ selectedOption, dateRange }) {
  // 🔹 Local state for Egg Production
  const [eggRows, setEggRows] = useState([]);
  const [eggLoading, setEggLoading] = useState(false);

  // 🔹 Local state for Egg Stock
  const [batchRows, setBatchRows] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // 🔹 Local state for Sales Records
  const [salesRows, setSalesRows] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);

  // 🔹 Local state for Payout History (NEW)
  const [payoutRows, setPayoutRows] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);

  // 🔹 Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // Reset page on tab/date changes
  useEffect(() => {
    setPage(1);
  }, [selectedOption, dateRange]);

  // mm/dd/yy like your sample "10/10/25"
  const mmddyy = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const yy = String(dt.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };

  // 🔹 Fetch payout history (APPROVED only)
  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Payout History") return;

    (async () => {
      try {
        setPayoutLoading(true);
        const list = await fetchPayoutOverviewList(); // calls RPC: view_payout_overview_admin
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
          status: "Approved", // we filtered already; ensure capitalized
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

  // Fetch egg production when that tab is active
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

  // Fetch egg batches when Egg Stock tab is active
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

  // Fetch sales records when Sales Records tab is active
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

  // Headers map (unchanged)
  const headerMap = {
    "Payout History": ["Payout ID", "Seller Name", "Amount", "Request Date", "Processed Date", "Status"],
    "Sales Records": ["Order ID", "Buyer Name", "Product Name", "Size", "Quantity Sold", "Price per tray", "Total Amount", "Order Date", "Fulfillment Date", "Order Status", "Payment Status"],
    "Transaction Records": ["Order ID", "Transaction Date", "Payment Method", "Gross Amount", "Platform Fee", "Net To Coop", "Platform Earnings", "Memo"],
    "Egg Stock": ["Batch ID", "Farmer Name", "Product ID", "Egg Quantity", "Date Collected", "Expiry Date", "Size", "Sold", "Created"],
    "Egg Production": ["Egg Production ID", "Farmer Name", "Flock ID", "Production Date", "Size", "Total Eggs", "Sellable Eggs", "Reject Eggs", "Notes", "Created"],
  };

  // Source data by tab
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
        return [];
      case "Egg Stock":
        return batchLoading
          ? [{ batchID: "Loading…", farmerName: "", productID: "", eggQuantity: "", dateCollected: "", expiryDate: "", size: "", sold: "", created: "" }]
          : batchRows;
      case "Egg Production":
        return eggLoading
          ? [{ productionID: "Loading…", farmerName: "", flockID: "", productionDate: "", size: "", totalEggs: "", sellableEggs: "", rejectEggs: "", notes: "", created: "" }]
          : eggRows;
      default:
        return [];
    }
  }, [selectedOption, payoutRows, salesRows, batchRows, eggRows, payoutLoading, salesLoading, batchLoading, eggLoading]);

  // Is current tab loading?
  const isLoading =
    (selectedOption === "Payout History" && payoutLoading) ||
    (selectedOption === "Sales Records" && salesLoading) ||
    (selectedOption === "Egg Stock" && batchLoading) ||
    (selectedOption === "Egg Production" && eggLoading);

  // Paginated data (10 per page, except while loading)
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((sourceData?.length || 0) / PAGE_SIZE));
  }, [sourceData]);

  // If page exceeds total after data changes, clamp to last page
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageStart = (page - 1) * PAGE_SIZE;
  const visibleData = isLoading ? sourceData : (sourceData || []).slice(pageStart, pageStart + PAGE_SIZE);

  // Select headers for current tab
  const headers = headerMap[selectedOption] || [];

  return (
    <div className="[&_thead_th]:text-base [&_thead_th]:py-1 [&_thead_tr]:h-9 [&_thead_th]:font-bold">
      <Table headers={headers}>
        {visibleData.map((item, index) => (
          <tr key={index} className="bg-[#faf4df] text-gray-700 rounded-lg shadow-sm">
            {/* Payout History (Approved only) */}
            {selectedOption === "Payout History" && (
              <>
                <td className="px-4 py-3 text-center font-medium ">{item.payoutID}</td>
                <td className="px-4 py-3 text-center">{item.sellerName}</td>
                <td className="px-4 py-3 text-center">₱{item.amount?.toLocaleString?.() ?? item.amount}</td>
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
                <td className="px-4 py-3 text-center">₱{item.pricePerTray}</td>
                <td className="px-4 py-3 text-center">₱{item.totalAmount}</td>
                <td className="px-4 py-3 text-center">{item.orderDate}</td>
                <td className="px-4 py-3 text-center">{item.fulfillmentDate}</td>
                <td className={`px-4 py-3 text-center font-medium ${item.orderStatus === "Delivered" ? "text-green-600" : item.orderStatus === "Pending" ? "text-yellow-500" : "text-red-500"}`}>{item.orderStatus}</td>
                <td className={`px-4 py-3 text-center font-medium ${item.paymentStatus === "Paid" ? "text-green-600" : "text-yellow-500"}`}>{item.paymentStatus}</td>
              </>
            )}

            {/* Transaction Records */}
            {selectedOption === "Transaction Records" && (
              <>
                <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
                <td className="px-4 py-3 text-center">{item.transactionDate}</td>
                <td className="px-4 py-3 text-center">{item.paymentMethod}</td>
                <td className="px-4 py-3 text-center">₱{item.grossAmount?.toLocaleString?.() ?? item.grossAmount}</td>
                <td className="px-4 py-3 text-center">₱{item.platformFee?.toLocaleString?.() ?? item.platformFee}</td>
                <td className="px-4 py-3 text-center">₱{item.netToCoop?.toLocaleString?.() ?? item.netToCoop}</td>
                <td className="px-4 py-3 text-center">₱{item.platformEarnings?.toLocaleString?.() ?? item.platformEarnings}</td>
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

            {/* Numbered pages (compact) */}
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
