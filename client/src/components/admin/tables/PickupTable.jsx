import React, { useState } from "react";
import Table from "../../Table";

export default function PickupTable() {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const discounts = [
    {
      farmer: "Justin Beiber",
      datePickup: "10/10/25",
      status: "Confirmation",
    },
    {
      farmer: "Justin Beiber",
      datePickup: "10/10/25",
      status: "Rejected",
    },
    {
      farmer: "Justin Beiber",
      datePickup: "10/10/25",
      status: "Confirmation",
    },
    {
      farmer: "Justin Beiber",
      datePickup: "10/10/25",
      status: "Complete",
    },
  ];

    const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);

    setSelectAll(updated.every(Boolean));
  };


  const headers = [
    "Farmer",
    "Date",
    "Status",
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
          <td className="px-4 py-3 text-center font-medium">{item.farmer}</td>
          <td className="px-4 py-3 text-center">{item.datePickup}</td>
          <td
            className={`px-4 py-3 text-center font-medium
              ${item.status === "Complete" ? "text-green-600" : ""}
              ${item.status === "Confirmation" ? "text-yellow-500" : ""}
              ${item.status === "Rejected" ? "text-red-500" : ""}`}
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
