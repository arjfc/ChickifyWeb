import React, { useState } from "react";
import Table from "../../Table";
export default function FeedMonitoringTable() {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const discounts = [
    {
      admin: "Maria Lopez",
      farmer: "Justin Beiber",
      feedType: "seeds",
      qty: 10,
      allocationDate: "10/10/25",
    },
    {
      admin: "Maria Lopez",
      farmer: "Justin Beiber",
      feedType: "seeds",
      qty: 10,
      allocationDate: "10/10/25",
    },
    {
      admin: "Maria Lopez",
      farmer: "Justin Beiber",
      feedType: "seeds",
      qty: 10,
      allocationDate: "10/10/25",
    },
    {
      admin: "Maria Lopez",
      farmer: "Justin Beiber",
      feedType: "seeds",
      qty: 10,
      allocationDate: "10/10/25",
    },
  ];

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);

    setSelectAll(updated.every(Boolean));
  };

  const headers = [
    "Admin",
    "Farmer",
    "Feed Type",
    "Quantity (Kg).",
    "Allocation Data",
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

  return (
    <Table headers={headers}>
      {discounts.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm transition"
        >
          <td className="px-4 py-3 text-center font-medium capitalize">{item.admin}</td>
          <td className="px-4 py-3 text-center font-medium capitalize">{item.farmer}</td>
          <td className="px-4 py-3 text-center font-medium capitalize">{item.feedType}</td>
          <td className="px-4 py-3 text-center font-medium capitalize">{item.qty}</td>
          <td className="px-4 py-3 text-center capitalize">{item.allocationDate}</td>
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
