// components/admin/tables/OrderTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import Table from "../../Table";
import { FaCircleInfo } from "react-icons/fa6";
import Modal from "react-modal";
import { listOrdersForTable } from "@/services/OrderNAllocation";
import { fetchSizeMetaMap } from "@/services/EggInventory";

const modalStyle = {
  content: {
    top: "50%", left: "50%", right: "auto", bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20, padding: 10, maxHeight: "100vh", width: "50vw",
    overflow: "visible",
  },
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
};

const statusColors = {
  Confirmed: "text-blue-600",
  "To Ship": "text-indigo-600",
  Shipped: "text-purple-600",
  Delivered: "text-green-600",
  Cancelled: "text-red-600",
  Refunded: "text-orange-500",
};

function fmtDateMDY(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default function OrderTable({
  selectedOption,
  status,
  mode = "none",
  selectedIds = [],
  onSelectionChange = () => {},
  refreshKey = 0,
}) {
  const effectiveStatus = status ?? selectedOption ?? null;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);
  const [sizeMeta, setSizeMeta] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const meta = await fetchSizeMetaMap();
        if (!alive) return;
        setSizeMeta(meta || {});
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [5, 10, 25, 50];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadErr(null);
        const apiRows = await listOrdersForTable({ status: effectiveStatus });
        if (!alive) return;
        const shaped = (apiRows || []).map((r) => ({
          orderID: r.id,
          customerName: r.customer || "—",
          dateOrdered: fmtDateMDY(r.dateOrdered),
          totalAmount: Number(r.totalAmount ?? 0).toFixed(2),
          orderStatus: r.orderStatus || "—",
          paymentStatus: r.paymentStatus || "—",
          phoneNumber: "—",
          address: r.buyerCoopName || "—",
          raw: r,
        }));
        setRows(shaped);
        setPage(1);
      } catch (e) {
        if (!alive) return;
        setLoadErr(e?.message || "Failed to load orders.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [effectiveStatus, refreshKey]);

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRows);
  const currentRows = useMemo(() => rows.slice(startIdx, endIdx), [rows, startIdx, endIdx]);

  const isSelected = (id) => selectedIds.includes(id);

  const toggleCheckbox = (id) => {
    if (mode !== "multi") return;
    const next = isSelected(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onSelectionChange(next);
  };

  const selectAllOnPage = (checked) => {
    if (mode !== "multi") return;
    const pageIds = currentRows.map((r) => r.orderID);
    const pageSet = new Set(pageIds);
    let next;
    if (checked) {
      next = Array.from(new Set([...selectedIds, ...pageIds]));
    } else {
      next = selectedIds.filter((id) => !pageSet.has(id));
    }
    onSelectionChange(next);
  };

  const setRadio = (id) => {
    if (mode !== "single") return;
    onSelectionChange(id ? [id] : []);
  };

  const selectionHeader =
    mode === "multi" ? (
      <input
        key="selectAll"
        type="checkbox"
        className="accent-primaryYellow focus:ring-2 focus:ring-black"
        onChange={(e) => selectAllOnPage(e.target.checked)}
        checked={
          currentRows.length > 0 &&
          currentRows.every((r) => selectedIds.includes(r.orderID))
        }
        indeterminate={
          currentRows.some((r) => selectedIds.includes(r.orderID)) &&
          !currentRows.every((r) => selectedIds.includes(r.orderID))
        }
      />
    ) : mode === "single" ? (
      <span key="selectOne" className="text-xs text-gray-500">Select</span>
    ) : (
      <span key="blank" />
    );

  const headers = [
    "Order ID",
    "Customer",
    "Date Ordered",
    "Total Amount",
    "Needs",
    "Order Status",
    "Payment Status",
    "Details",
    selectionHeader,
  ];

  const viewOrderDetails = (item) => {
    setIsModalOpen(true);
    setModalData(item);
  };

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const labelFromSizeId = (sid) => {
    const entry = Object.entries(sizeMeta).find(([label, v]) => Number(v.id) === Number(sid));
    return entry ? entry[0] : `#${sid}`;
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <div className="relative">
            <select
              className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span>
            Displaying {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of {totalRows}
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

      <Table headers={headers}>
        {loading && (
          <tr>
            <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
              Loading orders…
            </td>
          </tr>
        )}

        {!loading && loadErr && (
          <tr>
            <td colSpan={9} className="px-4 py-6 text-center text-red-600">
              {loadErr}
            </td>
          </tr>
        )}

        {!loading && !loadErr && currentRows.length === 0 && (
          <tr>
            <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
              No orders found.
            </td>
          </tr>
        )}

        {!loading && !loadErr && currentRows.map((item, index) => {
          const needsBy = new Map();
          for (const p of item.raw?.products || []) {
            const sid = Number(p.size_id || 0);
            const trays = Number(p.tray_qty || 0);
            if (!sid || trays <= 0) continue;
            needsBy.set(sid, (needsBy.get(sid) || 0) + trays);
          }
          const needsStr = Array.from(needsBy.entries())
            .map(([sid, t]) => `${labelFromSizeId(sid)}×${t}`)
            .join(", ");

          const selected = mode === 'single' && isSelected(item.orderID);

          return (
            <tr 
              key={`${item.orderID}-${startIdx + index}`} 
              className={`text-gray-700 rounded-lg shadow-sm transition ${
                selected
                  ? 'bg-yellow-200 border-l-4 border-primaryYellow'
                  : 'bg-yellow-100 hover:bg-yellow-50'
              }`}
            >
              <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
              <td className="px-4 py-3 text-center">{item.customerName}</td>
              <td className="px-4 py-3 text-center">{item.dateOrdered}</td>
              <td className="px-4 py-3 text-center">{item.totalAmount}</td>
              <td className="px-4 py-3 text-center">{needsStr || "—"}</td>
              <td className={`px-4 py-3 text-center font-medium ${statusColors[item.orderStatus] || "text-gray-500"}`}>
                {item.orderStatus}
              </td>
              <td className="px-4 py-3 text-center">{item.paymentStatus}</td>
              <td
                onClick={() => viewOrderDetails(item)}
                className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400"
                title="View details"
              >
                <FaCircleInfo />
              </td>

              <td className="px-4 py-3 text-center">
                {mode === "multi" ? (
                  <input
                    type="checkbox"
                    className="accent-primaryYellow focus:ring-2 focus:ring-black"
                    checked={selectedIds.includes(item.orderID)}
                    onChange={() => toggleCheckbox(item.orderID)}
                  />
                ) : mode === "single" ? (
                  <input
                    type="radio"
                    name="order-single-select"
                    className="accent-primaryYellow focus:ring-2 focus:ring-black"
                    checked={selectedIds.includes(item.orderID)}
                    onChange={() => setRadio(item.orderID)}
                  />
                ) : null}
              </td>
            </tr>
          );
        })}

        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Order Details"
          style={modalStyle}
        >
          {modalData && (
            <div className="flex flex-col gap-5 p-10">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col leading-tight">
                  <h1 className="text-2xl font-bold text-primaryYellow">Order Details</h1>
                  <p className="text-lg text-gray-400 font-bold">Order #: {modalData.orderID}</p>
                </div>
                <div className="flex flex-col leading-tight items-end">
                  <h1 className="text-lg text-gray-400 font-bold">Current Status:</h1>
                  <p className="text-2xl font-bold text-primaryYellow">{modalData.orderStatus}</p>
                </div>
              </div>

              <div className="flex flex-col leading-tight">
                <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                  {modalData.customerName} <span className="text-gray-400">{modalData.phoneNumber || "—"}</span>
                </h1>
                <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">{modalData.address || "—"}</h2>
              </div>

              <div className="flex flex-row gap-5">
                <div className="border-2 p-5 rounded-lg w-full">
                  <div className="flex flex-col gap-3">
                    <h1 className="text-xl text-primaryYellow font-bold mb-5">Item Summary</h1>
                    <div className="text-gray-500">(Attach order items from RPC when available)</div>
                  </div>
                </div>

                <div className="border-2 p-5 rounded-lg w-full">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-xl text-primaryYellow font-bold mb-5">Order Summary</h1>
                    <div className="flex flex-row justify-between items-center font-bold text-lg">
                      <p>Total Order</p>
                      <p>₱{modalData.totalAmount}</p>
                    </div>
                    <div className="flex flex-row justify-between items-center text-primaryYellow font-bold text-lg">
                      <p>Payment Method</p>
                      <p>{modalData.paymentStatus || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button onClick={() => setIsModalOpen(false)} className="cursor-pointer bg-primaryYellow text-white font-bold text-lg rounded-lg px-30 py-3">
                  Back
                </button>
              </div>
            </div>
          )}
        </Modal>
      </Table>
    </div>
  );
}
// // components/admin/tables/OrderTable.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Table from "../../Table";
// import { FaCircleInfo } from "react-icons/fa6";
// import Modal from "react-modal";
// import { listOrdersForTable } from "@/services/OrderNAllocation";
// import { fetchSizeMetaMap } from "@/services/EggInventory";

// const modalStyle = {
//   content: {
//     top: "50%", left: "50%", right: "auto", bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 10, maxHeight: "100vh", width: "50vw",
//     overflow: "visible",
//   },
//   overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
// };

// const statusColors = {
//   Confirmed: "text-blue-600",
//   "To Ship": "text-indigo-600",
//   Shipped: "text-purple-600",
//   Delivered: "text-green-600",
//   Cancelled: "text-red-600",
//   Refunded: "text-orange-500",
// };

// function fmtDateMDY(d) {
//   if (!d) return "—";
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return String(d);
//   const mm = String(dt.getMonth() + 1).padStart(2, "0");
//   const dd = String(dt.getDate()).padStart(2, "0");
//   const yyyy = dt.getFullYear();
//   return `${mm}/${dd}/${yyyy}`;
// }

// /**
//  * Props:
//  * - status / selectedOption (filter)
//  * - mode: "multi" | "single" | "none"
//  * - selectedIds: number[] (controlled by parent)
//  * - onSelectionChange: (ids:number[]) => void
//  * - refreshKey: number (force reload)
//  */
// export default function OrderTable({
//   selectedOption,
//   status,
//   mode = "none",
//   selectedIds = [],
//   onSelectionChange = () => {},
//   refreshKey = 0,
// }) {
//   const effectiveStatus = status ?? selectedOption ?? null;

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadErr, setLoadErr] = useState(null);

//   // size meta for "Needs" column
//   const [sizeMeta, setSizeMeta] = useState({}); // { LABEL: {id,ept} }
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const meta = await fetchSizeMetaMap();
//         if (!alive) return;
//         setSizeMeta(meta || {});
//       } catch {}
//     })();
//     return () => { alive = false; };
//   }, []);

//   // pagination
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const pageSizeOptions = [5, 10, 25, 50];

//   // modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalData, setModalData] = useState(null);

//   // Fetch from RPC whenever filter or refreshKey changes
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setLoadErr(null);
//         const apiRows = await listOrdersForTable({ status: effectiveStatus });
//         if (!alive) return;
//         const shaped = (apiRows || []).map((r) => ({
//           orderID: r.id,
//           customerName: r.customer || "—",
//           dateOrdered: fmtDateMDY(r.dateOrdered),
//           totalAmount: Number(r.totalAmount ?? 0).toFixed(2),
//           orderStatus: r.orderStatus || "—",
//           paymentStatus: r.paymentStatus || "—",
//           phoneNumber: "—",
//           address: r.buyerCoopName || "—",
//           raw: r,
//         }));
//         setRows(shaped);
//         setPage(1);
//       } catch (e) {
//         if (!alive) return;
//         setLoadErr(e?.message || "Failed to load orders.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [effectiveStatus, refreshKey]);

//   // Derived pagination
//   const totalRows = rows.length;
//   const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
//   const safePage = Math.min(page, totalPages);
//   const startIdx = (safePage - 1) * pageSize;
//   const endIdx = Math.min(startIdx + pageSize, totalRows);
//   const currentRows = useMemo(() => rows.slice(startIdx, endIdx), [rows, startIdx, endIdx]);

//   // Selection helpers
//   const isSelected = (id) => selectedIds.includes(id);

//   const toggleCheckbox = (id) => {
//     if (mode !== "multi") return;
//     const next = isSelected(id)
//       ? selectedIds.filter((x) => x !== id)
//       : [...selectedIds, id];
//     onSelectionChange(next);
//   };

//   const selectAllOnPage = (checked) => {
//     if (mode !== "multi") return;
//     const pageIds = currentRows.map((r) => r.orderID);
//     const pageSet = new Set(pageIds);
//     const currentSet = new Set(selectedIds);
//     let next;
//     if (checked) {
//       next = Array.from(new Set([...selectedIds, ...pageIds]));
//     } else {
//       next = selectedIds.filter((id) => !pageSet.has(id));
//     }
//     onSelectionChange(next);
//   };

//   const setRadio = (id) => {
//     if (mode !== "single") return;
//     onSelectionChange(id ? [id] : []);
//   };

//   // header cells
//   const selectionHeader =
//     mode === "multi" ? (
//       <input
//         key="selectAll"
//         type="checkbox"
//         className="accent-primaryYellow focus:ring-2 focus:ring-black"
//         onChange={(e) => selectAllOnPage(e.target.checked)}
//         checked={
//           currentRows.length > 0 &&
//           currentRows.every((r) => selectedIds.includes(r.orderID))
//         }
//         indeterminate={
//           currentRows.some((r) => selectedIds.includes(r.orderID)) &&
//           !currentRows.every((r) => selectedIds.includes(r.orderID))
//         }
//       />
//     ) : mode === "single" ? (
//       <span key="selectOne" className="text-xs text-gray-500">Select</span>
//     ) : (
//       <span key="blank" />
//     );

//   const headers = [
//     "Order ID",
//     "Customer",
//     "Date Ordered",
//     "Total Amount",
//     "Needs",          // NEW
//     "Order Status",
//     "Payment Status",
//     "Details",
//     selectionHeader,
//   ];

//   const viewOrderDetails = (item) => {
//     setIsModalOpen(true);
//     setModalData(item);
//   };

//   const onPrev = () => setPage((p) => Math.max(1, p - 1));
//   const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

//   // helper to render needs as "S×2, M×1"
//   const labelFromSizeId = (sid) => {
//     const entry = Object.entries(sizeMeta).find(([label, v]) => Number(v.id) === Number(sid));
//     return entry ? entry[0] : `#${sid}`;
//   };

//   return (
//     <div className="w-full">
//       {/* Top bar */}
//       <div className="mb-3 flex items-center justify-between">
//         <div className="flex items-center gap-2 text-[12px] text-gray-500">
//           <div className="relative">
//             <select
//               className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//             >
//               {pageSizeOptions.map((n) => (
//                 <option key={n} value={n}>{n}</option>
//               ))}
//             </select>
//             <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//           <span>
//             Displaying {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of {totalRows}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             className="rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold disabled:opacity-50"
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

//       <Table headers={headers}>
//         {loading && (
//           <tr>
//             <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
//               Loading orders…
//             </td>
//           </tr>
//         )}

//         {!loading && loadErr && (
//           <tr>
//             <td colSpan={9} className="px-4 py-6 text-center text-red-600">
//               {loadErr}
//             </td>
//           </tr>
//         )}

//         {!loading && !loadErr && currentRows.length === 0 && (
//           <tr>
//             <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
//               No orders found.
//             </td>
//           </tr>
//         )}

//         {!loading && !loadErr && currentRows.map((item, index) => {
//           const needsBy = new Map();
//           for (const p of item.raw?.products || []) {
//             const sid = Number(p.size_id || 0);
//             const trays = Number(p.tray_qty || 0);
//             if (!sid || trays <= 0) continue;
//             needsBy.set(sid, (needsBy.get(sid) || 0) + trays);
//           }
//           const needsStr = Array.from(needsBy.entries())
//             .map(([sid, t]) => `${labelFromSizeId(sid)}×${t}`)
//             .join(", ");

//           return (
//             <tr key={`${item.orderID}-${startIdx + index}`} className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition">
//               <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
//               <td className="px-4 py-3 text-center">{item.customerName}</td>
//               <td className="px-4 py-3 text-center">{item.dateOrdered}</td>
//               <td className="px-4 py-3 text-center">{item.totalAmount}</td>
//               <td className="px-4 py-3 text-center">{needsStr || "—"}</td>
//               <td className={`px-4 py-3 text-center font-medium ${statusColors[item.orderStatus] || "text-gray-500"}`}>
//                 {item.orderStatus}
//               </td>
//               <td className="px-4 py-3 text-center">{item.paymentStatus}</td>
//               <td
//                 onClick={() => viewOrderDetails(item)}
//                 className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400"
//                 title="View details"
//               >
//                 <FaCircleInfo />
//               </td>

//               {/* selection cell */}
//               <td className="px-4 py-3 text-center">
//                 {mode === "multi" ? (
//                   <input
//                     type="checkbox"
//                     className="accent-primaryYellow focus:ring-2 focus:ring-black"
//                     checked={selectedIds.includes(item.orderID)}
//                     onChange={() => toggleCheckbox(item.orderID)}
//                   />
//                 ) : mode === "single" ? (
//                   <input
//                     type="radio"
//                     name="order-single-select"
//                     className="accent-primaryYellow focus:ring-2 focus:ring-black"
//                     checked={selectedIds.includes(item.orderID)}
//                     onChange={() => setRadio(item.orderID)}
//                   />
//                 ) : null}
//               </td>
//             </tr>
//           );
//         })}

//         {/* Modal */}
//         <Modal
//           isOpen={isModalOpen}
//           onRequestClose={() => setIsModalOpen(false)}
//           contentLabel="Order Details"
//           style={modalStyle}
//         >
//           {modalData && (
//             <div className="flex flex-col gap-5 p-10">
//               <div className="flex flex-row items-center justify-between">
//                 <div className="flex flex-col leading-tight">
//                   <h1 className="text-2xl font-bold text-primaryYellow">Order Details</h1>
//                   <p className="text-lg text-gray-400 font-bold">Order #: {modalData.orderID}</p>
//                 </div>
//                 <div className="flex flex-col leading-tight items-end">
//                   <h1 className="text-lg text-gray-400 font-bold">Current Status:</h1>
//                   <p className="text-2xl font-bold text-primaryYellow">{modalData.orderStatus}</p>
//                 </div>
//               </div>

//               <div className="flex flex-col leading-tight">
//                 <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
//                   {modalData.customerName} <span className="text-gray-400">{modalData.phoneNumber || "—"}</span>
//                 </h1>
//                 <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">{modalData.address || "—"}</h2>
//               </div>

//               <div className="flex flex-row gap-5">
//                 <div className="border-2 p-5 rounded-lg w-full">
//                   <div className="flex flex-col gap-3">
//                     <h1 className="text-xl text-primaryYellow font-bold mb-5">Item Summary</h1>
//                     <div className="text-gray-500">(Attach order items from RPC when available)</div>
//                   </div>
//                 </div>

//                 <div className="border-2 p-5 rounded-lg w-full">
//                   <div className="flex flex-col gap-2">
//                     <h1 className="text-xl text-primaryYellow font-bold mb-5">Order Summary</h1>
//                     <div className="flex flex-row justify-between items-center font-bold text-lg">
//                       <p>Total Order</p>
//                       <p>₱{modalData.totalAmount}</p>
//                     </div>
//                     <div className="flex flex-row justify-between items-center text-primaryYellow font-bold text-lg">
//                       <p>Payment Method</p>
//                       <p>{modalData.paymentStatus || "—"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-center">
//                 <button onClick={() => setIsModalOpen(false)} className="cursor-pointer bg-primaryYellow text-white font-bold text-lg rounded-lg px-30 py-3">
//                   Back
//                 </button>
//               </div>
//             </div>
//           )}
//         </Modal>
//       </Table>
//     </div>
//   );
// }

// // components/admin/tables/OrderTable.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Table from "../../Table";
// import { FaCircleInfo } from "react-icons/fa6";
// import Modal from "react-modal";
// import { listOrdersForTable } from "@/services/OrderNAllocation";
// import { fetchSizeMetaMap } from "@/services/EggInventory";

//  const [sizeMap, setSizeMap] = useState({}); // { LABEL: {id,ept} }
//  useEffect(() => {
//    let alive = true;
//    (async () => {
//      try {
//        const meta = await fetchSizeMetaMap();
//        if (!alive) return;
//        setSizeMap(meta || {});
//      } catch {}
//    })();
//    return () => { alive = false; };
//  }, []);

// const modalStyle = {
//   content: {
//     top: "50%", left: "50%", right: "auto", bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 10, maxHeight: "100vh", width: "50vw",
//     overflow: "visible",
//   },
//   overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
// };

// const statusColors = {
//   Confirmed: "text-blue-600",
//   "To Ship": "text-indigo-600",
//   Shipped: "text-purple-600",
//   Delivered: "text-green-600",
//   Cancelled: "text-red-600",
//   Refunded: "text-orange-500",
// };

// function fmtDateMDY(d) {
//   if (!d) return "—";
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return String(d);
//   const mm = String(dt.getMonth() + 1).padStart(2, "0");
//   const dd = String(dt.getDate()).padStart(2, "0");
//   const yyyy = dt.getFullYear();
//   return `${mm}/${dd}/${yyyy}`;
// }

// /**
//  * Props:
//  * - status / selectedOption (filter)
//  * - mode: "multi" | "single" | "none"
//  * - selectedIds: number[] (controlled by parent)
//  * - onSelectionChange: (ids:number[]) => void
//  * - refreshKey: number (force reload)
//  */
// export default function OrderTable({
//   selectedOption,
//   status,
//   mode = "none",
//   selectedIds = [],
//   onSelectionChange = () => {},
//   refreshKey = 0,
// }) {
//   const effectiveStatus = status ?? selectedOption ?? null;

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadErr, setLoadErr] = useState(null);

//   // pagination
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const pageSizeOptions = [5, 10, 25, 50];

//   // modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalData, setModalData] = useState(null);

//   // Fetch from RPC whenever filter or refreshKey changes
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setLoadErr(null);
//         const apiRows = await listOrdersForTable({ status: effectiveStatus });
//         if (!alive) return;
//         const shaped = (apiRows || []).map((r) => ({
//           orderID: r.id,
//           customerName: r.customer || "—",
//           dateOrdered: fmtDateMDY(r.dateOrdered),
//           totalAmount: Number(r.totalAmount ?? 0).toFixed(2),
//           orderStatus: r.orderStatus || "—",
//           paymentStatus: r.paymentStatus || "—",
//           phoneNumber: "—",
//           address: r.buyerCoopName || "—",
//           raw: r,
//         }));
//         setRows(shaped);
//         setPage(1);
//       } catch (e) {
//         if (!alive) return;
//         setLoadErr(e?.message || "Failed to load orders.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [effectiveStatus, refreshKey]);

//   // Derived pagination
//   const totalRows = rows.length;
//   const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
//   const safePage = Math.min(page, totalPages);
//   const startIdx = (safePage - 1) * pageSize;
//   const endIdx = Math.min(startIdx + pageSize, totalRows);
//   const currentRows = useMemo(() => rows.slice(startIdx, endIdx), [rows, startIdx, endIdx]);

//   // Selection helpers
//   const isSelected = (id) => selectedIds.includes(id);

//   const toggleCheckbox = (id) => {
//     if (mode !== "multi") return;
//     const next = isSelected(id)
//       ? selectedIds.filter((x) => x !== id)
//       : [...selectedIds, id];
//     onSelectionChange(next);
//   };

//   const selectAllOnPage = (checked) => {
//     if (mode !== "multi") return;
//     const pageIds = currentRows.map((r) => r.orderID);
//     const pageSet = new Set(pageIds);
//     const currentSet = new Set(selectedIds);
//     let next;
//     if (checked) {
//       next = Array.from(new Set([...selectedIds, ...pageIds]));
//     } else {
//       next = selectedIds.filter((id) => !pageSet.has(id));
//     }
//     onSelectionChange(next);
//   };

//   const setRadio = (id) => {
//     if (mode !== "single") return;
//     onSelectionChange(id ? [id] : []);
//   };

//   // header cells
//   const selectionHeader =
//     mode === "multi" ? (
//       <input
//         key="selectAll"
//         type="checkbox"
//         className="accent-primaryYellow focus:ring-2 focus:ring-black"
//         onChange={(e) => selectAllOnPage(e.target.checked)}
//         checked={
//           currentRows.length > 0 &&
//           currentRows.every((r) => selectedIds.includes(r.orderID))
//         }
//         indeterminate={
//           currentRows.some((r) => selectedIds.includes(r.orderID)) &&
//           !currentRows.every((r) => selectedIds.includes(r.orderID))
//         }
//       />
//     ) : mode === "single" ? (
//       <span key="selectOne" className="text-xs text-gray-500">Select</span>
//     ) : (
//       <span key="blank" />
//     );

//   // const headers = [
//   //   "Order ID",
//   //   "Customer",
//   //   "Date Ordered",
//   //   "Total Amount",
//   //   "Order Status",
//   //   "Payment Status",
//   //   "Details",
//   //   selectionHeader,
//   // ];
//  const headers = [
//    "Order ID",
//    "Customer",
//    "Date Ordered",
//    "Total Amount",
//    "Needs",           // ⬅ new column
//    "Order Status",
//    "Payment Status",
//    "Details",
//    selectionHeader,
//  ];

//   const viewOrderDetails = (item) => {
//     setIsModalOpen(true);
//     setModalData(item);
//   };

//   const onPrev = () => setPage((p) => Math.max(1, p - 1));
//   const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

//   return (
//     <div className="w-full">
//       {/* Top bar */}
//       <div className="mb-3 flex items-center justify-between">
//         <div className="flex items-center gap-2 text-[12px] text-gray-500">
//           <div className="relative">
//             <select
//               className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//             >
//               {pageSizeOptions.map((n) => (
//                 <option key={n} value={n}>{n}</option>
//               ))}
//             </select>
//             <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//           <span>
//             Displaying {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of {totalRows}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             className="rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold disabled:opacity-50"
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

//       <Table headers={headers}>
//         {loading && (
//           <tr>
//             <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
//               Loading orders…
//             </td>
//           </tr>
//         )}

//         {!loading && loadErr && (
//           <tr>
//             <td colSpan={8} className="px-4 py-6 text-center text-red-600">
//               {loadErr}
//             </td>
//           </tr>
//         )}

//         {!loading && !loadErr && currentRows.length === 0 && (
//           <tr>
//             <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
//               No orders found.
//             </td>
//           </tr>
//         )}

//         {!loading && !loadErr && currentRows.map((item, index) => (
//           <tr key={`${item.orderID}-${startIdx + index}`} className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition">
//             <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
//             <td className="px-4 py-3 text-center">{item.customerName}</td>
//             <td className="px-4 py-3 text-center">{item.dateOrdered}</td>
//             <td className="px-4 py-3 text-center">{item.totalAmount}</td>
//             <td className={`px-4 py-3 text-center font-medium ${statusColors[item.orderStatus] || "text-gray-500"}`}>
//               {item.orderStatus}
//             </td>
//             <td className="px-4 py-3 text-center">{item.paymentStatus}</td>
//             <td
//               onClick={() => viewOrderDetails(item)}
//               className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400"
//               title="View details"
//             >
//               <FaCircleInfo />
//             </td>

//             {/* selection cell */}
//             <td className="px-4 py-3 text-center">
//               {mode === "multi" ? (
//                 <input
//                   type="checkbox"
//                   className="accent-primaryYellow focus:ring-2 focus:ring-black"
//                   checked={isSelected(item.orderID)}
//                   onChange={() => toggleCheckbox(item.orderID)}
//                 />
//               ) : mode === "single" ? (
//                 <input
//                   type="radio"
//                   name="order-single-select"
//                   className="accent-primaryYellow focus:ring-2 focus:ring-black"
//                   checked={isSelected(item.orderID)}
//                   onChange={() => setRadio(item.orderID)}
//                 />
//               ) : null}
//             </td>
//           </tr>
//         ))}

//         {/* Modal */}
//         <Modal
//           isOpen={isModalOpen}
//           onRequestClose={() => setIsModalOpen(false)}
//           contentLabel="Order Details"
//           style={modalStyle}
//         >
//           {modalData && (
//             <div className="flex flex-col gap-5 p-10">
//               <div className="flex flex-row items-center justify-between">
//                 <div className="flex flex-col leading-tight">
//                   <h1 className="text-2xl font-bold text-primaryYellow">Order Details</h1>
//                   <p className="text-lg text-gray-400 font-bold">Order #: {modalData.orderID}</p>
//                 </div>
//                 <div className="flex flex-col leading-tight items-end">
//                   <h1 className="text-lg text-gray-400 font-bold">Current Status:</h1>
//                   <p className="text-2xl font-bold text-primaryYellow">{modalData.orderStatus}</p>
//                 </div>
//               </div>

//               <div className="flex flex-col leading-tight">
//                 <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
//                   {modalData.customerName} <span className="text-gray-400">{modalData.phoneNumber || "—"}</span>
//                 </h1>
//                 <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">{modalData.address || "—"}</h2>
//               </div>

//               <div className="flex flex-row gap-5">
//                 <div className="border-2 p-5 rounded-lg w-full">
//                   <div className="flex flex-col gap-3">
//                     <h1 className="text-xl text-primaryYellow font-bold mb-5">Item Summary</h1>
//                     <div className="text-gray-500">(Attach order items from RPC when available)</div>
//                   </div>
//                 </div>

//                 <div className="border-2 p-5 rounded-lg w-full">
//                   <div className="flex flex-col gap-2">
//                     <h1 className="text-xl text-primaryYellow font-bold mb-5">Order Summary</h1>
//                     <div className="flex flex-row justify-between items-center font-bold text-lg">
//                       <p>Total Order</p>
//                       <p>₱{modalData.totalAmount}</p>
//                     </div>
//                     <div className="flex flex-row justify-between items-center text-primaryYellow font-bold text-lg">
//                       <p>Payment Method</p>
//                       <p>{modalData.paymentStatus || "—"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-center">
//                 <button onClick={() => setIsModalOpen(false)} className="cursor-pointer bg-primaryYellow text-white font-bold text-lg rounded-lg px-30 py-3">
//                   Back
//                 </button>
//               </div>
//             </div>
//           )}
//         </Modal>
//       </Table>
//     </div>
//   );
// }

// // components/admin/tables/OrderTable.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Table from "../../Table";
// import { FaCircleInfo } from "react-icons/fa6";
// import Modal from "react-modal";
// import { listOrdersForTable } from "@/services/OrderNAllocation";

// const modalStyle = {
//   content: {
//     top: "50%", left: "50%", right: "auto", bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 10, maxHeight: "100vh", width: "50vw",
//     overflow: "visible",
//   },
//   overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
// };

// const statusColors = {
//   Confirmed: "text-blue-600",
//   "To Ship": "text-indigo-600",
//   Shipped: "text-purple-600",
//   Delivered: "text-green-600",
//   Cancelled: "text-red-600",
//   Refunded: "text-orange-500",
// };

// function fmtDateMDY(d) {
//   if (!d) return "—";
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return String(d);
//   const mm = String(dt.getMonth() + 1).padStart(2, "0");
//   const dd = String(dt.getDate()).padStart(2, "0");
//   const yyyy = dt.getFullYear();
//   return `${mm}/${dd}/${yyyy}`;
// }

// /**
//  * Props:
//  *  - selectedOption / status: which order status to load
//  *  - onSelect?(payload): optional callback when selection changes
//  */
// export default function OrderTable({ selectedOption, status, onSelect }) {
//   const effectiveStatus = status ?? selectedOption ?? null;

//   // Decide selection mode based on status
//   // multi  = checkboxes + select-all (for Confirmed)
//   // single = radio buttons (for To Ship)
//   // none   = no selection (others) — you can keep multi if you prefer
//   const selectionMode =
//     effectiveStatus === "Confirmed" ? "multi"
//     : effectiveStatus === "To Ship" ? "single"
//     : "none";

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadErr, setLoadErr] = useState(null);

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const pageSizeOptions = [5, 10, 25, 50];

//   // Selection state
//   const [selected, setSelected] = useState([]);       // for multi (per page)
//   const [selectAll, setSelectAll] = useState(false);  // for multi
//   const [selectedId, setSelectedId] = useState(null); // for single

//   // Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalData, setModalData] = useState(null);

//   // Load data
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setLoadErr(null);
//         const apiRows = await listOrdersForTable({ status: effectiveStatus });
//         if (!alive) return;
//         const shaped = (apiRows || []).map((r) => ({
//           orderID: r.id,
//           customerName: r.customer || "—",
//           dateOrdered: fmtDateMDY(r.dateOrdered),
//           totalAmount: Number(r.totalAmount ?? 0).toFixed(2),
//           orderStatus: r.orderStatus || "—",
//           paymentStatus: r.paymentStatus || "—",
//           phoneNumber: "—",
//           address: r.buyerCoopName || "—",
//           raw: r,
//         }));
//         setRows(shaped);
//         setPage(1);
//         setSelected([]);
//         setSelectAll(false);
//         setSelectedId(null);
//       } catch (e) {
//         if (!alive) return;
//         setLoadErr(e?.message || "Failed to load orders.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [effectiveStatus]);

//   // Paging
//   const totalRows = rows.length;
//   const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
//   const safePage = Math.min(page, totalPages);
//   const startIdx = (safePage - 1) * pageSize;
//   const endIdx = Math.min(startIdx + pageSize, totalRows);
//   const currentRows = useMemo(() => rows.slice(startIdx, endIdx), [rows, startIdx, endIdx]);

//   // Reset page-local selection when page/size/data changes
//   useEffect(() => {
//     setSelected([]);
//     setSelectAll(false);
//   }, [safePage, pageSize, rows]);

//   // Notify parent on selection changes (optional)
//   useEffect(() => {
//     if (!onSelect) return;
//     if (selectionMode === "multi") {
//       const selectedOrders = currentRows
//         .map((r, i) => (selected[i] ? r : null))
//         .filter(Boolean)
//         .map((r) => r.orderID);
//       onSelect({ mode: "multi", orderIds: selectedOrders });
//     } else if (selectionMode === "single") {
//       onSelect({ mode: "single", orderId: selectedId });
//     } else {
//       onSelect({ mode: "none" });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selected, selectedId, selectionMode, currentRows]);

//   // Table headers
//   const headers = [
//     "Order ID",
//     "Customer",
//     "Date Ordered",
//     "Total Amount",
//     "Order Status",
//     "Payment Status",
//     "Details",
//     selectionMode === "multi" ? (
//       <input
//         key="selectAll"
//         type="checkbox"
//         checked={selectAll}
//         className="accent-primaryYellow focus:ring-2 focus:ring-black"
//         onChange={(e) => {
//           const isChecked = e.target.checked;
//           setSelectAll(isChecked);
//           setSelected(Array(currentRows.length).fill(isChecked));
//         }}
//       />
//     ) : selectionMode === "single" ? "Select" : "", // header label for radio/no-select
//   ];

//   const viewOrderDetails = (item) => {
//     setIsModalOpen(true);
//     setModalData(item);
//   };

//   const onPrev = () => setPage((p) => Math.max(1, p - 1));
//   const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

//   return (
//     <div className="w-full">
//       {/* Top bar: page size + results summary */}
//       <div className="mb-3 flex items-center justify-between">
//         <div className="flex items-center gap-2 text-[12px] text-gray-500">
//           <div className="relative">
//             <select
//               className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//             >
//               {pageSizeOptions.map((n) => (
//                 <option key={n} value={n}>{n}</option>
//               ))}
//             </select>
//             <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//           <span>
//             Displaying {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of {totalRows}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             className="rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold disabled:opacity-50"
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

//       <Table headers={headers}>
//         {loading && (
//           <tr>
//             <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
//               Loading orders…
//             </td>
//           </tr>
//         )}

//         {!loading && loadErr && (
//           <tr>
//             <td colSpan={8} className="px-4 py-6 text-center text-red-600">
//               {loadErr}
//             </td>
//           </tr>
//         )}

//         {!loading && !loadErr && currentRows.length === 0 && (
//           <tr>
//             <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
//               No orders found.
//             </td>
//           </tr>
//         )}

//         {!loading && !loadErr && currentRows.map((item, index) => (
//           <tr key={`${item.orderID}-${startIdx + index}`} className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition">
//             <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
//             <td className="px-4 py-3 text-center">{item.customerName}</td>
//             <td className="px-4 py-3 text-center">{item.dateOrdered}</td>
//             <td className="px-4 py-3 text-center">{item.totalAmount}</td>
//             <td className={`px-4 py-3 text-center font-medium ${statusColors[item.orderStatus] || "text-gray-500"}`}>
//               {item.orderStatus}
//             </td>
//             <td className="px-4 py-3 text-center">{item.paymentStatus}</td>
//             <td
//               onClick={() => viewOrderDetails(item)}
//               className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400"
//               title="View details"
//             >
//               <FaCircleInfo />
//             </td>

//             {/* selection cell */}
//             <td className="px-4 py-3 text-center">
//               {selectionMode === "multi" && (
//                 <input
//                   type="checkbox"
//                   className="accent-primaryYellow focus:ring-2 focus:ring-black"
//                   checked={selected[index] || false}
//                   onChange={() => {
//                     const copy = [...selected];
//                     copy[index] = !copy[index];
//                     setSelected(copy);
//                     setSelectAll(copy.length > 0 && copy.every(Boolean));
//                   }}
//                 />
//               )}

//               {selectionMode === "single" && (
//                 <input
//                   type="radio"
//                   name="order-single-select"
//                   className="accent-primaryYellow focus:ring-2 focus:ring-black"
//                   checked={selectedId === item.orderID}
//                   onChange={() => setSelectedId(item.orderID)}
//                 />
//               )}
//             </td>
//           </tr>
//         ))}

//         {/* Modal */}
//         <Modal
//           isOpen={isModalOpen}
//           onRequestClose={() => setIsModalOpen(false)}
//           contentLabel="Order Details"
//           style={modalStyle}
//         >
//           {modalData && (
//             <div className="flex flex-col gap-5 p-10">
//               <div className="flex flex-row items-center justify-between">
//                 <div className="flex flex-col leading-tight">
//                   <h1 className="text-2xl font-bold text-primaryYellow">Order Details</h1>
//                   <p className="text-lg text-gray-400 font-bold">Order #: {modalData.orderID}</p>
//                 </div>
//                 <div className="flex flex-col leading-tight items-end">
//                   <h1 className="text-lg text-gray-400 font-bold">Current Status:</h1>
//                   <p className="text-2xl font-bold text-primaryYellow">{modalData.orderStatus}</p>
//                 </div>
//               </div>

//               <div className="flex flex-col leading-tight">
//                 <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
//                   {modalData.customerName} <span className="text-gray-400">{modalData.phoneNumber || "—"}</span>
//                 </h1>
//                 <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">{modalData.address || "—"}</h2>
//               </div>

//               <div className="flex flex-row gap-5">
//                 <div className="border-2 p-5 rounded-lg w-full">
//                   <div className="flex flex-col gap-3">
//                     <h1 className="text-xl text-primaryYellow font-bold mb-5">Item Summary</h1>
//                     <div className="text-gray-500">(Attach order items from RPC when available)</div>
//                   </div>
//                 </div>

//                 <div className="border-2 p-5 rounded-lg w-full">
//                   <div className="flex flex-col gap-2">
//                     <h1 className="text-xl text-primaryYellow font-bold mb-5">Order Summary</h1>
//                     <div className="flex flex-row justify-between items-center font-bold text-lg">
//                       <p>Total Order</p>
//                       <p>₱{modalData.totalAmount}</p>
//                     </div>
//                     <div className="flex flex-row justify-between items-center text-primaryYellow font-bold text-lg">
//                       <p>Payment Method</p>
//                       <p>{modalData.paymentStatus || "—"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-center">
//                 <button onClick={() => setIsModalOpen(false)} className="cursor-pointer bg-primaryYellow text-white font-bold text-lg rounded-lg px-30 py-3">
//                   Back
//                 </button>
//               </div>
//             </div>
//           )}
//         </Modal>
//       </Table>
//     </div>
//   );
// }
