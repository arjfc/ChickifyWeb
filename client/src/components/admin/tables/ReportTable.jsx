import React from "react";
import Table from "../../Table";

export default function ReportTable({ selectedOption }) {
  // 🔹 Mock data for each report type
  const payoutData = [
    { payoutID: "PYT-3021", sellerName: "Maria Lopez", amount: 5000, requestDate: "10/10/25", processDate: "11/1/25", status: "Pending" },
    { payoutID: "PYT-3022", sellerName: "Juan Dela Cruz", amount: 3500, requestDate: "10/11/25", processDate: "11/2/25", status: "Approved" },
  ];

  const salesData = [
    { orderID: "ORD-5012", buyerName: "Ana Reyes", productName: "Fresh Eggs", variant: "Medium", quantity: 10, pricePerTray: 150, totalAmount: 1500, orderDate: "10/05/25", fulfillmentDate: "10/06/25", orderStatus: "Delivered", paymentStatus: "Paid" },
    { orderID: "ORD-5013", buyerName: "Carlo Santos", productName: "Brown Eggs", variant: "Large", quantity: 5, pricePerTray: 180, totalAmount: 900, orderDate: "10/08/25", fulfillmentDate: "10/09/25", orderStatus: "Pending", paymentStatus: "Unpaid" },
  ];

  const transactionData = [
    { orderID: "ORD-7001", transactionDate: "10/01/25", paymentMethod: "GCash", grossAmount: 2000, platformFee: 100, netToCoop: 1900, platformEarnings: 100, memo: "Weekly payout" },
    { orderID: "ORD-7002", transactionDate: "10/02/25", paymentMethod: "Bank Transfer", grossAmount: 3500, platformFee: 150, netToCoop: 3350, platformEarnings: 150, memo: "Commission fee" },
  ];

  const eggStockData = [
    { batchID: "BCH-101", farmerName: "Maria Lopez", productID: "PRD-200", eggQuantity: 500, dateCollected: "10/10/25", expiryDate: "10/20/25", size: "Medium", sold: 300, created: "10/10/25" },
    { batchID: "BCH-102", farmerName: "Juan Dela Cruz", productID: "PRD-201", eggQuantity: 400, dateCollected: "10/11/25", expiryDate: "10/21/25", size: "Large", sold: 250, created: "10/11/25" },
  ];

  const eggProductionData = [
    { productionID: "EP-001", farmerName: "Maria Lopez", flockID: "FLK-10", productionDate: "10/05/25", size: "Medium", totalEggs: 600, sellableEggs: 580, rejectEggs: 20, notes: "Good yield", created: "10/05/25" },
    { productionID: "EP-002", farmerName: "Juan Dela Cruz", flockID: "FLK-11", productionDate: "10/06/25", size: "Large", totalEggs: 500, sellableEggs: 490, rejectEggs: 10, notes: "Normal", created: "10/06/25" },
  ];

  // 🔹 Header definitions for each type
  const headerMap = {
    "Payout History": ["Payout ID", "Seller Name", "Amount", "Request Date", "Processed Date", "Status"],
    "Sales Records": ["Order ID", "Buyer Name", "Product Name", "Size", "Quantity Sold", "Price per tray", "Total Amount", "Order Date", "Fulfillment Date", "Order Status", "Payment Status"],
    "Transaction Records": ["Order ID", "Transaction Date", "Payment Method", "Gross Amount", "Platform Fee", "Net To Coop", "Platform Earnings", "Memo"],
    "Egg Stock": ["Batch ID", "Farmer Name", "Product ID", "Egg Quantity", "Date Collected", "Expiry Date", "Size", "Sold", "Created"],
    "Egg Production": ["Egg Production ID", "Farmer Name", "Flock ID", "Production Date", "Size", "Total Eggs", "Sellable Eggs", "Reject Eggs", "Notes", "Created"],
  };

  // 🔹 Select data & headers depending on selected option
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
      data = transactionData;
      break;
    case "Egg Stock":
      headers = headerMap["Egg Stock"];
      data = eggStockData;
      break;
    case "Egg Production":
      headers = headerMap["Egg Production"];
      data = eggProductionData;
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
                <td className="px-4 py-3 text-center">₱{item.grossAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">₱{item.platformFee.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">₱{item.netToCoop.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">₱{item.platformEarnings.toLocaleString()}</td>
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
