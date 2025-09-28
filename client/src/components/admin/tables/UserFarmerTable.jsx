// src/components/admin/tables/UserFarmerTable.jsx
import React, { useEffect, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import Table from "../../Table";
import { Link } from "react-router-dom";
import { fetchFarmersForAdmin } from "@/services/FarmerRequests";

export default function UserFarmerTable({ role, option, type, refreshTick }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // tweak the query based on UI filter "type"
        let query = { status: "approved", onlyActive: true };
        if (type === "Inactive") query = { status: "approved", onlyActive: false };
        if (type === "Deactivated") query = { status: "suspended", onlyActive: false };

        const data = await fetchFarmersForAdmin(query);
        if (!mounted) return;
        setRows(data);
        setSelected(Array((data || []).length).fill(false));
        setSelectAll(false);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load farmers.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    // 👇 refetch whenever filters or refresh token changes
  }, [role, option, type, refreshTick]);

  // Optional: filter by UI "type" (Active/Inactive/Deactivated)
  const filtered = rows.filter((r) => {
    // Map your UI filter to row fields
    if (!type || type === "All") return true;
    if (type === "Active") return r.status === "approved" && !r.ended_at;
    if (type === "Inactive" || type === "Deactivated") return !!r.ended_at; // tweak if you distinguish
    return true;
  });

  const headers = [
    <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(filtered.length).fill(isChecked));
      }}
    />,
    "Full Name",
    "Email",
    "Status",
    "Actions",
  ];

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);
    setSelectAll(updated.every(Boolean));
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!filtered.length) return <div className="p-6 text-gray-500">No farmers found.</div>;

  return (
    <Table headers={headers}>
      {filtered.map((item, index) => (
        <tr key={item.id ?? index} className="bg-yellow-100 text-gray-700">
          <td className="px-4 py-3 text-center">
            <input
              type="checkbox"
              checked={selected[index] || false}
              onChange={() => handleCheckboxChange(index)}
              className="accent-primaryYellow focus:ring-2 focus:ring-black"
            />
          </td>
          <td className="px-4 py-3 text-center font-medium">{item.name}</td>
          <td className="px-4 py-3 text-center">{item.email}</td>
          <td
            className={`px-4 py-3 text-center font-medium ${
              item.status === "approved" && !item.ended_at ? "text-green-600" : "text-red-500"
            }`}
          >
            {item.status === "approved" && !item.ended_at ? "Active" : "Inactive"}
          </td>
          <td className="px-4 py-3 text-center flex flex-row gap-3 justify-center items-center">
            <Link
              to={`/${role}/users/view-users`}
              state={{ user: { email: item.email, name: item.name, id: item.farmer_id } }}
              className="flex items-center gap-2 bg-primaryYellow text-black px-4 py-2 rounded-lg hover:opacity-90 cursor-pointer"
            >
              <FaRegEye />
              <span>View</span>
            </Link>

            <Link
              to={`/${role}/users/edit-users`}
              state={{ user: { email: item.email, name: item.name, id: item.farmer_id } }}
              className="flex items-center gap-2 bg-yellow-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-yellow-200 cursor-pointer"
            >
              <FiEdit />
              <span>Edit</span>
            </Link>
          </td>
        </tr>
      ))}
    </Table>
  );
}
