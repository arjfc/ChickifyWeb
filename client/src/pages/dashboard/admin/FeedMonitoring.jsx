import React, { useRef, useState, useEffect } from "react";
import { IoFilterOutline, IoChevronDown } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import FeedMonitoringTable from "@/components/admin/tables/FeedMonitoringTable";

// MUI X Date Picker
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

/* ---------- small reusable select ---------- */
function SimpleSelect({ label, placeholder = "Select", value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const onDocDown = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <label className="block text-gray-700 text-[16px] mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-between text-[14px]"
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <IoChevronDown className="text-gray-400 text-base" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-[14px]"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────── *
 * Allocate Modal
 * ──────────────────────────────────────────── */
function AllocateModal({ open, onClose, onConfirm }) {
  const overlayRef = useRef(null);
  const [feedName, setFeedName] = useState("");
  const [feedBrand, setFeedBrand] = useState("");
  const [amountKg, setAmountKg] = useState("");

  // ESC to close modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // sample options (swap with real data later)
  const FEED_NAMES = ["Starter Crumble", "Grower Pellets", "Layer Mash", "Finisher Pellet"];
  const FEED_BRANDS = ["B-MEG", "PilMico", "Vitarich", "Universal"];

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose(); // click-outside
      }}
      className="fixed inset-0 z-[100] bg-black/50 grid place-items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-[600px] max-w-[92vw] rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="p-6 md:p-8 text-center">
          <h2 className="text-3xl font-bold text-[#F6C32B]">Allocate Farmers</h2>
          <p className="mt-2 text-gray-800">
            The selected farmers will receive the recommended feed (kg). You may change this if you like.
          </p>

          {/* Form */}
          <div className="mt-6 space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
              <SimpleSelect
                label="Feed Name"
                value={feedName}
                onChange={setFeedName}
                options={FEED_NAMES}
              />
              <SimpleSelect
                label="Feed Brand"
                value={feedBrand}
                onChange={setFeedBrand}
                options={FEED_BRANDS}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Feed Amount (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Enter Amount"
                value={amountKg}
                onChange={(e) => setAmountKg(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6C32B]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 pb-7 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl bg-gray-400 text-white font-semibold hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm?.({ feedName, feedBrand, amountKg });
              onClose();
            }}
            className="h-12 rounded-xl bg-[#F6C32B] text-white font-semibold hover:opacity-90"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────── *
 * Page
 * ──────────────────────────────────────────── */
export default function FeedMonitoring() {
  const [dateValue, setDateValue] = useState(dayjs());
  const [openDate, setOpenDate] = useState(false);
  const [showAllocate, setShowAllocate] = useState(false);
  const dateAnchorRef = useRef(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="w-full">
        {/* Top controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="h-9 w-9 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              aria-label="Filter"
            >
              <IoFilterOutline className="text-gray-700 text-[18px]" />
            </button>

            <div className="relative">
              <button
                ref={dateAnchorRef}
                onClick={() => setOpenDate(true)}
                className="h-9 min-w-[160px] px-3 pr-2 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[14px] inline-flex items-center gap-2"
              >
                <LuCalendarDays className="text-[16px]" />
                <span className="whitespace-nowrap">Date Range</span>
                <IoChevronDown className="ml-auto text-[16px]" />
              </button>

              <DatePicker
                open={openDate}
                onClose={() => setOpenDate(false)}
                value={dateValue}
                onChange={(v) => setDateValue(v)}
                slotProps={{
                  textField: {
                    sx: { position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" },
                  },
                  popper: { anchorEl: dateAnchorRef.current, placement: "bottom-start" },
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAllocate(true)}
            className="h-9 px-5 rounded-lg bg-[#F6C32B] text-white text-[14px] font-medium hover:opacity-90"
          >
            Allocate
          </button>
        </div>

        {/* Table */}
        <FeedMonitoringTable />

        {/* Modal at end */}
        <AllocateModal
          open={showAllocate}
          onClose={() => setShowAllocate(false)}
          onConfirm={(payload) => {
            // hook up submit here
          }}
        />
      </div>
    </LocalizationProvider>
  );
}
