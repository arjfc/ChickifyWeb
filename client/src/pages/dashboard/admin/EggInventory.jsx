import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoEyeOutline } from "react-icons/io5";

export default function EggSupplyPage() {
  const totals = useMemo(
    () => ({ XS: 10100, S: 2000, M: 2000, L: 2000, XL: 10100, J: 2000 }),
    []
  );

  // Mock rows
  const [rows] = useState([
    {
      id: "1",
      farmer: "Maria Lopez",
      date: "2025-10-01",
      batchId: "1",
      trayStocks: 32,
      sizeBreakdown: [
        { size: "XS", qty: 10 },
        { size: "S", qty: 6 },
        { size: "M", qty: 8 },
        { size: "L", qty: 5 },
        { size: "XL", qty: 3 },
      ],
    },
    {
      id: "2",
      farmer: "Flynn Roger",
      date: "2025-10-01",
      batchId: "2",
      trayStocks: 12,
      sizeBreakdown: [
        { size: "S", qty: 4 },
        { size: "M", qty: 5 },
        { size: "L", qty: 3 },
      ],
    },
    {
      id: "3",
      farmer: "Maria Lopez",
      date: "2025-09-29",
      batchId: "3",
      trayStocks: 18,
      sizeBreakdown: [
        { size: "XS", qty: 6 },
        { size: "S", qty: 4 },
        { size: "M", qty: 8 },
      ],
    },
    {
      id: "4",
      farmer: "Flynn Roger",
      date: "2025-09-27",
      batchId: "4",
      trayStocks: 9,
      sizeBreakdown: [
        { size: "M", qty: 5 },
        { size: "L", qty: 4 },
      ],
    },
  ]);

  // selection (no TS generics)
  const [selected, setSelected] = useState([]);
  const selectAllRef = useRef(null);
  const allChecked = selected.length === rows.length && rows.length > 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selected.length > 0 && selected.length < rows.length;
    }
  }, [selected, rows.length]);

  const toggleAll = () => {
    setSelected((prev) =>
      prev.length === rows.length ? [] : rows.map((r) => r.id)
    );
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const Stat = ({ label, value }) => (
    <div className="flex items-center gap-3 rounded-xl bg-gray-200 px-5 py-3">
      <span className="w-10 shrink-0 text-[15px] font-semibold text-gray-600">
        {label}
      </span>
      <span className="ml-auto text-2xl font-semibold text-primaryYellow">
        {value.toLocaleString()}
      </span>
    </div>
  );

  // Modal state — View More
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

  // NEW: Send Egg Request modal state
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ size: "", qty: "" });
  const eggSizes = ["XS", "S", "M", "L", "XL", "J"];

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  return (
    <div className="w-full">
      {/* Summary */}
      <div className="rounded-2xl bg-white border border-gray-300 p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Total Eggs Supply (All Farmers)
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <Stat label="XS:" value={totals.XS} />
            <Stat label="S:" value={totals.S} />
            <Stat label="M:" value={totals.M} />
          </div>
          <div className="space-y-4">
            <Stat label="L:" value={totals.L} />
            <Stat label="XL:" value={totals.XL} />
            <Stat label="J:" value={totals.J} />
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primaryYellow">
          Egg Supply per Farmer
        </h2>
        <button
          onClick={() => setRequestOpen(true)}
          className="rounded-lg bg-primaryYellow px-5 py-3 font-semibold text-white shadow hover:opacity-90"
        >
          Send Egg Request
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
          <div className="w-10 flex justify-center">
            <input
              ref={selectAllRef}
              type="checkbox"
              onChange={toggleAll}
              checked={allChecked}
              className="h-4 w-4 accent-yellow-400"
              aria-label="select-all"
            />
          </div>
          <div className="flex-1 text-lg pl-8 text-center">Farmer</div>
          <div className="w-48 text-lg text-center">Date</div>
          <div className="w-[22rem] max-w-[22rem] text-lg text-center">Batch ID</div>
          <div className="w-40 text-lg text-center">Stocks (tray)</div>
          <div className="w-36 text-lg text-center">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-200">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center px-6 py-4 text-[15px]">
              <div className="w-10 flex justify-center">
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() => toggleOne(r.id)}
                  className="h-4 w-4 accent-yellow-400"
                  aria-label={`select-${r.id}`}
                />
              </div>

              <div className="flex-1 text-gray-900 pl-8 text-center">{r.farmer}</div>
              <div className="w-48 text-gray-700 text-center">{fmtDate(r.date)}</div>
              <div className="w-[22rem] max-w-[22rem] truncate text-gray-700 text-center">{r.batchId}</div>
              <div className="w-40 text-gray-700 text-center">{r.trayStocks}</div>
              <div className="w-36 text-center">
                <button
                  onClick={() => openModal(r)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  <IoEyeOutline className="text-lg" /> View More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <div className="relative">
                <select
                  className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
                  defaultValue="10"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
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
              <span>Displaying {rows.length} out of {rows.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold">
                Previous
              </button>
              <button className="rounded-md border border-yellow-600 bg-white px-3.5 py-1.5 text-[12px] font-medium text-yellow-500 hover:bg-yellow-300 hover:text-yellow-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal — View More (existing) */}
      {open && activeRow && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
          <div className="relative z-[1001] w-[550px] max-w-[92vw] rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-center text-3xl font-semibold text-primaryYellow">Stocks Details</h3>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-700">Stocks Available per Egg</p>
              <p className="text-lg font-semibold text-gray-700">
                Total&nbsp; Tray: <span className="font-bold">{activeRow.trayStocks}</span>
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-gray-600">
              {/* header */}
              <div className="flex items-center border-b border-gray-600 px-5 py-3">
                <div className="flex-1 text-lg font-semibold text-gray-800 text-center pr-20">
                  Egg Size
                </div>
                <div className="w-40 text-lg font-semibold text-gray-800 text-center pr-9">
                  Stocks
                </div>
              </div>

              {/* rows */}
              <div className="divide-y divide-gray-300">
                {activeRow.sizeBreakdown.map((s) => (
                  <div key={s.size} className="flex items-center px-5 py-3">
                    <div className="flex-1 text-gray-800 text-lg text-center pr-20">
                      {s.size}
                    </div>
                    <div className="w-40 text-gray-800 text-lg text-center pr-9">{s.qty}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={closeModal}
                className="w-[48%] rounded-lg bg-gray-300 py-3 text-center font-semibold text-gray hover:opacity-90"
              >
                Back
              </button>
              <button
                onClick={() => alert("Egg request sent")}
                className="w-[48%] rounded-lg bg-primaryYellow py-3 text-center font-semibold text-white hover:opacity-90"
              >
                Send Egg Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: "Send Egg Request" modal UI */}
      {requestOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setRequestOpen(false)} />
          <div className="relative z-[1001] w-[700px] max-w-[94vw] rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-center text-3xl font-semibold text-primaryYellow">Add New Egg Produced</h3>

            {/* Form row */}
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Egg Size */}
              <div>
                <label className="mb-2 block text-[16px] font-semibold text-gray-700">Egg Size:</label>
                <div className="relative">
                  <select
                    value={reqForm.size}
                    onChange={(e) => setReqForm((f) => ({ ...f, size: e.target.value }))}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-600"
                  >
                    <option value="">{`Choose Egg size`}</option>
                    {eggSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Quantity per Tray */}
              <div>
                <label className="mb-2 block text-[16px] font-semibold text-gray-700">Quantity per Tray:</label>
                <input
                  value={reqForm.qty}
                  onChange={(e) => setReqForm((f) => ({ ...f, qty: e.target.value }))}
                  placeholder="e.g 10"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-600 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Add Egg Tray button */}
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-gray-300 py-3 text-center text-[16px] font-semibold text-gray-700"
              onClick={() => { /* placeholder: add item to list */ }}
            >
              Add Egg Tray
            </button>

            {/* Totals row */}
            <div className="mt-6 flex items-center justify-between px-1">
              <p className="text-[18px] font-semibold text-gray-700">Total stocks</p>
              <p className="text-[18px] font-semibold text-gray-700">
                Total Tray: <span className="font-bold">32</span>
              </p>
            </div>

            {/* Table */}
            <div className="mt-3 rounded-xl border border-gray-600">
              {/* header */}
              <div className="flex items-center border-b border-gray-600 px-5 py-3">
                <div className="flex-1 text-lg font-semibold text-gray-800 text-center pr-36">Egg Size</div>
                <div className="w-40 text-lg font-semibold text-gray-800 text-center pr-28">Stocks</div>
              </div>

              {/* rows */}
              <div className="divide-y divide-gray-300">
                {["Size", "Size", "Size"].map((label, i) => (
                  <div key={i} className="flex items-center px-5 py-3">
                    <div className="flex-1 text-gray-800 text-lg text-center pr-36">{label}</div>
                    <div className="w-40 text-gray-800 text-lg text-center pr-28">Qty</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer buttons — added */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setRequestOpen(false)}
                className="w-[48%] rounded-lg bg-gray-300 py-3 text-center font-semibold text-white hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={() => { alert("Request sent"); setRequestOpen(false); }}
                className="w-[48%] rounded-lg bg-primaryYellow py-3 text-center font-semibold text-white hover:opacity-90"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




//  import React, { useEffect, useMemo, useRef, useState } from "react";
// import { IoEyeOutline } from "react-icons/io5";

// export default function EggSupplyPage() {
//   const totals = useMemo(
//     () => ({ XS: 10100, S: 2000, M: 2000, L: 2000, XL: 10100, J: 2000 }),
//     []
//   );

//   // Mock rows: farmer, date, batch id, stocks (tray)
//   const [rows] = useState([
//     {
//       id: "1",
//       farmer: "Maria Lopez",
//       date: "2025-10-01",
//       batchId: "1",
//       trayStocks: 32,
//       sizeBreakdown: [
//         { size: "XS", qty: 10 },
//         { size: "S", qty: 6 },
//         { size: "M", qty: 8 },
//         { size: "L", qty: 5 },
//         { size: "XL", qty: 3 },
//       ],
//     },
//     {
//       id: "2",
//       farmer: "Flynn Roger",
//       date: "2025-10-01",
//       batchId: "2",
//       trayStocks: 12,
//       sizeBreakdown: [
//         { size: "S", qty: 4 },
//         { size: "M", qty: 5 },
//         { size: "L", qty: 3 },
//       ],
//     },
//     {
//       id: "3",
//       farmer: "Maria Lopez",
//       date: "2025-09-29",
//       batchId: "3",
//       trayStocks: 18,
//       sizeBreakdown: [
//         { size: "XS", qty: 6 },
//         { size: "S", qty: 4 },
//         { size: "M", qty: 8 },
//       ],
//     },
//     {
//       id: "4",
//       farmer: "Flynn Roger",
//       date: "2025-09-27",
//       batchId: "4",
//       trayStocks: 9,
//       sizeBreakdown: [
//         { size: "M", qty: 5 },
//         { size: "L", qty: 4 },
//       ],
//     },
//   ]);

//   // selection (no TS generics)
//   const [selected, setSelected] = useState([]);
//   const selectAllRef = useRef(null);
//   const allChecked = selected.length === rows.length && rows.length > 0;

//   useEffect(() => {
//     if (selectAllRef.current) {
//       selectAllRef.current.indeterminate =
//         selected.length > 0 && selected.length < rows.length;
//     }
//   }, [selected, rows.length]);

//   const toggleAll = () => {
//     setSelected((prev) =>
//       prev.length === rows.length ? [] : rows.map((r) => r.id)
//     );
//   };

//   const toggleOne = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const Stat = ({ label, value }) => (
//     <div className="flex items-center gap-3 rounded-xl bg-gray-200 px-5 py-3">
//       <span className="w-10 shrink-0 text-[15px] font-semibold text-gray-600">
//         {label}
//       </span>
//       <span className="ml-auto text-2xl font-semibold text-primaryYellow">
//         {value.toLocaleString()}
//       </span>
//     </div>
//   );

//   // Modal state (plain JS)
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

//   const fmtDate = (d) =>
//     new Date(d).toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "2-digit",
//     });

//   return (
//     <div className="w-full">
//       {/* Summary */}
//       <div className="rounded-2xl bg-white border border-gray-300 p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
//         <h2 className="mb-4 text-lg font-semibold text-gray-800">
//           Total Eggs Supply (All Farmers)
//         </h2>
//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div className="space-y-4">
//             <Stat label="XS:" value={totals.XS} />
//             <Stat label="S:" value={totals.S} />
//             <Stat label="M:" value={totals.M} />
//           </div>
//           <div className="space-y-4">
//             <Stat label="L:" value={totals.L} />
//             <Stat label="XL:" value={totals.XL} />
//             <Stat label="J:" value={totals.J} />
//           </div>
//         </div>
//       </div>

//       {/* Section Header */}
//       <div className="mt-8 flex items-center justify-between">
//         <h2 className="text-2xl font-bold text-primaryYellow">
//           Egg Supply per Farmer
//         </h2>
//         <button className="rounded-lg bg-primaryYellow px-5 py-3 font-semibold text-white shadow hover:opacity-90">
//           Send Egg Request
//         </button>
//       </div>

//       {/* Table (Farmer, Date, Batch ID, Stocks tray) */}
//       <div className="mt-4 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
//         {/* Header */}
//         <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
//           <div className="w-10 flex justify-center">
//             <input
//               ref={selectAllRef}
//               type="checkbox"
//               onChange={toggleAll}
//               checked={allChecked}
//               className="h-4 w-4 accent-yellow-400"
//               aria-label="select-all"
//             />
//           </div>
//           <div className="flex-1 text-lg pl-8 text-center">Farmer</div>
//           <div className="w-48 text-lg text-center">Date</div>
//           <div className="w-[22rem] max-w-[22rem] text-lg text-center">Batch ID</div>
//           <div className="w-40 text-lg text-center">Stocks (tray)</div>
//           <div className="w-36 text-lg text-center">Actions</div>
//         </div>

//         {/* Rows */}
//         <div className="divide-y divide-gray-200">
//           {rows.map((r) => (
//             <div key={r.id} className="flex items-center px-6 py-4 text-[15px]">
//               <div className="w-10 flex justify-center">
//                 <input
//                   type="checkbox"
//                   checked={selected.includes(r.id)}
//                   onChange={() => toggleOne(r.id)}
//                   className="h-4 w-4 accent-yellow-400"
//                   aria-label={`select-${r.id}`}
//                 />
//               </div>

//               <div className="flex-1 text-gray-900 pl-8 text-center">{r.farmer}</div>
//               <div className="w-48 text-gray-700 text-center">{fmtDate(r.date)}</div>
//               <div className="w-[22rem] max-w-[22rem] truncate text-gray-700 text-center">{r.batchId}</div>
//               <div className="w-40 text-gray-700 text-center">{r.trayStocks}</div>
//               <div className="w-36 text-center">
//                 <button
//                   onClick={() => openModal(r)}
//                   className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
//                 >
//                   <IoEyeOutline className="text-lg" /> View More
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Footer */}
//         <div className="border-t border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-[12px] text-gray-500">
//               <div className="relative">
//                 <select
//                   className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
//                   defaultValue="10"
//                 >
//                   <option value="5">5</option>
//                   <option value="10">10</option>
//                   <option value="25">25</option>
//                 </select>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </div>
//               <span>Displaying {rows.length} out of {rows.length}</span>
//             </div>

//             <div className="flex items-center gap-2">
//               <button className="rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold">
//                 Previous
//               </button>
//               <button className="rounded-md border border-yellow-600 bg-white px-3.5 py-1.5 text-[12px] font-medium text-yellow-500 hover:bg-yellow-300 hover:text-yellow-700">
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal — matches your screenshot */}
//       {open && activeRow && (
//         <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
//           <div className="relative z-[1001] w-[600px] max-w-[92vw] rounded-2xl bg-white p-8 shadow-xl">
//             <h3 className="text-center text-3xl font-semibold text-primaryYellow">Stocks Details</h3>

//             <div className="mt-6 flex items-center justify-between">
//               <p className="text-lg font-semibold text-gray-700">Stocks Available per Egg</p>
//               <p className="text-lg font-semibold text-gray-700">
//                 Total Tray: <span className="font-bold">{activeRow.trayStocks}</span>
//               </p>
//             </div>

//       <div className="mt-3 rounded-xl border border-gray-600">
//         {/* header */}
//         <div className="flex items-center border-b border-gray-600 px-5 py-3">
//           <div className="flex-1 text-lg font-semibold text-gray-800 text-center pr-20">
//             Egg Size
//         </div>
//         <div className="w-40 text-lg font-semibold text-gray-800 text-center pr-9">
//             Stocks
//         </div>
//       </div>

//       {/* rows */}
//       <div className="divide-y divide-gray-300">
//         {activeRow.sizeBreakdown.map((s) => (
//       <div key={s.size} className="flex items-center px-5 py-3">
//         <div className="flex-1 text-gray-800 text-lg text-center pr-20">
//           {s.size}
//         </div>
//         <div className="w-40 text-gray-800 text-lg text-center pr-9">{s.qty}</div>
//       </div>
//     ))}
//     </div>
// </div>
//             <div className="mt-8 flex items-center justify-between">
//               <button
//                 onClick={closeModal}
//                 className="w-[48%] rounded-lg bg-gray-300 py-3 text-center font-semibold text-white hover:opacity-90"
//               >
//                 Back
//               </button>
//               <button
//                 onClick={() => alert("Egg request sent")}
//                 className="w-[48%] rounded-lg bg-primaryYellow py-3 text-center font-semibold text-white hover:opacity-90"
//               >
//                 Send Egg Request
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

 
 
 // import React, { useEffect, useMemo, useRef, useState } from "react";
  // import { IoEyeOutline } from "react-icons/io5";

  // export default function EggSupplyPage() {
  //   const totals = useMemo(
  //     () => ({ XS: 10100, S: 2000, M: 2000, L: 2000, XL: 10100, J: 2000 }),
  //     []
  //   );

  //   const [rows] = useState([
  //     {
  //       id: "1",
  //       name: "Maria Lopez",
  //       email: "farmer@gmail.com",
  //       date: "2025-10-01",
  //       totalStocks: 3200,
  //       status: "Active",
  //     },
  //     {
  //       id: "2",
  //       name: "Flynn Roger",
  //       email: "buyer@gmail.com",
  //       date: "2025-10-01",
  //       totalStocks: 1200,
  //       status: "Active",
  //     },
  //     {
  //       id: "3",
  //       name: "Maria Lopez",
  //       email: "farmer@gmail.com",
  //       date: "2025-09-29",
  //       totalStocks: 1800,
  //       status: "Active",
  //     },
  //     {
  //       id: "4",
  //       name: "Flynn Roger",
  //       email: "buyer@gmail.com",
  //       date: "2025-09-27",
  //       totalStocks: 900,
  //       status: "Active",
  //     },
  //   ]);

  //   const [selected, setSelected] = useState([]);
  //   const allChecked = selected.length === rows.length && rows.length > 0;
  //   const selectAllRef = useRef(null);

  //   useEffect(() => {
  //     if (selectAllRef.current) {
  //       selectAllRef.current.indeterminate =
  //         selected.length > 0 && selected.length < rows.length;
  //     }
  //   }, [selected, rows.length]);

  //   const toggleAll = () => {
  //     setSelected((prev) =>
  //       prev.length === rows.length ? [] : rows.map((r) => r.id)
  //     );
  //   };

  //   const toggleOne = (id) => {
  //     setSelected((prev) =>
  //       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  //     );
  //   };

  //   const Stat = ({ label, value }) => (
  //     <div className="flex items-center gap-3 rounded-xl bg-gray-200 px-5 py-3">
  //       <span className="w-10 shrink-0 text-[15px] font-semibold text-gray-600">
  //         {label}
  //       </span>
  //       <span className="ml-auto text-2xl font-semibold text-primaryYellow">
  //         {value.toLocaleString()}
  //       </span>
  //     </div>
  //   );

  //   return (
  //     <div className="mx-auto max-w-7xl p-6">
  //       {/* Summary */}
  //       <div className="rounded-2xl bg-white border border-gray-300 p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
  //         <h2 className="mb-4 text-lg font-semibold text-gray-800">
  //           Total Eggs Supply (All Farmers)
  //         </h2>
  //         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  //           <div className="space-y-4">
  //             <Stat label="XS:" value={totals.XS} />
  //             <Stat label="S:" value={totals.S} />
  //             <Stat label="M:" value={totals.M} />
  //           </div>
  //           <div className="space-y-4">
  //             <Stat label="L:" value={totals.L} />
  //             <Stat label="XL:" value={totals.XL} />
  //             <Stat label="J:" value={totals.J} />
  //           </div>
  //         </div>
  //       </div>

  //       {/* Section Header */}
  //       <div className="mt-8 flex items-center justify-between">
  //         <h2 className="text-2xl font-bold text-primaryYellow">
  //           Egg Supply per Farmer
  //         </h2>
  //         <button className="rounded-lg bg-primaryYellow px-5 py-3 font-semibold text-white shadow hover:opacity-90">
  //           Send Egg Request
  //         </button>
  //       </div>

  //       {/* Table */}
  //       <div className="mt-4 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
  //         {/* Header */}
  //         <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
  //           <div className="w-10 flex justify-center">
  //             <input
  //               ref={selectAllRef}
  //               type="checkbox"
  //               onChange={toggleAll}
  //               checked={allChecked}
  //               className="h-4 w-4 accent-yellow-400"
  //               aria-label="select-all"
  //             />
  //           </div>
  //           <div className="flex-1 text-lg pl-8 text-center">Full Name</div>
  //           <div className="w-64 text-lg text-center">Email</div>
  //           <div className="w-40 text-lg text-center">Date</div>
  //           <div className="w-40 text-lg text-center">Total Stocks</div>
  //           <div className="w-32 text-lg text-center">Status</div>
  //           <div className="w-36 text-lg text-center">Actions</div>
  //         </div>

  //         {/* Rows */}
  //         <div className="divide-y divide-gray-200">
  //           {rows.map((r) => (
  //             <div key={r.id} className="flex items-center px-6 py-4 text-[15px]">
  //               <div className="w-10 flex justify-center">
  //                 <input
  //                   type="checkbox"
  //                   checked={selected.includes(r.id)}
  //                   onChange={() => toggleOne(r.id)}
  //                   className="h-4 w-4 accent-yellow-400"
  //                   aria-label={`select-${r.id}`}
  //                 />
  //               </div>

  //              <div className="flex-1 text-gray-900 pl-8 text-center">{r.name}</div>
  //             <div className="w-64 text-gray-600 text-center">{r.email}</div>
  //             <div className="w-40 text-gray-700 text-center">{new Date(r.date).toLocaleDateString()}</div>
  //             <div className="w-40 text-gray-700 text-center">{r.totalStocks.toLocaleString()}</div>
  //             <div className="w-32 text-gray-700 text-center">{r.status}</div>
  //             <div className="w-36 text-center">
  //            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
  //               <IoEyeOutline className="text-lg" /> View More
  //             </button>
  //           </div>
  //             </div>
  //           ))}
  //         </div>

  //         {/* Footer */}
  //         <div className="border-t border-gray-200 px-6 py-4">
  //           <div className="flex items-center justify-between">
  //             {/* Left side */}
  //             <div className="flex items-center gap-2 text-[12px] text-gray-500">
  //               <div className="relative">
  //                 <select
  //                   className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
  //                   defaultValue="1"
  //                 >
  //                   <option value="1">1</option>
  //                   <option value="5">5</option>
  //                   <option value="10">10</option>
  //                 </select>
  //                 <svg
  //                   xmlns="http://www.w3.org/2000/svg"
  //                   className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
  //                   fill="none"
  //                   viewBox="0 0 24 24"
  //                   stroke="currentColor"
  //                 >
  //                   <path
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     strokeWidth={2}
  //                     d="M19 9l-7 7-7-7"
  //                   />
  //                 </svg>
  //               </div>
  //               <span>
  //                 Displaying {rows.length} out of {rows.length}
  //               </span>
  //             </div>

  //             {/* Right side */}
  //        <div className="flex items-center gap-2">
  //           <button className="rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold">
  //             Previous
  //           </button>
  //           <button className="rounded-md border border-yellow-600 bg-white px-3.5 py-1.5 text-[12px] font-medium text-yellow-500 hover:bg-yellow-300 hover:text-yellow-700">
  //             Next
  //           </button>
  //         </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }



// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { IoEyeOutline } from "react-icons/io5";

// /**
//  * Drop-in page that matches the provided mockup (pure JSX)
//  * - TailwindCSS classes
//  * - Uses your brand token `primaryYellow`
//  * - Summary card + table + checkboxes + pagination
//  */
// export default function EggSupplyPage() {
//   // ──────────────────────────────────────────────────────────────
//   // Mock totals (replace with real values)
//   // ──────────────────────────────────────────────────────────────
//   const totals = useMemo(
//     () => ({ XS: 10100, S: 2000, M: 2000, L: 2000, XL: 10100, J: 2000 }),
//     []
//   );

//   // ──────────────────────────────────────────────────────────────
//   // Mock table rows (replace with API data)
//   // ──────────────────────────────────────────────────────────────
//   const [rows] = useState([
//     {
//       id: "1",
//       name: "Maria Lopez",
//       email: "farmer@gmail.com",
//       date: "2025-10-01",
//       totalStocks: 3200,
//       status: "Active",
//     },
//     {
//       id: "2",
//       name: "Flynn Roger",
//       email: "buyer@gmail.com",
//       date: "2025-10-01",
//       totalStocks: 1200,
//       status: "Active",
//     },
//     {
//       id: "3",
//       name: "Maria Lopez",
//       email: "farmer@gmail.com",
//       date: "2025-09-29",
//       totalStocks: 1800,
//       status: "Active",
//     },
//     {
//       id: "4",
//       name: "Flynn Roger",
//       email: "buyer@gmail.com",
//       date: "2025-09-27",
//       totalStocks: 900,
//       status: "Active",
//     },
//   ]);

//   // ──────────────────────────────────────────────────────────────
//   // Selection state
//   // ──────────────────────────────────────────────────────────────
//   const [selected, setSelected] = useState([]);
//   const allChecked = selected.length === rows.length && rows.length > 0;
//   const selectAllRef = useRef(null);

//   useEffect(() => {
//     if (selectAllRef.current) {
//       selectAllRef.current.indeterminate =
//         selected.length > 0 && selected.length < rows.length;
//     }
//   }, [selected, rows.length]);

//   const toggleAll = () => {
//     setSelected((prev) => (prev.length === rows.length ? [] : rows.map((r) => r.id)));
//   };

//   const toggleOne = (id) => {
//     setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
//   };

//   // ──────────────────────────────────────────────────────────────
//   // Render helpers
//   // ──────────────────────────────────────────────────────────────
//   const Stat = ({ label, value }) => (
//     <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-5 py-3">
//       <span className="w-10 shrink-0 text-[15px] font-semibold text-gray-600">{label}</span>
//       <span className="ml-auto text-2xl font-semibold text-primaryYellow">{value.toLocaleString()}</span>
//     </div>
//   );

//   return (
//     <div className="mx-auto max-w-7xl p-6">
//       {/* ───────────────────── Summary Card ───────────────────── */}
//       <div className="rounded-2xl bg-white border border-gray-300 p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
//         <h2 className="mb-4 text-lg font-semibold text-gray-800">Total Eggs Supply (All Farmers)</h2>
//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div className="space-y-4">
//             <Stat label="XS:" value={totals.XS} />
//             <Stat label="S:" value={totals.S} />
//             <Stat label="M:" value={totals.M} />
//           </div>
//           <div className="space-y-4">
//             <Stat label="L:" value={totals.L} />
//             <Stat label="XL:" value={totals.XL} />
//             <Stat label="J:" value={totals.J} />
//           </div>
//         </div>
//       </div>

//       {/* ───────────────────── Section Header ───────────────────── */}
//       <div className="mt-8 flex items-center justify-between">
//         <h2 className="text-2xl font-bold text-primaryYellow">Egg Supply per Farmer</h2>
//         <button className="rounded-lg bg-primaryYellow px-5 py-3 font-semibold text-white shadow hover:opacity-90">
//           Send Egg Request
//         </button>
//       </div>

// {/* ───────────────────── Table ───────────────────── */}
// <div className="mt-4 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
//   {/* Header */}
//   <div className="flex items-center border-b border-gray-300 px-6 py-4 text-[15px] font-semibold text-yellow-400">
//     <div className="w-10">
//       <input
//         ref={selectAllRef}
//         type="checkbox"
//         onChange={toggleAll}
//         checked={allChecked}
//         className="h-4 w-4 accent-yellow-400"
//         aria-label="select-all"
//       />
//     </div>
//     <div className="flex-1">Full Name</div>
//     <div className="w-64">Date</div>
//     <div className="w-40">Total Stocks</div>
//     <div className="w-32">Status</div>
//     <div className="w-36">Actions</div>
//   </div>

//   {/* Rows */}
//   <div className="divide-y divide-gray-200">
//     {rows.map((r) => (
//       <div key={r.id} className="flex items-center px-6 py-4 text-[15px]">
//         <div className="w-10">
//           <input
//             type="checkbox"
//             checked={selected.includes(r.id)}
//             onChange={() => toggleOne(r.id)}
//             className="h-4 w-4 accent-yellow-400"
//             aria-label={`select-${r.id}`}
//           />
//         </div>

//         <div className="flex flex-1 items-center gap-3">
//           <div className="leading-tight">
//             <div className="font-medium text-gray-900">{r.name}</div>
//             <div className="text-sm text-gray-500">{r.email}</div>
//           </div>
//         </div>

//         <div className="w-64 text-gray-700">{new Date(r.date).toLocaleDateString()}</div>
//         <div className="w-40 text-gray-700">{r.totalStocks.toLocaleString()}</div>
//         <div className="w-32 text-gray-700">{r.status}</div>
//         <div className="w-36">
//           <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
//             <IoEyeOutline className="text-lg" /> View More
//           </button>
//         </div>
//       </div>
//     ))}
//   </div>

//   {/* Footer / Pagination */}
//   <div className="border-t border-gray-200 px-6 py-4">
//     <div className="flex items-center justify-between">
//       <div className="flex items-center gap-2 text-sm text-gray-500">
//         <span className="rounded-md border border-gray-300 bg-gray-100 px-2 py-1">1 ▾</span>
//         <span>
//           Displaying {rows.length} out of {rows.length}
//         </span>
//       </div>
//       <div className="flex items-center gap-3">
//         <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
//           Previous
//         </button>
//         <button className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-500">
//           Next
//         </button>
//       </div>
//     </div>
//   </div>
// </div>

//     </div>
//   );
// }


// import React, { useState } from "react";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import EggHistory from "../../../components/admin/tables/EggHistory";
// import { FaRegBell } from "react-icons/fa6";
// import PickupTable from "../../../components/admin/tables/PickupTable";
// import Modal from "react-modal";
// import { IoChevronDown, IoFilterOutline } from "react-icons/io5";
// import { DatePicker } from "@mui/x-date-pickers";
// const thirdModalStyle = {
//   content: {
//     top: "50%",
//     left: "50%",
//     right: "auto",
//     bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20,
//     padding: 30,
//     maxHeight: "100vh",
//     width: "35vw",
//     overflow: "visible",
//   },
//   overlay: {
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//     zIndex: 1000,
//   },
// };

// export default function EggPickUp() {
//   const [value, onChange] = useState(new Date());

//   const [selectedType, setSelectedType] = useState("");

//   const types = ["All", "Confirmation", "Complete", "Rejected"];

//   const totalTrayData = [
//     {
//       size: "xs",
//       qty: 10100,
//     },
//     {
//       size: "sm",
//       qty: 10100,
//     },
//     {
//       size: "m",
//       qty: 10100,
//     },
//     {
//       size: "l",
//       qty: 10100,
//     },
//     {
//       size: "xl",
//       qty: 10100,
//     },
//     {
//       size: "xxl",
//       qty: 10100,
//     },
//     {
//       size: "xxxl",
//       qty: 10100,
//     },
//   ];

//   const [eggUpdateModal, setEggUpdateModal] = useState(false);

//   const handleEggUpdateModal = () => {
//     setEggUpdateModal(!eggUpdateModal);
//   };

//   return (
//     <div className="grid grid-cols-3 gap-4">
//       {/* Ready for pickup table */}
//       <div className="p-6 rounded-lg border border-gray-200 shadow-lg col-span-2 flex flex-col">
//         <div className="flex flex-row justify-between items-center gap-5">
//           <div className="flex flex-row gap-2 items-center text-gray-400 text-xl font-bold">
//             <FaRegBell />
//             <h1>Ready for Pickup Today</h1>
//           </div>
//           <div className="flex flex-row justify-between">
//             <div className="flex flex-row gap-5">
//               <div className="flex flex-row items-center gap-2 border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600">
//                 <select
//                   value={selectedType}
//                   onChange={(e) => setSelectedType(e.target.value)}
//                   className="bg-transparent outline-none text-lg cursor-pointer"
//                 >
//                   <option value="" disabled>
//                     Status
//                   </option>
//                   {types.map((type, index) => (
//                     <option key={index} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div
//                 onClick={handleEggUpdateModal}
//                 className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//               >
//                 <p className="text-lg">Update</p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <PickupTable />
//       </div>
//       {/* Total Tray */}
//       <div className="p-6 rounded-lg border border-gray-200 shadow-lg col-span-1 flex flex-col gap-2">
//         <h1 className="text-2xl font-bold text-primaryYellow">
//           Total Tray Per Size
//         </h1>
//         {totalTrayData.map((data) => (
//           <div className="flex flex-row gap-2 items-center bg-gray-200 px-3 py-2 rounded-2xl">
//             <p className="text-lg font-bold text-primaryYellow uppercase">
//               {data.size}:
//             </p>
//             <p className="text-xl font-bold text-primaryYellow">
//               {data.qty.toLocaleString()}
//             </p>
//           </div>
//         ))}
//       </div>
//       {/* egg history table */}
//       <div className="flex flex-row items-center justify-between col-span-3">
//         <h1 className="text-2xl text-primaryYellow font-bold">
//           Egg Pickup History
//         </h1>
//         <DatePicker
//           label="Filter by Date"
//           onChange={(newValue) => onChange(newValue)}
//         />
//       </div>
//       <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <EggHistory />
//       </div>
//       <Modal
//         isOpen={eggUpdateModal}
//         onRequestClose={handleEggUpdateModal}
//         contentLabel="Egg update modal"
//         style={thirdModalStyle}
//       >
//         {/* Title */}
//         <h2 className="text-2xl font-bold text-primaryYellow mb-1">
//           Update Egg Count per Size
//         </h2>
//         <p className="text-gray-500 mb-6">
//           How many tray bundles did you pick up today per size?
//         </p>

//         {/* Form */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           {/* Egg Size Dropdown */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-gray-700 font-medium">Egg Size:</label>
//             <select
//               className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primaryYellow outline-none"
//               defaultValue=""
//             >
//               <option value="" disabled>
//                 Choose Egg size
//               </option>
//               <option value="Small">Small</option>
//               <option value="Medium">Medium</option>
//               <option value="Large">Large</option>
//               <option value="Extra Large">Extra Large</option>
//             </select>
//           </div>

//           {/* Tray Bundles Number Input */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-gray-700 font-medium">
//               Tray Bundles:
//             </label>
//             <input
//               type="number"
//               placeholder="e.g 10"
//               className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primaryYellow outline-none"
//             />
//           </div>
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={handleEggUpdateModal}
//           className="w-full bg-primaryYellow rounded-lg px-6 py-4 text-white font-semibold text-lg cursor-pointer hover:bg-yellow-500 transition"
//         >
//           Update Egg Count
//         </button>
//       </Modal>
//     </div>
//   );
// }
