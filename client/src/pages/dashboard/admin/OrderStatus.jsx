// pages/admin/OrderStatus.jsx
import React, { useEffect, useState, useMemo } from "react";
import { IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

import OrderTable from "../../../components/admin/tables/OrderTable";
import EggSupplyTable from "../../../components/admin/tables/EggSupplyTable";
import EggAllocationHistory from "../../../components/admin/tables/OrderAllocation";
import EggAllocation from "../../../components/admin/tables/EggAllocation";
import SelectedOrderCard from "../../../components/admin/tables/SelectedOrderCard";
import TruckingTable from "@/components/admin/tables/TruckingTable";
import AddDriverModal from "@/components/admin/modals/AddTruckingDriverModals";

import { getOrderStatusCounts, adminMarkOrderToShip } from "@/services/OrderNAllocation";
import { fetchDriverList } from "@/services/TruckingNAllocation";

const modalBaseStyle = {
  content: {
    top: "50%", left: "50%", right: "auto", bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20, padding: 20, maxHeight: "100vh", overflow: "visible",
  },
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
};

const STATUS_TABS = ["Confirmed", "To Ship", "Shipped", "Delivered", "Cancelled", "Refunded"];
const STATUS_LABEL_TO_DB = {
  Confirmed: "Confirmed",
  "To Ship": "To Ship",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  Refunded: "Refunded",
};
const mapStatusForDB = (label) => STATUS_LABEL_TO_DB[label] ?? null;

export default function OrderStatus() {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("Confirmed");
  const [selectedIds, setSelectedIds] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const bumpReload = () => setReloadKey((k) => k + 1);

  // counts
  const [statusCounts, setStatusCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [countsErr, setCountsErr] = useState(null);

  const reloadCounts = async () => {
    setLoadingCounts(true);
    try {
      const counts = await getOrderStatusCounts({});
      setStatusCounts(counts || {});
    } catch (e) {
      setCountsErr(e?.message || "Failed to load order counts.");
    } finally {
      setLoadingCounts(false);
    }
  };
  useEffect(() => { reloadCounts(); }, []);

  const selectionMode = useMemo(() => {
    if (selectedTab === "Confirmed") return "multi";
    if (selectedTab === "To Ship") return "single";
    if (selectedTab === "Shipped") return "multi"; 
    return "none";
  }, [selectedTab]);

  // action: mark as to ship (batch)
  const [marking, setMarking] = useState(false);
  const onMarkToShip = async () => {
    if (selectionMode !== "multi" || !selectedIds.length) return;
    setMarking(true);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => adminMarkOrderToShip(id, { actorId: null }))
      );
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length) {
        console.error(failed);
        alert(`Some orders failed to update (${failed.length}). Others succeeded.`);
      } else {
        alert("Selected orders marked as To Ship.");
      }
      await reloadCounts();
      bumpReload();
      setSelectedIds([]);
      setSelectedTab("To Ship");
    } finally {
      setMarking(false);
    }
  };

    // 🔹 DRIVERS STATE (for Shipped tab)
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driversErr, setDriversErr] = useState(null);

  useEffect(() => {
    if (selectedTab !== "Shipped") return;

    let alive = true;

    async function loadDrivers() {
      setLoadingDrivers(true);
      setDriversErr(null);

      try {
        const data = await fetchDriverList({});
        if (alive) setDrivers(data || []);
      } catch (err) {
        if (alive) setDriversErr(err.message || "Failed to load drivers.");
      } finally {
        if (alive) setLoadingDrivers(false);
      }
    }

    loadDrivers();
    return () => {
      alive = false;
    };
  }, [selectedTab, reloadKey]);

  // demo modals
  const [updateModal, setIsUpdateModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatusType, setSelectedStatusType] = useState("On delivery");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [openAddDriver, setOpenAddDriver] = useState(false);

  const handleSelect = (type) => { setSelectedStatusType(type); setIsDropdownOpen(false); };
  function handleUpdateModal() { setIsUpdateModal(!updateModal); }
  function handleUpdateStatus() { setIsUpdateModal(false); setConfirmationModal(true); }
  const handleConfirmationModal = () => { setConfirmationModal(false); navigate("/admin/products/egg-pickup"); };

  const isMarkDisabled = !(selectionMode === "multi" && selectedIds.length > 0);

  // Supply selection
  const [supplySelection, setSupplySelection] = useState([]);

  // Modal control
  const [openAlloc, setOpenAlloc] = useState(false);
  const canOpenAlloc =
    selectedTab === "To Ship" &&
    selectedIds.length === 1 &&
    supplySelection.length > 0;

  const selectedOrderId = selectedTab === "To Ship" && selectedIds.length === 1 ? selectedIds[0] : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {STATUS_TABS.map((label) => {
            const count = statusCounts[label] || 0;
            const active = selectedTab === label;
            return (
              <div
                key={label}
                onClick={() => { setSelectedTab(label); setSelectedIds([]); }}
                className={`relative cursor-pointer rounded-xl pl-4 pr-8 py-2 text-sm sm:text-base transition-colors ${
                  active
                    ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
                    : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
                }`}
              >
                {label}
                <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {loadingCounts ? "…" : count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 sm:gap-5 items-center">
          {selectedTab === "Confirmed" && (
            <button
              onClick={onMarkToShip}
              disabled={isMarkDisabled || marking}
              className={`font-medium rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base ${
                isMarkDisabled || marking
                  ? "bg-yellow-200 text-white cursor-not-allowed"
                  : "bg-primaryYellow text-white hover:opacity-90"
              }`}
              title={isMarkDisabled ? "Select one or more Confirmed orders" : "Mark selected orders as To Ship"}
            >
              {marking ? "Marking…" : "Mark as to ship"}
            </button>
          )}
        </div>
      </div>

      {countsErr && <div className="text-sm text-red-600">{countsErr}</div>}

      {/* Orders table */}
      <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
        <OrderTable
          key={reloadKey}
          status={mapStatusForDB(selectedTab)}
          selectedOption={mapStatusForDB(selectedTab)}
          mode={selectionMode}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>

      {/* Show drivers table only when status is "Shipped" */}
      {selectedTab === "Shipped" && (
        <>
          {driversErr && (
            <div className="text-sm text-red-600 mb-2">
              {driversErr}
            </div>
          )}

          <TruckingTable
            rows={drivers}
            onAddDriver={() => setOpenAddDriver(true)}
            onSelectionChange={(ids) => {
              console.log("Selected driver IDs:", ids);
            }}
          />

          {loadingDrivers && (
            <div className="text-sm text-gray-500 mt-2">
              Loading drivers…
            </div>
          )}
        </>
      )}


      {/* Selected order card (only in To Ship tab) */}
      {selectedOrderId && <SelectedOrderCard orderId={selectedOrderId} />}

      {/* Egg Supply table */}
      {selectedTab === "To Ship" && (
        <>
        <EggSupplyTable 
          onSelectedRowsChange={setSupplySelection}
          autoFilterOrderId={selectedOrderId}
        />

        {/* Allocate button */}
        <div className="flex justify-end">
          <button
            className={`rounded-lg px-5 py-2 text-white font-semibold transition-all ${
              canOpenAlloc ? "bg-primaryYellow hover:opacity-90 hover:shadow-lg" : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!canOpenAlloc}
            onClick={() => setOpenAlloc(true)}
          >
            {selectedTab !== "To Ship" 
              ? "Select a 'To Ship' order first"
              : selectedIds.length !== 1
              ? "Select exactly one order"
              : supplySelection.length === 0
              ? "Select egg supply to allocate"
              : `Allocate ${supplySelection.length} source${supplySelection.length > 1 ? 's' : ''}`
            }
          </button>
        </div>
        </>
      )}


      {/* Allocation modal */}
      {openAlloc && (
        <EggAllocation
          open={openAlloc}
          order={{ orderID: selectedIds[0] }}
          selectedSupplyRowIds={supplySelection}
          onClose={() => setOpenAlloc(false)}
          onAllocated={() => {
            setOpenAlloc(false);
            setSupplySelection([]);
            reloadCounts();
            bumpReload();
          }}
        />
      )}



      {/* Allocation history */}
      <EggAllocationHistory orderId={selectedIds[0] || null} reloadKey={reloadKey} />

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={openAddDriver}
        onClose={() => setOpenAddDriver(false)}
        onSubmit={(formData) => {
          console.log("NEW DRIVER:", formData);

          // Append to mock or later to API
          mockDrivers.push({
            tracking_profile_id: Date.now(),
            ...formData,
            schedule: null,
            nextSchedule: null,
          });

          setOpenAddDriver(false);
        }}
      />


      {/* Demo modals */}
      <Modal
        isOpen={updateModal}
        onRequestClose={handleUpdateModal}
        contentLabel="Update Order Status"
        style={{ ...modalBaseStyle, content: { ...modalBaseStyle.content, width: "90%", maxWidth: "500px" } }}
      >
        <div className="flex flex-col gap-5 px-3 py-6">
          <h1 className="text-primaryYellow text-fluid-xl text-center font-bold">Update Order Status</h1>
          <div className="flex flex-col">
            <h1 className="text-gray-400 text-sm sm:text-base">Current status:</h1>
            <p className="text-primaryYellow text-base sm:text-lg font-semibold">Pending</p>
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-400 text-sm sm:text-base">Update status:</h1>
            <div className="relative">
              <div
                className="flex items-center justify-between gap-2 shadow-xl border border-gray-300 text-primaryYellow font-medium rounded-lg px-4 py-2 cursor-pointer hover:opacity-90"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <p className="text-sm sm:text-base">{selectedStatusType}</p>
                <IoChevronDown className={`transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </div>
              {isDropdownOpen && (
                <div className="absolute mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {["On delivery", "Delivered", "Packing"].map((type, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm sm:text-base"
                      onClick={() => setSelectedStatusType(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={handleUpdateModal} className="bg-gray-400 rounded-lg px-4 sm:px-6 py-2 text-white text-sm sm:text-base font-semibold">
              Cancel
            </button>
            <button onClick={handleUpdateStatus} className="bg-primaryYellow rounded-lg px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base hover:bg-yellow-500 transition">
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmationModal}
        onRequestClose={handleConfirmationModal}
        contentLabel="Confirm Status"
        style={{ ...modalBaseStyle, content: { ...modalBaseStyle.content, width: "90%", maxWidth: "400px" } }}
      >
        <div className="flex flex-col justify-center items-center p-6 text-center">
          <h1 className="text-primaryYellow font-bold text-fluid-2xl">Pickup Complete!</h1>
          <p className="text-gray-400 mb-6 sm:mb-10 text-base sm:text-xl">Farmer Name here</p>
          <div onClick={handleConfirmationModal} className="w-full bg-primaryYellow shadow-md rounded-lg text-white px-4 py-3 font-bold cursor-pointer hover:bg-yellow-500 transition">
            Update Egg Count
          </div>
        </div>
      </Modal>
    </div>
  );
}

// // pages/admin/OrderStatus.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import { IoChevronDown } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import Modal from "react-modal";

// import OrderTable from "../../../components/admin/tables/OrderTable";
// import EggSupplyTable from "../../../components/admin/tables/EggSupplyTable";
// import EggAllocationHistory from "../../../components/admin/tables/OrderAllocation";
// import EggAllocation from "../../../components/admin/tables/EggAllocation";

// import { getOrderStatusCounts, adminMarkOrderToShip } from "@/services/OrderNAllocation";

// const modalBaseStyle = {
//   content: {
//     top: "50%", left: "50%", right: "auto", bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 20, maxHeight: "100vh", overflow: "visible",
//   },
//   overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
// };

// const STATUS_TABS = ["Confirmed", "To Ship", "Shipped", "Delivered", "Cancelled", "Refunded"];
// const STATUS_LABEL_TO_DB = {
//   Confirmed: "Confirmed",
//   "To Ship": "To Ship",
//   Shipped: "Shipped",
//   Delivered: "Delivered",
//   Cancelled: "Cancelled",
//   Refunded: "Refunded",
// };
// const mapStatusForDB = (label) => STATUS_LABEL_TO_DB[label] ?? null;

// export default function OrderStatus() {
//   const navigate = useNavigate();

//   const [selectedTab, setSelectedTab] = useState("Confirmed");

//   // ORDER selection (ids)
//   const [selectedIds, setSelectedIds] = useState([]); // array of order IDs

//   // force table to refetch after actions
//   const [reloadKey, setReloadKey] = useState(0);
//   const bumpReload = () => setReloadKey((k) => k + 1);

//   // counts
//   const [statusCounts, setStatusCounts] = useState({});
//   const [loadingCounts, setLoadingCounts] = useState(false);
//   const [countsErr, setCountsErr] = useState(null);

//   const reloadCounts = async () => {
//     setLoadingCounts(true);
//     try {
//       const counts = await getOrderStatusCounts({});
//       setStatusCounts(counts || {});
//     } catch (e) {
//       setCountsErr(e?.message || "Failed to load order counts.");
//     } finally {
//       setLoadingCounts(false);
//     }
//   };
//   useEffect(() => { reloadCounts(); }, []);

//   // choose selection mode per tab
//   const selectionMode = useMemo(() => {
//     if (selectedTab === "Confirmed") return "multi";
//     if (selectedTab === "To Ship") return "single";
//     return "none";
//   }, [selectedTab]);

//   // action: mark as to ship (batch) – only for Confirmed
//   const [marking, setMarking] = useState(false);
//   const onMarkToShip = async () => {
//     if (selectionMode !== "multi" || !selectedIds.length) return;
//     setMarking(true);
//     try {
//       const results = await Promise.allSettled(
//         selectedIds.map((id) => adminMarkOrderToShip(id, { actorId: null }))
//       );
//       const failed = results.filter((r) => r.status === "rejected");
//       if (failed.length) {
//         console.error(failed);
//         alert(`Some orders failed to update (${failed.length}). Others succeeded.`);
//       } else {
//         alert("Selected orders marked as To Ship.");
//       }
//       await reloadCounts();
//       bumpReload();
//       setSelectedIds([]);
//       setSelectedTab("To Ship");
//     } finally {
//       setMarking(false);
//     }
//   };

//   // demo modals (unchanged)
//   const [updateModal, setIsUpdateModal] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedStatusType, setSelectedStatusType] = useState("On delivery");
//   const [confirmationModal, setConfirmationModal] = useState(false);
//   const handleSelect = (type) => { setSelectedStatusType(type); setIsDropdownOpen(false); };
//   function handleUpdateModal() { setIsUpdateModal(!updateModal); }
//   function handleUpdateStatus() { setIsUpdateModal(false); setConfirmationModal(true); }
//   const handleConfirmationModal = () => { setConfirmationModal(false); navigate("/admin/products/egg-pickup"); };

//   const isMarkDisabled = !(selectionMode === "multi" && selectedIds.length > 0);

//   /* ---------------- Allocation wiring (no OrderTable UI change) ---------------- */

//   // Supply selection (from EggSupplyTable)
//   const [supplySelection, setSupplySelection] = useState([]); // selected row keys on current page

//   // Modal control
//   const [openAlloc, setOpenAlloc] = useState(false);
//   const canOpenAlloc =
//     selectedTab === "To Ship" &&
//     selectedIds.length === 1 &&
//     supplySelection.length > 0;

//   return (
//     <div className="flex flex-col gap-5">
//       {/* Tabs / Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//         <div className="flex flex-wrap items-center gap-3">
//           {STATUS_TABS.map((label) => {
//             const count = statusCounts[label] || 0;
//             const active = selectedTab === label;
//             return (
//               <div
//                 key={label}
//                 onClick={() => { setSelectedTab(label); setSelectedIds([]); }}
//                 className={`relative cursor-pointer rounded-xl pl-4 pr-8 py-2 text-sm sm:text-base transition-colors ${
//                   active
//                     ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
//                     : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
//                 }`}
//               >
//                 {label}
//                 <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
//                   {loadingCounts ? "…" : count}
//                 </span>
//               </div>
//             );
//           })}
//         </div>

//         {/* Actions */}
//         <div className="flex gap-3 sm:gap-5 items-center">
//           {selectedTab === "Confirmed" && (
//             <button
//               onClick={onMarkToShip}
//               disabled={isMarkDisabled || marking}
//               className={`font-medium rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base ${
//                 isMarkDisabled || marking
//                   ? "bg-yellow-200 text-white cursor-not-allowed"
//                   : "bg-primaryYellow text-white hover:opacity-90"
//               }`}
//               title={isMarkDisabled ? "Select one or more Confirmed orders" : "Mark selected orders as To Ship"}
//             >
//               {marking ? "Marking…" : "Mark as to ship"}
//             </button>
//           )}
//         </div>
//       </div>

//       {countsErr && <div className="text-sm text-red-600">{countsErr}</div>}

//       {/* Orders table */}
//       <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
//         <OrderTable
//           key={reloadKey}
//           status={mapStatusForDB(selectedTab)}
//           selectedOption={mapStatusForDB(selectedTab)}
//           mode={selectionMode}
//           selectedIds={selectedIds}
//           onSelectionChange={setSelectedIds}
//         />
//       </div>

//       {/* Egg Supply table — reports checked row IDs up */}
//       <EggSupplyTable onSelectedRowsChange={setSupplySelection} />

//       {/* Centralized Allocate button */}
//       <div className="flex justify-end">
//         <button
//           className={`rounded-lg px-5 py-2 text-white font-semibold ${
//             canOpenAlloc ? "bg-primaryYellow hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
//           }`}
//           disabled={!canOpenAlloc}
//           onClick={() => setOpenAlloc(true)}
//           title={
//             selectedTab !== "To Ship" ? "Select a single 'To Ship' order" :
//             selectedIds.length !== 1 ? "Select exactly one order" :
//             supplySelection.length === 0 ? "Tick at least one egg supply row" : "Allocate"
//           }
//         >
//           Allocate Order
//         </button>
//       </div>

//       {/* Allocation modal */}
//       {openAlloc && (
//         <EggAllocation
//           open={openAlloc}
//           order={{ orderID: selectedIds[0] }}
//           selectedSupplyRowIds={supplySelection}
//           onClose={() => setOpenAlloc(false)}
//           onAllocated={() => {
//             setOpenAlloc(false);
//             reloadCounts();
//             bumpReload();
//           }}
//         />
//       )}

//       {/* Allocation history (grouped by order+farmer+produced) */}
//       <EggAllocationHistory orderId={selectedIds[0] || null} reloadKey={reloadKey} />

//       {/* Your existing demo modals (unchanged) */}
//       <Modal
//         isOpen={updateModal}
//         onRequestClose={handleUpdateModal}
//         contentLabel="Update Order Status"
//         style={{ ...modalBaseStyle, content: { ...modalBaseStyle.content, width: "90%", maxWidth: "500px" } }}
//       >
//         <div className="flex flex-col gap-5 px-3 py-6">
//           <h1 className="text-primaryYellow text-fluid-xl text-center font-bold">Update Order Status</h1>
//           <div className="flex flex-col">
//             <h1 className="text-gray-400 text-sm sm:text-base">Current status:</h1>
//             <p className="text-primaryYellow text-base sm:text-lg font-semibold">Pending</p>
//           </div>
//           <div className="flex flex-col">
//             <h1 className="text-gray-400 text-sm sm:text-base">Update status:</h1>
//             <div className="relative">
//               <div
//                 className="flex items-center justify-between gap-2 shadow-xl border border-gray-300 text-primaryYellow font-medium rounded-lg px-4 py-2 cursor-pointer hover:opacity-90"
//                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               >
//                 <p className="text-sm sm:text-base">{selectedStatusType}</p>
//                 <IoChevronDown className={`transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
//               </div>
//               {isDropdownOpen && (
//                 <div className="absolute mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//                   {["On delivery", "Delivered", "Packing"].map((type, i) => (
//                     <div
//                       key={i}
//                       className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm sm:text-base"
//                       onClick={() => setSelectedStatusType(type)}
//                     >
//                       {type}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="flex gap-2 justify-center">
//             <button onClick={handleUpdateModal} className="bg-gray-400 rounded-lg px-4 sm:px-6 py-2 text-white text-sm sm:text-base font-semibold">
//               Cancel
//             </button>
//             <button onClick={handleUpdateStatus} className="bg-primaryYellow rounded-lg px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base hover:bg-yellow-500 transition">
//               Confirm
//             </button>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         isOpen={confirmationModal}
//         onRequestClose={handleConfirmationModal}
//         contentLabel="Confirm Status"
//         style={{ ...modalBaseStyle, content: { ...modalBaseStyle.content, width: "90%", maxWidth: "400px" } }}
//       >
//         <div className="flex flex-col justify-center items-center p-6 text-center">
//           <h1 className="text-primaryYellow font-bold text-fluid-2xl">Pickup Complete!</h1>
//           <p className="text-gray-400 mb-6 sm:mb-10 text-base sm:text-xl">Farmer Name here</p>
//           <div onClick={handleConfirmationModal} className="w-full bg-primaryYellow shadow-md rounded-lg text-white px-4 py-3 font-bold cursor-pointer hover:bg-yellow-500 transition">
//             Update Egg Count
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

// // pages/admin/OrderStatus.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import { IoChevronDown } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import Modal from "react-modal";

// import OrderTable from "../../../components/admin/tables/OrderTable";
// import EggSupplyTable from "../../../components/admin/tables/EggSupplyTable";
// import EggAllocationHistory from "../../../components/admin/tables/OrderAllocation";
// import EggAllocation from "../../../components/admin/tables/EggAllocation";

// import { getOrderStatusCounts, adminMarkOrderToShip } from "@/services/OrderNAllocation";
// // import { fetchSizeMetaMap, fetchSizes } from "@/services/EggInventory";

// const modalBaseStyle = {
//   content: {
//     top: "50%", left: "50%", right: "auto", bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 20, maxHeight: "100vh", overflow: "visible",
//   },
//   overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
// };

// const STATUS_TABS = ["Confirmed", "To Ship", "Shipped", "Delivered", "Cancelled", "Refunded"];
// const STATUS_LABEL_TO_DB = {
//   Confirmed: "Confirmed",
//   "To Ship": "To Ship",
//   Shipped: "Shipped",
//   Delivered: "Delivered",
//   Cancelled: "Cancelled",
//   Refunded: "Refunded",
// };
// const mapStatusForDB = (label) => STATUS_LABEL_TO_DB[label] ?? null;

// export default function OrderStatus() {
//   const navigate = useNavigate();

//   const [selectedTab, setSelectedTab] = useState("Confirmed");

//   // ORDER selection (ids)
//   const [selectedIds, setSelectedIds] = useState([]); // array of order IDs

//   // force table to refetch after actions
//   const [reloadKey, setReloadKey] = useState(0);
//   const bumpReload = () => setReloadKey((k) => k + 1);

//   // counts
//   const [statusCounts, setStatusCounts] = useState({});
//   const [loadingCounts, setLoadingCounts] = useState(false);
//   const [countsErr, setCountsErr] = useState(null);

//   const reloadCounts = async () => {
//     setLoadingCounts(true);
//     try {
//       const counts = await getOrderStatusCounts({});
//       setStatusCounts(counts || {});
//     } catch (e) {
//       setCountsErr(e?.message || "Failed to load order counts.");
//     } finally {
//       setLoadingCounts(false);
//     }
//   };
//   useEffect(() => { reloadCounts(); }, []);

//   // choose selection mode per tab
//   const selectionMode = useMemo(() => {
//     if (selectedTab === "Confirmed") return "multi";
//     if (selectedTab === "To Ship") return "single";
//     return "none";
//   }, [selectedTab]);

//   // action: mark as to ship (batch) – only for Confirmed
//   const [marking, setMarking] = useState(false);
//   const onMarkToShip = async () => {
//     if (selectionMode !== "multi" || !selectedIds.length) return;
//     setMarking(true);
//     try {
//       const results = await Promise.allSettled(
//         selectedIds.map((id) => adminMarkOrderToShip(id, { actorId: null }))
//       );
//       const failed = results.filter((r) => r.status === "rejected");
//       if (failed.length) {
//         console.error(failed);
//         alert(`Some orders failed to update (${failed.length}). Others succeeded.`);
//       } else {
//         alert("Selected orders marked as To Ship.");
//       }
//       await reloadCounts();
//       bumpReload();
//       setSelectedIds([]);
//       setSelectedTab("To Ship");
//     } finally {
//       setMarking(false);
//     }
//   };

//   // demo modals (unchanged)
//   const [updateModal, setIsUpdateModal] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedStatusType, setSelectedStatusType] = useState("On delivery");
//   const [confirmationModal, setConfirmationModal] = useState(false);
//   const handleSelect = (type) => { setSelectedStatusType(type); setIsDropdownOpen(false); };
//   function handleUpdateModal() { setIsUpdateModal(!updateModal); }
//   function handleUpdateStatus() { setIsUpdateModal(false); setConfirmationModal(true); }
//   const handleConfirmationModal = () => { setConfirmationModal(false); navigate("/admin/products/egg-pickup"); };

//   const isMarkDisabled = !(selectionMode === "multi" && selectedIds.length > 0);

//   /* ---------------- Allocation wiring (no OrderTable UI change) ---------------- */

//   // Parent size selector
//   // const [sizeOptions, setSizeOptions] = useState(["XS","S","M","L","XL","J"]);
//   // const [sizeFilter, setSizeFilter] = useState(""); // pick a real key that exists
//   // const [sizeOptions, setSizeOptions] = useState([]);   // load from DB
//   // const [sizeFilter, setSizeFilter] = useState("");     // none until loaded
//   // const [sizeMeta, setSizeMeta] = useState({});


//   // useEffect(() => {
//   //   let alive = true;
//   //   (async () => {
//   //     try {
//   //       const sizes = await fetchSizes();
//   //       const meta  = await fetchSizeMetaMap();
//   //       if (!alive) return;
//   //   //     setSizeOptions(sizes || ["SMALL","MEDIUM","LARGE","EXTRA-LARGE","JUMBO"]);
//   //   //     // ensure the current filter is valid with the freshly loaded options
//   //   //  if (!sizes?.includes(sizeFilter)) {
//   //   //    setSizeFilter(sizes?.[0] || "S");
//   //   //  }
//   //   //     setSizeMeta(meta || {});
//   //   setSizeOptions(sizes || []);
//   //     setSizeMeta(meta || {});
//   //   // choose an initial size if we don't have one yet
//   //    setSizeFilter((prev) =>
//   //      prev && sizes?.includes(prev) ? prev : (sizes?.[0] ?? "")
//   //    );
//   //     } catch {}
//   //   })();
//   //   return () => { alive = false; };
//   // }, []);

//   // Supply selection (from EggSupplyTable)
//   const [supplySelection, setSupplySelection] = useState([]); // selected row keys on current page

//   // Modal control
//   const [openAlloc, setOpenAlloc] = useState(false);
//   // const canOpenAlloc =
//   //   selectedTab === "To Ship" &&
//   //   selectedIds.length === 1 &&
//   //   sizeFilter &&
//   //   sizeFilter.toUpperCase() !== "ALL" &&
//   //   supplySelection.length > 0;
//    const canOpenAlloc =
//    selectedTab === "To Ship" &&
//    selectedIds.length === 1 &&
//    supplySelection.length > 0;

//   return (
//     <div className="flex flex-col gap-5">
//       {/* Tabs / Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//         <div className="flex flex-wrap items-center gap-3">
//           {STATUS_TABS.map((label) => {
//             const count = statusCounts[label] || 0;
//             const active = selectedTab === label;
//             return (
//               <div
//                 key={label}
//                 onClick={() => { setSelectedTab(label); setSelectedIds([]); }}
//                 className={`relative cursor-pointer rounded-xl pl-4 pr-8 py-2 text-sm sm:text-base transition-colors ${
//                   active
//                     ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
//                     : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
//                 }`}
//               >
//                 {label}
//                 <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
//                   {loadingCounts ? "…" : count}
//                 </span>
//               </div>
//             );
//           })}
//         </div>

//         {/* Actions (kept) */}
//         <div className="flex gap-3 sm:gap-5 items-center">
//           {selectedTab === "Confirmed" && (
//             <button
//               onClick={onMarkToShip}
//               disabled={isMarkDisabled || marking}
//               className={`font-medium rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base ${
//                 isMarkDisabled || marking
//                   ? "bg-yellow-200 text-white cursor-not-allowed"
//                   : "bg-primaryYellow text-white hover:opacity-90"
//               }`}
//               title={isMarkDisabled ? "Select one or more Confirmed orders" : "Mark selected orders as To Ship"}
//             >
//               {marking ? "Marking…" : "Mark as to ship"}
//             </button>
//           )}

//           {/* Parent size dropdown for allocation */}
//           {/* <div className="flex items-center gap-2">
//             <label className="text-sm text-gray-600">Size:</label>
//             <select
//               value={sizeFilter}
//               onChange={(e) => setSizeFilter(e.target.value)}
//               className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
//             >
//               {sizeOptions.map((s) => (
//                 <option key={s} value={s}>{s}</option>
//               ))}
//             </select>
//           </div> */}
//         </div>
//       </div>

//       {countsErr && <div className="text-sm text-red-600">{countsErr}</div>}

//       {/* Orders table (unchanged) */}
//       <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
//         <OrderTable
//           key={reloadKey}
//           status={mapStatusForDB(selectedTab)}
//           selectedOption={mapStatusForDB(selectedTab)}
//           mode={selectionMode}
//           selectedIds={selectedIds}
//           onSelectionChange={setSelectedIds}
//         />
//       </div>

//       {/* Egg Supply table — reports checked row IDs up */}
//       <EggSupplyTable onSelectedRowsChange={setSupplySelection} />

//       {/* Centralized Allocate button */}
//       <div className="flex justify-end">
//         <button
//           className={`rounded-lg px-5 py-2 text-white font-semibold ${
//             canOpenAlloc ? "bg-primaryYellow hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
//           }`}
//           disabled={!canOpenAlloc}
//           onClick={() => setOpenAlloc(true)}
//           title={
//             selectedTab !== "To Ship" ? "Select a single 'To Ship' order" :
//             selectedIds.length !== 1 ? "Select exactly one order" :
//             // supplySelection.length === 0 ? "Tick at least one egg supply row" :
//             // sizeFilter === "ALL" ? "Pick a specific size" : "Allocate"
//             supplySelection.length === 0 ? "Tick at least one egg supply row" : "Allocate"
//           }
//         >
//           Allocate Order
//         </button>
//       </div>

//       {/* Allocation modal (loads only when opened) */}
//       {openAlloc && (
//         <EggAllocation
//           open={openAlloc}
//           order={{ orderID: selectedIds[0] }}
//           // sizeLabel={sizeFilter}
//           // sizeMeta={sizeMeta}
//           selectedSupplyRowIds={supplySelection}
//           onClose={() => setOpenAlloc(false)}
//           onAllocated={() => {
//             setOpenAlloc(false);
//             reloadCounts();
//             bumpReload();
//           }}
//         />
//       )}

//       {/* Allocation history (placeholder) */}
//       <EggAllocationHistory rows={[]} />

//       {/* Your existing demo modals (unchanged) */}
//       <Modal
//         isOpen={updateModal}
//         onRequestClose={handleUpdateModal}
//         contentLabel="Update Order Status"
//         style={{ ...modalBaseStyle, content: { ...modalBaseStyle.content, width: "90%", maxWidth: "500px" } }}
//       >
//         <div className="flex flex-col gap-5 px-3 py-6">
//           <h1 className="text-primaryYellow text-fluid-xl text-center font-bold">Update Order Status</h1>
//           <div className="flex flex-col">
//             <h1 className="text-gray-400 text-sm sm:text-base">Current status:</h1>
//             <p className="text-primaryYellow text-base sm:text-lg font-semibold">Pending</p>
//           </div>
//           <div className="flex flex-col">
//             <h1 className="text-gray-400 text-sm sm:text-base">Update status:</h1>
//             <div className="relative">
//               <div
//                 className="flex items-center justify-between gap-2 shadow-xl border border-gray-300 text-primaryYellow font-medium rounded-lg px-4 py-2 cursor-pointer hover:opacity-90"
//                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               >
//                 <p className="text-sm sm:text-base">{selectedStatusType}</p>
//                 <IoChevronDown className={`transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
//               </div>
//               {isDropdownOpen && (
//                 <div className="absolute mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//                   {["On delivery", "Delivered", "Packing"].map((type, i) => (
//                     <div
//                       key={i}
//                       className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm sm:text-base"
//                       onClick={() => setSelectedStatusType(type)}
//                     >
//                       {type}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="flex gap-2 justify-center">
//             <button onClick={handleUpdateModal} className="bg-gray-400 rounded-lg px-4 sm:px-6 py-2 text-white text-sm sm:text-base font-semibold">
//               Cancel
//             </button>
//             <button onClick={handleUpdateStatus} className="bg-primaryYellow rounded-lg px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base hover:bg-yellow-500 transition">
//               Confirm
//             </button>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         isOpen={confirmationModal}
//         onRequestClose={handleConfirmationModal}
//         contentLabel="Confirm Status"
//         style={{ ...modalBaseStyle, content: { ...modalBaseStyle.content, width: "90%", maxWidth: "400px" } }}
//       >
//         <div className="flex flex-col justify-center items-center p-6 text-center">
//           <h1 className="text-primaryYellow font-bold text-fluid-2xl">Pickup Complete!</h1>
//           <p className="text-gray-400 mb-6 sm:mb-10 text-base sm:text-xl">Farmer Name here</p>
//           <div onClick={handleConfirmationModal} className="w-full bg-primaryYellow shadow-md rounded-lg text-white px-4 py-3 font-bold cursor-pointer hover:bg-yellow-500 transition">
//             Update Egg Count
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

// // pages/admin/OrderStatus.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import { IoChevronDown } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import Modal from "react-modal";

// import OrderTable from "../../../components/admin/tables/OrderTable";
// import EggSupplyTable from "../../../components/admin/tables/EggSupplyTable";
// import EggAllocationHistory from "../../../components/admin/tables/OrderAllocation";
// import EggAllocation from "../../../components/admin/tables/EggAllocation"


// import { getOrderStatusCounts, adminMarkOrderToShip } from "@/services/OrderNAllocation";
// import { fetchSizeMetaMap, fetchSizes } from "@/services/EggInventory";

// const modalBaseStyle = {
//   content: {
//     top: "50%", left: "50%", right: "auto", bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20, padding: 20, maxHeight: "100vh", overflow: "visible",
//   },
//   overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
// };

// const STATUS_TABS = ["Confirmed", "To Ship", "Shipped", "Delivered", "Cancelled", "Refunded"];
// const STATUS_LABEL_TO_DB = {
//   Confirmed: "Confirmed",
//   "To Ship": "To Ship",
//   Shipped: "Shipped",
//   Delivered: "Delivered",
//   Cancelled: "Cancelled",
//   Refunded: "Refunded",
// };
// const mapStatusForDB = (label) => STATUS_LABEL_TO_DB[label] ?? null;

// export default function OrderStatus() {
//   const navigate = useNavigate();

//   const [selectedTab, setSelectedTab] = useState("Confirmed");

//   // ORDER selection (ids) – keep as you had it
//   const [selectedIds, setSelectedIds] = useState([]); // array of order IDs

//   // force table to refetch after actions
//   const [reloadKey, setReloadKey] = useState(0);
//   const bumpReload = () => setReloadKey((k) => k + 1);

//   // counts
//   const [statusCounts, setStatusCounts] = useState({});
//   const [loadingCounts, setLoadingCounts] = useState(false);
//   const [countsErr, setCountsErr] = useState(null);

//   const reloadCounts = async () => {
//     setLoadingCounts(true);
//     try {
//       const counts = await getOrderStatusCounts({});
//       setStatusCounts(counts || {});
//     } catch (e) {
//       setCountsErr(e?.message || "Failed to load order counts.");
//     } finally {
//       setLoadingCounts(false);
//     }
//   };
//   useEffect(() => { reloadCounts(); }, []);

//   // choose selection mode per tab
//   const selectionMode = useMemo(() => {
//     if (selectedTab === "Confirmed") return "multi";
//     if (selectedTab === "To Ship") return "single";
//     return "none";
//   }, [selectedTab]);

//   // action: mark as to ship (batch) – only for Confirmed
//   const [marking, setMarking] = useState(false);
//   const onMarkToShip = async () => {
//     if (selectionMode !== "multi" || !selectedIds.length) return;
//     setMarking(true);
//     try {
//       const results = await Promise.allSettled(
//         selectedIds.map((id) => adminMarkOrderToShip(id, { actorId: null }))
//       );
//       const failed = results.filter((r) => r.status === "rejected");
//       if (failed.length) {
//         console.error(failed);
//         alert(`Some orders failed to update (${failed.length}). Others succeeded.`);
//       } else {
//         alert("Selected orders marked as To Ship.");
//       }
//       await reloadCounts();
//       bumpReload();
//       setSelectedIds([]);
//       setSelectedTab("To Ship");
//     } finally {
//       setMarking(false);
//     }
//   };

//   // Existing demo modals (kept)
//   const [updateModal, setIsUpdateModal] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedStatusType, setSelectedStatusType] = useState("On delivery");
//   const [confirmationModal, setConfirmationModal] = useState(false);
//   const handleSelect = (type) => { setSelectedStatusType(type); setIsDropdownOpen(false); };
//   function handleUpdateModal() { setIsUpdateModal(!updateModal); }
//   function handleUpdateStatus() { setIsUpdateModal(false); setConfirmationModal(true); }
//   const handleConfirmationModal = () => { setConfirmationModal(false); navigate("/admin/products/egg-pickup"); };

//   const isMarkDisabled = !(selectionMode === "multi" && selectedIds.length > 0);

//   /* ---------------- Allocation wiring (no UI change to your table) ---------------- */

//   // Size selector (parent). You can render your own dropdown elsewhere if you prefer.
//   const [sizeOptions, setSizeOptions] = useState(["SMALL", "MEDIUM", "LARGE", "EXTRA-LARGE", "JUMBO"]);
//   const [sizeMeta, setSizeMeta] = useState({});
//   const [sizeFilter, setSizeFilter] = useState("SMALL"); // default SMALL

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const sizes = await fetchSizes();
//         const meta  = await fetchSizeMetaMap();
//         if (!alive) return;
//         setSizeOptions(sizes || ["SMALL","MEDIUM","LARGE","EXTRA-LARGE","JUMBO"]);
//         setSizeMeta(meta || {});
//       } catch {}
//     })();
//     return () => { alive = false; };
//   }, []);

//   // Supply selection (from EggSupply table)
//   const [supplySelection, setSupplySelection] = useState([]); // row keys on the current page

//   // Modal control
//   const [openAlloc, setOpenAlloc] = useState(false);
//   const canOpenAlloc =
//     selectedTab === "To Ship" &&
//     selectedIds.length === 1 &&
//     sizeFilter &&
//     sizeFilter.toUpperCase() !== "ALL" &&
//     supplySelection.length > 0;

//   return (
//     <div className="flex flex-col gap-5">
//       {/* Tabs / Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//         <div className="flex flex-wrap items-center gap-3">
//           {STATUS_TABS.map((label) => {
//             const count = statusCounts[label] || 0;
//             const active = selectedTab === label;
//             return (
//               <div
//                 key={label}
//                 onClick={() => { setSelectedTab(label); setSelectedIds([]); }}
//                 className={`relative cursor-pointer rounded-xl pl-4 pr-8 py-2 text-sm sm:text-base transition-colors ${
//                   active
//                     ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
//                     : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
//                 }`}
//               >
//                 {label}
//                 <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
//                   {loadingCounts ? "…" : count}
//                 </span>
//               </div>
//             );
//           })}
//         </div>

//         {/* Actions (unchanged) */}
//         <div className="flex gap-3 sm:gap-5 items-center">
//           {selectedTab === "Confirmed" && (
//             <button
//               onClick={onMarkToShip}
//               disabled={isMarkDisabled || marking}
//               className={`font-medium rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base ${
//                 isMarkDisabled || marking
//                   ? "bg-yellow-200 text-white cursor-not-allowed"
//                   : "bg-primaryYellow text-white hover:opacity-90"
//               }`}
//               title={isMarkDisabled ? "Select one or more Confirmed orders" : "Mark selected orders as To Ship"}
//             >
//               {marking ? "Marking…" : "Mark as to ship"}
//             </button>
//           )}

//           {/* Simple size dropdown for allocation */}
//           <div className="flex items-center gap-2">
//             <label className="text-sm text-gray-600">Size:</label>
//             <select
//               value={sizeFilter}
//               onChange={(e) => setSizeFilter(e.target.value)}
//               className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
//             >
//               {sizeOptions.map((s) => (
//                 <option key={s} value={s}>{s}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {countsErr && <div className="text-sm text-red-600">{countsErr}</div>}

//       {/* Orders table (unchanged) */}
//       <div className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
//         <OrderTable
//           key={reloadKey}
//           status={mapStatusForDB(selectedTab)}
//           selectedOption={mapStatusForDB(selectedTab)}
//           mode={selectionMode}
//           selectedIds={selectedIds}
//           onSelectionChange={setSelectedIds}
//         />
//       </div>

//       {/* Egg Supply table (reports page-checked rows up) */}
//       <EggSupplyTable
//         onSelectedRowsChange={setSupplySelection}
//       />

//       {/* Centralized button to open modal */}
//       <div className="flex justify-end">
//         <button
//           className={`rounded-lg px-5 py-2 text-white font-semibold ${
//             canOpenAlloc ? "bg-primaryYellow hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
//           }`}
//           disabled={!canOpenAlloc}
//           onClick={() => setOpenAlloc(true)}
//           title={
//             selectedTab !== "To Ship" ? "Select a single 'To Ship' order" :
//             selectedIds.length !== 1 ? "Select exactly one order" :
//             supplySelection.length === 0 ? "Tick at least one egg supply row" :
//             sizeFilter === "ALL" ? "Pick a specific size" : "Allocate"
//           }
//         >
//           Allocate Order
//         </button>
//       </div>

//       {/* Allocation modal (loads only when opened) */}
//       {openAlloc && (
//         <EggAllocation
//           open={openAlloc}
//           order={{ orderID: selectedIds[0] }}
//           sizeLabel={sizeFilter}
//           sizeMeta={sizeMeta}
//           selectedSupplyRowIds={supplySelection}
//           onClose={() => setOpenAlloc(false)}
//           onAllocated={() => {
//             setOpenAlloc(false);
//             // refresh counters & tables if you want:
//             reloadCounts();
//             bumpReload();
//           }}
//         />
//       )}

//       {/* Allocation history list (unchanged placeholder) */}
//       <EggAllocationHistory rows={[]} />

//       {/* Your existing demo modals (unchanged) */}
//       <Modal
//         isOpen={updateModal}
//         onRequestClose={handleUpdateModal}
//         contentLabel="Update Order Status"
//         style={{ ...modalBaseStyle, content: { ...modalBaseStyle.content, width: "90%", maxWidth: "500px" } }}
//       >
//         <div className="flex flex-col gap-5 px-3 py-6">
//           <h1 className="text-primaryYellow text-fluid-xl text-center font-bold">Update Order Status</h1>
//           <div className="flex flex-col">
//             <h1 className="text-gray-400 text-sm sm:text-base">Current status:</h1>
//             <p className="text-primaryYellow text-base sm:text-lg font-semibold">Pending</p>
//           </div>
//           <div className="flex flex-col">
//             <h1 className="text-gray-400 text-sm sm:text-base">Update status:</h1>
//             <div className="relative">
//               <div
//                 className="flex items-center justify-between gap-2 shadow-xl border border-gray-300 text-primaryYellow font-medium rounded-lg px-4 py-2 cursor-pointer hover:opacity-90"
//                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               >
//                 <p className="text-sm sm:text-base">{selectedStatusType}</p>
//                 <IoChevronDown className={`transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
//               </div>
//               {isDropdownOpen && (
//                 <div className="absolute mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//                   {["On delivery", "Delivered", "Packing"].map((type, i) => (
//                     <div
//                       key={i}
//                       className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm sm:text-base"
//                       onClick={() => setSelectedStatusType(type)}
//                     >
//                       {type}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="flex gap-2 justify-center">
//             <button onClick={handleUpdateModal} className="bg-gray-400 rounded-lg px-4 sm:px-6 py-2 text-white text-sm sm:text-base font-semibold">
//               Cancel
//             </button>
//             <button onClick={handleUpdateStatus} className="bg-primaryYellow rounded-lg px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base hover:bg-yellow-500 transition">
//               Confirm
//             </button>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         isOpen={confirmationModal}
//         onRequestClose={handleConfirmationModal}
//         contentLabel="Confirm Status"
//         style={{ ...modalBaseStyle, content: { ...modalBaseStyle.content, width: "90%", maxWidth: "400px" } }}
//       >
//         <div className="flex flex-col justify-center items-center p-6 text-center">
//           <h1 className="text-primaryYellow font-bold text-fluid-2xl">Pickup Complete!</h1>
//           <p className="text-gray-400 mb-6 sm:mb-10 text-base sm:text-xl">Farmer Name here</p>
//           <div onClick={handleConfirmationModal} className="w-full bg-primaryYellow shadow-md rounded-lg text-white px-4 py-3 font-bold cursor-pointer hover:bg-yellow-500 transition">
//             Update Egg Count
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }