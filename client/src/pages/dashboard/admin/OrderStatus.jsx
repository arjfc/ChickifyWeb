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
  adminMarkManyDeliveredDetailed,
} from "@/services/OrderNAllocation";

import {
  fetchTruckingProfiles,
  addTruckingProfileForAdmin,
} from "@/services/Trucking";

/* ---------------- Toast (same style as “Check your inputs”) ---------------- */
function Toast({ toast, onClose }) {
  if (!toast) return null;

  const palette = {
    success: "bg-green-50 border-green-300 text-green-800 shadow-green-100",
    warning: "bg-amber-50 border-amber-300 text-amber-900 shadow-amber-100",
    error: "bg-red-50 border-red-300 text-red-800 shadow-red-100",
  };
  const styles = palette[toast.type || "warning"];

  return (
    <div className="fixed top-6 right-6 z-[2000]">
      <div
        className={`max-w-sm w-[360px] rounded-xl border p-4 shadow-lg ${styles}`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="text-xl leading-none">⚠️</div>
          <div className="flex-1">
            <p className="font-semibold mb-1">{toast.title}</p>
            <p className="text-sm opacity-90 whitespace-pre-line">
              {toast.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 rounded-md text-xs hover:bg-black/5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

const modalBaseStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 20,
    maxHeight: "100vh",
    overflow: "visible",
  },
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
};

const STATUS_TABS = [
  "Confirmed",
  "To Ship",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
];

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

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (
    message,
    type = "warning",
    title = "Check your inputs"
  ) => {
    setToast({ message, type, title });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 4500);
  };

  // counts
  const [statusCounts, setStatusCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [countsErr, setCountsErr] = useState(null);

  // drivers
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driversError, setDriversError] = useState(null);

  // selected driver for trucking
  const [selectedDriverId, setSelectedDriverId] = useState(null);

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

  useEffect(() => {
    reloadCounts();
  }, []);

  // Load drivers whenever we switch to "Shipped" tab
  useEffect(() => {
    async function loadDrivers() {
      if (selectedTab !== "Shipped") return;
      setLoadingDrivers(true);
      setDriversError(null);
      try {
        const rows = await fetchTruckingProfiles(true);
        setDrivers(rows);
        setSelectedDriverId(null); // reset selection
      } catch (err) {
        console.error("Failed to load drivers:", err);
        setDriversError(err.message || "Failed to load drivers.");
      } finally {
        setLoadingDrivers(false);
      }
    }
    loadDrivers();
  }, [selectedTab]);

  // selection per tab
  const selectionMode = useMemo(() => {
    if (selectedTab === "Confirmed") return "multi";
    if (selectedTab === "To Ship") return "single";
    if (selectedTab === "Shipped") return "multi";
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
        const msgLines = failed.map((f, idx) => `• Order #${selectedIds[idx]} failed.`);
        showToast(
          `${msgLines.join("\n")}\n\nOthers were updated successfully.`,
          "error",
          "Some orders failed"
        );
      } else {
        showToast("Selected orders marked as To Ship.", "success", "Status updated");
      }

      await reloadCounts();
      bumpReload();
      setSelectedIds([]);
      setSelectedTab("To Ship");
    } finally {
      setMarking(false);
    }
  };

  // Shipped -> Delivered
  const [delivering, setDelivering] = useState(false);
  const onMarkDelivered = async () => {
    if (selectedTab !== "Shipped" || !selectedIds.length) return;

    // require driver selection so trucking inserts
    if (!selectedDriverId) {
      showToast(
        "• Please select a driver in the trucking table before marking orders as Delivered.",
        "warning",
        "Driver required"
      );
      return;
    }

    setDelivering(true);
    try {
      const results = await adminMarkManyDeliveredDetailed(selectedIds, {
        trackingProfileId: selectedDriverId,
      });

      console.groupCollapsed("[Deliver] Batch delivery results");
      console.table(results);
      console.groupEnd();

      const failures = results.filter((r) => !r.ok);
      const successes = results.filter((r) => r.ok).map((r) => r.orderId);

      failures.forEach((f) => {
        console.error(`[Deliver] Order #${f.orderId} failed`, {
          orderId: f.orderId,
          error: f.error,
        });
      });

      if (failures.length) {
        const failLines = failures.map(
          (f) => `• #${f.orderId}: ${f.error || "Unknown error"}`
        );
        const successLine = successes.length
          ? `\n\nDelivered successfully:\n• ${successes.join(", ")}`
          : "";

        showToast(
          `Some orders failed to mark Delivered:\n${failLines.join(
            "\n"
          )}${successLine}`,
          "error",
          "Delivery update issues"
        );
      } else {
        showToast(
          `Selected orders marked as Delivered.\n• ${successes.join(", ")}`,
          "success",
          "Delivery status updated"
        );
      }

      await reloadCounts();
      bumpReload();
      setSelectedIds([]);
      setSelectedTab(failures.length ? "Shipped" : "Delivered");
    } finally {
      setDelivering(false);
    }
  };

  // demo modals
  const [updateModal, setIsUpdateModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatusType, setSelectedStatusType] = useState("On delivery");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [openAddDriver, setOpenAddDriver] = useState(false);

  const handleSelect = (type) => {
    setSelectedStatusType(type);
    setIsDropdownOpen(false);
  };

  function handleUpdateModal() {
    setIsUpdateModal(!updateModal);
  }

  function handleUpdateStatus() {
    setIsUpdateModal(false);
    setConfirmationModal(true);
  }

  const handleConfirmationModal = () => {
    setConfirmationModal(false);
    navigate("/admin/products/egg-pickup");
  };

  const isMarkDisabled = !(
    selectionMode === "multi" && selectedIds.length > 0
  );

  // disable deliver if no driver selected
  const isDeliverDisabled = !(
    selectedTab === "Shipped" &&
    selectedIds.length > 0 &&
    selectedDriverId
  );

  // allocation (To Ship flow)
  const [supplySelection, setSupplySelection] = useState([]);
  const [openAlloc, setOpenAlloc] = useState(false);
  const selectedOrderId =
    selectedTab === "To Ship" && selectedIds.length === 1
      ? selectedIds[0]
      : null;
  const canOpenAlloc =
    selectedTab === "To Ship" &&
    selectedIds.length === 1 &&
    supplySelection.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {STATUS_TABS.map((label) => {
            const count = statusCounts[label] || 0;
            const active = selectedTab === label;
            return (
              <div
                key={label}
                onClick={() => {
                  setSelectedTab(label);
                  setSelectedIds([]);
                }}
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
              title={
                isMarkDisabled
                  ? "Select one or more Confirmed orders"
                  : "Mark selected orders as To Ship"
              }
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
              title={
                !selectedDriverId
                  ? "Select a driver in the trucking table first"
                  : "Mark selected orders as Delivered"
              }
            >
              {delivering ? "Delivering…" : "Deliver"}
            </button>
          )}
        </div>
      </div>

      {countsErr && (
        <div className="text-sm text-red-600">{countsErr}</div>
      )}

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

      {/* Drivers table (Shipped tab only) */}
      {selectedTab === "Shipped" && (
        <>
          {driversError && (
            <p className="text-sm text-red-600 mb-1">{driversError}</p>
          )}
          {loadingDrivers ? (
            <p className="text-sm text-gray-500">Loading drivers…</p>
          ) : (
            <TruckingTable
              rows={drivers}
              onAddDriver={() => setOpenAddDriver(true)}
              onSelectionChange={(ids) => {
                console.log("Selected driver IDs:", ids);
                const first = ids && ids.length ? ids[0] : null;
                setSelectedDriverId(first);
              }}
            />
          )}
        </>
      )}

      {/* Selected order card (only in To Ship tab) */}
      {selectedOrderId && <SelectedOrderCard orderId={selectedOrderId} />}

      {/* Egg Supply table (To Ship tab) */}
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
                canOpenAlloc
                  ? "bg-primaryYellow hover:opacity-90 hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
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
                : `Allocate ${supplySelection.length} source${
                    supplySelection.length > 1 ? "s" : ""
                  }`}
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
      <EggAllocationHistory
        orderId={selectedIds[0] || null}
        reloadKey={reloadKey}
      />

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={openAddDriver}
        onClose={() => setOpenAddDriver(false)}
        onSubmit={async (formData) => {
          await addTruckingProfileForAdmin(formData);
          const rows = await fetchTruckingProfiles(true);
          setDrivers(rows);
          setOpenAddDriver(false);
        }}
      />

      {/* Demo update-modal (unchanged) */}
      <Modal
        isOpen={updateModal}
        onRequestClose={handleUpdateModal}
        contentLabel="Update Order Status"
        style={{
          ...modalBaseStyle,
          content: { ...modalBaseStyle.content, width: "90%", maxWidth: "500px" },
        }}
      >
        <div className="flex flex-col gap-5 px-3 py-6">
          <h1 className="text-primaryYellow text-fluid-xl text-center font-bold">
            Update Order Status
          </h1>
          <div className="flex flex-col">
            <h1 className="text-gray-400 text-sm sm:text-base">
              Current status:
            </h1>
            <p className="text-primaryYellow text-base sm:text-lg font-semibold">
              Pending
            </p>
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-400 text-sm sm:text-base">
              Update status:
            </h1>
            <div className="relative">
              <div
                className="flex items-center justify-between gap-2 shadow-xl border border-gray-300 text-primaryYellow font-medium rounded-lg px-4 py-2 cursor-pointer hover:opacity-90"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <p className="text-sm sm:text-base">{selectedStatusType}</p>
                <IoChevronDown
                  className={`transform transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isDropdownOpen && (
                <div className="absolute mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {["On delivery", "Delivered", "Packing"].map((type, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm sm:text-base"
                      onClick={() => handleSelect(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleUpdateModal}
              className="bg-gray-400 rounded-lg px-4 sm:px-6 py-2 text-white text-sm sm:text-base font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              className="bg-primaryYellow rounded-lg px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base hover:bg-yellow-500 transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Demo confirmation modal (unchanged) */}
      <Modal
        isOpen={confirmationModal}
        onRequestClose={handleConfirmationModal}
        contentLabel="Confirm Status"
        style={{
          ...modalBaseStyle,
          content: { ...modalBaseStyle.content, width: "90%", maxWidth: "400px" },
        }}
      >
        <div className="flex flex-col justify-center items-center p-6 text-center">
          <h1 className="text-primaryYellow font-bold text-fluid-2xl">
            Pickup Complete!
          </h1>
          <p className="text-gray-400 mb-6 sm:mb-10 text-base sm:text-xl">
            Farmer Name here
          </p>
          <div
            onClick={handleConfirmationModal}
            className="w-full bg-primaryYellow shadow-md rounded-lg text-white px-4 py-3 font-bold cursor-pointer hover:bg-yellow-500 transition"
          >
            Update Egg Count
          </div>
        </div>
      </Modal>
    </div>
  );
}
