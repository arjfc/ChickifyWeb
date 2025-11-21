import React, { useState } from "react";
import Modal from "react-modal";

const modalStyle = {
  content: {
    top: "50%", left: "50%", right: "auto", bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20, padding: 25, width: "90%", maxWidth: "480px",
    maxHeight: "90vh", overflowY: "auto",
  },
  overlay: { backgroundColor: "rgba(0,0,0,0.65)", zIndex: 2000 },
};

export default function AddDriverModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    truck_number: "",
    phone_number: "",
    plate_number: "",
    is_active: true,
    nextSchedule: "", // ⬅️ NEW
  });

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submitHandler() {
    if (!form.name.trim()) {
      alert("Driver name is required.");
      return;
    }
    if (!form.company_name.trim()) {
      alert("Company name is required.");
      return;
    }
    // nextSchedule is optional for now; you can enforce if needed
    onSubmit(form);
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyle}
      ariaHideApp={false}
    >
      <h2 className="text-xl font-bold text-primaryYellow mb-4 text-center">
        Add New Driver
      </h2>

      <div className="flex flex-col gap-3">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Driver Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Enter driver name"
          />
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Company Name
          </label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => updateField("company_name", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Enter company name"
          />
        </div>

        {/* Truck Number */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Truck Number
          </label>
          <input
            type="text"
            value={form.truck_number}
            onChange={(e) => updateField("truck_number", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="TRK-001"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Phone Number
          </label>
          <input
            type="text"
            value={form.phone_number}
            onChange={(e) => updateField("phone_number", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="09xxxxxxxxx"
          />
        </div>

        {/* Plate Number */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Plate Number
          </label>
          <input
            type="text"
            value={form.plate_number}
            onChange={(e) => updateField("plate_number", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="ABC-1234"
          />
        </div>

        {/* Next Schedule */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Next Schedule
          </label>
          <input
            type="datetime-local"
            value={form.nextSchedule}
            onChange={(e) => updateField("nextSchedule", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-[11px] text-gray-400">
            This will be used as the driver&apos;s next scheduled trip.
          </p>
        </div>

        {/* Active status */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
            className="h-4 w-4 accent-yellow-400"
          />
          <label className="text-sm text-gray-700">Active</label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
            <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
            >
                Cancel
            </button>

            <button
                onClick={submitHandler}
                className="flex-1 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500"
            >
                Add Driver
            </button>
        </div>

      </div>
    </Modal>
  );
}
