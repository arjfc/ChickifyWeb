import React, { useEffect, useMemo, useState } from "react";
import { IoEyeOutline } from "react-icons/io5";
import { fetchEggBatchesGrouped, fetchSizes } from "@/services/EggInventory";
import { getOrderSizeRequirement, adminCreateAllocationBulk } from "@/services/OrderNAllocation";

const STATUS_OPTIONS = ["All", "Fresh", "Sell Soon", "Expiring", "Expired", "Sold"];

// Match your RPC rank (lower = worse/sooner), but we want "about to expire first":
// Put Expired first, then Expiring, Sell Soon, Fresh, Sold
const STATUS_SORT_RANK = {
  Expired: 1,
  Expiring: 2,
  "Sell Soon": 3,
  Fresh: 4,
  Sold: 5,
};

function statusClasses(status) {
  const base =
    "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold";
  const s = (status || "").toLowerCase();
  if (s === "sold")
    return `${base} bg-gray-200 text-gray-700 border border-gray-300`;
  if (s === "expired")
    return `${base} bg-slate-200 text-slate-800 border border-slate-300`;
  if (s === "expiring")
    return `${base} bg-red-100 text-red-700 border border-red-300`;
  if (s === "sell soon")
    return `${base} bg-amber-100 text-amber-700 border border-amber-300`;
  if (s === "fresh")
    return `${base} bg-green-100 text-green-700 border border-green-300`;
  return `${base} bg-gray-100 text-gray-700 border border-gray-300`;
}

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

export default function EggSupplyTable() {
  const [rowsRaw, setRowsRaw] = useState([]);
  const [sizes, setSizes] = useState(["XS", "S", "M", "L", "XL", "J"]);
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("All");
  const [farmerFilter, setFarmerFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [5, 10, 25, 50];

  // Modal
  const [open, setOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

  // Chart filters
  const now = new Date();
  const [chartMonth, setChartMonth] = useState(now.getMonth() + 1);
  const [chartYear, setChartYear] = useState(now.getFullYear());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [r, s] = await Promise.all([
          fetchEggBatchesGrouped({}),
          fetchSizes(),
        ]);
        if (!mounted) return;
        setRowsRaw(r || []);
        setSizes(s || ["XS", "S", "M", "L", "XL", "J"]);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load egg supply.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function getSizeStats(row, label) {
    if (label === "ALL") {
      return {
        trays: Number(row.trayStocks || 0),
        eggs: Number(row.totalEggs ?? 0),
      };
    }
    const item = (row.sizeBreakdown || []).find(
      (s) => String(s.size || "").toUpperCase() === label
    );
    return {
      trays: Number(item?.qty || 0),
      eggs: Number(item?.eggs || 0),
    };
  }

  // Farmer options for dropdown
  const farmerOptions = useMemo(() => {
    const set = new Set(
      (rowsRaw || [])
        .map((r) => r.farmer)
        .filter((f) => f && String(f).trim() !== "")
    );
    return Array.from(set).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [rowsRaw]);

  // Status totals cards (respect current sizeFilter, ignore statusFilter)
  const statusTotals = useMemo(() => {
    const base = {};
    STATUS_OPTIONS.filter((s) => s !== "All").forEach((s) => {
      base[s] = { trays: 0, eggs: 0 };
    });

    (rowsRaw || []).forEach((r) => {
      const rawStatus = r.status || "";
      const key = STATUS_OPTIONS.find(
        (opt) => opt.toLowerCase() === rawStatus.toLowerCase()
      );
      if (!key || key === "All") return;
      const { trays, eggs } = getSizeStats(r, sizeFilter);
      base[key].trays += trays;
      base[key].eggs += eggs;
    });

    return base;
  }, [rowsRaw, sizeFilter]);

  // Apply size projection, farmer filter, status filter, then sort by rank & days_to_expiry
  const rowsFilteredSorted = useMemo(() => {
    const mapped = (rowsRaw || []).map((r) => {
      const { trays, eggs } = getSizeStats(r, sizeFilter);
      return { ...r, _traysForView: trays, _eggsForView: eggs };
    });

    const byFarmer = mapped.filter((r) => {
      if (farmerFilter === "ALL") return true;
      return r.farmer === farmerFilter;
    });

    const byStatus = byFarmer.filter((r) => {
      if (statusFilter === "All") return true;
      return (r.status || "").toLowerCase() === statusFilter.toLowerCase();
    });

    const sorted = byStatus.sort((a, b) => {
      const ra = STATUS_SORT_RANK[a.status] ?? 999;
      const rb = STATUS_SORT_RANK[b.status] ?? 999;

      if (ra !== rb) return ra - rb;

      const da = a.daysToExpiry ?? 99999;
      const db = b.daysToExpiry ?? 99999;
      if (da !== db) return da - db;

      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return ta - tb;
    });

    return sorted;
  }, [rowsRaw, sizeFilter, statusFilter, farmerFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [sizeFilter, statusFilter, farmerFilter]);

  // Pagination derived
  const totalRows = rowsFilteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRows);
  const currentRows = useMemo(
    () => rowsFilteredSorted.slice(startIdx, endIdx),
    [rowsFilteredSorted, startIdx, endIdx]
  );

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const openModal = (row) => {
    setActiveRow(row);
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setActiveRow(null);
  };

  // ===== Chart: Farmer performance (eggs collected per farmer per month/year) =====
  const yearOptions = useMemo(() => {
    const years = new Set();
    (rowsRaw || []).forEach((r) => {
      if (!r.date) return;
      const dt = new Date(r.date);
      if (!isNaN(dt)) years.add(dt.getFullYear());
    });
    const arr = Array.from(years).sort((a, b) => a - b);
    if (arr.length === 0) return [chartYear];
    return arr;
  }, [rowsRaw, chartYear]);

  const farmerPerformance = useMemo(() => {
    const map = new Map();
    (rowsRaw || []).forEach((r) => {
      if (!r.date || !r.farmer) return;
      const dt = new Date(r.date);
      if (isNaN(dt)) return;
      const m = dt.getMonth() + 1;
      const y = dt.getFullYear();
      if (m !== chartMonth || y !== chartYear) return;
      const eggs = Number(r.totalEggs ?? 0);
      const current = map.get(r.farmer) || 0;
      map.set(r.farmer, current + eggs);
    });
    const arr = Array.from(map.entries()).map(([farmer, eggs]) => ({
      farmer,
      eggs,
    }));
    // Sort descending by eggs
    arr.sort((a, b) => b.eggs - a.eggs);
    return arr;
  }, [rowsRaw, chartMonth, chartYear]);

  const maxEggs =
    farmerPerformance.reduce((max, f) => Math.max(max, f.eggs || 0), 0) || 1;

  return (
    <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
      {/* Top controls */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Egg Supply</h3>

          <label className="text-sm text-gray-600">Size:</label>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
          >
            <option value="ALL">All sizes (totals)</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600">Farmer:</label>
          <select
            value={farmerFilter}
            onChange={(e) => setFarmerFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
          >
            <option value="ALL">All farmers</option>
            {farmerOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Status overview ({sizeFilter === "ALL" ? "all sizes" : sizeFilter}):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {STATUS_OPTIONS.filter((s) => s !== "All").map((status) => {
            const t = statusTotals[status] || { trays: 0, eggs: 0 };
            return (
              <div
                key={status}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 flex flex-col"
              >
                <span className="text-xs font-semibold text-gray-600">
                  {status}
                </span>
                <span className="mt-1 text-sm font-bold text-gray-900">
                  {t.trays.toLocaleString()} tray
                  {t.trays === 1 ? "" : "s"}
                </span>
                <span className="text-[11px] text-gray-500">
                  {t.eggs.toLocaleString()} eggs
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farmer performance chart */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">
              Farmer performance – eggs collected
            </h4>
            <p className="text-xs text-gray-500">
              Compare total eggs collected per farmer for the selected month and
              year.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-gray-600">Month:</label>
            <select
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
              value={chartMonth}
              onChange={(e) => setChartMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <label className="text-xs text-gray-600">Year:</label>
            <select
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
              value={chartYear}
              onChange={(e) => setChartYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {farmerPerformance.length === 0 ? (
          <div className="py-4 text-xs text-gray-500 text-center">
            No egg collection data for this period.
          </div>
        ) : (
          <div className="mt-1">
            <div className="flex items-end gap-2 overflow-x-auto pb-2">
              {farmerPerformance.map((f) => {
                const heightPercent = Math.max(
                  5,
                  (f.eggs / maxEggs) * 100
                );
                return (
                  <div
                    key={f.farmer}
                    className="flex flex-col items-center min-w-[70px] mx-1"
                  >
                    <div className="w-8 sm:w-10 h-24 sm:h-28 bg-gray-200 rounded-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-yellow-400 rounded-t-full"
                        style={{ height: `${heightPercent}%` }}
                        title={`${f.eggs.toLocaleString()} eggs`}
                      />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold text-gray-700 text-center line-clamp-2">
                      {f.farmer}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {f.eggs.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
        <div className="flex-1 text-lg pl-2 text-center">Farmer</div>
        <div className="w-48 text-lg text-center">Date</div>
        <div className="w-44 text-lg text-center">
          {sizeFilter === "ALL" ? "Stocks per Tray" : `Trays (${sizeFilter})`}
        </div>
        <div className="w-44 text-lg text-center">
          {sizeFilter === "ALL" ? "Stocks per Egg" : `Eggs (${sizeFilter})`}
        </div>
        <div className="w-40 text-lg text-center">Status</div>
        <div className="w-36 text-lg text-center">Action</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading…</div>
        ) : err ? (
          <div className="py-10 text-center text-red-600">{err}</div>
        ) : currentRows.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No data</div>
        ) : (
          currentRows.map((r) => (
            <div
              key={r.id}
              className="flex items-center px-6 py-4 text-[15px]"
            >
              <div className="flex-1 text-gray-900 pl-2 text-center">
                {r.farmer}
              </div>
              <div className="w-48 text-gray-700 text-center">
                {fmtDate(r.date)}
              </div>

              <div className="w-44 text-gray-700 text-center">
                {r._traysForView} tray
                {r._traysForView === 1 ? "" : "s"}
              </div>
              <div className="w-44 text-gray-700 text-center">
                {Number(r._eggsForView || 0).toLocaleString()} eggs
              </div>

              <div className="w-40 text-center">
                <span className={statusClasses(r.status)}>
                  {r.status || "—"}
                </span>
              </div>

              <div className="w-36 text-center">
                <button
                  onClick={() => openModal(r)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  <IoEyeOutline className="text-lg" /> View More
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination footer – left side dropdown + "displaying" */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[12px] text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-[12px]">Rows per page:</span>
          <div className="relative">
            <select
              className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <span className="ml-3">
            Displaying {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of{" "}
            {totalRows}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold disabled:opacity-50"
            onClick={onPrev}
            disabled={safePage <= 1 || loading}
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {safePage} / {totalPages}
          </span>
          <button
            className="rounded-md border border-yellow-600 bg-white px-3.5 py-1.5 text-[12px] font-medium text-yellow-500 hover:bg-yellow-300 hover:text-yellow-700 disabled:opacity-50"
            onClick={onNext}
            disabled={safePage >= totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal — View More */}
      {open && activeRow && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
          <div className="relative z-[1001] w-[620px] max-w-[92vw] rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-center text-3xl font-semibold text-primaryYellow">
              Stocks Details
            </h3>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-700">
                Stocks Available
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {sizeFilter === "ALL" ? (
                  <>
                    Total:{" "}
                    <span className="font-bold">
                      {activeRow.trayStocks}
                    </span>{" "}
                    tray
                    {activeRow.trayStocks === 1 ? "" : "s"}
                    {" • "}
                    <span className="font-bold">
                      {(activeRow.totalEggs || 0).toLocaleString()}
                    </span>{" "}
                    eggs
                  </>
                ) : (
                  <>
                    {sizeFilter}:{" "}
                    <span className="font-bold">
                      {getSizeStats(activeRow, sizeFilter).trays}
                    </span>{" "}
                    tray
                    {getSizeStats(activeRow, sizeFilter).trays === 1
                      ? ""
                      : "s"}
                    {" • "}
                    <span className="font-bold">
                      {getSizeStats(activeRow, sizeFilter).eggs.toLocaleString()}
                    </span>{" "}
                    eggs
                  </>
                )}
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-gray-600">
              <div className="flex items-center border-b border-gray-600 px-5 py-3">
                <div className="flex-1 text-lg font-semibold text-gray-800 text-center pr-10">
                  Egg Size
                </div>
                <div className="w-40 text-lg font-semibold text-gray-800 text-center">
                  Stocks (trays)
                </div>
                <div className="w-40 text-lg font-semibold text-gray-800 text-center">
                  Stocks (eggs)
                </div>
              </div>

              <div className="divide-y divide-gray-300">
                {(activeRow.sizeBreakdown || []).map((s) => (
                  <div key={s.size} className="flex items-center px-5 py-3">
                    <div
                      className={`flex-1 text-gray-800 text-lg text-center pr-10 ${
                        sizeFilter !== "ALL" && s.size === sizeFilter
                          ? "font-bold"
                          : ""
                      }`}
                    >
                      {s.size}
                    </div>
                    <div className="w-40 text-gray-800 text-lg text-center">
                      {s.qty}
                    </div>
                    <div className="w-40 text-gray-800 text-lg text-center">
                      {(s.eggs || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={closeModal}
                className="w-[100%] rounded-lg bg-gray-300 py-3 text-center font-semibold text-gray hover:opacity-90"
              >
                Back
              </button>
              {/* <button
                onClick={() => alert("Egg request sent")}
                className="w-[48%] rounded-lg bg-primaryYellow py-3 text-center font-semibold text-white hover:opacity-90"
              >
                Send Egg Request
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
