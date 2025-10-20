// components/admin/tables/OrderAllocation.jsx
import React, { useEffect, useMemo, useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { listAllocationGroups } from "@/services/OrderNAllocation";

const STATUS_SORT_RANK = { Expired: 1, Expiring: 2, "Sell Soon": 3, Fresh: 4 };

function freshnessPill(status) {
  const base = "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold border";
  const s = (status || "").toLowerCase();
  if (s === "expired") return `${base} bg-slate-200 text-slate-800 border-slate-300`;
  if (s === "expiring") return `${base} bg-red-100 text-red-700 border-red-300`;
  if (s === "sell soon") return `${base} bg-amber-100 text-amber-700 border-amber-300`;
  if (s === "fresh") return `${base} bg-green-100 text-green-700 border-green-300`;
  return `${base} bg-gray-100 text-gray-700 border-gray-300`;
}

function allocStatusBadge(kind, count) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold";
  const k = (kind || "").toLowerCase();
  const cls =
    k === "pending" ? "bg-yellow-100 text-yellow-700" :
    k === "confirmed" ? "bg-green-100 text-green-700" :
    k === "rejected" ? "bg-red-100 text-red-700" :
    k === "fulfilled" ? "bg-indigo-100 text-indigo-700" :
    "bg-gray-100 text-gray-700";
  return (
    <span key={kind} className={`${base} ${cls}`}>
      {kind} <span className="font-bold">{count}</span>
    </span>
  );
}

export default function EggAllocationHistory({
  orderId = null,
  farmerId = null,
  dateFrom = null,
  dateTo = null,
  reloadKey = 0,
}) {
  const [rows, setRows] = useState([]);
  const [loadErr, setLoadErr] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : "—";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadErr(null);
        const data = await listAllocationGroups({ orderId, farmerId, dateFrom, dateTo });
        if (!alive) return;
        setRows(Array.isArray(data) ? data : data?.rows || []);
      } catch (e) {
        if (!alive) return;
        setLoadErr(e?.message || "Failed to load allocation history.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [orderId, farmerId, dateFrom, dateTo, reloadKey]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const ra = STATUS_SORT_RANK[a.freshnessStatus] ?? 999;
      const rb = STATUS_SORT_RANK[b.freshnessStatus] ?? 999;
      if (ra !== rb) return ra - rb;
      const da = a.daysToExpiry ?? 99999;
      const db = b.daysToExpiry ?? 99999;
      if (da !== db) return da - db;
      return new Date(a.produced).getTime() - new Date(b.produced).getTime();
    });
    return copy;
  }, [rows]);

  // Group by order
  const groupedByOrder = useMemo(() => {
    const map = new Map();
    for (const r of sorted) {
      const key = r.orderId ?? 0;
      if (!map.has(key)) {
        map.set(key, {
          orderId: key,
          orderStatus: r.orderStatus,
          items: [],
        });
      }
      map.get(key).items.push(r);
    }
    return Array.from(map.values());
  }, [sorted]);

  // Filter by status
  const filteredGroups = useMemo(() => {
    if (statusFilter === "All") return groupedByOrder;
    return groupedByOrder.filter(g => g.orderStatus === statusFilter);
  }, [groupedByOrder, statusFilter]);

  // Pagination
  const totalOrders = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalOrders);
  const currentOrders = useMemo(
    () => filteredGroups.slice(startIdx, endIdx),
    [filteredGroups, startIdx, endIdx]
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Auto-expand single order view
  useEffect(() => {
    if (orderId && currentOrders.length === 1) {
      setExpandedOrders(new Set([currentOrders[0].orderId]));
    }
  }, [orderId, currentOrders]);

  const toggleExpand = (oid) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(oid)) next.delete(oid);
      else next.add(oid);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedOrders(new Set(currentOrders.map(g => g.orderId)));
  };

  const collapseAll = () => {
    setExpandedOrders(new Set());
  };

  // Unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(groupedByOrder.map(g => g.orderStatus).filter(Boolean));
    return ["All", ...Array.from(statuses)];
  }, [groupedByOrder]);

  const onPrev = () => setPage(p => Math.max(1, p - 1));
  const onNext = () => setPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg">
      {/* Header with filters */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Egg Allocation History{orderId ? ` — Order #${orderId}` : ""}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          {!orderId && (
            <>
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
              >
                {uniqueStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </>
          )}

          {/* Expand/Collapse all */}
          {currentOrders.length > 0 && (
            <>
              <button
                onClick={expandAll}
                className="text-sm text-blue-600 hover:underline"
              >
                Expand All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={collapseAll}
                className="text-sm text-blue-600 hover:underline"
              >
                Collapse All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pagination controls */}
      {!loading && !loadErr && totalOrders > 0 && (
        <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>
              Showing {startIdx + 1}-{endIdx} of {totalOrders} orders
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={safePage <= 1}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs">
              Page {safePage} / {totalPages}
            </span>
            <button
              onClick={onNext}
              disabled={safePage >= totalPages}
              className="px-3 py-1 rounded border border-yellow-500 text-yellow-600 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading…</div>
      ) : loadErr ? (
        <div className="py-10 text-center text-red-600">{loadErr}</div>
      ) : currentOrders.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <div className="text-sm text-gray-500">
            {filteredGroups.length === 0 && statusFilter !== "All"
              ? `No allocations with status "${statusFilter}"`
              : "No allocations yet"
            }
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {currentOrders.map((grp) => {
            const isExpanded = expandedOrders.has(grp.orderId);
            
            // Calculate totals for collapsed view
            const totalTrays = grp.items.reduce((sum, r) => sum + Number(r.totalTrays || 0), 0);
            const totalEggs = grp.items.reduce((sum, r) => sum + Number(r.totalEggs || 0), 0);
            const farmerCount = new Set(grp.items.map(r => r.farmerName)).size;
            
            // Get all statuses
            const allStatuses = {};
            grp.items.forEach(r => {
              Object.entries(r.statusCounts || {}).forEach(([k, v]) => {
                allStatuses[k] = (allStatuses[k] || 0) + v;
              });
            });

            return (
              <div key={`order-${grp.orderId}`} className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Collapsible header */}
                <div
                  onClick={() => toggleExpand(grp.orderId)}
                  className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200 px-4 py-3 cursor-pointer hover:from-yellow-100 hover:to-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <IoChevronUp className="text-gray-600 text-xl flex-shrink-0" />
                    ) : (
                      <IoChevronDown className="text-gray-600 text-xl flex-shrink-0" />
                    )}
                    
                    <div>
                      <div className="text-base font-semibold text-gray-800">
                        Order <span className="text-primaryYellow">#{grp.orderId}</span>
                        {grp.orderStatus && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            grp.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                            grp.orderStatus === 'To Ship' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {grp.orderStatus}
                          </span>
                        )}
                      </div>
                      
                      {/* Summary info when collapsed */}
                      {!isExpanded && (
                        <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-3">
                          <span>{farmerCount} farmer{farmerCount > 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{grp.items.length} batch{grp.items.length > 1 ? 'es' : ''}</span>
                          <span>•</span>
                          <span className="font-semibold">{totalTrays} trays ({totalEggs.toLocaleString()} eggs)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status badges when collapsed */}
                  {!isExpanded && Object.keys(allStatuses).length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {Object.entries(allStatuses).map(([k, v]) => allocStatusBadge(k, v))}
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="bg-white">
                    {/* Column headers */}
                    <div className="flex items-center border-b border-gray-300 px-4 py-3 text-sm font-semibold text-yellow-400 bg-gray-50">
                      <div className="flex-1 text-center">Farmer</div>
                      <div className="w-32 text-center">Produced</div>
                      <div className="w-32 text-center">Freshness</div>
                      <div className="w-24 text-center">Days Left</div>
                      <div className="w-28 text-center">≈ Trays</div>
                      <div className="w-32 text-center">Eggs</div>
                      <div className="w-[280px] text-center">Size Breakdown</div>
                      <div className="w-48 text-center">Status</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-gray-200">
                      {grp.items.map((r, i) => (
                        <div
                          key={`${r.farmerId}-${r.produced}-${i}`}
                          className="flex items-center px-4 py-3 text-sm hover:bg-gray-50"
                        >
                          <div className="flex-1 text-gray-900 text-center">{r.farmerName}</div>
                          <div className="w-32 text-gray-700 text-center text-xs">{fmtDate(r.produced)}</div>
                          <div className="w-32 text-center">
                            <span className={freshnessPill(r.freshnessStatus)}>
                              {r.freshnessStatus}
                            </span>
                          </div>
                          <div className="w-24 text-center">
                            <span className={`font-semibold ${
                              (r.daysToExpiry ?? 999) < 7 ? 'text-red-600' :
                              (r.daysToExpiry ?? 999) < 14 ? 'text-amber-600' :
                              'text-green-600'
                            }`}>
                              {r.daysToExpiry ?? "—"}
                            </span>
                          </div>
                          <div className="w-28 text-gray-700 text-center">{r.totalTrays}</div>
                          <div className="w-32 text-gray-700 text-center">{(r.totalEggs ?? 0).toLocaleString()}</div>

                          {/* Size breakdown - compact */}
                          <div className="w-[280px] px-2">
                            <div className="rounded-lg border border-gray-300 overflow-hidden text-xs">
                              <div className="grid grid-cols-3 bg-gray-50 font-semibold">
                                <div className="px-2 py-1 text-center">Size</div>
                                <div className="px-2 py-1 text-center">Trays</div>
                                <div className="px-2 py-1 text-center">Eggs</div>
                              </div>
                              <div className="divide-y divide-gray-200">
                                {(r.sizeBreakdown || []).map((s) => (
                                  <div key={s.size} className="grid grid-cols-3">
                                    <div className="px-2 py-1 text-center">{s.size}</div>
                                    <div className="px-2 py-1 text-center">{s.trays}</div>
                                    <div className="px-2 py-1 text-center">{s.eggs.toLocaleString()}</div>
                                  </div>
                                ))}
                                {(!r.sizeBreakdown || r.sizeBreakdown.length === 0) && (
                                  <div className="px-2 py-1 text-center text-gray-500">—</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status badges */}
                          <div className="w-48 flex flex-col items-center gap-1">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {Object.entries(r.statusCounts || {}).length === 0 ? (
                                <span className="text-xs text-gray-500">—</span>
                              ) : (
                                Object.entries(r.statusCounts).map(([k, v]) => allocStatusBadge(k, v))
                              )}
                            </div>
                            {r.topAllocStatus && (
                              <div className="text-xs text-gray-500">
                                Top: <span className="font-semibold">{r.topAllocStatus}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order summary footer */}
                    <div className="border-t border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700">
                      <div className="flex justify-between items-center">
                        <span>
                          <span className="font-semibold">Total:</span> {farmerCount} farmer{farmerCount > 1 ? 's' : ''} • {grp.items.length} batch{grp.items.length > 1 ? 'es' : ''}
                        </span>
                        <span className="font-semibold">
                          {totalTrays} trays • {totalEggs.toLocaleString()} eggs
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// // components/admin/tables/OrderAllocation.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { listAllocationGroups } from "@/services/OrderNAllocation";

// const STATUS_SORT_RANK = { Expired: 1, Expiring: 2, "Sell Soon": 3, Fresh: 4 };

// function freshnessPill(status) {
//   const base =
//     "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold border";
//   const s = (status || "").toLowerCase();
//   if (s === "expired") return `${base} bg-slate-200 text-slate-800 border-slate-300`;
//   if (s === "expiring") return `${base} bg-red-100 text-red-700 border-red-300`;
//   if (s === "sell soon") return `${base} bg-amber-100 text-amber-700 border-amber-300`;
//   if (s === "fresh") return `${base} bg-green-100 text-green-700 border-green-300`;
//   return `${base} bg-gray-100 text-gray-700 border-gray-300`;
// }

// function allocStatusBadge(kind, count) {
//   const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold";
//   const k = (kind || "").toLowerCase();
//   const cls =
//     k === "pending"
//       ? "bg-yellow-100 text-yellow-700"
//       : k === "confirmed"
//       ? "bg-green-100 text-green-700"
//       : k === "rejected"
//       ? "bg-red-100 text-red-700"
//       : k === "fulfilled"
//       ? "bg-indigo-100 text-indigo-700"
//       : "bg-gray-100 text-gray-700";
//   return (
//     <span key={kind} className={`${base} ${cls}`}>
//       {kind} <span className="font-bold">{count}</span>
//     </span>
//   );
// }

// export default function EggAllocationHistory({
//   orderId = null, // filter to a single order (recommended on OrderStatus page)
//   farmerId = null,
//   dateFrom = null,
//   dateTo = null,
//   reloadKey = 0,
// }) {
//   const [rows, setRows] = useState([]);
//   const [loadErr, setLoadErr] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fmtDate = (d) =>
//     d
//       ? new Date(d).toLocaleDateString(undefined, {
//           year: "numeric",
//           month: "short",
//           day: "2-digit",
//         })
//       : "—";

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setLoadErr(null);
//         const data = await listAllocationGroups({ orderId, farmerId, dateFrom, dateTo });
//         if (!alive) return;
//         setRows(Array.isArray(data) ? data : data?.rows || []);
//       } catch (e) {
//         if (!alive) return;
//         setLoadErr(e?.message || "Failed to load allocation history.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [orderId, farmerId, dateFrom, dateTo, reloadKey]);

//   // Sort like EggSupply: freshness bucket, days left, produced date
//   const sorted = useMemo(() => {
//     const copy = [...rows];
//     copy.sort((a, b) => {
//       const ra = STATUS_SORT_RANK[a.freshnessStatus] ?? 999;
//       const rb = STATUS_SORT_RANK[b.freshnessStatus] ?? 999;
//       if (ra !== rb) return ra - rb;
//       const da = a.daysToExpiry ?? 99999;
//       const db = b.daysToExpiry ?? 99999;
//       if (da !== db) return da - db;
//       return new Date(a.produced).getTime() - new Date(b.produced).getTime();
//     });
//     return copy;
//   }, [rows]);

//   // Group by order for readability when multiple orders are displayed
//   const groupedByOrder = useMemo(() => {
//     const map = new Map();
//     for (const r of sorted) {
//       const key = r.orderId ?? 0;
//       if (!map.has(key)) map.set(key, { orderId: key, orderStatus: r.orderStatus, items: [] });
//       map.get(key).items.push(r);
//     }
//     return Array.from(map.values());
//   }, [sorted]);

//   return (
//     <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
//       <div className="mb-3 flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-800">
//           Egg Allocation (Grouped){orderId ? ` — Order #${orderId}` : ""}
//         </h3>
//       </div>

//       {loading ? (
//         <div className="py-10 text-center text-gray-500">Loading…</div>
//       ) : loadErr ? (
//         <div className="py-10 text-center text-red-600">{loadErr}</div>
//       ) : groupedByOrder.length === 0 ? (
//         <div className="py-10 text-center text-gray-500">No allocations yet</div>
//       ) : (
//         groupedByOrder.map((grp) => (
//           <div key={`order-${grp.orderId}`} className="mb-6">
//             {/* Order header */}
//             <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-3 mb-3">
//               <div className="text-sm sm:text-base font-semibold text-gray-800">
//                 Order <span className="text-primaryYellow">#{grp.orderId}</span>
//                 {grp.orderStatus ? (
//                   <span className="ml-2 text-gray-500">• {grp.orderStatus}</span>
//                 ) : null}
//               </div>
//               <div className="text-xs text-gray-500">Groups: {grp.items.length}</div>
//             </div>

//             {/* Column headers */}
//             <div className="flex items-center border-b border-gray-300 px-6 py-3 text-[15px] font-semibold text-yellow-400">
//               <div className="flex-1 text-center">Farmer</div>
//               <div className="w-40 text-center">Produced</div>
//               <div className="w-40 text-center">Freshness</div>
//               <div className="w-28 text-center">Days Left</div>
//               <div className="w-36 text-center">≈ Total Trays</div>
//               <div className="w-40 text-center">Total Eggs</div>
//               <div className="w-[420px] text-center">Size Breakdown</div>
//               <div className="w-64 text-center">Allocation Status</div>
//             </div>

//             {/* Rows */}
//             <div className="divide-y divide-gray-200">
//               {grp.items.map((r, i) => (
//                 <div
//                   key={`${r.farmerId}-${r.produced}-${i}`}
//                   className="flex items-start px-6 py-4 text-[15px]"
//                 >
//                   <div className="flex-1 text-gray-900 text-center">{r.farmerName}</div>
//                   <div className="w-40 text-gray-700 text-center">{fmtDate(r.produced)}</div>
//                   <div className="w-40 text-center">
//                     <span className={freshnessPill(r.freshnessStatus)}>
//                       {r.freshnessStatus}
//                     </span>
//                   </div>
//                   <div className="w-28 text-gray-700 text-center">
//                     {r.daysToExpiry ?? "—"}
//                   </div>
//                   <div className="w-36 text-gray-700 text-center">{r.totalTrays}</div>
//                   <div className="w-40 text-gray-700 text-center">
//                     {(r.totalEggs ?? 0).toLocaleString()}
//                   </div>

//                   {/* Size breakdown mini-table */}
//                   <div className="w-[420px]">
//                     <div className="rounded-xl border border-gray-300 overflow-hidden">
//                       <div className="grid grid-cols-3 bg-gray-50 text-gray-700 font-semibold text-sm">
//                         <div className="px-3 py-2 text-center">Size</div>
//                         <div className="px-3 py-2 text-center">≈ Trays</div>
//                         <div className="px-3 py-2 text-center">Eggs</div>
//                       </div>
//                       <div className="divide-y divide-gray-200">
//                         {(r.sizeBreakdown || []).map((s) => (
//                           <div key={s.size} className="grid grid-cols-3 text-gray-800">
//                             <div className="px-3 py-2 text-center">{s.size}</div>
//                             <div className="px-3 py-2 text-center">{s.trays}</div>
//                             <div className="px-3 py-2 text-center">
//                               {(s.eggs ?? 0).toLocaleString()}
//                             </div>
//                           </div>
//                         ))}
//                         {(!r.sizeBreakdown || r.sizeBreakdown.length === 0) && (
//                           <div className="px-3 py-2 text-center text-gray-500">—</div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Allocation status counts */}
//                   <div className="w-64 flex flex-col items-center gap-2">
//                     <div className="flex flex-wrap gap-1 justify-center">
//                       {Object.entries(r.statusCounts || {}).length === 0 ? (
//                         <span className="text-sm text-gray-500">—</span>
//                       ) : (
//                         Object.entries(r.statusCounts).map(([k, v]) =>
//                           allocStatusBadge(k, v)
//                         )
//                       )}
//                     </div>
//                     {r.topAllocStatus && (
//                       <div className="text-xs text-gray-500">
//                         Top status: <span className="font-semibold">{r.topAllocStatus}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

// // components/admin/tables/OrderAllocation.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { listAllocationGroups } from "@/services/OrderNAllocation";

// const STATUS_SORT_RANK = { Expired: 1, Expiring: 2, "Sell Soon": 3, Fresh: 4 };

// function freshnessPill(status) {
//   const base =
//     "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold border";
//   const s = (status || "").toLowerCase();
//   if (s === "expired") return `${base} bg-slate-200 text-slate-800 border-slate-300`;
//   if (s === "expiring") return `${base} bg-red-100 text-red-700 border-red-300`;
//   if (s === "sell soon") return `${base} bg-amber-100 text-amber-700 border-amber-300`;
//   if (s === "fresh") return `${base} bg-green-100 text-green-700 border-green-300`;
//   return `${base} bg-gray-100 text-gray-700 border-gray-300`;
// }

// function allocStatusBadge(kind, count) {
//   const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold";
//   const k = (kind || "").toLowerCase();
//   const cls =
//     k === "pending"
//       ? "bg-yellow-100 text-yellow-700"
//       : k === "confirmed"
//       ? "bg-green-100 text-green-700"
//       : k === "rejected"
//       ? "bg-red-100 text-red-700"
//       : k === "fulfilled"
//       ? "bg-indigo-100 text-indigo-700"
//       : "bg-gray-100 text-gray-700";
//   return (
//     <span key={kind} className={`${base} ${cls}`}>
//       {kind} <span className="font-bold">{count}</span>
//     </span>
//   );
// }

// export default function EggAllocationHistory({
//   orderId = null,     // pass an order id to filter to a single order (recommended on OrderStatus page)
//   farmerId = null,
//   dateFrom = null,
//   dateTo = null,
//   reloadKey = 0,
// }) {
//   const [rows, setRows] = useState([]);
//   const [loadErr, setLoadErr] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fmtDate = (d) =>
//     d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : "—";

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setLoadErr(null);
//         const data = await listAllocationGroups({ orderId, farmerId, dateFrom, dateTo });
//         if (!alive) return;
//         setRows(Array.isArray(data) ? data : data?.rows || []);
//       } catch (e) {
//         if (!alive) return;
//         setLoadErr(e?.message || "Failed to load allocation history.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [orderId, farmerId, dateFrom, dateTo, reloadKey]);

//   // Sort groups similar to EggSupply: freshness bucket, days left, produced date
//   const sorted = useMemo(() => {
//     const copy = [...rows];
//     copy.sort((a, b) => {
//       const ra = STATUS_SORT_RANK[a.freshnessStatus] ?? 999;
//       const rb = STATUS_SORT_RANK[b.freshnessStatus] ?? 999;
//       if (ra !== rb) return ra - rb;
//       const da = a.daysToExpiry ?? 99999;
//       const db = b.daysToExpiry ?? 99999;
//       if (da !== db) return da - db;
//       return new Date(a.produced).getTime() - new Date(b.produced).getTime();
//     });
//     return copy;
//   }, [rows]);

//   // Optional: group by orderId so multiple orders show clearly
//   const groupedByOrder = useMemo(() => {
//     const map = new Map();
//     for (const r of sorted) {
//       const key = r.orderId ?? 0;
//       if (!map.has(key)) map.set(key, { orderId: key, orderStatus: r.orderStatus, items: [] });
//       map.get(key).items.push(r);
//     }
//     return Array.from(map.values());
//   }, [sorted]);

//   return (
//     <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
//       <div className="mb-3 flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-800">
//           Egg Allocation (Grouped){orderId ? ` — Order #${orderId}` : ""}
//         </h3>
//       </div>

//       {loading ? (
//         <div className="py-10 text-center text-gray-500">Loading…</div>
//       ) : loadErr ? (
//         <div className="py-10 text-center text-red-600">{loadErr}</div>
//       ) : groupedByOrder.length === 0 ? (
//         <div className="py-10 text-center text-gray-500">No allocations yet</div>
//       ) : (
//         groupedByOrder.map((grp) => (
//           <div key={`order-${grp.orderId}`} className="mb-6">
//             {/* Order header */}
//             <div className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-3 mb-3">
//               <div className="text-sm sm:text-base font-semibold text-gray-800">
//                 Order <span className="text-primaryYellow">#{grp.orderId}</span>
//                 {grp.orderStatus ? (
//                   <span className="ml-2 text-gray-500">• {grp.orderStatus}</span>
//                 ) : null}
//               </div>
//               <div className="text-xs text-gray-500">Groups: {grp.items.length}</div>
//             </div>

//             {/* Column headers */}
//             <div className="flex items-center border-b border-gray-300 px-6 py-3 text-[15px] font-semibold text-yellow-400">
//               <div className="flex-1 text-center">Farmer</div>
//               <div className="w-40 text-center">Produced</div>
//               <div className="w-40 text-center">Freshness</div>
//               <div className="w-28 text-center">Days Left</div>
//               <div className="w-36 text-center">≈ Total Trays</div>
//               <div className="w-40 text-center">Total Eggs</div>
//               <div className="w-[420px] text-center">Size Breakdown</div>
//               <div className="w-64 text-center">Allocation Status</div>
//             </div>

//             {/* Rows */}
//             <div className="divide-y divide-gray-200">
//               {grp.items.map((r, i) => (
//                 <div key={`${r.farmerId}-${r.produced}-${i}`} className="flex items-start px-6 py-4 text-[15px]">
//                   <div className="flex-1 text-gray-900 text-center">{r.farmerName}</div>
//                   <div className="w-40 text-gray-700 text-center">{fmtDate(r.produced)}</div>
//                   <div className="w-40 text-center">
//                     <span className={freshnessPill(r.freshnessStatus)}>{r.freshnessStatus}</span>
//                   </div>
//                   <div className="w-28 text-gray-700 text-center">{r.daysToExpiry ?? "—"}</div>
//                   <div className="w-36 text-gray-700 text-center">{r.totalTrays}</div>
//                   <div className="w-40 text-gray-700 text-center">{r.totalEggs.toLocaleString()}</div>

//                   {/* Size breakdown mini-table */}
//                   <div className="w-[420px]">
//                     <div className="rounded-xl border border-gray-300 overflow-hidden">
//                       <div className="grid grid-cols-3 bg-gray-50 text-gray-700 font-semibold text-sm">
//                         <div className="px-3 py-2 text-center">Size</div>
//                         <div className="px-3 py-2 text-center">Trays</div>
//                         <div className="px-3 py-2 text-center">Eggs</div>
//                       </div>
//                       <div className="divide-y divide-gray-200">
//                         {(r.sizeBreakdown || []).map((s) => (
//                           <div key={s.size} className="grid grid-cols-3 text-gray-800">
//                             <div className="px-3 py-2 text-center">{s.size}</div>
//                             <div className="px-3 py-2 text-center">{s.trays}</div>
//                             <div className="px-3 py-2 text-center">{s.eggs.toLocaleString()}</div>
//                           </div>
//                         ))}
//                         {(!r.sizeBreakdown || r.sizeBreakdown.length === 0) && (
//                           <div className="px-3 py-2 text-center text-gray-500">—</div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Allocation status counts */}
//                   <div className="w-64 flex flex-col items-center gap-2">
//                     <div className="flex flex-wrap gap-1 justify-center">
//                       {Object.entries(r.statusCounts).length === 0
//                         ? <span className="text-sm text-gray-500">—</span>
//                         : Object.entries(r.statusCounts).map(([k, v]) => allocStatusBadge(k, v))}
//                     </div>
//                     {r.topAllocStatus && (
//                       <div className="text-xs text-gray-500">
//                         Top status: <span className="font-semibold">{r.topAllocStatus}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

// // components/admin/tables/OrderAllocation.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { listAllocationGroups } from "@/services/OrderNAllocation";
// import OrderAllocationRow from "../../../components/admin/tables/EggAllocation";

// const FRESH_SORT_RANK = { Expired: 1, Expiring: 2, "Sell Soon": 3, Fresh: 4 };

// function freshnessClasses(status) {
//   const base =
//     "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold";
//   const s = (status || "").toLowerCase();
//   if (s === "expired") return `${base} bg-slate-200 text-slate-800 border border-slate-300`;
//   if (s === "expiring") return `${base} bg-red-100 text-red-700 border border-red-300`;
//   if (s === "sell soon") return `${base} bg-amber-100 text-amber-700 border border-amber-300`;
//   if (s === "fresh") return `${base} bg-green-100 text-green-700 border border-green-300`;
//   return `${base} bg-gray-100 text-gray-700 border border-gray-300`;
// }

// function allocBadge(status, count) {
//   const base = "rounded-full border px-2 py-0.5 text-xs font-semibold";
//   const s = (status || "").toLowerCase();
//   let cls = "border-gray-300 text-gray-700 bg-gray-50";
//   if (s === "pending") cls = "border-yellow-300 text-yellow-800 bg-yellow-50";
//   if (s === "confirmed") cls = "border-green-300 text-green-800 bg-green-50";
//   if (s === "rejected") cls = "border-red-300 text-red-800 bg-red-50";
//   if (s === "fulfilled") cls = "border-blue-300 text-blue-800 bg-blue-50";
//   return (
//     <span key={status} className={`${base} ${cls}`}>
//       {status} · {count}
//     </span>
//   );
// }

// export default function EggAllocationHistory({
//   orderId = null,
//   farmerId = null,
//   dateFrom = null,
//   dateTo = null,
//   reloadKey = 0,
// }) {
//   const [rows, setRows] = useState([]);
//   const [loadErr, setLoadErr] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // drill-down modal state
//   const [openRows, setOpenRows] = useState(false);
//   const [activeGroup, setActiveGroup] = useState(null); // { farmerId, farmerName, produced }

//   const fmtDate = (d) =>
//     d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : "—";

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setLoadErr(null);
//         const data = await listAllocationGroups({ orderId, farmerId, dateFrom, dateTo });
//         if (!alive) return;
//         setRows(Array.isArray(data) ? data : (data?.rows || []));
//       } catch (e) {
//         if (!alive) return;
//         setLoadErr(e?.message || "Failed to load allocation history.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [orderId, farmerId, dateFrom, dateTo, reloadKey]);

//   // Sort like EggSupply: freshness, days to expiry, produced
//   const sorted = useMemo(() => {
//     const copy = [...rows];
//     copy.sort((a, b) => {
//       const sa = a.freshnessStatus ?? a.status;
//       const sb = b.freshnessStatus ?? b.status;
//       const ra = FRESH_SORT_RANK[sa] ?? 999;
//       const rb = FRESH_SORT_RANK[sb] ?? 999;
//       if (ra !== rb) return ra - rb;

//       const da = (a.daysToExpiry ?? a.days_to_expiry ?? 99999);
//       const db = (b.daysToExpiry ?? b.days_to_expiry ?? 99999);
//       if (da !== db) return da - db;

//       return new Date(a.produced).getTime() - new Date(b.produced).getTime();
//     });
//     return copy;
//   }, [rows]);

//   const openDrilldown = (g) => {
//     setActiveGroup(g);
//     setOpenRows(true);
//   };

//   return (
//     <>
//       <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
//         <div className="mb-3 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-800">
//             Egg Allocation (Grouped){orderId ? ` — Order #${orderId}` : ""}
//           </h3>
//         </div>

//         {/* Header */}
//         <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
//           <div className="flex-1 text-lg text-center">Farmer</div>
//           <div className="w-48 text-lg text-center">Produced</div>
//           <div className="w-40 text-lg text-center">Freshness</div>
//           <div className="w-32 text-lg text-center">Days Left</div>
//           <div className="w-40 text-lg text-center">Total Trays</div>
//           <div className="w-44 text-lg text-center">Total Eggs</div>
//           <div className="w-[420px] text-lg text-center">Size Breakdown</div>
//           <div className="w-[360px] text-lg text-center">Alloc Status</div>
//         </div>

//         <div className="divide-y divide-gray-200">
//           {loading ? (
//             <div className="py-10 text-center text-gray-500">Loading…</div>
//           ) : loadErr ? (
//             <div className="py-10 text-center text-red-600">{loadErr}</div>
//           ) : sorted.length === 0 ? (
//             <div className="py-10 text-center text-gray-500">No allocations yet</div>
//           ) : (
//             sorted.map((r, i) => {
//               const fresh = r.freshnessStatus ?? r.status;
//               return (
//                 <div key={`${r.farmerId}-${r.produced}-${i}`} className="flex items-start px-6 py-4 text-[15px]">
//                   <div className="flex-1 text-gray-900 text-center">{r.farmerName}</div>
//                   <div className="w-48 text-gray-700 text-center">{fmtDate(r.produced)}</div>
//                   <div className="w-40 text-center">
//                     <span className={freshnessClasses(fresh)}>{fresh}</span>
//                   </div>
//                   <div className="w-32 text-gray-700 text-center">{r.daysToExpiry ?? "—"}</div>
//                   <div className="w-40 text-gray-700 text-center">{r.totalTrays}</div>
//                   <div className="w-44 text-gray-700 text-center">{r.totalEggs.toLocaleString()}</div>

//                   {/* Size breakdown */}
//                   <div className="w-[420px]">
//                     <div className="rounded-xl border border-gray-300 overflow-hidden">
//                       <div className="grid grid-cols-3 bg-gray-50 text-gray-700 font-semibold text-sm">
//                         <div className="px-3 py-2 text-center">Size</div>
//                         <div className="px-3 py-2 text-center">Trays</div>
//                         <div className="px-3 py-2 text-center">Eggs</div>
//                       </div>
//                       <div className="divide-y divide-gray-200">
//                         {(r.sizeBreakdown || []).map((s) => (
//                           <div key={s.size} className="grid grid-cols-3 text-gray-800">
//                             <div className="px-3 py-2 text-center">{s.size}</div>
//                             <div className="px-3 py-2 text-center">{s.trays}</div>
//                             <div className="px-3 py-2 text-center">{s.eggs.toLocaleString()}</div>
//                           </div>
//                         ))}
//                         {(!r.sizeBreakdown || r.sizeBreakdown.length === 0) && (
//                           <div className="px-3 py-2 text-center text-gray-500">—</div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Allocation status badges */}
//                   <div className="w-[360px]">
//                     <div className="flex flex-wrap gap-2 justify-center">
//                       {r.statusCounts && Object.keys(r.statusCounts).length > 0 ? (
//                         Object.entries(r.statusCounts).map(([k, v]) => allocBadge(k, v))
//                       ) : (
//                         <span className="text-sm text-gray-500">—</span>
//                       )}
//                     </div>
//                     {r.topAllocStatus && (
//                       <div className="mt-2 text-center text-xs text-gray-500">
//                         Top status: <span className="font-semibold capitalize">{r.topAllocStatus}</span>
//                       </div>
//                     )}
//                   </div>

//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {/* Drill-down modal */}
//       {openRows && activeGroup && (
//         <OrderAllocationRow
//           open={openRows}
//           onClose={() => setOpenRows(false)}
//           farmerId={activeGroup.farmerId}
//           farmerName={activeGroup.farmerName}
//           produced={activeGroup.produced}
//           orderId={orderId}
//         />
//       )}
//     </>
//   );
// }


// import React, { useEffect, useMemo, useState } from "react";
// import { listAllocationGroups } from "@/services/OrderNAllocation";

// const STATUS_SORT_RANK = { Expired: 1, Expiring: 2, "Sell Soon": 3, Fresh: 4 };

// function statusClasses(status) {
//   const base = "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold";
//   const s = (status || "").toLowerCase();
//   if (s === "expired")  return `${base} bg-slate-200 text-slate-800 border border-slate-300`;
//   if (s === "expiring") return `${base} bg-red-100 text-red-700 border border-red-300`;
//   if (s === "sell soon")return `${base} bg-amber-100 text-amber-700 border border-amber-300`;
//   if (s === "fresh")    return `${base} bg-green-100 text-green-700 border border-green-300`;
//   return `${base} bg-gray-100 text-gray-700 border border-gray-300`;
// }

// export default function EggAllocationHistory({
//   orderId = null,
//   farmerId = null,
//   dateFrom = null,
//   dateTo = null,
//   reloadKey = 0,
// }) {
//   const [rows, setRows] = useState([]);
//   const [loadErr, setLoadErr] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fmtDate = (d) =>
//     d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : "—";

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true); setLoadErr(null);
//         const data = await listAllocationGroups({ orderId, farmerId, dateFrom, dateTo });
//         if (!alive) return;
//         setRows(data || []);
//       } catch (e) {
//         if (!alive) return;
//         setLoadErr(e?.message || "Failed to load allocation history.");
//       } finally { if (alive) setLoading(false); }
//     })();
//     return () => { alive = false; };
//   }, [orderId, farmerId, dateFrom, dateTo, reloadKey]);

//   // sort like EggSupply (status bucket, days to expiry, produced)
//   const sorted = useMemo(() => {
//     const copy = [...rows];
//     copy.sort((a, b) => {
//       const ra = STATUS_SORT_RANK[a.status] ?? 999;
//       const rb = STATUS_SORT_RANK[b.status] ?? 999;
//       if (ra !== rb) return ra - rb;
//       const da = (a.daysToExpiry ?? 99999);
//       const db = (b.daysToExpiry ?? 99999);
//       if (da !== db) return da - db;
//       return new Date(a.produced).getTime() - new Date(b.produced).getTime();
//     });
//     return copy;
//   }, [rows]);

//   return (
//     <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
//       <div className="mb-3 flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-800">
//           Egg Allocation (Grouped){orderId ? ` — Order #${orderId}` : ""}
//         </h3>
//       </div>

//       {/* Header */}
//       <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
//         <div className="flex-1 text-lg text-center">Farmer</div>
//         <div className="w-48 text-lg text-center">Produced</div>
//         <div className="w-40 text-lg text-center">Status</div>
//         <div className="w-32 text-lg text-center">Days Left</div>
//         <div className="w-40 text-lg text-center">Total Trays</div>
//         <div className="w-44 text-lg text-center">Total Eggs</div>
//         <div className="w-[420px] text-lg text-center">Size Breakdown</div>
//       </div>

//       <div className="divide-y divide-gray-200">
//         {loading ? (
//           <div className="py-10 text-center text-gray-500">Loading…</div>
//         ) : loadErr ? (
//           <div className="py-10 text-center text-red-600">{loadErr}</div>
//         ) : sorted.length === 0 ? (
//           <div className="py-10 text-center text-gray-500">No allocations yet</div>
//         ) : (
//           sorted.map((r, i) => (
//             <div key={`${r.farmerId}-${r.produced}-${i}`} className="flex items-start px-6 py-4 text-[15px]">
//               <div className="flex-1 text-gray-900 text-center">{r.farmerName}</div>
//               <div className="w-48 text-gray-700 text-center">{fmtDate(r.produced)}</div>
//               <div className="w-40 text-center"><span className={statusClasses(r.status)}>{r.status}</span></div>
//               <div className="w-32 text-gray-700 text-center">{r.daysToExpiry ?? "—"}</div>
//               <div className="w-40 text-gray-700 text-center">{r.totalTrays}</div>
//               <div className="w-44 text-gray-700 text-center">{r.totalEggs.toLocaleString()}</div>

//               <div className="w-[420px]">
//                 <div className="rounded-xl border border-gray-300 overflow-hidden">
//                   <div className="grid grid-cols-3 bg-gray-50 text-gray-700 font-semibold text-sm">
//                     <div className="px-3 py-2 text-center">Size</div>
//                     <div className="px-3 py-2 text-center">Trays</div>
//                     <div className="px-3 py-2 text-center">Eggs</div>
//                   </div>
//                   <div className="divide-y divide-gray-200">
//                     {(r.sizeBreakdown || []).map((s) => (
//                       <div key={s.size} className="grid grid-cols-3 text-gray-800">
//                         <div className="px-3 py-2 text-center">{s.size}</div>
//                         <div className="px-3 py-2 text-center">{s.trays}</div>
//                         <div className="px-3 py-2 text-center">{s.eggs.toLocaleString()}</div>
//                       </div>
//                     ))}
//                     {(!r.sizeBreakdown || r.sizeBreakdown.length === 0) && (
//                       <div className="px-3 py-2 text-center text-gray-500">—</div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
