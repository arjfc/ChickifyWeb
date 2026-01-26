import { useState, useEffect, useRef } from "react";
import LogsTable from "@/components/super-admin/tables/LogsTable";
import TrackUserTable from "@/components/super-admin/tables/TrackUserLoginTable";
import { BsGrid } from "react-icons/bs";
import { LuCalendar } from "react-icons/lu";
import { fetchAllActionType } from "@/services/Activitylogs";

export default function ActivityLogs() {
  // ===== Activity Logs (tabs) =====
  const adminOptions = ["Admin", "Farmer", "Buyer"];
  const [selectedAdminOption, setSelectedAdminOption] = useState("Admin");

  const getRoleForTab = (tab) => {
    if (tab === "Admin") return "admin";
    if (tab === "Farmer") return "farmer";
    if (tab === "Buyer") return "buyer";
    return "All";
  };

  // ===== Activity logs filters =====
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [types, setTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");

  // ===== Track Last Sign-ins filters =====
  const [loginRole, setLoginRole] = useState(getRoleForTab("Admin")); // synced with tabs
  const [loginFromDate, setLoginFromDate] = useState("");
  const [loginToDate, setLoginToDate] = useState("");

  // ===== Counts =====
  const [activityCount, setActivityCount] = useState(0);
  const [signinCount, setSigninCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const actionTypes = await fetchAllActionType();
        setTypes(["All", ...actionTypes]);
      } catch (err) {
        console.error("Failed to load action types:", err);
      }
    })();
  }, []);

  // When tab changes, also filter Track Last Sign-ins by same role
  useEffect(() => {
    setLoginRole(getRoleForTab(selectedAdminOption));
  }, [selectedAdminOption]);

  // Refs to trigger child PDF exports
  const activityRef = useRef(null);
  const signinsRef = useRef(null);

  const buildDateLabel = (from, to) => {
    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Until ${to}`;
    return "All dates";
  };

  const handleGenerateActivityPdf = async () => {
    try {
      await activityRef.current?.exportPdf({
        title: "Chickify Activity Logs",
        subtitle: `${selectedAdminOption}`,
        filename: `activity_logs_${selectedAdminOption}_${selectedType}_${
          fromDate || "all"
        }_${toDate || "all"}.pdf`,
      });
    } catch (e) {
      console.error("Activity Logs PDF export failed:", e);
      alert("Failed to generate Activity Logs PDF.");
    }
  };

  const handleGenerateSigninsPdf = async () => {
  try {
    await signinsRef.current?.exportPdf({
      title: "Chickify Track Last Sign-ins",
      subtitle: loginRole === "All" ? "All Roles" : loginRole,
      filename: `user_signins_${loginRole}_${
        loginFromDate || "all"
      }_${loginToDate || "all"}.pdf`,
    });
  } catch (e) {
    console.error("User Logs PDF export failed:", e);
    alert("Failed to generate User Logs PDF.");
  }
};


  // ===== Reset handlers =====
  const resetActivityFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedType("All");
  };

  const resetSigninFilters = () => {
    setLoginFromDate("");
    setLoginToDate("");
    setLoginRole(getRoleForTab(selectedAdminOption));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* =================== Activity Logs Tabs =================== */}
      <div className="flex items-center bg-softPrimaryYelllow p-2 rounded-xl">
        <div className="flex gap-2">
          {adminOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedAdminOption(opt)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedAdminOption === opt
                  ? "border border-primaryYellow text-black bg-yellow-50"
                  : "text-black hover:bg-yellow-100/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* =================== Activity Logs Header =================== */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-800">ACTIVITY LOGS</h2>
        <p className="text-sm text-gray-600">
          View all recorded actions (create, update, delete, login, etc.) performed by
          Admins, Farmers, and Buyers.
        </p>
      </div>

      {/* =================== Activity Logs Filters =================== */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Left: filters */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Action Type */}
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-3 py-2">
            <BsGrid className="text-gray-600 w-4 h-4" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            >
              {types.map((type, i) => (
                <option key={i} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          
          {/* From date */}
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-3 py-2">
            <LuCalendar className="text-gray-600 w-4 h-4" />
            <span className="text-sm text-gray-700">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>

          {/* To date */}
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-3 py-2">
            <LuCalendar className="text-gray-600 w-4 h-4" />
            <span className="text-sm text-gray-700">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>

          <button
            onClick={resetActivityFilters}
            className="cursor-pointer border border-gray-300 text-gray-700 text-xs font-medium rounded-lg px-3 py-2 hover:bg-gray-50"
          >
            Reset filters
          </button>
        </div>

        {/* Right: buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateActivityPdf}
            className="cursor-pointer bg-primaryYellow text-white text-sm font-semibold rounded-lg px-4 py-2"
          >
            Generate Activity Logs Report
          </button>

        </div>
      </div>

      <LogsTable
        ref={activityRef}
        selectedOption={selectedAdminOption}
        type={selectedType}
        fromDate={fromDate || null}
        toDate={toDate || null}
        onCountChange={setActivityCount}
      />

      {/* =================== Track last sign-ins =================== */}
      <div className="flex flex-col gap-1 mt-4">
        <h2 className="text-xl font-semibold text-gray-800">TRACK LAST SIGN-INS</h2>
        <p className="text-sm text-gray-600">
          Monitor the most recent login activity of users across all roles for auditing
          and security checks.
        </p>
      </div>

      {/* =================== Track last sign-ins Filters =================== */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role */}
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-3 py-2">
            <BsGrid className="text-gray-600 w-4 h-4" />
            <select
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            >
              {["All", "admin", "farmer", "buyer"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* From date */}
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-3 py-2">
            <LuCalendar className="text-gray-600 w-4 h-4" />
            <span className="text-sm text-gray-700">From</span>
            <input
              type="date"
              value={loginFromDate}
              onChange={(e) => setLoginFromDate(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>

          {/* To date */}
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-3 py-2">
            <LuCalendar className="text-gray-600 w-4 h-4" />
            <span className="text-sm text-gray-700">To</span>
            <input
              type="date"
              value={loginToDate}
              onChange={(e) => setLoginToDate(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>

          
          <button
            onClick={resetSigninFilters}
            className="cursor-pointer border border-gray-300 text-gray-700 text-xs font-medium rounded-lg px-3 py-2 hover:bg-gray-50"
          >
            Reset filters
          </button>
        </div>

        {/* Right: buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateSigninsPdf}
            className="cursor-pointer bg-primaryYellow text-white text-sm font-semibold rounded-lg px-4 py-2"
          >
            Generate User Logs Report
          </button>

        </div>
      </div>

      <TrackUserTable
        ref={signinsRef}
        limit={15}
        userrole={loginRole}
        fromDate={loginFromDate || null}
        toDate={loginToDate || null}
        onCountChange={setSigninCount}
      />
    </div>
  );
}


// import { useState, useEffect, useRef } from "react";
// import LogsTable from "@/components/super-admin/tables/LogsTable";
// import TrackUserTable from "@/components/super-admin/tables/TrackUserLoginTable";
// import { BsGrid } from "react-icons/bs";
// import { fetchAllActionType } from "@/services/activityLogs";
// import { LuCalendar } from "react-icons/lu";

// export default function ActivityLogs() {
//   // ===== Activity Logs (tabs) =====
//   const adminOptions = ["Admin", "Farmer", "Buyer"];
//   const [selectedAdminOption, setSelectedAdminOption] = useState("Admin");

//   // ===== Activity logs filters =====
//   const [dateRange, setDateRange] = useState("all");
//   const [types, setTypes] = useState(["All"]);
//   const [selectedType, setSelectedType] = useState("All");

//   // ===== Track Last Sign-ins filters =====
//   const [loginRole, setLoginRole] = useState("All");
//   const [loginDateRange, setLoginDateRange] = useState("all");

//   const dateOptions = [
//     { value: "all", label: "All time" },
//     { value: "today", label: "Today" },
//     { value: "yesterday", label: "Yesterday" },
//     { value: "7", label: "Last 7 days" },
//     { value: "30", label: "Last 30 days" },
//     { value: "last_month", label: "Last month" },
//   ];

//   useEffect(() => {
//     (async () => {
//       try {
//         const actionTypes = await fetchAllActionType();
//         setTypes(["All", ...actionTypes]);
//       } catch (err) {
//         console.error("Failed to load action types:", err);
//       }
//     })();
//   }, []);

//   // ⬇️ NEW: refs to trigger child PDF exports
//   const activityRef = useRef(null);
//   const signinsRef = useRef(null);

//   const handleGenerateActivityPdf = async () => {
//     try {
//       await activityRef.current?.exportPdf({
//         title: "Chickify Activity Logs",
//         subtitle: `${selectedAdminOption} • ${selectedType} • ${dateOptions.find(d => d.value === dateRange)?.label ?? dateRange}`,
//         filename: `activity_logs_${selectedAdminOption}_${selectedType}_${dateRange}.pdf`,
//       });
//     } catch (e) {
//       console.error("Activity Logs PDF export failed:", e);
//       alert("Failed to generate Activity Logs PDF.");
//     }
//   };

//   const handleGenerateSigninsPdf = async () => {
//     try {
//       await signinsRef.current?.exportPdf({
//         title: "Chickify Track Last Sign-ins",
//         subtitle: `${loginRole} • ${dateOptions.find(d => d.value === loginDateRange)?.label ?? loginDateRange}`,
//         filename: `user_signins_${loginRole}_${loginDateRange}.pdf`,
//       });
//     } catch (e) {
//       console.error("User Logs PDF export failed:", e);
//       alert("Failed to generate User Logs PDF.");
//     }
//   };

//   return (
//     <div className="flex flex-col gap-6">
//       {/* =================== Activity Logs =================== */}
//       <div className="flex items-center bg-softPrimaryYelllow p-2 rounded-xl">
//         <div className="flex gap-2">
//           {adminOptions.map((opt) => (
//             <button
//               key={opt}
//               onClick={() => setSelectedAdminOption(opt)}
//               className={`px-3 py-1 rounded-lg stext-sm transition-colors ${
//                 selectedAdminOption === opt
//                   ? "border border-primaryYellow text-black bg-yellow-50"
//                   : "text-black hover:bg-yellow-100/40"
//               }`}
//             >
//               {opt}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Filters left, button right */}
//       <div className="flex items-center justify-between">
//         {/* Left: filters */}
//         <div className="flex items-center gap-3 [&_svg]:w-4 [&_svg]:h-4">
//           {/* Date Range */}
//           <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
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

//           {/* Action Type */}
//           <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
//             <BsGrid className="text-gray-600" />
//             <select
//               value={selectedType}
//               onChange={(e) => setSelectedType(e.target.value)}
//               className="bg-transparent outline-none text-sm text-gray-700"
//             >
//               {types.map((type, i) => (
//                 <option key={i} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Right: button */}
//         <button
//           onClick={handleGenerateActivityPdf}
//           className="cursor-pointer bg-primaryYellow text-white text-sm font-semibold rounded-lg px-4 py-2"
//         >
//           Generate Activity Logs Report
//         </button>
//       </div>

//       <LogsTable
//         ref={activityRef}
//         selectedOption={selectedAdminOption}
//         type={selectedType}
//         dateRange={dateRange}
//       />

//       {/* =================== Track last sign-ins =================== */}
//       <h2 className="text-xl font-semibold text-gray-800 ">TRACK LAST SIGN-INS</h2>

//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3 [&_svg]:w-4 [&_svg]:h-4">
//           <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
//             <LuCalendar className="text-gray-600" />
//             <select
//               value={loginDateRange}
//               onChange={(e) => setLoginDateRange(e.target.value)}
//               className="bg-transparent outline-none text-sm text-gray-700"
//             >
//               {dateOptions.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Role */}
//           <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
//             <BsGrid className="text-gray-600" />
//             <select
//               value={loginRole}
//               onChange={(e) => setLoginRole(e.target.value)}
//               className="bg-transparent outline-none text-sm text-gray-700"
//             >
//               {["All", "admin", "farmer", "buyer"].map((r) => (
//                 <option key={r} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Right: button */}
//         <button
//           onClick={handleGenerateSigninsPdf}
//           className="cursor-pointer bg-primaryYellow text-white text-sm font-semibold rounded-lg px-4 py-2"
//         >
//           Generate User Logs Report
//         </button>
//       </div>

//       <TrackUserTable
//         ref={signinsRef}
//         limit={15}
//         userrole={loginRole}
//         date={loginDateRange}
//       />
//     </div>
//   );
// }
