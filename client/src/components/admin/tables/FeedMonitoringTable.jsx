import React, { useEffect, useMemo, useState } from "react";
import { fetchFeedAllocations } from "@/services/FeedMonitoring";

export default function FeedMonitoringTable({ refreshKey = 0 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await fetchFeedAllocations();
        if (active) {
          setRows(data);
        }
      } catch (e) {
        if (active) setErr(e?.message || "Failed to load allocations.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refreshKey]);

  // Group rows by farmer for better visual organization
  const groupedByFarmer = useMemo(() => {
    const groups = {};
    rows.forEach(row => {
      if (!groups[row.farmer]) {
        groups[row.farmer] = [];
      }
      groups[row.farmer].push(row);
    });
    return groups;
  }, [rows]);

  const header = "text-[#F6C32B] text-[16px] font-semibold";
  const cell = "text-[15px] text-gray-700 px-4 py-3";
  const grid = "grid grid-cols-[1.3fr_1fr_1.1fr_0.9fr_1fr_1fr] gap-x-4 items-center";

  return (
    <div className="mt-6 rounded-lg bg-white border border-gray-300 shadow-sm">
      {/* Header with title */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-200">
        <h2 className="text-[22px] font-bold text-gray-700">
          Feed Allocation History
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          View all feed allocations to farmers
        </p>
      </div>

      {/* Table Header */}
      <div className={`px-6 py-4 ${grid} bg-gray-50`}>
        <div className={header}>Farmer</div>
        <div className={header}>Feed Brand</div>
        <div className={header}>Feed Type</div>
        <div className={`${header} text-center`}>Remaining (kg)</div>
        <div className={`${header} text-center`}>Allocated (kg)</div>
        <div className={header}>Date</div>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t-2 border-[#F6C32B]" />

      {/* Body */}
      <div className="px-0">
        {loading && (
          <div className="px-6 py-8 text-sm text-gray-500 text-center">
            Loading allocations…
          </div>
        )}
        {!loading && err && (
          <div className="px-6 py-8 text-sm text-red-600 text-center">{err}</div>
        )}
        {!loading && !err && rows.length === 0 && (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <div className="text-sm text-gray-500">
              No allocations yet. Start by selecting farmers and feed above.
            </div>
          </div>
        )}

        {/* {!loading && !err && Object.entries(groupedByFarmer).map(([farmer, farmerRows], groupIndex) => (
          <div key={farmer} className={groupIndex > 0 ? 'border-t border-gray-200' : ''}>
            {farmerRows.map((r, index) => {
              const isFirstInGroup = index === 0;
              const isDepleted = Number(r.remainingKg) === 0;
              
              return (
                <div 
                  key={r.id} 
                  className={`px-6 ${grid} ${
                    index % 2 === 0 ? 'bg-[#faf4df]' : 'bg-white'
                  } ${isDepleted ? 'opacity-60' : ''}`}
                >
                  <div className={`${cell} ${isFirstInGroup ? 'font-semibold' : ''}`}>
                    {r.farmer}
                  </div>
                  <div className={cell}>{r.brand}</div>
                  <div className={cell}>{r.type}</div>
                  <div className={`${cell} text-center font-semibold ${
                    isDepleted ? 'text-red-500' : 'text-gray-700'
                  }`}>
                    {r.remainingKg}
                    {isDepleted && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Depleted
                      </span>
                    )}
                  </div>
                  <div className={`${cell} text-center font-semibold`}>
                    {r.allocatedKg}
                  </div>
                  <div className={cell}>
                    {r.allocationDate
                      ? new Date(r.allocationDate).toLocaleDateString("en-US", {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        ))} */}
        {!loading && !err && Object.entries(groupedByFarmer).map(([farmer, farmerRows], groupIndex) => (
          <div key={farmer} className={groupIndex > 0 ? 'border-t border-gray-200' : ''}>
            {farmerRows.map((r, index) => {
              const isFirstInGroup = index === 0;
              const isDepleted = Number(r.remainingKg) === 0;
              
              return (
                <div 
                  key={r.id} 
                  className={`px-6 ${grid} ${
                    index % 2 === 0 ? 'bg-[#faf4df]' : 'bg-white'
                  }`}
                >
                  <div className={`${cell} ${isFirstInGroup ? 'font-semibold' : ''}`}>
                    {r.farmer}
                  </div>
                  <div className={cell}>{r.brand}</div>
                  <div className={cell}>{r.type}</div>
                  <div className={`${cell} text-center font-semibold ${
                    isDepleted ? 'text-red-500' : 'text-gray-700'
                  }`}>
                    {r.remainingKg}
                    {isDepleted && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        DEPLETED
                      </span>
                    )}
                  </div>
                  <div className={`${cell} text-center font-semibold`}>
                    {r.allocatedKg}
                  </div>
                  <div className={cell}>
                    {r.allocationDate
                      ? new Date(r.allocationDate).toLocaleDateString("en-US", {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer summary */}
      {!loading && !err && rows.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Total allocations: <span className="font-semibold">{rows.length}</span>
            {' • '}
            Total farmers: <span className="font-semibold">{Object.keys(groupedByFarmer).length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { fetchFeedAllocations } from "@/services/FeedMonitoring";

// export default function FeedMonitoringTable({ refreshKey = 0 }) {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     let active = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr("");
//         const data = await fetchFeedAllocations();
//         if (active) {
//           setRows(data);
//         }
//       } catch (e) {
//         if (active) setErr(e?.message || "Failed to load allocations.");
//       } finally {
//         if (active) setLoading(false);
//       }
//     })();
//     return () => { active = false; };
//   }, [refreshKey]);

//   const header = "text-[#F6C32B] text-[16px] font-semibold";
//   const cell = "text-[16px] text-gray-700 px-4 py-4";
//   const grid = "grid grid-cols-[1.15fr_0.9fr_1fr_1.05fr_1.15fr_1.05fr] items-center";

//   return (
//     <div className="mt-6 rounded-lg bg-white border border-gray-300 shadow-sm pb-5">
//       {/* Header */}
//       <div className={`px-6 py-4 ${grid}`}>
//         <div className={header}>Farmer</div>
//         <div className={header}>Feed Brand</div>
//         <div className={header}>Feed Type</div>
//         <div className={`${header} text-center`}>Remaining Feeds (kg)</div>
//         <div className={`${header} text-center`}>Allocated Feeds (kg)</div>
//         <div className={header}>Allocation Date</div>
//       </div>

//       {/* Divider */}
//       <div className="mx-6 border-t-2 border-[#F6C32B]" />

//       {/* Body */}
//       <div className="px-0">
//         {loading && (
//           <div className="px-6 py-4 text-sm text-gray-500">Loading allocations…</div>
//         )}
//         {!loading && err && (
//           <div className="px-6 py-4 text-sm text-red-600">{err}</div>
//         )}
//         {!loading && !err && rows.length === 0 && (
//           <div className="px-6 py-4 text-sm text-gray-500">No allocations found.</div>
//         )}

//         {!loading &&
//           !err &&
//           rows.map((r, index) => (
//             <div 
//               key={r.id} 
//               className={`px-6 ${grid} ${
//                 index % 2 === 0 ? 'bg-[#faf4df]' : 'bg-white'
//               }`}
//             >
//               <div className={cell}>{r.farmer}</div>
//               <div className={cell}>{r.brand}</div>
//               <div className={cell}>{r.type}</div>
//               <div className={`${cell} text-center`}>{r.remainingKg}</div>
//               <div className={`${cell} text-center`}>{r.allocatedKg}</div>
//               <div className={cell}>
//                 {r.allocationDate
//                   ? new Date(r.allocationDate).toLocaleDateString("en-US")
//                   : "—"}
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// }

