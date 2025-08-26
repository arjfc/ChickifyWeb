import React, { useState } from "react";
import Table from "../../Table";

export default function AdminVerTable({option}) {
   const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const adminVer = [
    {
      product: "Tray of Eggs",
      size: "medium",
      seller: "Maria Lopez",
      price: "100",
      date: "10/02/2025",
      status: "pending",
    },
    {
      product: "Tray of Eggz",
      size: "medium",
      seller: "Maria Lopez",
      price: "100",
      date: "10/02/2025",
      status: "pending",
    },
    {
      product: "Tray of Egg",
      size: "medium",
      seller: "Maria Lopez",
      price: "100",
      date: "10/02/2025",
      status: "pending",
    },
    {
      product: "Tray of Egg",
      size: "medium",
      seller: "Maria Lopez",
      price: "100",
      date: "10/02/2025",
      status: "approved",
    },
  ];

  const headers = [
    "Product",
    "Size",
    "Seller",
    "Unit Price (₱)",
    "Date Submitted",
    "Status",
     <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(adminVer.length).fill(isChecked));
      }}
    />,
  ];

  const filteredData =
    option && option !== "All"
      ? adminVer.filter(
          (c) => c.status.toLowerCase() === option.toLowerCase()
        )
      : adminVer;


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

          <td className="px-4 py-3 text-center font-medium">{item.product}</td>
          <td className="px-4 py-3 text-center">{item.size}</td>
          <td className="px-4 py-3 text-center">{item.seller}</td>
          <td className="px-4 py-3 text-center">{item.price}</td>
          <td className="px-4 py-3 text-center">{item.date}</td>
          <td
            className={`px-4 py-3 text-center font-medium capitalize ${
              item.status === "Active" ? "text-green-600" : "text-red-500"
            }`}
          >
            {item.status}
          </td>   
          <td className="px-4 py-3 text-center">
            <input
              type="checkbox"
              checked={selected[index] || false}
              className="accent-primaryYellow focus:ring-2 focus:ring-black"
              onChange={() => handleCheckboxChange(index)}
            />
          </td>
        </tr>
      ))}
    </Table>
  );
}
