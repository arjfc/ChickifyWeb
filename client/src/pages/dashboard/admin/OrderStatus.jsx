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

import {
  getOrderStatusCounts,
  adminMarkOrderToShip,
  adminMarkManyDeliveredDetailed, // <-- detailed batch helper
} from "@/services/OrderNAllocation";

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

const mockDrivers = [
  {
    tracking_profile_id: 1,
    name: "John Michael Santos",
    company_name: "AgroSwift Logistics",
    truck_number: "TRK-001",
    phone_number: "09171234567",
    plate_number: "ABC-1234",
    is_active: true,
    schedule: "2025-11-18T08:00:00Z",
    nextSchedule: "2025-11-18T08:00:00Z",
  },
  {
    tracking_profile_id: 2,
    name: "Ricardo D. Mendoza",
    company_name: "GreenRoad Transport",
    truck_number: "TRK-212",
    phone_number: "09981234567",
    plate_number: "DDD-9811",
    is_active: false,
    schedule: "2025-11-12T13:00:00Z",
    nextSchedule: "2025-11-20T13:30:00Z",
  },
  {
    tracking_profile_id: 3,
    name: "Alvin P. Villanueva",
    company_name: "AgroSwift Logistics",
    truck_number: "TRK-019",
    phone_number: "09182345678",
    plate_number: "XYZ-5588",
    is_active: true,
    schedule: "2025-11-20T13:00:00Z",
    nextSchedule: "2025-11-17T10:15:00Z",
  },
  {
    tracking_profile_id: 4,
    name: "Mark Joseph Reyes",
    company_name: "RoadMaster Delivery",
    truck_number: "TRK-340",
    phone_number: "09091239888",
    plate_number: "QWE-4400",
    is_active: true,
    schedule: "2025-11-18T09:45:00Z",
    nextSchedule: "2025-11-21T09:45:00Z",
  },
  {
    tracking_profile_id: 5,
    name: "Leo A. Dizon",
    company_name: "GreenRoad Transport",
    truck_number: "TRK-099",
    phone_number: "09381237654",
    plate_number: "GGG-7777",
    is_active: false,
    schedule: "2025-11-15T15:00:00Z",
    nextSchedule: "2025-11-19T15:00:00Z",
  },
];

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

  // selection per tab
  const selectionMode = useMemo(() => {
    if (selectedTab === "Confirmed") return "multi";
    if (selectedTab === "To Ship") return "single";
    if (selectedTab === "Shipped") return "multi"; // allow multi for Deliver
    return "none";
  }, [selectedTab]);

  // Confirmed -> To Ship
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
        console.error("[To Ship] failures:", failed);
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

  // Shipped -> Delivered (with detailed console + alert)
  const [delivering, setDelivering] = useState(false);
  const onMarkDelivered = async () => {
    if (selectedTab !== "Shipped" || !selectedIds.length) return;
    setDelivering(true);
    try {
      const results = await adminMarkManyDeliveredDetailed(selectedIds);
      // results: [{ orderId, ok, error }]
      console.groupCollapsed("[Deliver] RPC results");
      console.table(results);
      console.groupEnd();

      const failures = results.filter(r => !r.ok);
      const successes = results.filter(r => r.ok).map(r => r.orderId);

      // print each failure to console with context
      failures.forEach(f => {
        console.error(`[Deliver] Order #${f.orderId} failed`, { orderId: f.orderId, error: f.error });
      });

      if (failures.length) {
        const lines = failures.map(f => `#${f.orderId}: ${f.error}`).join("\n");
        alert(`Some orders failed to mark Delivered (${failures.length}).\n\n${lines}\n\nOthers succeeded: ${successes.join(", ") || "none"}.`);
      } else {
        alert(`Selected orders marked as Delivered.\nOrders: ${successes.join(", ")}`);
      }

      await reloadCounts();
      bumpReload();
      setSelectedIds([]);
      setSelectedTab(failures.length ? "Shipped" : "Delivered");
    } finally {
      setDelivering(false);
    }
  };

  // demo modals (unchanged)
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
  const isDeliverDisabled = !(selectedTab === "Shipped" && selectedIds.length > 0);

  // allocation (To Ship flow)
  const [supplySelection, setSupplySelection] = useState([]);
  const [openAlloc, setOpenAlloc] = useState(false);
  const selectedOrderId = selectedTab === "To Ship" && selectedIds.length === 1 ? selectedIds[0] : null;
  const canOpenAlloc =
    selectedTab === "To Ship" &&
    selectedIds.length === 1 &&
    supplySelection.length > 0;

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

          {selectedTab === "Shipped" && (
            <button
              onClick={onMarkDelivered}
              disabled={isDeliverDisabled || delivering}
              className={`font-medium rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base ${
                isDeliverDisabled || delivering
                  ? "bg-yellow-200 text-white cursor-not-allowed"
                  : "bg-primaryYellow text-white hover:opacity-90"
              }`}
              title={isDeliverDisabled ? "Select one or more Shipped orders" : "Mark selected orders as Delivered"}
            >
              {delivering ? "Delivering…" : "Deliver"}
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
        <TruckingTable
          rows={mockDrivers}
          onAddDriver={() => setOpenAddDriver(true)}
          onSelectionChange={(ids) => {
            console.log("Selected driver IDs:", ids);
          }}
        />
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
