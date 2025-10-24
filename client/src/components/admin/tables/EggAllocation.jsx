// components/admin/tables/EggAllocation.jsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { fetchEggBatchesGrouped } from "@/services/EggInventory";
import {
  getOrderSizeRequirement,
  getOrderSizeRequirements,
  adminCreateAllocationBulk,
} from "@/services/OrderNAllocation";

/**
 * Props:
 * - open: boolean
 * - order: { orderID: number }
 * - selectedSupplyRowIds: string[]   // "<farmer_uuid>-YYYY-MM-DD"
 * - onClose: () => void
 * - onAllocated?: () => void
 */
const modalStyle = {
  content: {
    top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    borderRadius: 20, padding: 20, width: "92vw", maxWidth: 800,
    maxHeight: "90vh", overflow: "auto",
  },
  overlay: { backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1000 },
};

export default function EggAllocation({
  open = false,
  order,
  selectedSupplyRowIds = [],
  onClose,
  onAllocated,
}) {
  // requirement for this order (per size)
  const [orderNeeds, setOrderNeeds] = useState([]); // [{sizeId,sizeLabel,trays,ept}]
  const [activeSize, setActiveSize] = useState(null);
  const [activeEpt, setActiveEpt] = useState(30);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // supply rows (for the active size, from the selected farmer-date rows)
  const [rows, setRows] = useState([]); // [{ id, farmer, date, eggsAvail, traysInfo }]
  const [required, setRequired] = useState({ trays: 0, sizeId: null, ept: 30 });

  // user inputs (eggs per row)
  const [inputs, setInputs] = useState({});
  const supplyIdsKey = (selectedSupplyRowIds || []).join(",");

  // load all sizes needed for this order when modal opens
  useEffect(() => {
    if (!open || !order?.orderID) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr(null);
        const needs = await getOrderSizeRequirements(order.orderID);
        if (!alive) return;

        if (!needs.length) {
          setErr("This order has no tray requirements.");
          setLoading(false);
          return;
        }

        // pick first size as default
        const first = needs[0];
        setOrderNeeds(needs);
        setActiveSize(first.sizeLabel);
        setActiveEpt(first.ept);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to prepare allocation.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, order?.orderID]);

  // whenever the active size or the selected rows change: load supply & requirement
  useEffect(() => {
    if (!open || !order?.orderID || !activeSize || (selectedSupplyRowIds || []).length === 0) {
      setRows([]); setRequired({ trays: 0, sizeId: null, ept: activeEpt }); setInputs({});
      return;
    }
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr(null);

        // all grouped rows, then pick only the ones the user checked in EggSupplyTable
        const all = await fetchEggBatchesGrouped({});
        const picked = (all || []).filter((r) => (selectedSupplyRowIds || []).includes(r.id));

        // requirement for this size (trays & ept)
        const need = await getOrderSizeRequirement(order.orderID, activeSize);
        if (!alive) return;

        // shape supply rows for this size:
        // - eggsAvail comes straight from RPC's per-size breakdown (sum of live eggs across batches)
        const shaped = picked.map((r) => {
          const item = (r.sizeBreakdown || []).find(
            (s) => String(s.size || "").toUpperCase() === String(activeSize).toUpperCase()
          );
          const eggs = Number(item?.eggs || 0);
          const traysInfo = Math.floor(eggs / (need?.ept || activeEpt || 30));
          return {
            id: r.id,
            farmer: r.farmer,
            date: r.date,
            eggsAvail: eggs,
            traysInfo,
          };
        });

        setRows(shaped);
        setRequired({ trays: Number(need?.trays || 0), sizeId: need?.sizeId ?? null, ept: need?.ept || activeEpt || 30 });

        // init inputs to 0
        const init = {}; shaped.forEach((r) => { init[r.id] = 0; });
        setInputs(init);
        setActiveEpt(need?.ept || activeEpt || 30);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load supply for selected size.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, order?.orderID, activeSize, supplyIdsKey]);

  // reset when closed
  useEffect(() => {
    if (!open) {
      setRows([]); setInputs({}); setErr(null); setLoading(false);
      setOrderNeeds([]); setActiveSize(null); setActiveEpt(30);
      setRequired({ trays: 0, sizeId: null, ept: 30 });
    }
  }, [open]);

  // ---- derived numbers (eggs mode) ----
  const requiredEggs = (required.trays || 0) * (required.ept || activeEpt || 30);
  const sumEggs = Object.values(inputs).reduce((s, v) => s + Math.max(0, Math.floor(Number(v || 0))), 0);
  const remainingEggs = Math.max(0, requiredEggs - sumEggs);
  const overEggs = Math.max(0, sumEggs - requiredEggs);

  const canConfirm =
    open &&
    !loading &&
    !err &&
    rows.length > 0 &&
    required.trays > 0 &&
    overEggs === 0 &&
    remainingEggs === 0 &&
    rows.every((r) => (inputs[r.id] ?? 0) <= r.eggsAvail);

  const onChangeInput = (rowId, val) =>
    setInputs((prev) => ({
      ...prev,
      [rowId]: Math.max(0, Math.floor(Number(val || 0))),
    }));

  // Greedy autofill: consume eggs from rows in order until requirement met
  const autoFill = () => {
    let need = requiredEggs;
    const next = {};
    for (const r of rows) {
      if (need <= 0) { next[r.id] = 0; continue; }
      const take = Math.min(need, Number(r.eggsAvail || 0));
      next[r.id] = take;
      need -= take;
    }
    setInputs(next);
  };

  const confirm = async () => {
    if (!canConfirm) return;

    // build eggs payload
    const details = rows
      .map((r) => ({ supply_row_key: r.id, eggs: Math.max(0, Math.floor(Number(inputs[r.id] || 0))) }))
      .filter((d) => d.eggs > 0);

    try {
      const res = await adminCreateAllocationBulk({
        orderId: order.orderID,
        sizeId: required.sizeId,
        details, // eggs mode
      });
      if (res?.warning) {
        console.warn(res.warning);
        alert(`Allocated with warning: ${res.warning}`);
      } else {
        alert("Allocation recorded.");
      }
      onAllocated?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      alert(`Allocation failed: ${e?.message || e}`);
    }
  };

  return (
    <Modal isOpen={open} onRequestClose={onClose} style={modalStyle} contentLabel="Allocate Order">
      <div className="flex flex-col gap-4">
        <h2 className="text-center text-2xl font-bold text-primaryYellow">
          Allocate {activeSize || "—"} eggs to Order #{order?.orderID}
        </h2>

        {/* If order needs multiple sizes, allow switching */}
        {orderNeeds.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {orderNeeds.map((n) => (
              <button
                key={n.sizeId}
                type="button"
                onClick={() => setActiveSize(n.sizeLabel)}
                className={`px-3 py-1 rounded-full border ${
                  activeSize === n.sizeLabel
                    ? "bg-primaryYellow text-white border-primaryYellow"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {n.sizeLabel} × {n.trays}
              </button>
            ))}
          </div>
        )}

        {!open ? null : loading ? (
          <div className="text-center text-gray-500 py-8">Preparing…</div>
        ) : err ? (
          <div className="text-center text-red-600 py-8">{err}</div>
        ) : (
          <>
            <div className="text-center text-gray-700">
              Required: <b>{required.trays}</b> trays • Eggs/tray: <b>{required.ept}</b> •{" "}
              Need eggs: <b>{requiredEggs}</b>
            </div>

            <div className="rounded-lg border">
              <div className="grid grid-cols-12 gap-2 border-b px-3 py-2 font-semibold">
                <div className="col-span-5">Farmer / Date</div>
                <div className="col-span-3 text-center">Available (eggs)</div>
                <div className="col-span-2 text-center">≈ Trays</div>
                <div className="col-span-2 text-center">Allocate (eggs)</div>
              </div>

              {rows.map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-0 items-center">
                  <div className="col-span-5">
                    <div className="font-medium">{r.farmer}</div>
                    <div className="text-xs text-gray-500">{new Date(r.date).toDateString()}</div>
                  </div>
                  <div className="col-span-3 text-center">{(r.eggsAvail || 0).toLocaleString()}</div>
                  <div className="col-span-2 text-center">{r.traysInfo}</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={r.eggsAvail}
                      value={inputs[r.id] ?? 0}
                      onChange={(e) => onChangeInput(r.id, e.target.value)}
                      className="w-full rounded-md border px-2 py-1 text-center"
                    />
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                      onClick={() => onChangeInput(r.id, r.eggsAvail)}
                      title="Use all eggs from this row"
                    >
                      Max
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-700">
              <button type="button" className="rounded-md border px-3 py-2 hover:bg-gray-50" onClick={autoFill}>
                Auto-fill
              </button>
              <div className="flex items-center gap-4">
                <span>Allocated: <b>{sumEggs.toLocaleString()}</b> eggs</span>
                <span>= <b>{sumEggs.toLocaleString()}</b> / {requiredEggs.toLocaleString()}
                  {overEggs > 0 && <span className="text-red-600"> (over by {overEggs})</span>}
                  {remainingEggs > 0 && <span className="text-red-600"> (remain {remainingEggs})</span>}
                </span>
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-3">
              <button className="rounded-lg bg-gray-300 px-4 py-2" onClick={onClose}>Cancel</button>
              <button
                className={`rounded-lg px-4 py-2 text-white ${canConfirm ? "bg-primaryYellow hover:opacity-90" : "bg-yellow-200 cursor-not-allowed"}`}
                disabled={!canConfirm}
                onClick={confirm}
              >
                Confirm Allocation
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// // components/admin/tables/EggAllocation.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Modal from "react-modal";
// import { fetchEggBatchesGrouped } from "@/services/EggInventory";
// import {
//   getOrderSizeRequirement,
//   getOrderSizeRequirements,
//   adminCreateAllocationBulk,
// } from "@/services/OrderNAllocation";

// /**
//  * Props:
//  * - open: boolean
//  * - order: { orderID: number }
//  * - selectedSupplyRowIds: string[]   // "<farmer_uuid>-YYYY-MM-DD"
//  * - onClose: () => void
//  * - onAllocated?: () => void
//  */
// const modalStyle = {
//   content: {
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20,
//     padding: 20,
//     width: "92vw",
//     maxWidth: 800,
//     maxHeight: "90vh",
//     overflow: "auto",
//   },
//   overlay: { backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1000 },
// };

// export default function EggAllocation({
//   open = false,
//   order,
//   selectedSupplyRowIds = [],
//   onClose,
//   onAllocated,
// }) {
//   // order size requirements
//   const [orderNeeds, setOrderNeeds] = useState([]); // [{sizeId,sizeLabel,trays,ept}]
//   const [activeSize, setActiveSize] = useState(null); // "S","M",...
//   const [activeEpt, setActiveEpt] = useState(30);

//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState(null);
//   const [rows, setRows] = useState([]); // supply rows for active size
//   const [required, setRequired] = useState({ trays: 0, sizeId: null });
//   const [inputs, setInputs] = useState({});

//   const supplyIdsKey = (selectedSupplyRowIds || []).join(",");

//   // Load size requirements when modal opens
//   useEffect(() => {
//     if (!open || !order?.orderID) return;
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);
//         const needs = await getOrderSizeRequirements(order.orderID);
//         if (!alive) return;
//         setOrderNeeds(needs);
//         const first = needs[0];
//         if (!first) {
//           setErr("This order has no tray requirements.");
//           setLoading(false);
//           return;
//         }
//         setActiveSize(first.sizeLabel);
//         setActiveEpt(first.ept);
//       } catch (e) {
//         if (!alive) return;
//         setErr(e?.message || "Failed to prepare allocation.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [open, order?.orderID]);

//   // Load supply + required whenever active size or selected rows change
//   useEffect(() => {
//     if (!open || !order?.orderID || !activeSize || (selectedSupplyRowIds || []).length === 0) {
//       setRows([]);
//       setRequired({ trays: 0, sizeId: null });
//       setInputs({});
//       return;
//     }
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);

//         const all = await fetchEggBatchesGrouped({});
//         const picked = (all || []).filter((r) => (selectedSupplyRowIds || []).includes(r.id));

//         const need = await getOrderSizeRequirement(order.orderID, activeSize);
//         if (!alive) return;

//         const shaped = picked.map((r) => {
//           const item = (r.sizeBreakdown || []).find(
//             (s) => String(s.size || "").toUpperCase() === String(activeSize).toUpperCase()
//           );
//           const trays = Number(item?.qty || 0);  // ✅ allocatable whole trays
//           const eggs = Number(item?.eggs || 0);
//           const loose = Math.max(0, eggs - trays * (need?.ept || activeEpt || 30));
//           return {
//             id: r.id,
//             farmer: r.farmer,
//             date: r.date,
//             traysAvail: trays,
//             looseEggs: loose, // info only
//           };
//         });

//         setRows(shaped);
//         setRequired({ trays: Number(need?.trays || 0), sizeId: need?.sizeId ?? null });
//         const init = {};
//         shaped.forEach((r) => {
//           init[r.id] = 0;
//         });
//         setInputs(init);
//         setActiveEpt(need?.ept || activeEpt || 30);
//       } catch (e) {
//         if (!alive) return;
//         setErr(e?.message || "Failed to load supply for selected size.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [open, order?.orderID, activeSize, supplyIdsKey]);

//   // Clear when closed
//   useEffect(() => {
//     if (!open) {
//       setRows([]);
//       setInputs({});
//       setErr(null);
//       setLoading(false);
//       setOrderNeeds([]);
//       setActiveSize(null);
//       setActiveEpt(30);
//       setRequired({ trays: 0, sizeId: null });
//     }
//   }, [open]);

//   // INFO: loose eggs (do NOT use to satisfy requirement)
//   const totalLoose = useMemo(
//     () => rows.reduce((s, r) => s + Number(r.looseEggs || 0), 0),
//     [rows]
//   );
//   const pooledTraysFromLoose = Math.floor(totalLoose / (activeEpt || 30)); // info only
//   const looseRemainder = totalLoose % (activeEpt || 30);

//   const sumInputs = Object.values(inputs).reduce((s, v) => s + Number(v || 0), 0);

//   // ✅ allocator requires EXACT whole trays, no pooling to satisfy requirement
//   const remaining = Math.max(0, Number(required.trays || 0) - sumInputs);
//   const overBy = Math.max(0, sumInputs - Number(required.trays || 0));

//   const canConfirm =
//     open &&
//     !loading &&
//     !err &&
//     rows.length > 0 &&
//     required.trays > 0 &&
//     overBy === 0 &&
//     remaining === 0 &&
//     rows.every((r) => (inputs[r.id] ?? 0) <= r.traysAvail);

//   const onChangeInput = (rowId, val) =>
//     setInputs((prev) => ({
//       ...prev,
//       [rowId]: Math.max(0, Math.floor(Number(val || 0))),
//     }));

//   const autoFill = () => {
//     // ✅ fill only from allocatable whole trays
//     let need = Number(required.trays || 0);
//     const next = {};
//     for (const r of rows) {
//       if (need <= 0) {
//         next[r.id] = 0;
//         continue;
//       }
//       const take = Math.min(need, Number(r.traysAvail || 0));
//       next[r.id] = take;
//       need -= take;
//     }
//     setInputs(next);
//   };

//   const confirm = async () => {
//     if (!canConfirm) return;

//     // ✅ only whole trays from selected rows
//     const details = rows
//       .map((r) => ({ supply_row_key: r.id, trays: Number(inputs[r.id] || 0) }))
//       .filter((d) => d.trays > 0);

//     try {
//       const res = await adminCreateAllocationBulk({
//         orderId: order.orderID,
//         sizeId: required.sizeId,
//         details,
//       });
//       if (res?.warning) {
//         console.warn(res.warning);
//         alert(`Allocated with warning: ${res.warning}`);
//       } else {
//         alert("Allocation recorded.");
//       }
//       onAllocated?.();
//       onClose?.();
//     } catch (e) {
//       console.error(e);
//       alert(`Allocation failed: ${e?.message || e}`);
//     }
//   };

//   return (
//     <Modal isOpen={open} onRequestClose={onClose} style={modalStyle} contentLabel="Allocate Order">
//       <div className="flex flex-col gap-4">
//         <h2 className="text-center text-2xl font-bold text-primaryYellow">
//           Allocate {activeSize || "—"} trays to Order #{order?.orderID}
//         </h2>

//         {/* If multiple sizes are needed, let user switch here */}
//         {orderNeeds.length > 1 && (
//           <div className="flex flex-wrap items-center justify-center gap-2">
//             {orderNeeds.map((n) => (
//               <button
//                 key={n.sizeId}
//                 type="button"
//                 onClick={() => setActiveSize(n.sizeLabel)}
//                 className={`px-3 py-1 rounded-full border ${
//                   activeSize === n.sizeLabel
//                     ? "bg-primaryYellow text-white border-primaryYellow"
//                     : "bg-white text-gray-700 border-gray-300"
//                 }`}
//               >
//                 {n.sizeLabel} × {n.trays}
//               </button>
//             ))}
//           </div>
//         )}

//         {!open ? null : loading ? (
//           <div className="text-center text-gray-500 py-8">Preparing…</div>
//         ) : err ? (
//           <div className="text-center text-red-600 py-8">{err}</div>
//         ) : (
//           <>
//             <div className="text-center text-gray-600">
//               Required: <b>{required.trays}</b> trays • Eggs/tray: <b>{activeEpt}</b> •{" "}
//               Loose available (info): <b>{totalLoose}</b> eggs → potential{" "}
//               <b>{pooledTraysFromLoose}</b> tray{pooledTraysFromLoose === 1 ? "" : "s"}{" "}
//               {looseRemainder ? (
//                 <span className="text-red-600">(leftover {looseRemainder} eggs)</span>
//               ) : null}
//             </div>

//             <div className="rounded-lg border">
//               <div className="grid grid-cols-12 gap-2 border-b px-3 py-2 font-semibold">
//                 <div className="col-span-5">Farmer / Date</div>
//                 <div className="col-span-3 text-center">Available (trays)</div>
//                 <div className="col-span-2 text-center">Loose eggs</div>
//                 <div className="col-span-2 text-center">Allocate</div>
//               </div>
//               {rows.map((r) => (
//                 <div
//                   key={r.id}
//                   className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-0 items-center"
//                 >
//                   <div className="col-span-5">
//                     <div className="font-medium">{r.farmer}</div>
//                     <div className="text-xs text-gray-500">
//                       {new Date(r.date).toDateString()}
//                     </div>
//                   </div>
//                   <div className="col-span-3 text-center">{r.traysAvail}</div>
//                   <div className="col-span-2 text-center">{r.looseEggs}</div>
//                   <div className="col-span-2">
//                     <input
//                       type="number"
//                       min={0}
//                       max={r.traysAvail}
//                       value={inputs[r.id] ?? 0}
//                       onChange={(e) => onChangeInput(r.id, e.target.value)}
//                       className="w-full rounded-md border px-2 py-1 text-center"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex items-center justify-between text-sm text-gray-700">
//               <button type="button" className="rounded-md border px-3 py-2 hover:bg-gray-50" onClick={autoFill}>
//                 Auto-fill
//               </button>
//               <div className="flex items-center gap-4">
//                 <span>
//                   Allocated (manual): <b>{sumInputs}</b>
//                 </span>
//                 <span>
//                   = <b>{sumInputs}</b> / {required.trays}
//                   {overBy > 0 && <span className="text-red-600"> (over by {overBy})</span>}
//                   {remaining > 0 && <span className="text-red-600"> (remain {remaining})</span>}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-2 flex justify-end gap-3">
//               <button className="rounded-lg bg-gray-300 px-4 py-2" onClick={onClose}>
//                 Cancel
//               </button>
//               <button
//                 className={`rounded-lg px-4 py-2 text-white ${
//                   canConfirm ? "bg-primaryYellow hover:opacity-90" : "bg-yellow-200 cursor-not-allowed"
//                 }`}
//                 disabled={!canConfirm}
//                 onClick={confirm}
//               >
//                 Confirm Allocation
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// }

// // components/admin/tables/EggAllocation.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Modal from "react-modal";
// import { fetchEggBatchesGrouped } from "@/services/EggInventory";
// import {
//   getOrderSizeRequirement,
//   getOrderSizeRequirements,
//   adminCreateAllocationBulk,
// } from "@/services/OrderNAllocation";

// /**
//  * Props:
//  * - open: boolean
//  * - order: { orderID: number }
//  * - selectedSupplyRowIds: string[]   // "<farmer_uuid>-YYYY-MM-DD"
//  * - onClose: () => void
//  * - onAllocated?: () => void
//  */
// const modalStyle = {
//   content: {
//     top: "50%", left: "50%", transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 20, width: "92vw", maxWidth: 800,
//     maxHeight: "90vh", overflow: "auto",
//   },
//   overlay: { backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1000 },
// };

// export default function EggAllocation({
//   open = false,
//   order,
//   selectedSupplyRowIds = [],
//   onClose,
//   onAllocated,
// }) {
//   // order size requirements
//   const [orderNeeds, setOrderNeeds] = useState([]); // [{sizeId,sizeLabel,trays,ept}]
//   const [activeSize, setActiveSize] = useState(null); // "S","M",...
//   const [activeEpt, setActiveEpt] = useState(30);

//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState(null);
//   const [rows, setRows] = useState([]); // supply rows for active size
//   const [required, setRequired] = useState({ trays: 0, sizeId: null });
//   const [inputs, setInputs] = useState({});

//   const supplyIdsKey = (selectedSupplyRowIds || []).join(",");

//   // Load size requirements when modal opens
//   useEffect(() => {
//     if (!open || !order?.orderID) return;
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);
//         const needs = await getOrderSizeRequirements(order.orderID);
//         if (!alive) return;
//         setOrderNeeds(needs);
//         const first = needs[0];
//         if (!first) {
//           setErr("This order has no tray requirements.");
//           setLoading(false);
//           return;
//         }
//         setActiveSize(first.sizeLabel);
//         setActiveEpt(first.ept);
//       } catch (e) {
//         if (!alive) return;
//         setErr(e?.message || "Failed to prepare allocation.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [open, order?.orderID]);

//   // Load supply + required whenever active size or selected rows change
//   useEffect(() => {
//     if (!open || !order?.orderID || !activeSize || (selectedSupplyRowIds || []).length === 0) {
//       setRows([]); setRequired({ trays: 0, sizeId: null }); setInputs({});
//       return;
//     }
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);

//         const all = await fetchEggBatchesGrouped({});
//         const picked = (all || []).filter((r) =>
//           (selectedSupplyRowIds || []).includes(r.id)
//         );

//         const need = await getOrderSizeRequirement(order.orderID, activeSize);
//         if (!alive) return;

//         const shaped = picked.map((r) => {
//           const item = (r.sizeBreakdown || []).find(
//             (s) => String(s.size || "").toUpperCase() === String(activeSize).toUpperCase()
//           );
//           const trays = Number(item?.qty || 0);
//           const eggs  = Number(item?.eggs || 0);
//           const loose = Math.max(0, eggs - trays * (need?.ept || activeEpt || 30));
//           return { id: r.id, farmer: r.farmer, date: r.date, traysAvail: trays, looseEggs: loose };
//         });

//         setRows(shaped);
//         setRequired({ trays: Number(need?.trays || 0), sizeId: need?.sizeId ?? null });
//         const init = {};
//         shaped.forEach((r) => { init[r.id] = 0; });
//         setInputs(init);
//         setActiveEpt(need?.ept || activeEpt || 30);
//       } catch (e) {
//         if (!alive) return;
//         setErr(e?.message || "Failed to load supply for selected size.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [open, order?.orderID, activeSize, supplyIdsKey]);

//   // Clear when closed
//   useEffect(() => {
//     if (!open) {
//       setRows([]);
//       setInputs({});
//       setErr(null);
//       setLoading(false);
//       setOrderNeeds([]);
//       setActiveSize(null);
//       setActiveEpt(30);
//       setRequired({ trays: 0, sizeId: null });
//     }
//   }, [open]);

//   const totalLoose = useMemo(
//     () => rows.reduce((s, r) => s + Number(r.looseEggs || 0), 0),
//     [rows]
//   );
//   const pooledTraysFromLoose = Math.floor(totalLoose / (activeEpt || 30));
//   const looseRemainder = totalLoose % (activeEpt || 30);

//   const sumInputs = Object.values(inputs).reduce((s, v) => s + Number(v || 0), 0);
//   const allocatedWithLoose = sumInputs + pooledTraysFromLoose;
//   const remaining = Math.max(0, Number(required.trays || 0) - allocatedWithLoose);
//   const overBy = Math.max(0, allocatedWithLoose - Number(required.trays || 0));

//   const canConfirm =
//     open &&
//     !loading &&
//     !err &&
//     rows.length > 0 &&
//     required.trays > 0 &&
//     overBy === 0 &&
//     remaining === 0 &&
//     rows.every((r) => (inputs[r.id] ?? 0) <= r.traysAvail);

//   const onChangeInput = (rowId, val) =>
//     setInputs((prev) => ({ ...prev, [rowId]: Math.max(0, Math.floor(Number(val || 0))) }));

//   const autoFill = () => {
//     let need = Number(required.trays || 0) - pooledTraysFromLoose;
//     const next = {};
//     for (const r of rows) {
//       if (need <= 0) { next[r.id] = 0; continue; }
//       const take = Math.min(need, Number(r.traysAvail || 0));
//       next[r.id] = take;
//       need -= take;
//     }
//     setInputs(next);
//   };

//   const confirm = async () => {
//     if (!canConfirm) return;

//     const details = rows
//       .map((r) => ({ supply_row_key: r.id, trays: Number(inputs[r.id] || 0) }))
//       .filter((d) => d.trays > 0);

//     // add pooled loose trays deterministically by loose desc
//     let pool = pooledTraysFromLoose;
//     const byLooseDesc = [...rows].sort((a, b) => (b.looseEggs || 0) - (a.looseEggs || 0));
//     for (const r of byLooseDesc) {
//       if (pool <= 0) break;
//       const rec = details.find((d) => d.supply_row_key === r.id);
//       if (rec) { rec.trays += 1; pool -= 1; }
//     }

//     try {
//       const res = await adminCreateAllocationBulk({
//         orderId: order.orderID,
//         sizeId: required.sizeId,
//         details,
//       });
//       if (res?.warning) {
//         console.warn(res.warning);
//         alert(`Allocated with warning: ${res.warning}`);
//       } else {
//         alert("Allocation recorded.");
//       }
//       onAllocated?.();
//       onClose?.();
//     } catch (e) {
//       console.error(e);
//       alert(`Allocation failed: ${e?.message || e}`);
//     }
//   };

//   return (
//     <Modal isOpen={open} onRequestClose={onClose} style={modalStyle} contentLabel="Allocate Order">
//       <div className="flex flex-col gap-4">
//         <h2 className="text-center text-2xl font-bold text-primaryYellow">
//           Allocate {activeSize || "—"} trays to Order #{order?.orderID}
//         </h2>

//         {/* If multiple sizes are needed, let user switch here */}
//         {orderNeeds.length > 1 && (
//           <div className="flex flex-wrap items-center justify-center gap-2">
//             {orderNeeds.map((n) => (
//               <button
//                 key={n.sizeId}
//                 type="button"
//                 onClick={() => setActiveSize(n.sizeLabel)}
//                 className={`px-3 py-1 rounded-full border ${
//                   activeSize === n.sizeLabel
//                     ? "bg-primaryYellow text-white border-primaryYellow"
//                     : "bg-white text-gray-700 border-gray-300"
//                 }`}
//               >
//                 {n.sizeLabel} × {n.trays}
//               </button>
//             ))}
//           </div>
//         )}

//         {!open ? null : loading ? (
//           <div className="text-center text-gray-500 py-8">Preparing…</div>
//         ) : err ? (
//           <div className="text-center text-red-600 py-8">{err}</div>
//         ) : (
//           <>
//             <div className="text-center text-gray-600">
//               Required: <b>{required.trays}</b> trays • Eggs/tray: <b>{activeEpt}</b> •{" "}
//               Pooled loose: <b>{pooledTraysFromLoose}</b>{" "}
//               {looseRemainder ? (
//                 <span className="text-red-600">(leftover {looseRemainder} eggs)</span>
//               ) : null}
//             </div>

//             <div className="rounded-lg border">
//               <div className="grid grid-cols-12 gap-2 border-b px-3 py-2 font-semibold">
//                 <div className="col-span-5">Farmer / Date</div>
//                 <div className="col-span-3 text-center">Available (trays)</div>
//                 <div className="col-span-2 text-center">Loose eggs</div>
//                 <div className="col-span-2 text-center">Allocate</div>
//               </div>
//               {rows.map((r) => (
//                 <div key={r.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-0 items-center">
//                   <div className="col-span-5">
//                     <div className="font-medium">{r.farmer}</div>
//                     <div className="text-xs text-gray-500">{new Date(r.date).toDateString()}</div>
//                   </div>
//                   <div className="col-span-3 text-center">{r.traysAvail}</div>
//                   <div className="col-span-2 text-center">{r.looseEggs}</div>
//                   <div className="col-span-2">
//                     <input
//                       type="number"
//                       min={0}
//                       max={r.traysAvail}
//                       value={inputs[r.id] ?? 0}
//                       onChange={(e) => onChangeInput(r.id, e.target.value)}
//                       className="w-full rounded-md border px-2 py-1 text-center"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex items-center justify-between text-sm text-gray-700">
//               <button type="button" className="rounded-md border px-3 py-2 hover:bg-gray-50" onClick={autoFill}>
//                 Auto-fill
//               </button>
//               <div className="flex items-center gap-4">
//                 <span>Allocated (manual): <b>{sumInputs}</b></span>
//                 <span>+ from loose: <b>{pooledTraysFromLoose}</b></span>
//                 <span>= <b>{allocatedWithLoose}</b> / {required.trays}
//                   {overBy > 0 && <span className="text-red-600"> (over by {overBy})</span>}
//                   {remaining > 0 && <span className="text-red-600"> (remain {remaining})</span>}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-2 flex justify-end gap-3">
//               <button className="rounded-lg bg-gray-300 px-4 py-2" onClick={onClose}>Cancel</button>
//               <button
//                 className={`rounded-lg px-4 py-2 text-white ${canConfirm ? "bg-primaryYellow hover:opacity-90" : "bg-yellow-200 cursor-not-allowed"}`}
//                 disabled={!canConfirm}
//                 onClick={confirm}
//               >
//                 Confirm Allocation
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// }

// // pages/admin/_AllocationModal.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Modal from "react-modal";
// import { getOrderSizeRequirement, getOrderSizeRequirements, adminCreateAllocationBulk } from "@/services/OrderNAllocation";
// import { fetchEggBatchesGrouped } from "@/services/EggInventory";
// /**
//  * Props:
//  * - open: boolean
//  * - order: { orderID: number }
//  * - sizeLabel: string ("SMALL", "MEDIUM", ...)
//  * - sizeMeta: { [LABEL]: { id:number, ept:number } }
//  * - selectedSupplyRowIds: string[]   // "<farmer_uuid>-YYYY-MM-DD"
//  * - onClose: () => void
//  * - onAllocated?: () => void
//  */
// const modalStyle = {
//   content: {
//     top: "50%", left: "50%", transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 20, width: "92vw", maxWidth: 800,
//     maxHeight: "90vh", overflow: "auto",
//   },
//   overlay: { backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1000 },
// };

// export default function EggAllocation({
//   open = false,
//   order,
//   sizeLabel,          // optional now
//   selectedSupplyRowIds = [],
//   onClose,
//   onAllocated,
// }) {
// //   const sizeKey = String(sizeLabel || "").toUpperCase();
// //   const ept = sizeMeta?.[sizeKey]?.ept ?? 30;
//   // active size inside modal
//   const [activeSize, setActiveSize] = useState(null); // "S","M","..."
//   const [activeEpt, setActiveEpt] = useState(30);
//   const [orderNeeds, setOrderNeeds] = useState([]);   // [{sizeId,sizeLabel,trays,ept}]

//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState(null);
//   const [rows, setRows] = useState([]);
//   const [required, setRequired] = useState({ trays: 0, sizeId: null });
//   const [inputs, setInputs] = useState({});

//   const supplyIdsKey = (selectedSupplyRowIds || []).join(",");

//   // Load when opened
//   useEffect(() => {
//     // if (!open || !order?.orderID || (selectedSupplyRowIds || []).length === 0) return;
//     if (!open || !order?.orderID || (selectedSupplyRowIds || []).length === 0) return;

//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);

//         // const all = await fetchEggBatchesGrouped({});
//         // 1) What sizes does the order need?
//         const needs = await getOrderSizeRequirements(order.orderID); // may be 1+ sizes
//         if (!alive) return;
//         setOrderNeeds(needs);

//         // choose active size:
//         let chosenLabel = sizeLabel ? String(sizeLabel).toUpperCase() : null;
//         if (!chosenLabel) chosenLabel = needs[0]?.sizeLabel || null;
//         if (!chosenLabel) {
//           setErr("This order has no tray requirements.");
//           setLoading(false);
//           return;
//         }
//         setActiveSize(chosenLabel);
//         setActiveEpt(needs.find(n => n.sizeLabel === chosenLabel)?.ept || 30);

//         // 2) Load supply and shape for the chosen size
//         const all = await fetchEggBatchesGrouped({});
//         const picked = (all || []).filter((r) =>
//           (selectedSupplyRowIds || []).includes(r.id)
//         );

//         const shaped = picked.map((r) => {
//           const item = (r.sizeBreakdown || []).find(
//             //(s) => String(s.size || "").toUpperCase() === sizeKey
//             (s) => String(s.size || "").toUpperCase() === chosenLabel
//           );
//           const trays = Number(item?.qty || 0);
//           const eggs  = Number(item?.eggs || 0);
//           //const loose = Math.max(0, eggs - trays * ept);
//           const loose = Math.max(0, eggs - trays * (needs.find(n => n.sizeLabel === chosenLabel)?.ept || 30));
//           return { id: r.id, farmer: r.farmer, date: r.date, traysAvail: trays, looseEggs: loose };
//         });

//         //const need = await getOrderSizeRequirement(order.orderID, sizeKey);
//         const need = await getOrderSizeRequirement(order.orderID, chosenLabel);
//         if (!alive) return;
//         setRows(shaped);
//         //setRequired({ trays: Number(need?.trays || 0), sizeId: need?.sizeId ?? null });
//         if (Number(need?.trays || 0) === 0) {
//         setErr(`This order does not require any ${sizeKey} trays.`);
//         }
//         const init = {};
//         shaped.forEach((r) => { init[r.id] = 0; });
//         setInputs(init);
//       } catch (e) {
//         if (!alive) return;
//         setErr(e?.message || "Failed to prepare allocation.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();

//     return () => { alive = false; };
//   }, [open, order?.orderID, supplyIdsKey, sizeLabel]);

//   // Clear when closed
//   useEffect(() => {
//     if (!open) {
//       setRows([]);
//       setInputs({});
//       setErr(null);
//       setLoading(false);
//       setOrderNeeds([]);
//       setActiveSize(null);
//     }
//   }, [open]);

// //   const totalLoose = useMemo(() => rows.reduce((s, r) => s + Number(r.looseEggs || 0), 0), [rows]);
// //   const pooledTraysFromLoose = Math.floor(totalLoose / ept);
// //   const looseRemainder = totalLoose % ept;
//   const totalLoose = useMemo(() => rows.reduce((s, r) => s + Number(r.looseEggs || 0), 0), [rows]);
//   const pooledTraysFromLoose = Math.floor(totalLoose / activeEpt);
//   const looseRemainder = totalLoose % activeEpt;
//   const sumInputs = Object.values(inputs).reduce((s, v) => s + Number(v || 0), 0);
//   const allocatedWithLoose = sumInputs + pooledTraysFromLoose;
//   const remaining = Math.max(0, Number(required.trays || 0) - allocatedWithLoose);
//   const overBy = Math.max(0, allocatedWithLoose - Number(required.trays || 0));

//   const canConfirm =
//     open &&
//     !loading &&
//     !err &&
//     rows.length > 0 &&
//     required.trays > 0 &&
//     overBy === 0 &&
//     remaining === 0 &&
//     rows.every((r) => (inputs[r.id] ?? 0) <= r.traysAvail);

//   const onChangeInput = (rowId, val) =>
//     setInputs((prev) => ({ ...prev, [rowId]: Math.max(0, Math.floor(Number(val || 0))) }));

//   const autoFill = () => {
//     let need = Number(required.trays || 0) - pooledTraysFromLoose;
//     const next = {};
//     for (const r of rows) {
//       if (need <= 0) { next[r.id] = 0; continue; }
//       const take = Math.min(need, Number(r.traysAvail || 0));
//       next[r.id] = take;
//       need -= take;
//     }
//     setInputs(next);
//   };

//   const confirm = async () => {
//     if (!canConfirm) return;

//     const details = rows
//       .map((r) => ({ supply_row_key: r.id, trays: Number(inputs[r.id] || 0) }))
//       .filter((d) => d.trays > 0);

//     // add pooled loose trays deterministically by loose desc
//     let pool = pooledTraysFromLoose;
//     const byLooseDesc = [...rows].sort((a, b) => (b.looseEggs || 0) - (a.looseEggs || 0));
//     for (const r of byLooseDesc) {
//       if (pool <= 0) break;
//       const rec = details.find((d) => d.supply_row_key === r.id);
//       if (rec) { rec.trays += 1; pool -= 1; }
//     }

// try {
//       const res = await adminCreateAllocationBulk({
//         orderId: order.orderID,
//         sizeId: required.sizeId,
//         details,
//       });
//       if (res?.warning) {
//         console.warn(res.warning);
//         alert(`Allocated with warning: ${res.warning}`);
//       } else {
//         alert("Allocation recorded.");
//       }
//     } catch (e) {
//       console.error(e);
//       alert(`Allocation failed: ${e?.message || e}`);
//       return; // don't close modal on failure
//     }

//     onAllocated?.();
//     onClose?.();
//   };

//   return (
//     <Modal isOpen={open} onRequestClose={onClose} style={modalStyle} contentLabel="Allocate Order">
//       <div className="flex flex-col gap-4">
//      <h2 className="text-center text-2xl font-bold text-primaryYellow">
//           Allocate {activeSize || "—"} trays to Order #{order?.orderID}
//         </h2>

//         {/* If multiple sizes are needed, let user switch here */}
//         {orderNeeds.length > 1 && (
//           <div className="flex flex-wrap items-center justify-center gap-2">
//             {orderNeeds.map((n) => (
//               <button
//                 key={n.sizeId}
//                 type="button"
//                 onClick={() => {
//                   // quick reload by closing/opening with new chosen label:
//                   setActiveSize(n.sizeLabel);
//                   setActiveEpt(n.ept);
//                   // re-run supply shaping for chosen size:
//                   // simplest: trigger effect by faking prop sizeLabel change
//                 }}
//                 className={`px-3 py-1 rounded-full border ${
//                   activeSize === n.sizeLabel ? "bg-primaryYellow text-white border-primaryYellow" : "bg-white text-gray-700 border-gray-300"
//                 }`}
//               >
//                 {n.sizeLabel} × {n.trays}
//               </button>
//             ))}
//           </div>
//         )}

//         {!open ? null : loading ? (
//           <div className="text-center text-gray-500 py-8">Preparing…</div>
//         ) : err ? (
//           <div className="text-center text-red-600 py-8">{err}</div>
//         ) : (
//           <>
//             <div className="text-center text-gray-600">
//               Required: <b>{required.trays}</b> trays • Eggs/tray: <b>{activeEpt}</b> •{" "}
//               Pooled loose: <b>{pooledTraysFromLoose}</b>{" "}
//               {looseRemainder ? (
//                 <span className="text-red-600">(leftover {looseRemainder} eggs — must be 0)</span>
//               ) : null}
//             </div>

//             <div className="rounded-lg border">
//               <div className="grid grid-cols-12 gap-2 border-b px-3 py-2 font-semibold">
//                 <div className="col-span-5">Farmer / Date</div>
//                 <div className="col-span-3 text-center">Available (trays)</div>
//                 <div className="col-span-2 text-center">Loose eggs</div>
//                 <div className="col-span-2 text-center">Allocate</div>
//               </div>
//               {rows.map((r) => (
//                 <div key={r.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-0 items-center">
//                   <div className="col-span-5">
//                     <div className="font-medium">{r.farmer}</div>
//                     <div className="text-xs text-gray-500">{new Date(r.date).toDateString()}</div>
//                   </div>
//                   <div className="col-span-3 text-center">{r.traysAvail}</div>
//                   <div className="col-span-2 text-center">{r.looseEggs}</div>
//                   <div className="col-span-2">
//                     <input
//                       type="number"
//                       min={0}
//                       max={r.traysAvail}
//                       value={inputs[r.id] ?? 0}
//                       onChange={(e) => onChangeInput(r.id, e.target.value)}
//                       className="w-full rounded-md border px-2 py-1 text-center"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex items-center justify-between text-sm text-gray-700">
//               <button type="button" className="rounded-md border px-3 py-2 hover:bg-gray-50" onClick={autoFill}>
//                 Auto-fill
//               </button>
//               <div className="flex items-center gap-4">
//                 <span>Allocated (manual): <b>{sumInputs}</b></span>
//                 <span>+ from loose: <b>{pooledTraysFromLoose}</b></span>
//                 <span>= <b>{allocatedWithLoose}</b> / {required.trays}
//                   {overBy > 0 && <span className="text-red-600"> (over by {overBy})</span>}
//                   {remaining > 0 && <span className="text-red-600"> (remain {remaining})</span>}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-2 flex justify-end gap-3">
//               <button className="rounded-lg bg-gray-300 px-4 py-2" onClick={onClose}>Cancel</button>
//               <button
//                 className={`rounded-lg px-4 py-2 text-white ${canConfirm ? "bg-primaryYellow hover:opacity-90" : "bg-yellow-200 cursor-not-allowed"}`}
//                 disabled={!canConfirm}
//                 onClick={confirm}
//               >
//                 Confirm Allocation
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// }
// components/admin/tables/EggAllocation.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import Modal from "react-modal";
// import { fetchEggBatchesGrouped } from "@/services/EggInventory";
// import { getOrderSizeRequirement, adminCreateAllocationBulk } from "@/services/OrderNAllocation";

// /**
//  * Props:
//  * - open: boolean
//  * - order: { orderID: number }
//  * - sizeLabel: string ("SMALL", "MEDIUM", ...)
//  * - sizeMeta: { [LABEL]: { id:number, ept:number } }
//  * - selectedSupplyRowIds: string[]   // "<farmer_uuid>-YYYY-MM-DD"
//  * - onClose: () => void
//  * - onAllocated?: () => void
//  */
// const modalStyle = {
//   content: {
//     top: "50%", left: "50%", transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 20, width: "92vw", maxWidth: 800,
//     maxHeight: "90vh", overflow: "auto",
//   },
//   overlay: { backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1000 },
// };

// // normalize possible labels
// const CANON = { XS:"XS", S:"S", M:"M", L:"L", XL:"XL", J:"J",
//   SMALL:"S", MEDIUM:"M", LARGE:"L", "EXTRA-LARGE":"XL", JUMBO:"J" };

// export default function EggAllocation({
//   open = false,
//   order,
//   sizeLabel,
//   sizeMeta,
//   selectedSupplyRowIds = [],
//   onClose,
//   onAllocated,
// }) {
//   const sizeKey = CANON[String(sizeLabel || "").toUpperCase()] || String(sizeLabel || "").toUpperCase();
//   const ept = sizeMeta?.[sizeKey]?.ept ?? 30;

//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState(null);
//   const [rows, setRows] = useState([]);
//   const [required, setRequired] = useState({ trays: 0, sizeId: null });
//   const [inputs, setInputs] = useState({});

//   const supplyIdsKey = (selectedSupplyRowIds || []).join(",");

//   // Load when opened
//   useEffect(() => {
//     if (!open || !order?.orderID || (selectedSupplyRowIds || []).length === 0) return;

//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr(null);

//         const all = await fetchEggBatchesGrouped({});
//         const picked = (all || []).filter((r) =>
//           (selectedSupplyRowIds || []).includes(r.id)
//         );

//         const shaped = picked.map((r) => {
//           const item = (r.sizeBreakdown || []).find(
//             (s) => String(s.size || "").toUpperCase() === sizeKey
//           );
//           const trays = Number(item?.qty || 0);
//           const eggs  = Number(item?.eggs || 0);
//           const loose = Math.max(0, eggs - trays * ept);
//           return { id: r.id, farmer: r.farmer, date: r.date, traysAvail: trays, looseEggs: loose };
//         });

//         const need = await getOrderSizeRequirement(order.orderID, sizeKey);

//         if (!alive) return;
//         setRows(shaped);
//         setRequired({ trays: Number(need?.trays || 0), sizeId: need?.sizeId ?? null });

//         const init = {};
//         shaped.forEach((r) => { init[r.id] = 0; });
//         setInputs(init);
//       } catch (e) {
//         if (!alive) return;
//         setErr(e?.message || "Failed to prepare allocation.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();

//     return () => { alive = false; };
//   }, [open, order?.orderID, supplyIdsKey, sizeKey, ept]);

//   // Clear when closed
//   useEffect(() => {
//     if (!open) {
//       setRows([]);
//       setInputs({});
//       setErr(null);
//       setLoading(false);
//     }
//   }, [open]);

//   const totalLoose = useMemo(() => rows.reduce((s, r) => s + Number(r.looseEggs || 0), 0), [rows]);
//   const pooledTraysFromLoose = Math.floor(totalLoose / ept);
//   const looseRemainder = totalLoose % ept;

//   const sumInputs = Object.values(inputs).reduce((s, v) => s + Number(v || 0), 0);
//   const allocatedWithLoose = sumInputs + pooledTraysFromLoose;
//   const remaining = Math.max(0, Number(required.trays || 0) - allocatedWithLoose);
//   const overBy = Math.max(0, allocatedWithLoose - Number(required.trays || 0));

//   const canConfirm =
//     open &&
//     !loading &&
//     !err &&
//     rows.length > 0 &&
//     required.trays > 0 &&
//     overBy === 0 &&
//     remaining === 0 &&
//     // you can keep requiring 0 remainder if you want exact packing
//     looseRemainder === 0 &&
//     rows.every((r) => (inputs[r.id] ?? 0) <= r.traysAvail);

//   const onChangeInput = (rowId, val) =>
//     setInputs((prev) => ({ ...prev, [rowId]: Math.max(0, Math.floor(Number(val || 0))) }));

//   const autoFill = () => {
//     let need = Number(required.trays || 0) - pooledTraysFromLoose;
//     const next = {};
//     for (const r of rows) {
//       if (need <= 0) { next[r.id] = 0; continue; }
//       const take = Math.min(need, Number(r.traysAvail || 0));
//       next[r.id] = take;
//       need -= take;
//     }
//     setInputs(next);
//   };

//   const confirm = async () => {
//     if (!canConfirm) return;

//     const details = rows
//       .map((r) => ({ supply_row_key: r.id, trays: Number(inputs[r.id] || 0) }))
//       .filter((d) => d.trays > 0);

//     // add pooled loose trays deterministically by loose desc
//     let pool = pooledTraysFromLoose;
//     const byLooseDesc = [...rows].sort((a, b) => (b.looseEggs || 0) - (a.looseEggs || 0));
//     for (const r of byLooseDesc) {
//       if (pool <= 0) break;
//       const rec = details.find((d) => d.supply_row_key === r.id);
//       if (rec) { rec.trays += 1; pool -= 1; }
//     }

//     const res = await adminCreateAllocationBulk({
//       orderId: order.orderID,
//       sizeId: required.sizeId,
//       details,
//     });

//     if (res?.warning) {
//       console.warn(res.warning);
//       alert(`Allocated with warning: ${res.warning}`);
//     } else {
//       alert("Allocation recorded.");
//     }

//     onAllocated?.();
//     onClose?.();
//   };

//   return (
//     <Modal isOpen={open} onRequestClose={onClose} style={modalStyle} contentLabel="Allocate Order">
//       <div className="flex flex-col gap-4">
//         <h2 className="text-center text-2xl font-bold text-primaryYellow">
//           Allocate {sizeKey} trays to Order #{order?.orderID}
//         </h2>

//         {!open ? null : loading ? (
//           <div className="text-center text-gray-500 py-8">Preparing…</div>
//         ) : err ? (
//           <div className="text-center text-red-600 py-8">{err}</div>
//         ) : (
//           <>
//             <div className="text-center text-gray-600">
//               Required: <b>{required.trays}</b> trays • Eggs/tray: <b>{ept}</b> •{" "}
//               Pooled loose trays: <b>{pooledTraysFromLoose}</b>{" "}
//               <span className="text-gray-500">(from {totalLoose} eggs; remainder {looseRemainder})</span>
//             </div>

//             <div className="rounded-lg border">
//               <div className="grid grid-cols-12 gap-2 border-b px-3 py-2 font-semibold">
//                 <div className="col-span-5">Farmer / Date</div>
//                 <div className="col-span-3 text-center">Available (trays)</div>
//                 <div className="col-span-2 text-center">Loose eggs</div>
//                 <div className="col-span-2 text-center">Allocate</div>
//               </div>
//               {rows.map((r) => (
//                 <div key={r.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-0 items-center">
//                   <div className="col-span-5">
//                     <div className="font-medium">{r.farmer}</div>
//                     <div className="text-xs text-gray-500">{new Date(r.date).toDateString()}</div>
//                   </div>
//                   <div className="col-span-3 text-center">{r.traysAvail}</div>
//                   <div className="col-span-2 text-center">{r.looseEggs}</div>
//                   <div className="col-span-2">
//                     <input
//                       type="number"
//                       min={0}
//                       max={r.traysAvail}
//                       value={inputs[r.id] ?? 0}
//                       onChange={(e) => onChangeInput(r.id, e.target.value)}
//                       className="w-full rounded-md border px-2 py-1 text-center"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex items-center justify-between text-sm text-gray-700">
//               <button type="button" className="rounded-md border px-3 py-2 hover:bg-gray-50" onClick={autoFill}>
//                 Auto-fill
//               </button>
//               <div className="flex items-center gap-4">
//                 <span>Allocated (manual): <b>{sumInputs}</b></span>
//                 <span>+ from loose: <b>{pooledTraysFromLoose}</b></span>
//                 <span>= <b>{allocatedWithLoose}</b> / {required.trays}
//                   {overBy > 0 && <span className="text-red-600"> (over by {overBy})</span>}
//                   {remaining > 0 && <span className="text-red-600"> (remain {remaining})</span>}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-2 flex justify-end gap-3">
//               <button className="rounded-lg bg-gray-300 px-4 py-2" onClick={onClose}>Cancel</button>
//               <button
//                 className={`rounded-lg px-4 py-2 text-white ${canConfirm ? "bg-primaryYellow hover:opacity-90" : "bg-yellow-200 cursor-not-allowed"}`}
//                 disabled={!canConfirm}
//                 onClick={confirm}
//               >
//                 Confirm Allocation
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// }
