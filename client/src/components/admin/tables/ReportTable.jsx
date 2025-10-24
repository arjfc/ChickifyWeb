import React, { useEffect, useMemo, useState } from "react";
import Table from "../../Table";
import { fetchTransactionsByAdmin } from "@/services/TransactionLogs"; 

export default function ReportTable({
  selectedOption,
  reportDateRange = "all",
}) {
  // 🔹 Local state for RPC data
  const [txRows, setTxRows] = useState([]);        // raw rows from RPC
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // ===== Helpers =====
  const peso = (n) =>
    typeof n === "number"
      ? `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "₱0.00";

  // Supabase returns dates like "2025-10-02" (ISO date). Mock data might be "10/02/25".
  const parseDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    // try ISO first
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) return new Date(d + "T00:00:00");
    // fallback: mm/dd/yy
    const mdy = d.split("/");
    if (mdy.length === 3) {
      const [mm, dd, yy] = mdy.map((x) => parseInt(x, 10));
      const fullY = yy < 100 ? 2000 + yy : yy;
      return new Date(fullY, mm - 1, dd);
    }
    const t = new Date(d);
    return isNaN(t) ? null : t;
  };

  // Get date range (inclusive) based on the dropdown value
  const getRange = (key) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (key === "all") return { from: null, to: null };

    if (key === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
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

  // 🔹 Fetch RPC data when "Transaction Records" tab is active
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (selectedOption !== "Transaction Records") return;
      setLoading(true);
      setErr(null);
      try {
        const rows = await fetchTransactionsByAdmin(); // uses your client/usage function
        if (!cancelled) setTxRows(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load transactions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [selectedOption]);

  // 🔹 Mock data for other tabs (unchanged)
  const payoutData = [
    { payoutID: "PYT-3021", sellerName: "Maria Lopez", amount: 5000, requestDate: "10/10/25", processDate: "11/1/25", status: "Pending" },
    { payoutID: "PYT-3022", sellerName: "Juan Dela Cruz", amount: 3500, requestDate: "10/11/25", processDate: "11/2/25", status: "Approved" },
  ];

  const salesData = [
    { orderID: "ORD-5012", buyerName: "Ana Reyes", productName: "Fresh Eggs", variant: "Medium", quantity: 10, pricePerTray: 150, totalAmount: 1500, orderDate: "10/05/25", fulfillmentDate: "10/06/25", orderStatus: "Delivered", paymentStatus: "Paid" },
    { orderID: "ORD-5013", buyerName: "Carlo Santos", productName: "Brown Eggs", variant: "Large", quantity: 5, pricePerTray: 180, totalAmount: 900, orderDate: "10/08/25", fulfillmentDate: "10/09/25", orderStatus: "Pending", paymentStatus: "Unpaid" },
  ];

  const eggStockData = [
    { batchID: "BCH-101", farmerName: "Maria Lopez", productID: "PRD-200", eggQuantity: 500, dateCollected: "10/10/25", expiryDate: "10/20/25", size: "Medium", sold: 300, created: "10/10/25" },
    { batchID: "BCH-102", farmerName: "Juan Dela Cruz", productID: "PRD-201", eggQuantity: 400, dateCollected: "10/11/25", expiryDate: "10/21/25", size: "Large", sold: 250, created: "10/11/25" },
  ];

  const eggProductionData = [
    { productionID: "EP-001", farmerName: "Maria Lopez", flockID: "FLK-10", productionDate: "10/05/25", size: "Medium", totalEggs: 600, sellableEggs: 580, rejectEggs: 20, notes: "Good yield", created: "10/05/25" },
    { productionID: "EP-002", farmerName: "Juan Dela Cruz", flockID: "FLK-11", productionDate: "10/06/25", size: "Large", totalEggs: 500, sellableEggs: 490, rejectEggs: 10, notes: "Normal", created: "10/06/25" },
  ];

  // 🔹 Headers
  const headerMap = {
    "Payout History": ["Payout ID", "Seller Name", "Amount", "Request Date", "Processed Date", "Status"],
    "Sales Records": ["Order ID", "Buyer Name", "Product Name", "Size", "Quantity Sold", "Price per tray", "Total Amount", "Order Date", "Fulfillment Date", "Order Status", "Payment Status"],
    "Transaction Records": ["Order ID", "Transaction Date", "Payment Method", "Gross Amount", "Platform Fee", "Net To Coop", "Memo"],
    "Egg Stock": ["Batch ID", "Farmer Name", "Product ID", "Egg Quantity", "Date Collected", "Expiry Date", "Size", "Sold", "Created"],
    "Egg Production": ["Egg Production ID", "Farmer Name", "Flock ID", "Production Date", "Size", "Total Eggs", "Sellable Eggs", "Reject Eggs", "Notes", "Created"],
  };

  // 🔹 Select base data per tab (Transaction uses RPC)
  let headers = [];
  let baseData = [];

  switch (selectedOption) {
    case "Payout History":
      headers = headerMap["Payout History"];
      baseData = payoutData;
      break;
    case "Sales Records":
      headers = headerMap["Sales Records"];
      baseData = salesData;
      break;
    case "Transaction Records":
      headers = headerMap["Transaction Records"];
      // Map RPC rows → table row shape
      baseData = (txRows || []).map((r) => ({
        orderID: r.order_code ?? `ORD-${String(r.order_id).padStart(4, "0")}`,
        transactionDate: r.transaction_date, // keep raw string; we’ll parse for filter
        paymentMethod: r.payment_method || "",
        grossAmount: Number(r.gross_amount ?? 0),
        platformFee: Number(r.platform_fee ?? 0),
        netToCoop: Number(r.net_to_coop ?? 0),
        memo: r.memo ?? "",
      }));
      break;
    case "Egg Stock":
      headers = headerMap["Egg Stock"];
      baseData = eggStockData;
      break;
    case "Egg Production":
      headers = headerMap["Egg Production"];
      baseData = eggProductionData;
      break;
    default:
      headers = [];
      baseData = [];
  }

  // 🔹 UI-only date filtering (does NOT hit DB)
  const filteredData = useMemo(() => {
    const { from, to } = getRange(reportDateRange);
    if (!from && !to) return baseData;

    const within = (d) => {
      const dt = parseDate(d);
      if (!dt) return false;
      if (from && dt < from) return false;
      if (to && dt > to) return false;
      return true;
    };

    // pick the correct date field per tab
    const picker = {
      "Payout History": (row) => row.processDate || row.requestDate,
      "Sales Records": (row) => row.orderDate,
      "Transaction Records": (row) => row.transactionDate,
      "Egg Stock": (row) => row.created || row.dateCollected,
      "Egg Production": (row) => row.created || row.productionDate,
    }[selectedOption];

    return baseData.filter((row) => within(picker(row)));
  }, [baseData, reportDateRange, selectedOption]);

  // 🔹 Loading / error for Transaction tab
  if (selectedOption === "Transaction Records" && loading) {
    return <div className="text-gray-600 px-2 py-3">Loading transactions…</div>;
  }
  if (selectedOption === "Transaction Records" && err) {
    return <div className="text-red-600 px-2 py-3">Error: {String(err)}</div>;
  }

  return (
    <div className="[&_thead_th]:text-base [&_thead_th]:py-1 [&_thead_tr]:h-9 [&_thead_th]:font-bold">
      <Table headers={headers}>
        {filteredData.map((item, index) => (
          <tr key={index} className="bg-[#faf4df] text-gray-700 rounded-lg shadow-sm">
            {/* Payout History */}
            {selectedOption === "Payout History" && (
              <>
                <td className="px-4 py-3 text-center font-medium">{item.payoutID}</td>
                <td className="px-4 py-3 text-center">{item.sellerName}</td>
                <td className="px-4 py-3 text-center">{peso(item.amount)}</td>
                <td className="px-4 py-3 text-center">{item.requestDate}</td>
                <td className="px-4 py-3 text-center">{item.processDate}</td>
                <td className={`px-4 py-3 text-center font-medium ${item.status === "Approved" ? "text-green-600" : item.status === "Pending" ? "text-yellow-500" : "text-red-500"}`}>{item.status}</td>
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
                <td className={`px-4 py-3 text-center font-medium ${item.orderStatus === "Delivered" ? "text-green-600" : item.orderStatus === "Pending" ? "text-yellow-500" : "text-red-500"}`}>{item.orderStatus}</td>
                <td className={`px-4 py-3 text-center font-medium ${item.paymentStatus === "Paid" ? "text-green-600" : "text-yellow-500"}`}>{item.paymentStatus}</td>
              </>
            )}

            {/* Transaction Records (from RPC) */}
            {selectedOption === "Transaction Records" && (
              <>
                <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
                <td className="px-4 py-3 text-center">{item.transactionDate}</td>
                <td className="px-4 py-3 text-center">{item.paymentMethod}</td>
                <td className="px-4 py-3 text-center">{peso(item.grossAmount)}</td>
                <td className="px-4 py-3 text-center">{peso(item.platformFee)}</td>
                <td className="px-4 py-3 text-center">{peso(item.netToCoop)}</td>
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
    </div>
  );
}
