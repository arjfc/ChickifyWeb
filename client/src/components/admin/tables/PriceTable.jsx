import React, { useState } from "react";
import Table from "../../Table";

export default function PriceTable() {
const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const discounts = [
    {
      size: "Extra Small",
      weightRange: "35-43g",
      suggestedBasePrice: "₱2.50",
      finalPrice: "₱2.50"
    },
    {
      size: "Small",
      weightRange: "35-43g",
      suggestedBasePrice: "₱2.50",
      finalPrice: "₱2.50"
    },
    {
      size: "Large",
      weightRange: "35-43g",
      suggestedBasePrice: "₱2.50",
      finalPrice: "₱2.50"
    },
    {
      size: "Extra Large",
      weightRange: "35-43g",
      suggestedBasePrice: "₱2.50",
      finalPrice: "₱2.50"
    },
    {
      size: "Extra Small",
      weightRange: "35-43g",
      suggestedBasePrice: "₱2.50",
      finalPrice: "₱2.50"
    },

  ];

  const headers = [
    "Size",
    "Weight Range",
    "Suggested Base Price",
    "Final Price",
    // <input
    //   key="selectAll"
    //   type="checkbox"
    //   className="accent-primaryYellow focus:ring-2 focus:ring-black"
    //   checked={selectAll}
    //   onChange={(e) => {
    //     const isChecked = e.target.checked;
    //     setSelectAll(isChecked);
    //     setSelected(Array(discounts.length).fill(isChecked));
    //   }}
    // />,
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
         
          <td className="px-4 py-3 text-center font-medium">{item.size}</td>
          <td className="px-4 py-3 text-center">{item.weightRange}</td>
          <td className="px-4 py-3 text-center">{item.suggestedBasePrice}</td>
          <td className="px-4 py-3 text-center">{item.finalPrice}</td>
           {/* <td className="px-4 py-3 text-center">
            <input
              type="checkbox"
              className="accent-primaryYellow focus:ring-2 focus:ring-black"
              checked={selected[index] || false}
              onChange={() => handleCheckboxChange(index)}
            />
          </td> */}
        </tr>
      ))}
    </Table>
  );
}
