import React, { useState } from "react";
import Table from "../../Table";

export default function ReportTable({ selectedOption }) {
  const reportData = [
    {
      reportID: "PYT-3021",
      sellerName: "Maria Lopez",
      amount: 5000,
      requestDate: "10/10/25",
      processDate: "11/1/25",
      status: `Pending`,
    },
    {
      reportID: "PYT-3021",
      sellerName: "Maria Lopez",
      amount: 5000,
      requestDate: "10/10/25",
      processDate: "11/1/25",
      status: `Pending`,
    },
    {
      reportID: "SLS-3021",
      sellerName: "Maria Lopez",
      amount: 5000,
      requestDate: "10/10/25",
      processDate: "11/1/25",
      status: `Pending`,
    },
    {
      reportID: "TRR-3021",
      sellerName: "Maria Lopez",
      amount: 5000,
      requestDate: "10/10/25",
      processDate: "11/1/25",
      status: `Pending`,
    },
  ];

  const typeMap = {
    "Payout History": "PYT",
    "Seller Sales": "SLS",
    "Transaction Records": "TRR",
  };

  const filteredData =
    selectedOption && selectedOption !== "All"
      ? reportData.filter((c) =>
          c.reportID.startsWith(typeMap[selectedOption] || "")
        )
      : reportData;

  const headers = [
    "Payout ID",
    "Seller Name",
    "Amount",
    "Request Date",
    "Processed Date",
    "Status",
  ];

  return (
    <Table headers={headers}>
      {filteredData.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm transition"
        >
          <td className="px-4 py-3 text-center font-medium">{item.reportID}</td>
          <td className="px-4 py-3 text-center">{item.sellerName}</td>
          <td className="px-4 py-3 text-center">
            ₱{item.amount.toLocaleString()}
          </td>
          <td className="px-4 py-3 text-center">{item.requestDate}</td>
          <td className="px-4 py-3 text-center">{item.processDate}</td>
          <td
            className={`px-4 py-3 text-center font-medium
                ${item.status === "Approved" ? "text-green-600" : ""}
                ${item.status === "Pending" ? "text-yellow-500" : ""}
                ${item.status === "Rejected" ? "text-red-500" : ""}
                ${item.status === "Processing" ? "text-yellow-500" : ""}`}
          >
            {item.status}
          </td>
        </tr>
      ))}
    </Table>
  );
}
