import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import Table from "../../Table";

export default function ExpenseTable({ onSelectionChange = () => {}, onEdit = () => {} }) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const source = [
    { admin: "Maria Lopez", farmer: "Justin Beiber", feedType: "Categ", qty: 10, allocationDate: "10/10/25" },
    { admin: "Maria Lopez", farmer: "Justin Beiber", feedType: "Categ", qty: 10, allocationDate: "10/10/25" },
    { admin: "Maria Lopez", farmer: "Justin Beiber", feedType: "Categ", qty: 10, allocationDate: "10/10/25" },
    { admin: "Maria Lopez", farmer: "Justin Beiber", feedType: "Categ", qty: 10, allocationDate: "10/10/25" },
  ];

  const expenses = source.map((r, i) => ({
    id: i + 1, // temporary unique id
    date: r.allocationDate,
    admin: r.admin,
    category: r.feedType,
    amount: r.qty,
  }));

  // Keep parent informed about selection count
  useEffect(() => {
    const count = selected.filter(Boolean).length;
    onSelectionChange(count);
  }, [selected, onSelectionChange]);

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);
    setSelectAll(updated.every(Boolean));
  };

  const toggleSelectAll = (isChecked) => {
    setSelectAll(isChecked);
    setSelected(Array(expenses.length).fill(isChecked));
  };

  const headers = [
    "Date",
    "Admin",
    "Category",
    "Amount",
    <span key="actions" className="block text-center">Actions</span>,
    <div key="selectAll" className="flex justify-center">
      <input
        type="checkbox"
        checked={selectAll}
        className="w-4 h-4 accent-primaryYellow focus:ring-2 focus:ring-black"
        onChange={(e) => toggleSelectAll(e.target.checked)}
      />
    </div>,
  ];

  return (
    <Table headers={headers}>
      {expenses.map((item, index) => (
        <tr
          key={item.id}
          style={{ backgroundColor: "#fffcc4" }} // ✅ custom background color
          className="hover:bg-yellow-100 text-gray-700 transition"
        >
          <td className="px-4 py-3 text-center">{item.date}</td>
          <td className="px-4 py-3 text-center capitalize">{item.admin}</td>
          <td className="px-4 py-3 text-center capitalize">{item.category}</td>
          <td className="px-4 py-3 text-center">{item.amount}</td>

          {/* Actions column with Edit button */}
          <td className="px-4 py-3 text-center">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md 
                         bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 
                         hover:bg-yellow-200"
              onClick={() => onEdit(item)}  
            >
              <FiEdit className="text-lg" />
              Edit
            </button>
          </td>

          {/* Row checkbox */}
          <td className="px-4 py-3 text-center">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primaryYellow focus:ring-2 focus:ring-black"
              checked={selected[index] || false}
              onChange={() => handleCheckboxChange(index)}
            />
          </td>
        </tr>
      ))}
    </Table>
  );
}
