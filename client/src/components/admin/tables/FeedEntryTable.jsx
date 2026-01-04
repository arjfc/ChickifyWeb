//FeedEntryTable.jsx
import React, { useEffect, useState, useMemo } from "react";
import { IoAdd, IoSearchOutline, IoPencil } from "react-icons/io5";
import { listMyFeedTypes } from "../../../services/FeedEntry";
export default function FeedEntryTable({ refreshKey = 0, onAddClick, onEditClick }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await listMyFeedTypes();
        if (alive) setRows(data || []);
      } catch (e) {
        if (alive) setError(e.message || "Failed to load feed types");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [refreshKey]);

  // Filter by search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.brand?.toLowerCase().includes(q) ||
        r.form?.toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // Pagination
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRows);
  const currentRows = useMemo(
    () => filteredRows.slice(startIdx, endIdx),
    [filteredRows, startIdx, endIdx]
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const header = "text-[#F6C32B] text-[15px] font-semibold";
  const cell = "text-[15px] text-gray-700 bg-[#faf4df] px-4 py-3";

  return (
    <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Feed Types</h3>
          <p className="text-sm text-gray-600">
            Manage available feed types for your cooperative
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
            <input
              type="text"
              placeholder="Search feeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-[200px] pl-9 pr-3 rounded-lg border border-gray-300 bg-gray-50 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primaryYellow text-white text-sm font-semibold hover:bg-green-700 transition-all"
          >
            <IoAdd className="text-lg" />
            Add Feed
          </button>
        </div>
      </div>

      {/* Pagination controls */}
      {!loading && !error && totalRows > 0 && (
        <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>
              Showing {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of {totalRows}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={safePage <= 1}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              Previous
            </button>
            <span className="text-xs">
              Page {safePage} / {totalPages}
            </span>
            <button
              onClick={onNext}
              disabled={safePage >= totalPages}
              className="px-3 py-1 rounded border border-yellow-500 text-yellow-600 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Table Headers */}
      <div className="flex items-center border-b border-gray-300 px-4 py-3">
        <div className={`flex-1 ${header}`}>Name</div>
        <div className={`w-48 ${header}`}>Brand</div>
        <div className={`w-40 ${header}`}>Form</div>
        <div className={`w-32 ${header}`}>Price/Kg</div>
        <div className={`w-32 ${header}`}>Pack Size</div>
        <div className={`w-20 ${header}`}>Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading feed types...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600">{error}</div>
        ) : currentRows.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-gray-400 text-4xl mb-2">🌾</div>
            <div className="text-sm text-gray-500">
              {searchQuery
                ? `No feed types match "${searchQuery}"`
                : "No feed types yet. Add your first one!"}
            </div>
          </div>
        ) : (
          currentRows.map((row, index) => (
            <div
              key={row.feed_type_id}
              className={`flex items-center px-4 ${
                index % 2 === 0 ? "bg-[#faf4df]" : "bg-white"
              }`}
            >
              <div className={`flex-1 ${cell}`}>{row.name}</div>
              <div className={`w-48 ${cell}`}>{row.brand || "—"}</div>
              <div className={`w-40 ${cell}`}>{row.form || "—"}</div>
              <div className={`w-32 ${cell}`}>
                {row.current_price_per_kg ? `₱${parseFloat(row.current_price_per_kg).toFixed(2)}` : "—"}
              </div>
              <div className={`w-32 ${cell}`}>
                {row.pack_size_kg ? `${parseFloat(row.pack_size_kg)} kg` : "—"}
              </div>
              <div className={`w-20 ${cell}`}>
                <button
                  onClick={() => onEditClick?.(row)}
                  className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit feed type"
                >
                  <IoPencil className="text-sm" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
