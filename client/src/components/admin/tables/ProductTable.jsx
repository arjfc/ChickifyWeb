import React from "react";

export default function ProductTable({ products = [], loading = false, onEdit }) {
  if (loading) return <div className="p-4">Loading…</div>;
  if (!products.length) return <div className="p-4 text-gray-500">No products yet.</div>;

  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          <th className="px-4 py-3">Image</th>
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Category</th>
          <th className="px-4 py-3">Size</th>
          <th className="px-4 py-3">Price/Tray</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.prod_id} className="border-b hover:bg-gray-50">
            <td className="px-4 py-3">
              {p.prod_img
                ? <img src={p.prod_img} alt={p.prod_name} className="h-12 w-12 object-cover rounded" />
                : <div className="h-12 w-12 bg-gray-200 rounded" />
              }
            </td>
            <td className="px-4 py-3 font-medium">{p.prod_name}</td>
            <td className="px-4 py-3">{p.category}</td>
            <td className="px-4 py-3">{p.size}</td>
            <td className="px-4 py-3">{Number(p.prod_price_per_tray).toFixed(2)}</td>
            <td className="px-4 py-3">{p.prod_status}</td>
            <td className="px-4 py-3">
              <button
                onClick={() => onEdit?.(p)}
                className="px-3 py-1 rounded bg-primaryYellow text-white hover:opacity-90"
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
