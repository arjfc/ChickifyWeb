// components/admin/tables/ExpenseTable.jsx
import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import Table from "../../Table";
import { listAdminExpenses, listFarmersExpenses } from "@/services/Expenses";

export default function ExpenseTable({
  scope = "admin",              // "admin" | "farmers"
  onSelectionChange = () => {},
  onEdit = () => {},
  from,
  to,
  expCategId,
  refreshKey = 0,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const fetcher =
          scope === "farmers" ? listFarmersExpenses : listAdminExpenses;

        const data = await fetcher({
          from,
          to,
          exp_categ_id: expCategId,
          limit: 200,
          offset: 0,
        });

        const normalized = (data || []).map((r) => ({
          id: r.expenses_id,
          date: r.expense_date,
          owner: r.owner_name || (scope === "admin" ? "Me" : "—"),
          category: r.exp_categ_name,
          amount: r.amount,
          exp_categ_id: r.exp_categ_id,
          user_id: r.user_id,
        }));

        if (alive) {
          setRows(normalized);
          setSelected(Array(normalized.length).fill(false));
          setSelectAll(false);
        }
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load expenses");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [scope, from, to, expCategId, refreshKey]);

  useEffect(() => {
    onSelectionChange(selected.filter(Boolean).length);
  }, [selected, onSelectionChange]);

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);
    setSelectAll(updated.length > 0 && updated.every(Boolean));
  };

  const toggleSelectAll = (isChecked) => {
    setSelectAll(isChecked);
    setSelected(Array(rows.length).fill(isChecked));
  };

  const headers = [
    "Date",
    scope === "admin" ? "Admin" : "Farmer",
    "Category",
    "Amount",
    <span key="actions" className="block text-center">
      Actions
    </span>,
    <div key="selectAll" className="flex justify-center">
      <input
        type="checkbox"
        checked={selectAll}
        className="w-4 h-4 accent-primaryYellow focus:ring-2 focus:ring-black"
        onChange={(e) => toggleSelectAll(e.target.checked)}
      />
    </div>,
  ];

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 text-center text-gray-600">
        Loading expenses…
      </div>
    );
  }
  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {err}
      </div>
    );
  }

  return (
    <Table headers={headers}>
      {rows.length === 0 ? (
        <tr>
          <td className="px-4 py-6 text-center text-gray-500" colSpan={headers.length}>
            No expenses found.
          </td>
        </tr>
      ) : (
        rows.map((item, index) => (
          <tr
            key={item.id}
            style={{ backgroundColor: "#fffcc4" }}
            className="hover:bg-yellow-100 text-gray-700 transition"
          >
            <td className="px-4 py-3 text-center">{item.date}</td>
            <td className="px-4 py-3 text-center capitalize">{item.owner}</td>
            <td className="px-4 py-3 text-center capitalize">{item.category}</td>
            <td className="px-4 py-3 text-center">{item.amount}</td>

            <td className="px-4 py-3 text-center">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md 
                           bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 
                           hover:bg-yellow-200"
                onClick={() =>
                  onEdit({
                    id: item.id,
                    amount: item.amount,
                    exp_categ_id: item.exp_categ_id,
                    category: item.category,
                    date: item.date,
                    user_id: item.user_id,
                  })
                }
              >
                <FiEdit className="text-lg" />
                Edit
              </button>
            </td>

            <td className="px-4 py-3 text-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primaryYellow focus:ring-2 focus:ring-black"
                checked={selected[index] || false}
                onChange={() => handleCheckboxChange(index)}
              />
            </td>
          </tr>
        ))
      )}
    </Table>
  );
}