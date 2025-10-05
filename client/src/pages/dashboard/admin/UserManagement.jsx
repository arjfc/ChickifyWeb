// src/pages/admin/UserManagement.jsx
import React, { useState, useRef, useEffect } from "react";
import UserFarmerTable from "../../../components/admin/tables/UserFarmerTable";
import { LuUserRound } from "react-icons/lu";
import DashboardCard from "../../../components/DashboardCard";
import FarmerRequestsTable from "../../../components/admin/tables/FarmerRequest";

export default function UserManagement() {
  const [refreshTick, setRefreshTick] = useState(0);
  const bumpRefresh = () => setRefreshTick((t) => t + 1);
  const farmerRequestsTableRef = useRef();

  const [showApproveAll, setShowApproveAll] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-6 relative">
      {/* KPI Cards */}
      <DashboardCard
        title="Total Active Farmer Users"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={15300}
      />
      <DashboardCard
        title="Total Active Buyer Users"
        icon={<LuUserRound className="text-6xl text-primaryYellow" />}
        data={15300}
      />

      {/* Farmer Verification header */}
      <div className="col-span-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primaryYellow">
          Farmer Verification
        </h1>
        {showApproveAll && (
          <button
            onClick={() => farmerRequestsTableRef.current?.approveAllSelected()}
            className="px-4 py-2 rounded-lg font-medium shadow bg-primaryYellow text-white hover:opacity-90"
          >
            Approve All
          </button>
        )}
      </div>

      {/* Farmer Verification table */}
      <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
        <FarmerRequestsTable
          ref={farmerRequestsTableRef}
          refreshTick={refreshTick}
          onActionComplete={bumpRefresh}
          onHeaderCheck={(checked) => setShowApproveAll(checked)}
        />
      </div>

      {/* Farmers list */}
      <div className="col-span-2">
        <h1 className="text-2xl font-bold text-primaryYellow">
          List of Farmers
        </h1>
      </div>
      <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
        <UserFarmerTable
          role="admin"
          option="Farmer"
          type="All"
          refreshTick={refreshTick}
        />
      </div>
    </div>
  );
}


// // src/pages/admin/UserManagement.jsx
// import React, { useState } from "react";
// import UserFarmerTable from "../../../components/admin/tables/UserFarmerTable";
// import { LuUserRound } from "react-icons/lu";
// import DashboardCard from "../../../components/DashboardCard";
// import FarmerRequestsTable from "../../../components/admin/tables/FarmerRequest";
// import {
//   fetchPendingFarmerRequestsForAdmin,
//   approveFarmerRequest,
// } from "@/services/FarmerRequests";

// export default function UserManagement() {
//   const [refreshTick, setRefreshTick] = useState(0);
//   const [bulkBusy, setBulkBusy] = useState(false);
//   const bumpRefresh = () => setRefreshTick((t) => t + 1);

//   // Bulk "Approve All" for farmer verification
//   const handleApproveAll = async () => {
//     setBulkBusy(true);
//     try {
//       const rows = await fetchPendingFarmerRequestsForAdmin();
//       if (!rows?.length) return;
//       if (!window.confirm(`Approve all ${rows.length} pending farmer(s)?`)) return;

//       for (const r of rows) {
//         await approveFarmerRequest(r.id);
//       }
//       bumpRefresh(); // refresh both tables
//     } finally {
//       setBulkBusy(false);
//     }
//   };

//   return (
//     <div className="grid grid-cols-2 gap-6 relative">
//       {/* KPI Cards (kept) */}
//       <DashboardCard
//         title="Total Active Farmer Users"
//         icon={<LuUserRound className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />
//       <DashboardCard
//         title="Total Active Buyer Users"
//         icon={<LuUserRound className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />

//       {/* Farmer Verification header + Approve All */}
//       <div className="col-span-2 flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-primaryYellow">Farmer Verification</h1>
//         <button
//           onClick={handleApproveAll}
//           disabled={bulkBusy}
//           className="px-5 py-2 rounded-lg bg-primaryYellow text-white font-medium shadow hover:opacity-90 disabled:opacity-60"
//         >
//           {bulkBusy ? "Approving…" : "Approve All"}
//         </button>
//       </div>

//       {/* Farmer Verification table */}
//       <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <FarmerRequestsTable
//           refreshTick={refreshTick}
//           onActionComplete={bumpRefresh}
//         />
//       </div>

//       {/* Farmers list (tabs & dropdown removed; fixed to Farmers, All) */}
//       <div className="col-span-2">
//         <h1 className="text-2xl font-bold text-primaryYellow">List of Farmers</h1>
//       </div>
//       <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <UserFarmerTable
//           role="admin"
//           option="Farmer"  // fixed since tabs removed
//           type="All"       // fixed since dropdown removed
//           refreshTick={refreshTick}
//         />
//       </div>
//     </div>
//   );
// }



// // src/pages/dashboard/admin/UserManagement.jsx
// import React, { useState } from "react";
// import UserFarmerTable from "../../../components/admin/tables/UserFarmerTable";
// import { LuUserRound } from "react-icons/lu";
// import DashboardCard from "../../../components/DashboardCard";
// import { IoChevronDown, IoFilterOutline } from "react-icons/io5";
// import FarmerRequestsTable from "../../../components/admin/tables/FarmerRequest";

// export default function UserManagement() {
//   // Tabs now: Pending / Approved / Rejected (UI only)
//   const statusOptions = ["Pending", "Approved", "Rejected"];
//   const [selectedStatus, setSelectedStatus] = useState("Pending"); // <-- no TS generic

//   // Main Dropdown (unchanged)
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedMainType, setSelectedMainType] = useState("All");
//   const mainTypes = ["All", "Active", "Inactive", "Deactivated"];

//   const [refreshTick, setRefreshTick] = useState(0);
//   const bumpRefresh = () => setRefreshTick((t) => t + 1);

//   // (kept placeholders)
//   const [value, onChange] = useState(new Date());
//   const [selectedFlagType, setSelectedFlagType] = useState("All");
//   const flagTypes = ["All", "Payment Failures", "Multiple Complaints"];
//   const [selectedRisk, setSelectedRisk] = useState("All");
//   const riskLevels = ["All", "High", "Medium", "Low"];

//   // <-- no typed param
//   const handleMainSelect = (type) => {
//     setSelectedMainType(type);
//     setIsDropdownOpen(false);
//   };

//   return (
//     <div className="grid grid-cols-2 gap-6 relative">
//       {/* Cards */}
//       <DashboardCard
//         title="Total Active Farmer Users"
//         icon={<LuUserRound className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />
//       <DashboardCard
//         title="Total Active Buyer Users"
//         icon={<LuUserRound className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />

//       {/* Filter Tabs */}
//       <div className="col-span-2 flex flex-row justify-between items-center relative">
//         <div className="flex flex-row gap-5">
//           {statusOptions.map((label) => (
//             <div
//               key={label}
//               onClick={() => setSelectedStatus(label)} 
//               className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
//                 selectedStatus === label
//                   ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
//                   : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
//               }`}
//             >
//               {label}
//             </div>
//           ))}
//           <div
//             onClick={() => alert("clicked")}
//             className="flex items-center cursor-pointer rounded-xl px-5 py-2 transition-colors border-gray-300 border text-lg hover:border-primaryYellow hover:text-primaryYellow hover:font-bold"
//           >
//             <IoFilterOutline />
//           </div>
//         </div>

//         {/* Main Dropdown */}
//         <div className="relative">
//           <div
//             className="flex flex-row items-center gap-2 shadow-xl border bg-primaryYellow text-white border-gray-300 font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//           >
//             <p className="text-lg">{selectedMainType}</p>
//             <IoChevronDown
//               className={`transform transition-transform duration-200 ${
//                 isDropdownOpen ? "rotate-180" : ""
//               }`}
//             />
//           </div>

//           {isDropdownOpen && (
//             <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//               {mainTypes.map((type, index) => (
//                 <div
//                   key={index}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
//                   onClick={() => handleMainSelect(type)}
//                 >
//                   {type}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Farmer Verification visible only when "Pending" is selected */}
//       {selectedStatus === "Pending" && (
//         <>
//           <div className="col-span-2">
//             <h1 className="text-2xl font-bold text-primaryYellow">Farmer Verification</h1>
//           </div>
//           <div className="col-span-2 p-6 rounded-lg border border-gray-300 bg-white shadow-lg">
//             <FarmerRequestsTable
//               refreshTick={refreshTick}
//               onActionComplete={bumpRefresh}
//             />
//           </div>
//         </>
//       )}

//       {/* List */}
//       <div className="col-span-2">
//         <h1 className="text-2xl font-bold text-primaryYellow">List of Farmers</h1>
//       </div>
//       <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <UserFarmerTable
//           role={"admin"}
//           option={"Farmer"}         // keep backend-facing prop stable
//           type={selectedMainType}   // All | Active | Inactive | Deactivated
//           refreshTick={refreshTick}
//         />
//       </div>
//     </div>
//   );
//}




// import React, { useState } from "react";
// import UserFarmerTable from "../../../components/admin/tables/UserFarmerTable";
// import { LuUserRound } from "react-icons/lu";
// import DashboardCard from "../../../components/DashboardCard";
// import { IoChevronDown, IoFilterOutline } from "react-icons/io5";
// import FarmerRequestsTable from "../../../components/admin/tables/FarmerRequest";

// export default function UserManagement() {
//   // Tabs for Farmer / Buyer
//   const userOptions = ["Farmer", "Buyer"];
//   const [selectedUserOption, setSelectedUserOption] = useState("Farmer");

//   // Main Dropdown
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedMainType, setSelectedMainType] = useState("All");
//   const mainTypes = ["All", "Active", "Inactive", "Deactivated"];

//   const [refreshTick, setRefreshTick] = useState(0);
//   const bumpRefresh = () => setRefreshTick((t) => t + 1);

//   // Calendar
//   const [value, onChange] = useState(new Date());

//   // Type of Flag
//   const [selectedFlagType, setSelectedFlagType] = useState("All");
//   const flagTypes = ["All", "Payment Failures", "Multiple Complaints"];

//   // Risk Level
//   const [selectedRisk, setSelectedRisk] = useState("All");
//   const riskLevels = ["All", "High", "Medium", "Low"];

//   const handleMainSelect = (type) => {
//     setSelectedMainType(type);
//     setIsDropdownOpen(false);
//   };

//   return (
//     <div className="grid grid-cols-2 gap-6 relative">
//       {/* Cards */}
//       <DashboardCard
//         title="Total Active Farmer Users"
//         icon={<LuUserRound className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />
//       <DashboardCard
//         title="Total Active Buyer Users"
//         icon={<LuUserRound className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />

//       {/* Filter Tabs */}
//       {/* ORIGINAL: <div className="col-span-2 flex flex-row justify-between items-center relative"> */}
//       <div className="col-span-2 flex flex-row justify-between items-center relative">
//         <div className="flex flex-row gap-5">
//           {userOptions.map((data) => (
//             <div
//               key={data}
//               onClick={() => setSelectedUserOption(data)}
//               className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
//                 selectedUserOption === data
//                   ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
//                   : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
//               }`}
//             >
//               {data}
//             </div>
//           ))}
//           <div
//             onClick={() => alert("clicked")}
//             className="flex items-center cursor-pointer rounded-xl px-5 py-2 transition-colors border-gray-300 border text-lg hover:border-primaryYellow hover:text-primaryYellow hover:font-bold"
//           >
//             <IoFilterOutline />
//           </div>
//         </div>

//         {/* Main Dropdown */}
//         <div className="relative">
//           <div
//             className="flex flex-row items-center gap-2 shadow-xl border bg-primaryYellow text-white border-gray-300 font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//           >
//             <p className="text-lg">{selectedMainType}</p>
//             <IoChevronDown
//               className={`transform transition-transform duration-200 ${
//                 isDropdownOpen ? "rotate-180" : ""
//               }`}
//             />
//           </div>

//           {isDropdownOpen && (
//             <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//               {mainTypes.map((type, index) => (
//                 <div
//                   key={index}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
//                   onClick={() => handleMainSelect(type)}
//                 >
//                   {type}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Farmer Verification (only when Farmer tab is active) */}
//       {selectedUserOption === "Farmer" && (
//         <>
//           <div className="col-span-2">
//             <h1 className="text-2xl font-bold text-primaryYellow">
//               Farmer Verification
//             </h1>
//           </div>
//           <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
//             <FarmerRequestsTable
//               refreshTick={refreshTick}
//               onActionComplete={bumpRefresh} // 🔁 after approve/reject, refresh other tables
//             />
//           </div>
//         </>
//       )}
//       <div className="col-span-2">
//         <h1 className="text-2xl font-bold text-primaryYellow">
//           {selectedUserOption === "Farmer" ? "List of Farmers" : "List of Buyers"}
//         </h1>
//       </div>
//       <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <UserFarmerTable
//           role={"admin"}
//           option={selectedUserOption}   // "Farmer" or "Buyer" -> your existing table should branch fetch logic
//           type={selectedMainType}       // All | Active | Inactive | Deactivated
//           refreshTick={refreshTick}     // 🔁 refetch after verification actions
//         />
//       </div>
//     </div>
//   );
// }




// import React, { useState } from "react";
// import UserFarmerTable from "../../../components/admin/tables/UserFarmerTable";
// import SusActTable from "../../../components/admin/tables/SusActTable";
// import { LuUserRound } from "react-icons/lu";
// import DashboardCard from "../../../components/DashboardCard";
// import {
//   IoChevronDown,
//   IoFilterOutline,
// } from "react-icons/io5";
// import { BsGrid } from "react-icons/bs";
// import { PiSealWarningBold } from "react-icons/pi";
// import { DatePicker } from "@mui/x-date-pickers";
// import FarmerRequestsTable from "../../../components/admin/tables/FarmerRequest";

// export default function UserManagement() {
//   // Tabs for Farmer / Buyer
//   const userOptions = ["Farmer", "Buyer"];
//   const [selectedUserOption, setSelectedUserOption] = useState("Farmer");

//   // Main Dropdown
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedMainType, setSelectedMainType] = useState("All");
//   const mainTypes = ["All", "Active", "Inactive", "Deactivated"];

//   const [refreshTick, setRefreshTick] = useState(0);
//   const bumpRefresh = () => setRefreshTick(t => t + 1);

//   // Calendar
//   const [value, onChange] = useState(new Date());

//   // Type of Flag
//   const [selectedFlagType, setSelectedFlagType] = useState("All");
//   const flagTypes = ["All", "Payment Failures", "Multiple Complaints"];

//   // Risk Level
//   const [selectedRisk, setSelectedRisk] = useState("All");
//   const riskLevels = ["All", "High", "Medium", "Low"];

//   const handleMainSelect = (type) => {
//     setSelectedMainType(type);
//     setIsDropdownOpen(false);
//   };

//   return (
//     <div className="grid grid-cols-2 gap-6 relative">
//       {/* Cards */}
//       <DashboardCard
//         title="Total Active Farmer Users"
//         icon={<LuUserRound className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />
//       <DashboardCard
//         title="Total Active Buyer Users"
//         icon={<LuUserRound className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />

//       {/* Filter Tabs */}
//       <div className="col-span-2 flex flex-row justify-between items-center relative">
//         <div className="flex flex-row gap-5">
//           {userOptions.map((data) => (
//             <div
//               onClick={() => setSelectedUserOption(data)}
//               className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
//                 selectedUserOption === data
//                   ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
//                   : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
//               }`}
//               key={data}
//             >
//               {data}
//             </div>
//           ))}
//           <div
//             onClick={() => alert("clicked")}
//             className="flex items-center cursor-pointer rounded-xl px-5 py-2 transition-colors border-gray-300 border text-lg hover:border-primaryYellow hover:text-primaryYellow hover:font-bold"
//           >
//             <IoFilterOutline />
//           </div>
//         </div>

//         {/* Main Dropdown */}
//         <div className="relative">
//           <div
//             className="flex flex-row items-center gap-2 shadow-xl border bg-primaryYellow text-white border-gray-300 font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//           >
//             <p className="text-lg">{selectedMainType}</p>
//             <IoChevronDown
//               className={`transform transition-transform duration-200 ${
//                 isDropdownOpen ? "rotate-180" : ""
//               }`}
//             />
//           </div>

//           {isDropdownOpen && (
//             <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//               {mainTypes.map((type, index) => (
//                 <div
//                   key={index}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
//                   onClick={() => handleMainSelect(type)}
//                 >
//                   {type}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Farmer Requests (only when Farmer tab is active) */}
//       {selectedUserOption === "Farmer" && (
//         <>
//           <div className="col-span-3">
//             <h1 className="text-2xl font-bold text-primaryYellow">Farmer Verification</h1>
//           </div>
//           <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
//             <FarmerRequestsTable
//               // NEW:
//               refreshTick={refreshTick}
//               onActionComplete={bumpRefresh}  // 🔁 after approve/reject, refresh other tables
//             />
//           </div>
//         </>
//       )}

//       {/* User Table */}
//         <div className="col-span-3">
//             <h1 className="text-2xl font-bold text-primaryYellow">List of Farmers</h1>
//         </div>
//       <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <UserFarmerTable
//           role={"admin"}
//           option={selectedUserOption}
//           type={selectedMainType}
//           // NEW:
//           refreshTick={refreshTick}          // 🔁 refetch when FarmerRequests changes
//         />
//       </div>

      
//     </div>
//   );
// }
