import React, { useState } from "react";
import PayoutReqTable from "../../../components/admin/tables/PayoutReqTable";
import { LuCalendar } from "react-icons/lu";

export default function PayoutRequest() {
  const options = ["Pending", "Approved", "Rejected"];
  const [selectedOption, setSelectedOption] = useState("Pending");

  // ⬇️ Copied date range state + options from FIRST CODE
  const [dateRange, setDateRange] = useState("all");
  const dateOptions = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "last_month", label: "Last month" },
  ];

  // ✅ Approve still opens the modal (same pattern you used)
  const openApproveModal = () => window.dispatchEvent(new Event("openRefundModal"));

  // ✅ Reject will NOT open a modal — emit a direct action event instead
  //    (Handle this in PayoutReqTable to perform the reject immediately)
  const rejectDirect = () => window.dispatchEvent(new Event("rejectPayoutDirect"));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row justify-between items-center border-b border-gray-300 gap-10">
          {options.map((data) => (
            <div
              key={data}
              onClick={() => setSelectedOption(data)}
              className={`text-xl font-semibold px-3 py-2 cursor-pointer transition-colors duration-200 ${
                selectedOption === data
                  ? "text-primaryYellow font-semibold border-b-4 border-primaryYellow"
                  : "text-gray-400"
              }`}
            >
              {data}
            </div>
          ))}
        </div>

        <div className="flex flex-row justify-between items-center gap-5">
          {/* ⬇️ Date range dropdown (same idea as FIRST CODE) */}
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-2">
            <LuCalendar className="text-gray-600" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Approve -> still opens approve modal */}
          <div
            onClick={openApproveModal}
            className="cursor-pointer bg-yellow-500 text-white text-md font-bold rounded-lg px-5 py-2"
            title="Open approve modal"
          >
            Approve
          </div>

          {/* Reject -> NO MODAL. Fire a direct event the table can handle */}
          <div
            onClick={rejectDirect}
            className="cursor-pointer bg-gray-600 text-white text-md font-bold rounded-lg px-5 py-2"
            title="Reject payout (no modal)"
          >
            Reject
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        {/* pass dateRange as 'date' to match your first file’s prop shape */}
        <PayoutReqTable selectedOption={selectedOption} date={dateRange} />
      </div>
    </div>
  );
}



// import React, { useState } from "react";
// import PayoutReqTable from "../../../components/admin/tables/PayoutReqTable";
// import { LuCalendar } from "react-icons/lu";

// export default function PayoutRequest() {
//   const options = ["Pending", "Approved", "Rejected"];
//   const [selectedOption, setSelectedOption] = useState("Pending");

//   // ⬇️ Copied date range state + options from FIRST CODE
//   const [dateRange, setDateRange] = useState("all");
//   const dateOptions = [
//     { value: "all", label: "All time" },
//     { value: "today", label: "Today" },
//     { value: "yesterday", label: "Yesterday" },
//     { value: "7", label: "Last 7 days" },
//     { value: "30", label: "Last 30 days" },
//     { value: "last_month", label: "Last month" },
//   ];

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="flex flex-row justify-between">
//         <div className="flex flex-row justify-between items-center border-b border-gray-300 gap-10">
//           {options.map((data) => (
//             <div
//               key={data}
//               onClick={() => setSelectedOption(data)}
//               className={`text-xl font-semibold px-3 py-2 cursor-pointer transition-colors duration-200 ${
//                 selectedOption === data
//                   ? "text-primaryYellow font-semibold border-b-4 border-primaryYellow"
//                   : "text-gray-400"
//               }`}
//             >
//               {data}
//             </div>
//           ))}
//         </div>

//         <div className="flex flex-row justify-between items-center gap-5">
//           {/* ⬇️ Replaced DatePicker with the date range dropdown (same as FIRST CODE) */}
//           <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-2">
//             <LuCalendar className="text-gray-600" />
//             <select
//               value={dateRange}
//               onChange={(e) => setDateRange(e.target.value)}
//               className="bg-transparent outline-none text-sm text-gray-700"
//             >
//               {dateOptions.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div
//             onClick={() => alert("clicked")}
//             className="cursor-pointer bg-yellow-500 text-white text-md font-bold rounded-lg px-5 py-2"
//           >
//             Approve
//           </div>

//           <div
//             onClick={() => alert("clicked")}
//             className="cursor-pointer bg-gray-600 text-white text-md font-bold rounded-lg px-5 py-2"
//           >
//             Reject
//           </div>
       
//         </div>
//       </div>

//       <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
//         <PayoutReqTable selectedOption={selectedOption} />
//       </div>
//     </div>
//   );
// }
