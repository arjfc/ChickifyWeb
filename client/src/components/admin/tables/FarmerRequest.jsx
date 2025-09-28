import React, { useEffect, useState } from "react";
import {
  fetchPendingFarmerRequestsForAdmin,
  approveFarmerRequest,
  rejectFarmerRequest,
} from "@/services/FarmerRequests";

export default function FarmerRequestsTable({ refreshTick, onActionComplete }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function refresh() {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await fetchPendingFarmerRequestsForAdmin();
      setRows(data);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [refreshTick]); // 👈 also refetch when parent bumps

  const onApprove = async (id) => {
    setBusyId(id);
    setErrorMsg("");
    try {
      await approveFarmerRequest(id);    // backend sets farmer approved/active
      await refresh();                   // update pending list
      onActionComplete && onActionComplete(); // 🔁 tell parent to refresh UserFarmerTable
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
      onActionComplete && onActionComplete(); // 🔁 refresh other tables too
    } catch (e) {
      setErrorMsg(e?.message || "Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (errorMsg) return <div className="p-6 text-red-600">{errorMsg}</div>;
  if (!rows.length) return <div className="p-6 text-gray-500">No pending farmer requests.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-4">Farmer</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Requested At</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b hover:bg-yellow-50/40">
              <td className="py-3 px-4">{r.farmer_name || r.farmer_id}</td>
              <td className="py-3 px-4">{r.farmer_email || "—"}</td>
              <td className="py-3 px-4">
                {r.requested_at ? new Date(r.requested_at).toLocaleString() : "—"}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onApprove(r.id)}
                    disabled={busyId === r.id}
                    className="bg-primaryYellow text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(r.id)}
                    disabled={busyId === r.id}
                    className="bg-gray-500 text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
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
