// src/components/admin/tables/FarmerRequestsTable.jsx
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  fetchPendingFarmerRequestsForAdmin,
  approveFarmerRequest,
  rejectFarmerRequest,
} from "@/services/FarmerRequests";

const FarmerRequestsTable = forwardRef(
  (
    {
      refreshTick,
      onActionComplete,
      onSelectionChange,
      onHeaderCheck,
      onViewPermit, // ✅ parent will handle modal + RPC
    },
    ref
  ) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [selected, setSelected] = useState(new Set());
    const headerCbRef = useRef(null);

    async function refresh() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await fetchPendingFarmerRequestsForAdmin();
        setRows(data || []);
        setSelected(new Set());
      } catch (e) {
        setErrorMsg(e?.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      refresh();
    }, [refreshTick]);

    useEffect(() => {
      onSelectionChange && onSelectionChange(Array.from(selected));
    }, [selected, onSelectionChange]);

    useEffect(() => {
      if (!headerCbRef.current) return;
      const all = rows.length > 0 && selected.size === rows.length;
      const none = selected.size === 0;
      headerCbRef.current.indeterminate = !all && !none;
    }, [selected, rows.length]);

    const toggleRow = (id) => {
      setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    };

    const toggleAll = () => {
      setSelected((prev) => {
        if (rows.length === 0) return new Set();
        const allSelected = prev.size === rows.length;
        const next = allSelected ? new Set() : new Set(rows.map((r) => r.id));
        onHeaderCheck && onHeaderCheck(!allSelected);
        return next;
      });
    };

    const onApprove = async (id) => {
      setBusyId(id);
      setErrorMsg("");
      try {
        await approveFarmerRequest(id);
        await refresh();
        onActionComplete && onActionComplete();
      } catch (e) {
        setErrorMsg(e?.message || "Approve failed");
      } finally {
        setBusyId(null);
      }
    };

    const onReject = async (id) => {
      const reason = window.prompt("Reason (optional):") || undefined;
      setBusyId(id);
      setErrorMsg("");
      try {
        await rejectFarmerRequest(id, reason);
        await refresh();
        onActionComplete && onActionComplete();
      } catch (e) {
        setErrorMsg(e?.message || "Reject failed");
      } finally {
        setBusyId(null);
      }
    };

    useImperativeHandle(ref, () => ({
      approveAllSelected: async () => {
        if (selected.size === 0) return;
        setErrorMsg("");
        try {
          for (let id of selected) {
            await approveFarmerRequest(id);
          }
          await refresh();
          onActionComplete && onActionComplete();
        } catch (e) {
          setErrorMsg(e?.message || "Bulk approve failed");
        }
      },
    }));

    if (loading) return <div className="p-6">Loading…</div>;
    if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;
    if (!rows.length)
      return (
        <div className="p-6 text-gray-500">No pending farmer requests.</div>
      );

    const allChecked = rows.length > 0 && selected.size === rows.length;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-center">
                <input
                  ref={headerCbRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-primaryYellow cursor-pointer"
                  aria-label="Select all"
                />
              </th>
              <th className="py-3 px-4 text-center text-primaryYellow text-lg">
                Farmer
              </th>
              <th className="py-3 px-4 text-center text-primaryYellow text-lg">
                Email
              </th>
              <th className="py-3 px-4 text-center text-primaryYellow text-lg">
                Requested At
              </th>
              <th className="py-3 px-4 text-center text-primaryYellow text-lg">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const isChecked = selected.has(r.id);
              return (
                <tr key={r.id} className="bg-[#FEF9C2]">
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRow(r.id)}
                      className="h-4 w-4 accent-primaryYellow cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800 text-center">
                    {r.farmer_name || r.farmer_id}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-center">
                    {r.farmer_email || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-center">
                    {r.requested_at
                      ? new Date(r.requested_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                      {/* View Permit button -> parent handler */}
                      <button
                        type="button"
                        onClick={() => onViewPermit && onViewPermit(r)}
                        className="px-3 py-2 rounded-lg border border-primaryYellow text-primaryYellow font-medium text-sm shadow-sm hover:bg-primaryYellow hover:text-white transition"
                      >
                        View Permit
                      </button>

                      <button
                        onClick={() => onApprove(r.id)}
                        disabled={busyId === r.id}
                        className="px-4 py-2 rounded-lg bg-primaryYellow text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(r.id)}
                        disabled={busyId === r.id}
                        className="px-4 py-2 rounded-lg bg-[#5c5c5d] text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

export default FarmerRequestsTable;

// // src/components/admin/tables/FarmerRequestsTable.jsx
// import React, {
//   useEffect,
//   useRef,
//   useState,
//   forwardRef,
//   useImperativeHandle,
// } from "react";
// import {
//   fetchPendingFarmerRequestsForAdmin,
//   approveFarmerRequest,
//   rejectFarmerRequest,
// } from "@/services/FarmerRequests";

// const FarmerRequestsTable = forwardRef(
//   (
//     {
//       refreshTick,
//       onActionComplete,
//       onSelectionChange,
//       onHeaderCheck,
//       onViewPermit, // 🆕 add this
//     },
//     ref
//   ) => {
//     const [rows, setRows] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [busyId, setBusyId] = useState(null);
//     const [errorMsg, setErrorMsg] = useState("");
//     const [selected, setSelected] = useState(new Set());
//     const headerCbRef = useRef(null);

//     async function refresh() {
//       setLoading(true);
//       setErrorMsg("");
//       try {
//         const data = await fetchPendingFarmerRequestsForAdmin();
//         setRows(data || []);
//         setSelected(new Set());
//       } catch (e) {
//         setErrorMsg(e?.message || "Failed to load requests");
//       } finally {
//         setLoading(false);
//       }
//     }

//     useEffect(() => {
//       refresh();
//     }, [refreshTick]);

//     // notify parent of selection changes
//     useEffect(() => {
//       onSelectionChange && onSelectionChange(Array.from(selected));
//     }, [selected, onSelectionChange]);

//     // handle header checkbox indeterminate state
//     useEffect(() => {
//       if (!headerCbRef.current) return;
//       const all = rows.length > 0 && selected.size === rows.length;
//       const none = selected.size === 0;
//       headerCbRef.current.indeterminate = !all && !none;
//     }, [selected, rows.length]);

//     const toggleRow = (id) => {
//       setSelected((prev) => {
//         const next = new Set(prev);
//         next.has(id) ? next.delete(id) : next.add(id);
//         return next;
//       });
//     };

//     const toggleAll = () => {
//       setSelected((prev) => {
//         if (rows.length === 0) return new Set();
//         const allSelected = prev.size === rows.length;
//         const next = allSelected ? new Set() : new Set(rows.map((r) => r.id));
//         onHeaderCheck && onHeaderCheck(!allSelected); // notify parent
//         return next;
//       });
//     };

//     const onApprove = async (id) => {
//       setBusyId(id);
//       setErrorMsg("");
//       try {
//         await approveFarmerRequest(id);
//         await refresh();
//         onActionComplete && onActionComplete();
//       } catch (e) {
//         setErrorMsg(e?.message || "Approve failed");
//       } finally {
//         setBusyId(null);
//       }
//     };

//     const onReject = async (id) => {
//       const reason = window.prompt("Reason (optional):") || undefined;
//       setBusyId(id);
//       setErrorMsg("");
//       try {
//         await rejectFarmerRequest(id, reason);
//         await refresh();
//         onActionComplete && onActionComplete();
//       } catch (e) {
//         setErrorMsg(e?.message || "Reject failed");
//       } finally {
//         setBusyId(null);
//       }
//     };

//     // expose bulk approve to parent
//     useImperativeHandle(ref, () => ({
//       approveAllSelected: async () => {
//         if (selected.size === 0) return;
//         setErrorMsg("");
//         try {
//           for (let id of selected) {
//             await approveFarmerRequest(id);
//           }
//           await refresh();
//           onActionComplete && onActionComplete();
//         } catch (e) {
//           setErrorMsg(e?.message || "Bulk approve failed");
//         }
//       },
//     }));

//     if (loading) return <div className="p-6">Loading…</div>;
//     if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;
//     if (!rows.length)
//       return (
//         <div className="p-6 text-gray-500">No pending farmer requests.</div>
//       );

//     const allChecked = rows.length > 0 && selected.size === rows.length;

//     return (
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="bg-gray-50">
//               <th className="py-3 px-4 text-center">
//                 <input
//                   ref={headerCbRef}
//                   type="checkbox"
//                   checked={allChecked}
//                   onChange={toggleAll}
//                   className="h-4 w-4 accent-primaryYellow cursor-pointer"
//                   aria-label="Select all"
//                 />
//               </th>
//               <th className="py-3 px-4 text-center text-primaryYellow text-lg">
//                 Farmer
//               </th>
//               <th className="py-3 px-4 text-center text-primaryYellow text-lg">
//                 Email
//               </th>
//               <th className="py-3 px-4 text-center text-primaryYellow text-lg">
//                 Requested At
//               </th>
//               <th className="py-3 px-4 text-center text-primaryYellow text-lg">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((r) => {
//               const isChecked = selected.has(r.id);
//               return (
//                 <tr key={r.id} className="bg-[#FEF9C2]">
//                   <td className="py-3 px-4 text-center">
//                     <input
//                       type="checkbox"
//                       checked={isChecked}
//                       onChange={() => toggleRow(r.id)}
//                       className="h-4 w-4 accent-primaryYellow cursor-pointer"
//                     />
//                   </td>
//                   <td className="py-3 px-4 font-semibold text-gray-800 text-center">
//                     {r.farmer_name || r.farmer_id}
//                   </td>
//                   <td className="py-3 px-4 text-gray-700 text-center">
//                     {r.farmer_email || "—"}
//                   </td>
//                   <td className="py-3 px-4 text-gray-700 text-center">
//                     {r.requested_at
//                       ? new Date(r.requested_at).toLocaleString()
//                       : "—"}
//                   </td>
//                   <td className="py-3 px-4">
//                     <div className="flex flex-wrap justify-center gap-3">
//                       {/* 🆕 View Permit button */}
//                       <button
//                         type="button"
//                         onClick={() =>
//                           onViewPermit && onViewPermit(r)
//                         }
//                         className="px-3 py-2 rounded-lg border border-primaryYellow text-primaryYellow font-medium text-sm shadow-sm hover:bg-primaryYellow hover:text-white transition"
//                       >
//                         View Permit
//                       </button>

//                       <button
//                         onClick={() => onApprove(r.id)}
//                         disabled={busyId === r.id}
//                         className="px-4 py-2 rounded-lg bg-primaryYellow text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                       >
//                         Approve
//                       </button>
//                       <button
//                         onClick={() => onReject(r.id)}
//                         disabled={busyId === r.id}
//                         className="px-4 py-2 rounded-lg bg-[#5c5c5d] text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                       >
//                         Reject
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     );
//   }
// );

// export default FarmerRequestsTable;

// // src/components/admin/tables/FarmerRequestsTable.jsx
// import React, {useEffect,useRef,useState,forwardRef,useImperativeHandle} from "react";
// import {fetchPendingFarmerRequestsForAdmin,approveFarmerRequest,rejectFarmerRequest,} from "@/services/FarmerRequests";

// const FarmerRequestsTable = forwardRef(
//   ({ refreshTick, onActionComplete, onSelectionChange, onHeaderCheck }, ref)=> {
//     const [rows, setRows] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [busyId, setBusyId] = useState(null);
//     const [errorMsg, setErrorMsg] = useState("");
//     const [selected, setSelected] = useState(new Set());
//     const headerCbRef = useRef(null);

//     async function refresh() {
//       setLoading(true);
//       setErrorMsg("");
//       try {
//         const data = await fetchPendingFarmerRequestsForAdmin();
//         setRows(data || []);
//         setSelected(new Set());
//       } catch (e) {
//         setErrorMsg(e?.message || "Failed to load requests");
//       } finally {
//         setLoading(false);
//       }
//     }

//     useEffect(() => {
//       refresh();
//     }, [refreshTick]);

//     // notify parent of selection changes
//     useEffect(() => {
//       onSelectionChange && onSelectionChange(Array.from(selected));
//     }, [selected, onSelectionChange]);

//     // handle header checkbox indeterminate state
//     useEffect(() => {
//       if (!headerCbRef.current) return;
//       const all = rows.length > 0 && selected.size === rows.length;
//       const none = selected.size === 0;
//       headerCbRef.current.indeterminate = !all && !none;
//     }, [selected, rows.length]);

//     const toggleRow = (id) => {
//       setSelected((prev) => {
//         const next = new Set(prev);
//         next.has(id) ? next.delete(id) : next.add(id);
//         return next;
//       });
//     };

//    const toggleAll = () => {
//   setSelected((prev) => {
//     if (rows.length === 0) return new Set();
//     const allSelected = prev.size === rows.length;
//     const next = allSelected ? new Set() : new Set(rows.map((r) => r.id));
//     onHeaderCheck && onHeaderCheck(!allSelected); // notify parent
//     return next;
//   });
// };

//     const onApprove = async (id) => {
//       setBusyId(id);
//       setErrorMsg("");
//       try {
//         await approveFarmerRequest(id);
//         await refresh();
//         onActionComplete && onActionComplete();
//       } catch (e) {
//         setErrorMsg(e?.message || "Approve failed");
//       } finally {
//         setBusyId(null);
//       }
//     };

//     const onReject = async (id) => {
//       const reason = window.prompt("Reason (optional):") || undefined;
//       setBusyId(id);
//       setErrorMsg("");
//       try {
//         await rejectFarmerRequest(id, reason);
//         await refresh();
//         onActionComplete && onActionComplete();
//       } catch (e) {
//         setErrorMsg(e?.message || "Reject failed");
//       } finally {
//         setBusyId(null);
//       }
//     };

//     // expose bulk approve to parent
//     useImperativeHandle(ref, () => ({
//       approveAllSelected: async () => {
//         if (selected.size === 0) return;
//         setErrorMsg("");
//         try {
//           for (let id of selected) {
//             await approveFarmerRequest(id);
//           }
//           await refresh();
//           onActionComplete && onActionComplete();
//         } catch (e) {
//           setErrorMsg(e?.message || "Bulk approve failed");
//         }
//       },
//     }));

//     if (loading) return <div className="p-6">Loading…</div>;
//     if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;
//     if (!rows.length)
//       return <div className="p-6 text-gray-500">No pending farmer requests.</div>;

//     const allChecked = rows.length > 0 && selected.size === rows.length;

//     return (
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="bg-gray-50">
//               <th className="py-3 px-4 text-center">
//                 <input
//                   ref={headerCbRef}
//                   type="checkbox"
//                   checked={allChecked}
//                   onChange={toggleAll}
//                   className="h-4 w-4 accent-primaryYellow cursor-pointer"
//                   aria-label="Select all"
//                 />
//               </th>
//               <th className="py-3 px-4 text-center text-primaryYellow text-lg">
//                 Farmer
//               </th>
//               <th className="py-3 px-4 text-center text-primaryYellow text-lg">
//                 Email
//               </th>
//               <th className="py-3 px-4 text-center text-primaryYellow text-lg">
//                 Requested At
//               </th>
//               <th className="py-3 px-4 text-center text-primaryYellow text-lg">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((r) => {
//               const isChecked = selected.has(r.id);
//               return (
//                 <tr key={r.id} className="bg-[#FEF9C2]">
//                   <td className="py-3 px-4 text-center">
//                     <input
//                       type="checkbox"
//                       checked={isChecked}
//                       onChange={() => toggleRow(r.id)}
//                       className="h-4 w-4 accent-primaryYellow cursor-pointer"
//                     />
//                   </td>
//                   <td className="py-3 px-4 font-semibold text-gray-800 text-center">
//                     {r.farmer_name || r.farmer_id}
//                   </td>
//                   <td className="py-3 px-4 text-gray-700 text-center">
//                     {r.farmer_email || "—"}
//                   </td>
//                   <td className="py-3 px-4 text-gray-700 text-center">
//                     {r.requested_at
//                       ? new Date(r.requested_at).toLocaleString()
//                       : "—"}
//                   </td>
//                   <td className="py-3 px-4">
//                     <div className="flex justify-center gap-3">
//                       <button
//                         onClick={() => onApprove(r.id)}
//                         disabled={busyId === r.id}
//                         className="px-4 py-2 rounded-lg bg-primaryYellow text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                       >
//                         Approve
//                       </button>
//                       <button
//                         onClick={() => onReject(r.id)}
//                         disabled={busyId === r.id}
//                         className="px-4 py-2 rounded-lg bg-[#5c5c5d] text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                       >
//                         Reject
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     );
//   }
// );

// export default FarmerRequestsTable;

// // src/components/admin/tables/FarmerRequestsTable.jsx
// import React, { useEffect, useRef, useState } from "react";
// import {
//   fetchPendingFarmerRequestsForAdmin,
//   approveFarmerRequest,
//   rejectFarmerRequest,
// } from "@/services/FarmerRequests";

// export default function FarmerRequestsTable({ refreshTick, onActionComplete, onSelectionChange }) {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [busyId, setBusyId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [selected, setSelected] = useState(new Set()); // <— selection state
//   const headerCbRef = useRef(null);

//   async function refresh() {
//     setLoading(true);
//     setErrorMsg("");
//     try {
//       const data = await fetchPendingFarmerRequestsForAdmin();
//       setRows(data || []);
//       setSelected(new Set()); // clear selection on refresh
//     } catch (e) {
//       setErrorMsg(e?.message || "Failed to load requests");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     refresh();
//   }, [refreshTick]);

//   // update parent about selection (optional)
//   useEffect(() => {
//     onSelectionChange && onSelectionChange(Array.from(selected));
//   }, [selected, onSelectionChange]);

//   // handle indeterminate state on header checkbox
//   useEffect(() => {
//     if (!headerCbRef.current) return;
//     const all = rows.length > 0 && selected.size === rows.length;
//     const none = selected.size === 0;
//     headerCbRef.current.indeterminate = !all && !none;
//   }, [selected, rows.length]);

//   const toggleRow = (id) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };

//   const toggleAll = () => {
//     setSelected((prev) => {
//       if (rows.length === 0) return new Set();
//       const allSelected = prev.size === rows.length;
//       return allSelected ? new Set() : new Set(rows.map((r) => r.id));
//     });
//   };

//   const onApprove = async (id) => {
//     setBusyId(id);
//     setErrorMsg("");
//     try {
//       await approveFarmerRequest(id);
//       await refresh();
//       onActionComplete && onActionComplete();
//     } catch (e) {
//       setErrorMsg(e?.message || "Approve failed");
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const onReject = async (id) => {
//     const reason = window.prompt("Reason (optional):") || undefined;
//     setBusyId(id);
//     setErrorMsg("");
//     try {
//       await rejectFarmerRequest(id, reason);
//       await refresh();
//       onActionComplete && onActionComplete();
//     } catch (e) {
//       setErrorMsg(e?.message || "Reject failed");
//     } finally {
//       setBusyId(null);
//     }
//   };

//   if (loading) return <div className="p-6">Loading…</div>;
//   if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;
//   if (!rows.length) return <div className="p-6 text-gray-500">No pending farmer requests.</div>;

//   const allChecked = rows.length > 0 && selected.size === rows.length;

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-left">
//         <thead>
//           <tr className="bg-gray-50">
//             <th className="py-3 px-4 text-center">
//               <input
//                 ref={headerCbRef}
//                 type="checkbox"
//                 checked={allChecked}
//                 onChange={toggleAll}
//                 className="h-4 w-4 accent-primaryYellow cursor-pointer"
//                 aria-label="Select all"
//               />
//             </th>
//             <th className="py-3 px-4 text-center text-primaryYellow text-lg">Farmer</th>
//             <th className="py-3 px-4 text-center text-primaryYellow text-lg">Email</th>
//             <th className="py-3 px-4 text-center text-primaryYellow text-lg">Requested At</th>
//             <th className="py-3 px-4 text-center text-primaryYellow text-lg">Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {rows.map((r) => {
//             const isChecked = selected.has(r.id);
//             return (
//               <tr key={r.id} className="bg-[#FEF9C2]">
//                 <td className="py-3 px-4 text-center">
//                   <input
//                     type="checkbox"
//                     checked={isChecked}
//                     onChange={() => toggleRow(r.id)}
//                     className="h-4 w-4 accent-primaryYellow cursor-pointer"
//                     aria-label={`Select ${r.farmer_name || r.farmer_id}`}
//                   />
//                 </td>
//                 <td className="py-3 px-4 font-semibold text-gray-800 text-center">
//                   {r.farmer_name || r.farmer_id}
//                 </td>
//                 <td className="py-3 px-4 text-gray-700 text-center">
//                   {r.farmer_email || "—"}
//                 </td>
//                 <td className="py-3 px-4 text-gray-700 text-center">
//                   {r.requested_at ? new Date(r.requested_at).toLocaleString() : "—"}
//                 </td>
//                 <td className="py-3 px-4">
//                   <div className="flex justify-center gap-3">
//                     <button
//                       onClick={() => onApprove(r.id)}
//                       disabled={busyId === r.id}
//                       className="px-4 py-2 rounded-lg bg-primaryYellow text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={() => onReject(r.id)}
//                       disabled={busyId === r.id}
//                       className="px-4 py-2 rounded-lg bg-[#5c5c5d] text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }




// // src/components/admin/tables/FarmerRequestsTable.jsx
// import React, { useEffect, useState } from "react";
// import {
//   fetchPendingFarmerRequestsForAdmin,
//   approveFarmerRequest,
//   rejectFarmerRequest,
// } from "@/services/FarmerRequests";

// export default function FarmerRequestsTable({ refreshTick, onActionComplete }) {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [busyId, setBusyId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");

//   async function refresh() {
//     setLoading(true);
//     setErrorMsg("");
//     try {
//       const data = await fetchPendingFarmerRequestsForAdmin();
//       setRows(data || []);
//     } catch (e) {
//       setErrorMsg(e?.message || "Failed to load requests");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     refresh();
//   }, [refreshTick]);

//   const onApprove = async (id) => {
//     setBusyId(id);
//     setErrorMsg("");
//     try {
//       await approveFarmerRequest(id);          // ✅ keep backend behavior
//       await refresh();
//       onActionComplete && onActionComplete();  // notify parent
//     } catch (e) {
//       setErrorMsg(e?.message || "Approve failed");
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const onReject = async (id) => {
//     const reason = window.prompt("Reason (optional):") || undefined;
//     setBusyId(id);
//     setErrorMsg("");
//     try {
//       await rejectFarmerRequest(id, reason);   // ✅ keep backend behavior
//       await refresh();
//       onActionComplete && onActionComplete();  // notify parent
//     } catch (e) {
//       setErrorMsg(e?.message || "Reject failed");
//     } finally {
//       setBusyId(null);
//     }
//   };

//   if (loading) return <div className="p-6">Loading…</div>;
//   if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;
//   if (!rows.length) return <div className="p-6 text-gray-500">No pending farmer requests.</div>;

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-left">
//         <thead>
//           <tr className="bg-gray-50">
//             <th className="py-3 px-4 text-center text-primaryYellow text-lg">Farmer</th>
//             <th className="py-3 px-4 text-center text-primaryYellow text-lg">Email</th>
//             <th className="py-3 px-4 text-center text-primaryYellow text-lg">Requested At</th>
//             <th className="py-3 px-4 text-center text-primaryYellow text-lg">Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {rows.map((r) => (
//             <tr key={r.id} className="bg-[#FEF9C2]">
//               <td className="py-3 px-4 font-semibold text-gray-800 text-center">
//                 {r.farmer_name || r.farmer_id}
//               </td>
//               <td className="py-3 px-4 text-gray-700 text-center">
//                 {r.farmer_email || "—"}
//               </td>
//               <td className="py-3 px-4 text-gray-700 text-center">
//                 {r.requested_at ? new Date(r.requested_at).toLocaleString() : "—"}
//               </td>
//               <td className="py-3 px-4">
//                 <div className="flex justify-center gap-3">
//                   <button
//                     onClick={() => onApprove(r.id)}
//                     disabled={busyId === r.id}
//                     className="px-4 py-2 rounded-lg bg-primaryYellow text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                   >
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => onReject(r.id)}
//                     disabled={busyId === r.id}
//                     className="px-4 py-2 rounded-lg bg-[#5c5c5d] text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                   >
//                     Reject
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import {
//   fetchPendingFarmerRequestsForAdmin,
//   approveFarmerRequest,
//   rejectFarmerRequest,
// } from "@/services/FarmerRequests";

// export default function FarmerRequestsTable({ refreshTick, onActionComplete }) {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [busyId, setBusyId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");

//   async function refresh() {
//     setLoading(true);
//     setErrorMsg("");
//     try {
//       const data = await fetchPendingFarmerRequestsForAdmin();
//       setRows(data);
//     } catch (e) {
//       setErrorMsg(e?.message || "Failed to load requests");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     refresh();
//   }, [refreshTick]); // 👈 also refetch when parent bumps

//   const onApprove = async (id) => {
//     setBusyId(id);
//     setErrorMsg("");
//     try {
//       await approveFarmerRequest(id);    // backend sets farmer approved/active
//       await refresh();                   // update pending list
//       onActionComplete && onActionComplete(); // 🔁 tell parent to refresh UserFarmerTable
//     } catch (e) {
//       setErrorMsg(e?.message || "Approve failed");
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const onReject = async (id) => {
//     const reason = window.prompt("Reason (optional):") || undefined;
//     setBusyId(id);
//     setErrorMsg("");
//     try {
//       await rejectFarmerRequest(id, reason);
//       await refresh();
//       onActionComplete && onActionComplete(); // 🔁 refresh other tables too
//     } catch (e) {
//       setErrorMsg(e?.message || "Reject failed");
//     } finally {
//       setBusyId(null);
//     }
//   };

//   if (loading) return <div className="p-6">Loading…</div>;
//   if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;
//   if (!rows.length) return <div className="p-6 text-gray-500">No pending farmer requests.</div>;

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-left">
//         <thead>
//           <tr className="border-b">
//             <th className="py-3 px-4">Farmer</th>
//             <th className="py-3 px-4">Email</th>
//             <th className="py-3 px-4">Requested At</th>
//             <th className="py-3 px-4 text-right">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((r) => (
//             <tr key={r.id} className="border-b hover:bg-yellow-50/40">
//               <td className="py-3 px-4">{r.farmer_name || r.farmer_id}</td>
//               <td className="py-3 px-4">{r.farmer_email || "—"}</td>
//               <td className="py-3 px-4">
//                 {r.requested_at ? new Date(r.requested_at).toLocaleString() : "—"}
//               </td>
//               <td className="py-3 px-4">
//                 <div className="flex justify-end gap-2">
//                   <button
//                     onClick={() => onApprove(r.id)}
//                     disabled={busyId === r.id}
//                     className="bg-primaryYellow text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-60"
//                   >
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => onReject(r.id)}
//                     disabled={busyId === r.id}
//                     className="bg-gray-500 text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-60"
//                   >
//                     Reject
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import {
//   fetchPendingFarmerRequestsForAdmin,
//   approveFarmerRequest,
//   rejectFarmerRequest,
// } from "@/services/FarmerRequests";

// export default function FarmerRequestsTable() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [busyId, setBusyId] = useState(null);
//   const [errorMsg, setErrorMsg] = useState("");

//   async function refresh() {
//     setLoading(true);
//     setErrorMsg("");
//     try {
//       const data = await fetchPendingFarmerRequestsForAdmin();
//       setRows(data);
//     } catch (e) {
//       setErrorMsg(e?.message || "Failed to load requests");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     refresh();
//   }, []);

//   const onApprove = async (id) => {
//     setBusyId(id);
//     setErrorMsg("");
//     try {
//       await approveFarmerRequest(id); // RPC: admin_process_farmer_request(row_id, 'approved', ...)
//       await refresh();
//     } catch (e) {
//       setErrorMsg(e?.message || "Approve failed");
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const onReject = async (id) => {
//     const reason = window.prompt("Reason (optional):") || undefined;
//     setBusyId(id);
//     setErrorMsg("");
//     try {
//       await rejectFarmerRequest(id, reason); // RPC: admin_process_farmer_request(row_id, 'rejected', reason)
//       await refresh();
//     } catch (e) {
//       setErrorMsg(e?.message || "Reject failed");
//     } finally {
//       setBusyId(null);
//     }
//   };

//   if (loading) return <div className="p-6">Loading…</div>;

//   return (
//     <div className="overflow-x-auto">
//       {errorMsg ? (
//         <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-red-700">
//           {errorMsg}
//         </div>
//       ) : null}

//       {!rows.length ? (
//         <div className="p-6 text-gray-500">No pending farmer requests.</div>
//       ) : (
//         <table className="w-full text-left">
//           <thead>
//             <tr className="border-b">
//               <th className="py-3 px-4">Farmer</th>
//               <th className="py-3 px-4">Email</th>
//               <th className="py-3 px-4">Requested At</th>
//               <th className="py-3 px-4 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r) => {
//               const isBusy = busyId === r.id;
//               return (
//                 <tr key={r.id} className="border-b hover:bg-yellow-50/40">
//                   <td className="py-3 px-4">{r.farmer_name || r.farmer_id}</td>
//                   <td className="py-3 px-4">{r.farmer_email || "—"}</td>
//                   <td className="py-3 px-4">
//                     {r.requested_at ? new Date(r.requested_at).toLocaleString() : "—"}
//                   </td>
//                   <td className="py-3 px-4">
//                     <div className="flex justify-end gap-2">
//                       <button
//                         onClick={() => onApprove(r.id)}
//                         disabled={isBusy}
//                         className="bg-primaryYellow text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-60"
//                         title="Approve this farmer's request"
//                       >
//                         {isBusy ? "Approving…" : "Approve"}
//                       </button>
//                       <button
//                         onClick={() => onReject(r.id)}
//                         disabled={isBusy}
//                         className="bg-gray-600 text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-60"
//                         title="Reject this farmer's request"
//                       >
//                         {isBusy ? "Rejecting…" : "Reject"}
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }
