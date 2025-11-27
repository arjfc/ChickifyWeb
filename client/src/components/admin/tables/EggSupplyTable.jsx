// // components/admin/tables/EggSupplyTable.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { IoEyeOutline } from "react-icons/io5";
// import { fetchEggBatchesGrouped, fetchSizes } from "@/services/EggInventory";
// import { getOrderSizeRequirements } from "@/services/OrderNAllocation";

// const STATUS_OPTIONS = ["All", "Fresh", "Sell Soon", "Expiring", "Expired", "Sold"];

// const STATUS_SORT_RANK = {
//   Expired: 1,
//   Expiring: 2,
//   "Sell Soon": 3,
//   Fresh: 4,
//   Sold: 5,
// };

// function statusClasses(status) {
//   const base =
//     "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold";
//   const s = (status || "").toLowerCase();
//   if (s === "sold") return `${base} bg-gray-200 text-gray-700 border border-gray-300`;
//   if (s === "expired") return `${base} bg-slate-200 text-slate-800 border border-slate-300`;
//   if (s === "expiring") return `${base} bg-red-100 text-red-700 border border-red-300`;
//   if (s === "sell soon") return `${base} bg-amber-100 text-amber-700 border border-amber-300`;
//   if (s === "fresh") return `${base} bg-green-100 text-green-700 border border-green-300`;
//   return `${base} bg-gray-100 text-gray-700 border-gray-300`;
// }

// export default function EggSupplyTable({ 
//   onSelectedRowsChange,
//   autoFilterOrderId = null 
// } = {}) {
//   const [rowsRaw, setRowsRaw] = useState([]);
//   const [sizes, setSizes] = useState(["XS", "S", "M", "L", "XL", "J"]);
//   const [sizeFilter, setSizeFilter] = useState("ALL");
//   const [statusFilter, setStatusFilter] = useState("All");

//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState(null);

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const [selected, setSelected] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const selectAllRef = useRef(null);

//   // Auto-filter by order size
//   useEffect(() => {
//     if (!autoFilterOrderId) {
//       setSizeFilter("ALL");
//       return;
//     }
    
//     let alive = true;
//     (async () => {
//       try {
//         const needs = await getOrderSizeRequirements(autoFilterOrderId);
//         if (!alive) return;
        
//         if (needs.length === 1) {
//           // Single size needed - auto filter
//           setSizeFilter(needs[0].sizeLabel);
//         } else if (needs.length > 1) {
//           // Multiple sizes - show all but could add indicator
//           setSizeFilter("ALL");
//         }
//       } catch (e) {
//         console.error("Failed to auto-filter by order size:", e);
//       }
//     })();
    
//     return () => { alive = false; };
//   }, [autoFilterOrderId]);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);
//         const [r, s] = await Promise.all([fetchEggBatchesGrouped({}), fetchSizes()]);
//         if (!mounted) return;
//         setRowsRaw(r || []);
//         setSizes(s || ["XS", "S", "M", "L", "XL", "J"]);
//       } catch (e) {
//         if (!mounted) return;
//         setErr(e?.message || "Failed to load egg supply.");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   function getSizeStats(row, label) {
//     if (label === "ALL") {
//       // ✅ FIX: Sum across ALL sizes in breakdown
//       const totalTrays = (row.sizeBreakdown || []).reduce((sum, s) => sum + Number(s.qty || 0), 0);
//       const totalEggs = (row.sizeBreakdown || []).reduce((sum, s) => sum + Number(s.eggs || 0), 0);
//       return { trays: totalTrays, eggs: totalEggs };
//     }
    
//     const item = (row.sizeBreakdown || []).find(
//       (s) => String(s.size || "").toUpperCase() === label
//     );
//     return {
//       trays: Number(item?.qty || 0),
//       eggs: Number(item?.eggs || 0),
//     };
//   }

//   const rowsFilteredSorted = useMemo(() => {
//     const mapped = (rowsRaw || []).map((r) => {
//       const { trays, eggs } = getSizeStats(r, sizeFilter);
//       return { ...r, _traysForView: trays, _eggsForView: eggs };
//     });

//     const byStatus = mapped.filter((r) => {
//       if (statusFilter === "All") return true;
//       return (r.status || "").toLowerCase() === statusFilter.toLowerCase();
//     });

//     const sorted = byStatus.sort((a, b) => {
//       const ra = STATUS_SORT_RANK[a.status] ?? 999;
//       const rb = STATUS_SORT_RANK[b.status] ?? 999;
//       if (ra !== rb) return ra - rb;

//       const da = a.daysToExpiry ?? 99999;
//       const db = b.daysToExpiry ?? 99999;
//       if (da !== db) return da - db;

//       const ta = new Date(a.date).getTime();
//       const tb = new Date(b.date).getTime();
//       return ta - tb;
//     });

//     return sorted;
//   }, [rowsRaw, sizeFilter, statusFilter]);

//   useEffect(() => {
//     setPage(1);
//   }, [sizeFilter, statusFilter]);

//   const totalRows = rowsFilteredSorted.length;
//   const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
//   const safePage = Math.min(page, totalPages);
//   const startIdx = (safePage - 1) * pageSize;
//   const endIdx = Math.min(startIdx + pageSize, totalRows);
//   const currentRows = useMemo(
//     () => rowsFilteredSorted.slice(startIdx, endIdx),
//     [rowsFilteredSorted, startIdx, endIdx]
//   );

//   useEffect(() => {
//     if (selectAllRef.current) {
//       selectAllRef.current.indeterminate =
//         selected.length > 0 && selected.length < currentRows.length;
//     }
//   }, [selected, currentRows.length]);

//   useEffect(() => {
//     setSelected([]);
//     setSelectAll(false);
//   }, [safePage, pageSize, rowsFilteredSorted]);

//   useEffect(() => {
//     if (typeof onSelectedRowsChange !== "function") return;
//     const ids = currentRows
//       .map((r, i) => (selected[i] ? r.id : null))
//       .filter(Boolean);
//     onSelectedRowsChange(ids);
//   }, [selected, currentRows, onSelectedRowsChange]);

//   const toggleAll = () => {
//     const all = currentRows.length > 0 && selected.length === currentRows.length;
//     setSelected(all ? [] : Array(currentRows.length).fill(true));
//     setSelectAll(!all);
//   };
  
//   const toggleOne = (index) => {
//     const copy = [...selected];
//     copy[index] = !copy[index];
//     setSelected(copy);
//     setSelectAll(copy.length > 0 && copy.every(Boolean));
//   };

//   const fmtDate = (d) =>
//     new Date(d).toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "2-digit",
//     });

//   const onPrev = () => setPage((p) => Math.max(1, p - 1));
//   const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

//   const [open, setOpen] = useState(false);
//   const [activeRow, setActiveRow] = useState(null);
//   const openModal = (row) => {
//     setActiveRow(row);
//     setOpen(true);
//   };
//   const closeModal = () => {
//     setOpen(false);
//     setActiveRow(null);
//   };

//   return (
//     <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
//       {/* Top controls */}
//       <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <div className="flex flex-wrap items-center gap-3">
//           <h3 className="text-lg font-semibold text-gray-800">Egg Supply</h3>

//           <label className="text-sm text-gray-600">Size:</label>
//           <select
//             value={sizeFilter}
//             onChange={(e) => setSizeFilter(e.target.value)}
//             className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
//           >
//             <option value="ALL">All sizes (totals)</option>
//             {sizes.map((s) => (
//               <option key={s} value={s}>
//                 {s}
//               </option>
//             ))}
//           </select>

//           <label className="text-sm text-gray-600">Status:</label>
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
//           >
//             {STATUS_OPTIONS.map((s) => (
//               <option key={s} value={s}>
//                 {s}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex items-center gap-2 text-[12px] text-gray-500">
//           <div className="relative">
//             <select
//               className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//             >
//               {[5, 10, 25, 50].map((n) => (
//                 <option key={n} value={n}>
//                   {n}
//                 </option>
//               ))}
//             </select>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//           <span>
//             Displaying {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of {totalRows}
//           </span>

//           <button
//             className="ml-2 rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold disabled:opacity-50"
//             onClick={onPrev}
//             disabled={safePage <= 1 || loading}
//           >
//             Previous
//           </button>
//           <span className="text-xs text-gray-600">
//             Page {safePage} / {totalPages}
//           </span>
//           <button
//             className="rounded-md border border-yellow-600 bg-white px-3.5 py-1.5 text-[12px] font-medium text-yellow-500 hover:bg-yellow-300 hover:text-yellow-700 disabled:opacity-50"
//             onClick={onNext}
//             disabled={safePage >= totalPages || loading}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* Header */}
//       <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
//         <div className="w-10 flex justify-center">
//           <input
//             ref={selectAllRef}
//             type="checkbox"
//             onChange={toggleAll}
//             checked={selectAll}
//             className="h-4 w-4 accent-yellow-400"
//             aria-label="select-all"
//             disabled={loading || currentRows.length === 0}
//           />
//         </div>
//         <div className="flex-1 text-lg pl-8 text-center">Farmer</div>
//         <div className="w-44 text-lg text-center">Date</div>
//         <div className="w-32 text-lg text-center">Days Left</div>
//         <div className="w-40 text-lg text-center">
//           {sizeFilter === "ALL" ? "Stocks (trays)" : `Trays (${sizeFilter})`}
//         </div>
//         <div className="w-40 text-lg text-center">
//           {sizeFilter === "ALL" ? "Stocks (eggs)" : `Eggs (${sizeFilter})`}
//         </div>
//         <div className="w-36 text-lg text-center">Status</div>
//         <div className="w-32 text-lg text-center">Action</div>
//       </div>

//       {/* Rows */}
//       <div className="divide-y divide-gray-200">
//         {loading ? (
//           <div className="py-10 text-center text-gray-500">Loading…</div>
//         ) : err ? (
//           <div className="py-10 text-center text-red-600">{err}</div>
//         ) : currentRows.length === 0 ? (
//           <div className="py-10 text-center text-gray-500">No data</div>
//         ) : (
//           currentRows.map((r, i) => {
//             const isChecked = selected[i] || false;
//             return (
//               <div 
//                 key={r.id} 
//                 className={`flex items-center px-6 py-4 text-[15px] transition-colors ${
//                   isChecked ? 'bg-yellow-100 border-l-4 border-primaryYellow' : 'hover:bg-yellow-50'
//                 }`}
//               >
//                 <div className="w-10 flex justify-center">
//                   <input
//                     type="checkbox"
//                     checked={isChecked}
//                     onChange={() => toggleOne(i)}
//                     className="h-4 w-4 accent-yellow-400"
//                     aria-label={`select-${r.id}`}
//                   />
//                 </div>
//                 <div className="flex-1 text-gray-900 pl-8 text-center">{r.farmer}</div>
//             <div className="w-44 text-gray-700 text-center">{fmtDate(r.date)}</div>

//             {/* Days Left column */}
//             <div className="w-32 text-center">
//               {r.daysToExpiry != null ? (
//                 <span className={`font-semibold ${
//                   r.daysToExpiry < 7 ? 'text-red-600' : 
//                   r.daysToExpiry < 14 ? 'text-amber-600' : 
//                   'text-green-600'
//                 }`}>
//                   {r.daysToExpiry} days
//                 </span>
//               ) : (
//                 <span className="text-gray-400">—</span>
//               )}
//             </div>

//             <div className="w-40 text-gray-700 text-center">
//               {r._traysForView} tray{r._traysForView === 1 ? "" : "s"}
//             </div>
//             <div className="w-40 text-gray-700 text-center">
//               {Number(r._eggsForView || 0).toLocaleString()} eggs
//             </div>

//             <div className="w-36 text-center">
//               <span className={statusClasses(r.status)}>{r.status || "—"}</span>
//             </div>

//             <div className="w-32 text-center">
//               <button
//                 onClick={() => openModal(r)}
//                 className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
//               >
//                 <IoEyeOutline className="text-lg" /> View
//               </button>
//             </div>
//           </div>
//         );
//       })
//     )}
//   </div>

//   {/* Modal — View More */}
//   {open && activeRow && (
//     <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
//       <div className="relative z-[1001] w-[620px] max-w-[92vw] rounded-2xl bg-white p-8 shadow-xl">
//         <h3 className="text-center text-3xl font-semibold text-primaryYellow">Stocks Details</h3>

//         <div className="mt-6 flex items-center justify-between">
//           <p className="text-lg font-semibold text-gray-700">Stocks Available</p>
//           <p className="text-lg font-semibold text-gray-700">
//             Total: <span className="font-bold">{activeRow.trayStocks}</span> tray
//             {activeRow.trayStocks === 1 ? "" : "s"}
//             {" • "}
//             <span className="font-bold">{(activeRow.totalEggs || 0).toLocaleString()}</span> eggs
//           </p>
//         </div>

//         <div className="mt-3 rounded-xl border border-gray-600">
//           <div className="flex items-center border-b border-gray-600 px-5 py-3">
//             <div className="flex-1 text-lg font-semibold text-gray-800 text-center pr-10">
//               Egg Size
//             </div>
//             <div className="w-40 text-lg font-semibold text-gray-800 text-center">
//               Stocks (trays)
//             </div>
//             <div className="w-40 text-lg font-semibold text-gray-800 text-center">
//               Stocks (eggs)
//             </div>
//           </div>

//           <div className="divide-y divide-gray-300">
//             {(activeRow.sizeBreakdown || []).map((s) => (
//               <div key={s.size} className="flex items-center px-5 py-3">
//                 <div className="flex-1 text-gray-800 text-lg text-center pr-10">{s.size}</div>
//                 <div className="w-40 text-gray-800 text-lg text-center">{s.qty}</div>
//                 <div className="w-40 text-gray-800 text-lg text-center">
//                   {(s.eggs || 0).toLocaleString()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Updated footer - removed "Send Egg Request" */}
//         <div className="mt-8">
//           <button
//             onClick={closeModal}
//             className="w-full rounded-lg bg-gray-300 py-3 text-center font-semibold text-gray-700 hover:opacity-90"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   )}
// </div>
//   );
// }
// components/admin/tables/EggSupplyTable.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoEyeOutline } from "react-icons/io5";
import { fetchEggBatchesGrouped, fetchSizes } from "@/services/EggInventory";
import { getOrderSizeRequirements } from "@/services/OrderNAllocation";

const STATUS_OPTIONS = ["All", "Fresh", "Sell Soon", "Expiring", "Expired", "Sold"];

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
  if (s === "sold") return `${base} bg-gray-200 text-gray-700 border border-gray-300`;
  if (s === "expired") return `${base} bg-slate-200 text-slate-800 border border-slate-300`;
  if (s === "expiring") return `${base} bg-red-100 text-red-700 border border-red-300`;
  if (s === "sell soon") return `${base} bg-amber-100 text-amber-700 border border-amber-300`;
  if (s === "fresh") return `${base} bg-green-100 text-green-700 border border-green-300`;
  return `${base} bg-gray-100 text-gray-700 border-gray-300`;
}

export default function EggSupplyTable({
  onSelectedRowsChange,
  autoFilterOrderId = null,
} = {}) {
  const [rowsRaw, setRowsRaw] = useState([]);
  const [sizes, setSizes] = useState(["XS", "S", "M", "L", "XL", "J"]);
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const selectAllRef = useRef(null);

  // Auto-filter by order size
  useEffect(() => {
    if (!autoFilterOrderId) {
      setSizeFilter("ALL");
      return;
    }

    let alive = true;
    (async () => {
      try {
        const needs = await getOrderSizeRequirements(autoFilterOrderId);
        if (!alive) return;

        if (needs.length === 1) {
          setSizeFilter(needs[0].sizeLabel);
        } else if (needs.length > 1) {
          setSizeFilter("ALL");
        }
      } catch (e) {
        console.error("Failed to auto-filter by order size:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [autoFilterOrderId]);

  // Load data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [r, s] = await Promise.all([fetchEggBatchesGrouped({}), fetchSizes()]);
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
      const totalTrays = (row.sizeBreakdown || []).reduce(
        (sum, s) => sum + Number(s.qty || 0),
        0
      );
      const totalEggs = (row.sizeBreakdown || []).reduce(
        (sum, s) => sum + Number(s.eggs || 0),
        0
      );
      return { trays: totalTrays, eggs: totalEggs };
    }

    const item = (row.sizeBreakdown || []).find(
      (s) => String(s.size || "").toUpperCase() === label
    );
    return {
      trays: Number(item?.qty || 0),
      eggs: Number(item?.eggs || 0),
    };
  }

  // const rowsFilteredSorted = useMemo(() => {
  //   const mapped = (rowsRaw || []).map((r) => {
  //     const { trays, eggs } = getSizeStats(r, sizeFilter);
  //     return { ...r, _traysForView: trays, _eggsForView: eggs };
  //   });

  //   const byStatus = mapped.filter((r) => {
  //     if (statusFilter === "All") return true;
  //     return (r.status || "").toLowerCase() === statusFilter.toLowerCase();
  //   });

  //   const sorted = byStatus.sort((a, b) => {
  //     const ra = STATUS_SORT_RANK[a.status] ?? 999;
  //     const rb = STATUS_SORT_RANK[b.status] ?? 999;
  //     if (ra !== rb) return ra - rb;

  //     const da = a.daysToExpiry ?? 99999;
  //     const db = b.daysToExpiry ?? 99999;
  //     if (da !== db) return da - db;

  //     const ta = new Date(a.date).getTime();
  //     const tb = new Date(b.date).getTime();
  //     return ta - tb;
  //   });

  //   return sorted;
  // }, [rowsRaw, sizeFilter, statusFilter]);
  const rowsFilteredSorted = useMemo(() => {
  // 1) Attach per-view stats for the selected size
  const mapped = (rowsRaw || []).map((r) => {
    const { trays, eggs } = getSizeStats(r, sizeFilter);
    return { ...r, _traysForView: trays, _eggsForView: eggs };
  });

  // 2) Filter by status
  const byStatus = mapped.filter((r) => {
    const status = (r.status || "").toLowerCase();

    // When "All" is selected, show everything EXCEPT expired
    if (statusFilter === "All") {
      return status !== "expired";
    }

    // Other filters work as usual (Fresh, Sell Soon, Expiring, Expired, Sold)
    return status === statusFilter.toLowerCase();
  });

  // 3) 🔥 Filter out rows where the selected size has no eggs/trays
  const bySizeNonZero = byStatus.filter((r) => {
    // When viewing a specific size, hide farmer/date rows that
    // have 0 eggs for that size (even if they have eggs in other sizes)
    if (sizeFilter !== "ALL") {
      return (r._eggsForView || 0) > 0;
    }

    // For "ALL", we keep whatever the RPC gives (it already excludes
    // fully-empty rows), but you *can* enforce >0 if you want:
    return (r._eggsForView || 0) > 0;
  });

  // 4) Sort
  const sorted = bySizeNonZero.sort((a, b) => {
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
  }, [rowsRaw, sizeFilter, statusFilter]);


  useEffect(() => {
    setPage(1);
  }, [sizeFilter, statusFilter]);

  const totalRows = rowsFilteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRows);
  const currentRows = useMemo(
    () => rowsFilteredSorted.slice(startIdx, endIdx),
    [rowsFilteredSorted, startIdx, endIdx]
  );

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selected.length > 0 && selected.length < currentRows.length;
    }
  }, [selected, currentRows.length]);

  useEffect(() => {
    setSelected([]);
    setSelectAll(false);
  }, [safePage, pageSize, rowsFilteredSorted]);

  useEffect(() => {
    if (typeof onSelectedRowsChange !== "function") return;
    const ids = currentRows
      .map((r, i) => (selected[i] ? r.id : null))
      .filter(Boolean);
    onSelectedRowsChange(ids);
  }, [selected, currentRows, onSelectedRowsChange]);

  const toggleAll = () => {
    const all = currentRows.length > 0 && selected.length === currentRows.length;
    setSelected(all ? [] : Array(currentRows.length).fill(true));
    setSelectAll(!all);
  };

  const toggleOne = (index) => {
    const copy = [...selected];
    copy[index] = !copy[index];
    setSelected(copy);
    setSelectAll(copy.length > 0 && copy.every(Boolean));
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const [open, setOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const openModal = (row) => {
    setActiveRow(row);
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setActiveRow(null);
  };

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
        </div>

        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <div className="relative">
            <select
              className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 25, 50].map((n) => (
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span>
            Displaying {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of {totalRows}
          </span>

          <button
            className="ml-2 rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold disabled:opacity-50"
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

      {/* Header */}
      <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
        <div className="w-10 flex justify-center">
          <input
            ref={selectAllRef}
            type="checkbox"
            onChange={toggleAll}
            checked={selectAll}
            className="h-4 w-4 accent-yellow-400"
            aria-label="select-all"
            disabled={loading || currentRows.length === 0}
          />
        </div>
        <div className="flex-1 text-lg pl-8 text-center">Farmer</div>
        <div className="w-44 text-lg text-center">Date</div>
        <div className="w-32 text-lg text-center">Days Left</div>
        <div className="w-40 text-lg text-center">
          {sizeFilter === "ALL" ? "Stocks (trays)" : `Trays (${sizeFilter})`}
        </div>
        <div className="w-40 text-lg text-center">
          {sizeFilter === "ALL" ? "Stocks (eggs)" : `Eggs (${sizeFilter})`}
        </div>
        <div className="w-36 text-lg text-center">Status</div>
        <div className="w-32 text-lg text-center">Action</div>
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
          currentRows.map((r, i) => {
            const isChecked = selected[i] || false;
            return (
              <div
                key={r.id}
                className={`flex items-center px-6 py-4 text-[15px] transition-colors ${
                  isChecked ? "bg-yellow-100 border-l-4 border-primaryYellow" : "hover:bg-yellow-50"
                }`}
              >
                <div className="w-10 flex justify-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOne(i)}
                    className="h-4 w-4 accent-yellow-400"
                    aria-label={`select-${r.id}`}
                  />
                </div>
                <div className="flex-1 text-gray-900 pl-8 text-center">{r.farmer}</div>
                <div className="w-44 text-gray-700 text-center">{fmtDate(r.date)}</div>

                {/* Days Left column */}
                <div className="w-32 text-center">
                  {r.daysToExpiry != null ? (
                    <span
                      className={`font-semibold ${
                        r.daysToExpiry <= 2
                          ? "text-red-600"
                          : r.daysToExpiry <= 7
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {r.daysToExpiry} days
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>

                <div className="w-40 text-gray-700 text-center">
                  {r._traysForView} tray{r._traysForView === 1 ? "" : "s"}
                </div>
                <div className="w-40 text-gray-700 text-center">
                  {Number(r._eggsForView || 0).toLocaleString()} eggs
                </div>

                <div className="w-36 text-center">
                  <span className={statusClasses(r.status)}>{r.status || "—"}</span>
                </div>

                <div className="w-32 text-center">
                  <button
                    onClick={() => openModal(r)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                  >
                    <IoEyeOutline className="text-lg" /> View
                  </button>
                </div>
              </div>
            );
          })
        )}
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

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-700">Stocks Available</p>
                <p className="text-lg font-semibold text-gray-700">
                  Total:{" "}
                  <span className="font-bold">{activeRow.trayStocks}</span> tray
                  {activeRow.trayStocks === 1 ? "" : "s"}
                  {" • "}
                  <span className="font-bold">
                    {(activeRow.totalEggs || 0).toLocaleString()}
                  </span>{" "}
                  eggs
                </p>
              </div>

              {/* 🥚 Extra info: pieces → extra trays + leftover pieces */}
              {activeRow.eggsPerPiece > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  You have{" "}
                  <span className="font-semibold">
                    {activeRow.eggsPerPiece}
                  </span>{" "}
                  pieces of eggs →{" "}
                  <span className="font-semibold">
                    {activeRow.extraTraysFromPieces}
                  </span>{" "}
                  extra tray
                  {activeRow.extraTraysFromPieces === 1 ? "" : "s"},{" "}
                  <span className="font-semibold">
                    {activeRow.leftoverPieces}
                  </span>{" "}
                  leftover piece
                  {activeRow.leftoverPieces === 1 ? "" : "s"}
                  .
                </p>
              )}
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
                    <div className="flex-1 text-gray-800 text-lg text-center pr-10">
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

            <div className="mt-8">
              <button
                onClick={closeModal}
                className="w-full rounded-lg bg-gray-300 py-3 text-center font-semibold text-gray-700 hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
