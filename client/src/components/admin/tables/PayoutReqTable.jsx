  import React, { useState } from "react";
  import Table from "../../Table";
  import { FaCircleInfo } from "react-icons/fa6";

  export default function PayoutReqTable({ selectedOption }) {
    const [selected, setSelected] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const payoutReqData = [
      {
        payoutID: "PYT-3021",
        requestor: "Maria Lopez",
        amount: 5000,
        requestDate: "10/10/25",
        status: `Pending`,
      },
      {
        payoutID: "PYT-3021",
        requestor: "Maria Lopez",
        amount: 5000,
        requestDate: "10/10/25",
        status: `Pending`,
      },
      {
        payoutID: "PYT-3021",
        requestor: "Maria Lopez",
        amount: 5000,
        requestDate: "10/10/25",
        status: `Processing`,
      },
      {
        payoutID: "PYT-3021",
        requestor: "Maria Lopez",
        amount: 5000,
        requestDate: "10/10/25",
        status: `Approved`,
      },
      {
        payoutID: "PYT-3021",
        requestor: "Maria Lopez",
        amount: 5000,
        requestDate: "10/10/25",
        status: `Rejected`,
      },
      {
        payoutID: "PYT-3021",
        requestor: "Maria Lopez",
        amount: 5000,
        requestDate: "10/10/25",
        status: `Rejected`,
      },
    ];

    const filteredData =
      selectedOption && selectedOption !== "All"
        ? payoutReqData.filter(
            (c) => c.status.toLowerCase() === selectedOption.toLowerCase()
          )
        : payoutReqData;

    const headers = [
      "Payout ID",
      "Requestor (Farmer)",
      "Amount",
      "Request Date",
      "Status",
      <input
        key="selectAll"
        type="checkbox"
        checked={selectAll}
        className="accent-primaryYellow focus:ring-2 focus:ring-black"
        onChange={(e) => {
          const isChecked = e.target.checked;
          setSelectAll(isChecked);
          setSelected(Array(filteredData.length).fill(isChecked));
        }}
      />,
    ];

    const handleCheckboxChange = (index) => {
      const updated = [...selected];
      updated[index] = !updated[index];
      setSelected(updated);

      setSelectAll(updated.every(Boolean));
    };
    
    return (
      <Table headers={headers}>
        {filteredData.map((item, index) => (
          <tr
            key={index}
            className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm  transition"
          >
            <td className="px-4 py-3 text-center font-medium">{item.payoutID}</td>
            <td className="px-4 py-3 text-center">{item.requestor}</td>
            <td className="px-4 py-3 text-center">₱{item.amount.toLocaleString()}</td>
            <td className="px-4 py-3 text-center">{item.requestDate}</td>
            <td
              className={`px-4 py-3 text-center font-medium
                  ${item.status === "Approved" ? "text-green-600" : ""}
                  ${item.status === "Pending" ? "text-yellow-500" : ""}
                  ${item.status === "Rejected" ? "text-red-500" : ""}
                  ${item.status === "Processing" ? "text-yellow-500" : ""}`}
            >
              {item.status}
            </td>
            <td className="px-4 py-3 text-center">
              <input
                type="checkbox"
                className="accent-primaryYellow focus:ring-2 focus:ring-black"
                checked={selected[index] || false}
                onChange={() => handleCheckboxChange(index)}
              />
            </td>
          </tr>
        ))}
      </Table>
    );
  }
