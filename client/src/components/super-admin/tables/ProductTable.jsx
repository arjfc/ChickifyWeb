import React, { useState } from "react";
import Table from "../../Table";

export default function ProductTable({option}) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const products = [
    {
      type: "Egg",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
    {
      type: "Egg",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
    {
      type: "Egg",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
    {
      type: "Chicken",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
    {
      type: "Itlog",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
    {
      type: "Itlog",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
  ];

  const headers = [
    "Type",
    "Size",
    "Description",
    "Price(₱)",
    "Stock Quantity",
    "Status",
    <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(products.length).fill(isChecked));
      }}
    />,
  ];

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);

    setSelectAll(updated.every(Boolean));
  };

    const filteredData =
    option && option !== "All"
      ? products.filter(
          (c) => c.type.toLowerCase() === option.toLowerCase()
        )
      : products;


  return (
    <Table headers={headers}>
      {filteredData.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm transition"
        >
         
          <td className="px-4 py-3 text-center font-medium">{item.type}</td>
          <td className="px-4 py-3 text-center">{item.size}</td>
          <td className="px-4 py-3 text-center">{item.description}</td>
          <td className="px-4 py-3 text-center">{item.price}</td>
          <td className="px-4 py-3 text-center">{item.stock}</td>
          <td
            className={`px-4 py-3 text-center font-medium ${
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
