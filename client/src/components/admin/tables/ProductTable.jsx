import React, { useState } from "react";
import Table from "../../Table";

export default function ProductTable({type}) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const products = [
    {
      category: "Egg",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
    {
      category: "Egg",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
    {
      category: "Egg",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Listed",
    },
    {
      category: "Size",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Unlisted",
    },
    {
      category: "Itlog",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Unlisted",
    },
    {
      category: "Egg",
      size: "Medium",
      description: "Farm-fresh native eggs, perfect for daily consumption",
      price: "100",
      stock: "600",
      status: "Unlisted",
    },
  ];


    const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);

    setSelectAll(updated.every(Boolean));
  };


  const filteredData = products.filter((log) => {

    const typeMatch =
      !type || type === "All"
        ? true
        : log.category.toLowerCase() === type.toLowerCase();

    return  typeMatch;
  });

  const headers = [
    "Category",
    "Size",
    "Description",
    "Price(₱)",
    "Stock Quantity",
    "Status",
    <input
      key="selectAll"
      type="checkbox"
          className="accent-primaryYellow focus:ring-2 focus:ring-black"
      checked={selectAll}
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(filteredData.length).fill(isChecked));
      }}
    />,
  ];



  return (
    <Table headers={headers}>
      {filteredData.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm transition"
        >
         
          <td className="px-4 py-3 text-center font-medium">{item.category}</td>
          <td className="px-4 py-3 text-center">{item.size}</td>
          <td className="px-4 py-3 text-center">{item.description}</td>
          <td className="px-4 py-3 text-center">{item.price}</td>
          <td className="px-4 py-3 text-center">{item.stock}</td>
          <td
            className={`px-4 py-3 text-center font-medium ${
              item.status === "Listed" ? "text-green-600" : "text-red-500"
            }`}
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
