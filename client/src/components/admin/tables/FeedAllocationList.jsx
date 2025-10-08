// import React, { useEffect, useMemo, useState } from "react";
// import { IoSearchOutline } from "react-icons/io5";
// import { fetchFeedPurchases } from "@/services/feedmonitoring";

// export default function FeedAllocationList({ onSelectPurchase, selectedPurchaseId, refreshKey = 0 }) {
//   const [q, setQ] = useState("");
//   const [rowsRaw, setRowsRaw] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     let active = true;
//     (async () => {
//       try {
//         setLoading(true);
//         const data = await fetchFeedPurchases();
//         if (active) setRowsRaw(data);
//       } catch (e) {
//         if (active) setErr(e?.message || "Failed to load purchases.");
//       } finally {
//         if (active) setLoading(false);
//       }
//     })();
//     return () => { active = false; };
//   }, [refreshKey]);

//   // hide zero or negative remaining
//   const filteredByRemaining = useMemo(
//     () => (rowsRaw || []).filter(r => Number(r.amountKg) > 0),
//     [rowsRaw]
//   );

//    const rows = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return filteredByRemaining;
//     return filteredByRemaining.filter(
//       (r) =>
//         r.name?.toLowerCase().includes(s) ||
//         r.brand?.toLowerCase().includes(s) ||
//         r.form?.toLowerCase().includes(s)
//     );
//   }, [q, filteredByRemaining]);

//   const header = "text-[#F6C32B] text-[16px] font-semibold";
//   const cell = "text-[16px] text-gray-700 bg-[#faf4df] px-2 py-3";
//   const grid = "grid grid-cols-[60px_1.1fr_1fr_1fr_1fr] items-center";

//   return (
//     <div className="rounded-lg bg-white border border-gray-300 shadow-sm">
//       <div className="flex items-center justify-between px-6 pt-5">
//         <div className="flex items-center gap-3">
//           <h2 className="text-[20px] font-semibold text-gray-700">
//             Select Feed Purchase
//           </h2>
//           <span className="bg-gray-400 text-white text-[12px] font-semibold px-3 py-1 rounded-full">
//             STEP 2
//           </span>
//         </div>
//         <div className="relative">
//           <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
//           <input
//             type="text"
//             placeholder="Search"
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             className="h-9 w-[240px] pl-9 pr-3 rounded-lg border border-gray-300 bg-gray-50 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-300"
//           />
//         </div>
//       </div>

//       <div className={`px-6 mt-4 ${grid}`}>
//         <div className="flex justify-center">
//           {/* <span className="text-[#F6C32B] text-[14px] font-semibold">SELECT</span> */}
//         </div>
//         <div className={header}>Name</div>
//         <div className={header}>Brand</div>
//         <div className={header}>Form</div>
//         <div className={`${header} text-right`}>Amount (kg)</div>
//       </div>

//       <div className="mx-6 mt-2 border-t-2 border-[#F6C32B]" />

//       <div className="px-6 py-2 space-y-1">
//         {loading && <div className="text-gray-500 text-sm py-4">Loading purchases…</div>}
//         {!loading && err && <div className="text-red-600 text-sm py-4">{err}</div>}
//         {!loading && !err && rows.length === 0 && (
//           <div className="text-gray-500 text-sm py-4">No purchases found.</div>
//         )}

//         {!loading && !err && rows.map((r) => {
//           const isSelected = selectedPurchaseId === r.id;
//           return (
//             <div 
//               key={r.id} 
//               className={`${grid} cursor-pointer rounded-lg transition-all ${
//                 isSelected 
//                   ? 'bg-yellow-100 border-l-4 border-[#F6C32B] shadow-md' 
//                   : 'hover:bg-yellow-50'
//               }`}
//               onClick={() => onSelectPurchase?.(r)}
//             >
//               <div className={`${cell} flex items-center justify-center`}>
//                 <input
//                   type="radio"
//                   name="purchase"
//                   checked={isSelected}
//                   onChange={() => onSelectPurchase?.(r)}
//                   className="h-5 w-5 accent-[#F6C32B] cursor-pointer"
//                   onClick={(e) => e.stopPropagation()}
//                 />
//               </div>
//               <div className={cell}>{r.name}</div>
//               <div className={cell}>{r.brand}</div>
//               <div className={cell}>{r.form}</div>
//               <div className={`${cell} text-right font-semibold`}>{r.amountKg}</div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { fetchFeedPurchases } from "@/services/feedmonitoring";

export default function FeedAllocationList({ onSelectPurchase, selectedPurchaseId, refreshKey = 0 }) {
  const [q, setQ] = useState("");
  const [rowsRaw, setRowsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchFeedPurchases();
        if (active) setRowsRaw(data);
      } catch (e) {
        if (active) setErr(e?.message || "Failed to load purchases.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refreshKey]);

  const filteredByRemaining = useMemo(
    () => (rowsRaw || []).filter(r => Number(r.amountKg) > 0),
    [rowsRaw]
  );

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return filteredByRemaining;
    return filteredByRemaining.filter(
      (r) =>
        r.name?.toLowerCase().includes(s) ||
        r.brand?.toLowerCase().includes(s) ||
        r.form?.toLowerCase().includes(s)
    );
  }, [q, filteredByRemaining]);

  const header = "text-[#F6C32B] text-[16px] font-semibold";
  const cell = "text-[16px] text-gray-700 bg-[#faf4df] px-2 py-3";
  const grid = "grid grid-cols-[60px_1.1fr_1fr_1fr_1fr] items-center";

  return (
    <div className="rounded-lg bg-white border border-gray-300 shadow-sm">
      <div className="flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-semibold text-gray-700">
            Select Feed Purchase
          </h2>
          <span className="bg-gray-400 text-white text-[12px] font-semibold px-3 py-1 rounded-full">
            STEP 2
          </span>
        </div>
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
          <input
            type="text"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 w-[240px] pl-9 pr-3 rounded-lg border border-gray-300 bg-gray-50 text-[14px] focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>
      </div>

      <div className={`px-6 mt-4 ${grid}`}>
        <div />
        <div className={header}>Name</div>
        <div className={header}>Brand</div>
        <div className={header}>Form</div>
        <div className={`${header} text-right`}>Amount (kg)</div>
      </div>

      <div className="mx-6 mt-2 border-t-2 border-[#F6C32B]" />

      <div className="px-6 py-2 space-y-1 pb-4">
        {loading && <div className="text-gray-500 text-sm py-4">Loading purchases…</div>}
        {!loading && err && <div className="text-red-600 text-sm py-4">{err}</div>}
        {!loading && !err && rows.length === 0 && (
          <div className="text-gray-500 text-sm py-4">No available purchases. All feeds have been fully allocated.</div>
        )}

        {!loading && !err && rows.map((r) => {
          const isSelected = selectedPurchaseId === r.id;
          return (
            <div 
              key={r.id} 
              className={`${grid} cursor-pointer rounded-lg transition-all ${
                isSelected 
                  ? 'bg-yellow-100 border-l-4 border-[#F6C32B] shadow-md' 
                  : 'hover:bg-yellow-50'
              }`}
              onClick={() => onSelectPurchase?.(r)}
            >
              <div className={`${cell} flex items-center justify-center`}>
                <input
                  type="radio"
                  name="purchase"
                  checked={isSelected}
                  onChange={() => onSelectPurchase?.(r)}
                  className="h-5 w-5 accent-[#F6C32B] cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className={cell}>{r.name}</div>
              <div className={cell}>{r.brand}</div>
              <div className={cell}>{r.form}</div>
              <div className={`${cell} text-right font-semibold`}>{r.amountKg}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}