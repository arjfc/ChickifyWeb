import React, { useState } from "react";
import Table from "../../Table";

export default function DiscountTable() {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const discounts = [
    {
      code: "EGGFEST",
      discount: "₱50 OFF",
      method: "Fixed Amount",
      minQty: "5 trays",
      minOrderTotal: "₱1,000",
      maxUse: "10",
      validUntil: "04/24/2025",
    },
    {
      code: "EGGFEST",
      discount: "₱50 OFF",
      method: "Fixed Amount",
      minQty: "5 trays",
      minOrderTotal: "₱1,000",
      maxUse: "10",
      validUntil: "04/24/2025",
    },
    {
      code: "EGGFEST",
      discount: "₱50 OFF",
      method: "Fixed Amount",
      minQty: "5 trays",
      minOrderTotal: "₱1,000",
      maxUse: "10",
      validUntil: "04/24/2025",
    },
    {
      code: "EGGFEST",
      discount: "₱50 OFF",
      method: "Fixed Amount",
      minQty: "5 trays",
      minOrderTotal: "₱1,000",
      maxUse: "10",
      validUntil: "04/24/2025",
    },
  ];

  const headers = [
    "Code",
    "Discount",
    "Method",
    "Min. Quantity",
    "Min. Order Total",
    "Max Uses",
    "Valid Until",
    <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(discounts.length).fill(isChecked));
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
      {discounts.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm transition"
        >
          <td className="px-4 py-3 text-center font-medium">{item.code}</td>
          <td className="px-4 py-3 text-center">{item.discount}</td>
          <td className="px-4 py-3 text-center">{item.method}</td>
          <td className="px-4 py-3 text-center">{item.minQty}</td>
          <td className="px-4 py-3 text-center">{item.minOrderTotal}</td>
          <td className="px-4 py-3 text-center">{item.maxUse}</td>
          <td className="px-4 py-3 text-center">{item.validUntil}</td>
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
