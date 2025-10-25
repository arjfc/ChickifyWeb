// components/admin/tables/ReportTable.jsx
import React, { useEffect, useState } from "react";
import Table from "../../Table";
import { fetchEggProduction, fetchEggBatch } from "@/services/Reports";

export default function ReportTable({ selectedOption }) {
  // 🔹 Local state for Egg Production
  const [eggRows, setEggRows] = useState([]);
  const [eggLoading, setEggLoading] = useState(false);

  // 🔹 Local state for Egg Stock
  const [batchRows, setBatchRows] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

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

  // Fetch egg production when that tab is active
  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Egg Production") return;
    (async () => {
      try {
        setEggLoading(true);
        const data = await fetchEggProduction({}); // no filters
        if (!alive) return;
        const mapped = (data || []).map((r) => ({
          productionID: r.egg_prod,                         // keep your column name
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
    return () => { alive = false; };
  }, [selectedOption]);

  // Fetch egg batches when Egg Stock tab is active
  useEffect(() => {
    let alive = true;
    if (selectedOption !== "Egg Stock") return;
    (async () => {
      try {
        setBatchLoading(true);
        const data = await fetchEggBatch({}); // no filters
        if (!alive) return;
        const mapped = (data || []).map((r) => ({
          batchID: r.batch_id,                               // keep your column name
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
    return () => { alive = false; };
  }, [selectedOption]);

  // 🔹 Mock data for other report types (unchanged)
  const payoutData = [
    { payoutID: "PYT-3021", sellerName: "Maria Lopez", amount: 5000, requestDate: "10/10/25", processDate: "11/1/25", status: "Pending" },
    { payoutID: "PYT-3022", sellerName: "Juan Dela Cruz", amount: 3500, requestDate: "10/11/25", processDate: "11/2/25", status: "Approved" },
  ];

  const salesData = [
    { orderID: "ORD-5012", buyerName: "Ana Reyes", productName: "Fresh Eggs", variant: "Medium", quantity: 10, pricePerTray: 150, totalAmount: 1500, orderDate: "10/05/25", fulfillmentDate: "10/06/25", orderStatus: "Delivered", paymentStatus: "Completed" },
    { orderID: "ORD-5013", buyerName: "Carlo Santos", productName: "Brown Eggs", variant: "Large", quantity: 5, pricePerTray: 180, totalAmount: 900, orderDate: "10/08/25", fulfillmentDate: "10/09/25", orderStatus: "Pending", paymentStatus: "Pending" },
  ];

  // 🔹 Headers map (unchanged)
  const headerMap = {
    "Payout History": ["Payout ID", "Seller Name", "Amount", "Request Date", "Processed Date", "Status"],
    "Sales Records": ["Order ID", "Buyer Name", "Product Name", "Size", "Quantity Sold", "Price per tray", "Total Amount", "Order Date", "Fulfillment Date", "Order Status", "Payment Status"],
    "Transaction Records": ["Order ID", "Transaction Date", "Payment Method", "Gross Amount", "Platform Fee", "Net To Coop", "Platform Earnings", "Memo"],
    "Egg Stock": ["Batch ID", "Farmer Name", "Product ID", "Egg Quantity", "Date Collected", "Expiry Date", "Size", "Sold", "Created"],
    "Egg Production": ["Egg Production ID", "Farmer Name", "Flock ID", "Production Date", "Size", "Total Eggs", "Sellable Eggs", "Reject Eggs", "Notes", "Created"],
  };

  // 🔹 Select headers & data based on selected option (UI unchanged)
  let headers = [];
  let data = [];

  switch (selectedOption) {
    case "Payout History":
      headers = headerMap["Payout History"];
      data = payoutData;
      break;
    case "Sales Records":
      headers = headerMap["Sales Records"];
      data = salesData;
      break;
    case "Transaction Records":
      headers = headerMap["Transaction Records"];
      data = []; // unchanged placeholder
      break;
    case "Egg Stock":
      headers = headerMap["Egg Stock"];
      data = batchLoading
        ? [{ batchID: "Loading…", farmerName: "", productID: "", eggQuantity: "", dateCollected: "", expiryDate: "", size: "", sold: "", created: "" }]
        : batchRows;
      break;
    case "Egg Production":
      headers = headerMap["Egg Production"];
      data = eggLoading
        ? [{ productionID: "Loading…", farmerName: "", flockID: "", productionDate: "", size: "", totalEggs: "", sellableEggs: "", rejectEggs: "", notes: "", created: "" }]
        : eggRows;
      break;
    default:
      headers = [];
      data = [];
  }

  return (
    <div className="[&_thead_th]:text-base [&_thead_th]:py-1 [&_thead_tr]:h-9 [&_thead_th]:font-bold">
      <Table headers={headers}>
        {data.map((item, index) => (
          <tr key={index} className="bg-[#faf4df] text-gray-700 rounded-lg shadow-sm">
            {/* Payout History */}
            {selectedOption === "Payout History" && (
              <>
                <td className="px-4 py-3 text-center font-medium ">{item.payoutID}</td>
                <td className="px-4 py-3 text-center">{item.sellerName}</td>
                <td className="px-4 py-3 text-center">₱{item.amount.toLocaleString()}</td>
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

            {/* Egg Stock (now powered by RPC) */}
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

            {/* Egg Production (powered by RPC) */}
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
