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
  markMembershipPaymentPaid,
  shouldShowMarkAsPaidButton,
  canApproveRequest,
} from "@/services/FarmerRequests";

// ✅ use the helpers (recommended)
import {
  verifyMembershipPayment,
  rejectMembershipPayment,
} from "@/services/membershipPaymentAdmin";

const FarmerRequestsTable = forwardRef(
  (
    {
      refreshTick,
      onActionComplete,
      onSelectionChange,
      onHeaderCheck,
      onViewPermit,
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

    const getMembershipPaymentId = (row) =>
      row.membership_payment_id ?? row.membershipPaymentId ?? null;

    /**
     * ✅ Approve logic:
     * - If membership_payment_id exists: verify payment (RPC also writes ledger)
     * - Else: fallback to old approveFarmerRequest(row)
     */
    const onApprove = async (row) => {
      setBusyId(row.id);
      setErrorMsg("");
      try {
        const membershipPaymentId = getMembershipPaymentId(row);

        if (membershipPaymentId) {
          await verifyMembershipPayment(membershipPaymentId);
        } else {
          await approveFarmerRequest(row);
        }

        await refresh();
        onActionComplete && onActionComplete();
      } catch (e) {
        setErrorMsg(e?.message || "Approve failed");
      } finally {
        setBusyId(null);
      }
    };

    /**
     * ✅ Reject logic:
     * - Cancel payment (if exists)
     * - Always reject farmer request (DB + email)
     */
    const onReject = async (row) => {
      const reason = window.prompt("Reason (optional):") || undefined;
      setBusyId(row.id);
      setErrorMsg("");
      try {
        const membershipPaymentId = getMembershipPaymentId(row);

        if (membershipPaymentId) {
          await rejectMembershipPayment(membershipPaymentId, reason);
        }

        await rejectFarmerRequest(row, reason);

        await refresh();
        onActionComplete && onActionComplete();
      } catch (e) {
        setErrorMsg(e?.message || "Reject failed");
      } finally {
        setBusyId(null);
      }
    };

    const onMarkAsPaid = async (row) => {
      setBusyId(row.id);
      setErrorMsg("");
      try {
        await markMembershipPaymentPaid(row.membership_payment_id);
        await refresh();
        onActionComplete && onActionComplete();
      } catch (e) {
        setErrorMsg(e?.message || "Mark as paid failed");
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
            const row = rows.find((r) => r.id === id);
            if (!row) continue;

            const membershipPaymentId = getMembershipPaymentId(row);

            if (membershipPaymentId) {
              await verifyMembershipPayment(membershipPaymentId);
            } else {
              await approveFarmerRequest(row);
            }
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
                Contact
              </th>
              <th className="py-3 px-4 text-center text-primaryYellow text-lg">
                Email
              </th>
              <th className="py-3 px-4 text-center text-primaryYellow text-lg">
                Payment Status
              </th>
              <th className="py-3 px-4 text-center text-primaryYellow text-lg">
                Amount
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
                    {r.farmer_contact_no || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-center">
                    {r.farmer_email || "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                      r.payment_status === 'verified' ? 'bg-green-100 text-green-800' :
                      r.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      r.payment_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {r.payment_status || 'not_submitted'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-center">
                    {r.payment_amount ? `₱${Number(r.payment_amount).toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 text-center">
                    {r.requested_at
                      ? new Date(r.requested_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => onViewPermit && onViewPermit(r)}
                        className="px-3 py-2 rounded-lg border border-primaryYellow text-primaryYellow font-medium text-sm shadow-sm hover:bg-primaryYellow hover:text-white transition"
                      >
                        View Permit
                      </button>

                      {shouldShowMarkAsPaidButton(r) && (
                        <button
                          onClick={() => onMarkAsPaid(r)}
                          disabled={busyId === r.id}
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm shadow hover:bg-blue-700 disabled:opacity-60"
                        >
                          Mark as Paid
                        </button>
                      )}

                      <button
                        onClick={() => onApprove(r)}
                        disabled={busyId === r.id || !canApproveRequest(r)}
                        className="px-4 py-2 rounded-lg bg-primaryYellow text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => onReject(r)}
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
//       onViewPermit, // ✅ parent will handle modal + RPC
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

//     useEffect(() => {
//       onSelectionChange && onSelectionChange(Array.from(selected));
//     }, [selected, onSelectionChange]);

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
//         onHeaderCheck && onHeaderCheck(!allSelected);
//         return next;
//       });
//     };

//     const onApprove = async (row) => {
//       setBusyId(row.id);
//       setErrorMsg("");
//       try {
//         await approveFarmerRequest(row);  // ⬅️ pass whole row
//         await refresh();
//         onActionComplete && onActionComplete();
//       } catch (e) {
//         setErrorMsg(e?.message || "Approve failed");
//       } finally {
//         setBusyId(null);
//       }
//     };

//     const onReject = async (row) => {
//       const reason = window.prompt("Reason (optional):") || undefined;
//       setBusyId(row.id);
//       setErrorMsg("");
//       try {
//         await rejectFarmerRequest(row, reason);  // ⬅️ pass row + reason
//         await refresh();
//         onActionComplete && onActionComplete();
//       } catch (e) {
//         setErrorMsg(e?.message || "Reject failed");
//       } finally {
//         setBusyId(null);
//       }
//     };

//     useImperativeHandle(ref, () => ({
//       approveAllSelected: async () => {
//         if (selected.size === 0) return;
//         setErrorMsg("");
//         try {
//           for (let id of selected) {
//             const row = rows.find((r) => r.id === id);
//             if (row) {
//               await approveFarmerRequest(row); // this will also send emails
//             }
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
//                       {/* View Permit button -> parent handler */}
//                       <button
//                         type="button"
//                         onClick={() => onViewPermit && onViewPermit(r)}
//                         className="px-3 py-2 rounded-lg border border-primaryYellow text-primaryYellow font-medium text-sm shadow-sm hover:bg-primaryYellow hover:text-white transition"
//                       >
//                         View Permit
//                       </button>

//                       <button
//                         onClick={() => onApprove(r)}
//                         disabled={busyId === r.id}
//                         className="px-4 py-2 rounded-lg bg-primaryYellow text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//                       >
//                         Approve
//                       </button>
//                       <button
//                         onClick={() => onReject(r)}
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
