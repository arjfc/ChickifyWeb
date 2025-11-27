// src/components/admin/modals/AddTruckingDriverModals.jsx
import React, { useState, useMemo } from "react";
import Modal from "react-modal";

const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxWidth: "480px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  overlay: { backgroundColor: "rgba(0,0,0,0.65)", zIndex: 2000 },
};

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AddDriverModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    truck_number: "",
    phone_number: "",
    plate_number: "",
    is_active: true,
  });

  const [weeklyDays, setWeeklyDays] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.company_name.trim() &&
      form.truck_number.trim() &&
      form.plate_number.trim() &&
      weeklyDays.length > 0 &&
      !submitting
    );
  }, [form, weeklyDays, submitting]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const toggleDay = (day) => {
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  function handleClose() {
    if (submitting) return;
    setForm({
      name: "",
      company_name: "",
      truck_number: "",
      phone_number: "",
      plate_number: "",
      is_active: true,
    });
    setWeeklyDays([]);
    onClose?.();
  }

  async function submitHandler(e) {
    e?.preventDefault?.();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        weekly_schedule_days: weeklyDays, // ⬅ used by service/RPC
      });
      handleClose();
    } catch (err) {
      console.error("AddDriverModal submit error:", err);
      alert(err?.message || "Failed to add driver.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={modalStyle}
      ariaHideApp={false}
    >
      <h2 className="text-xl font-bold text-primaryYellow mb-4 text-center">
        Add New Driver
      </h2>

      <form className="flex flex-col gap-3" onSubmit={submitHandler}>
        {/* Driver Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Driver Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Enter driver name"
          />
        </div>

        {/* Company Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Company Name <span className="text-red-500">*</span>
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
            Truck Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.truck_number}
            onChange={(e) => updateField("truck_number", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="TRK-001"
          />
        </div>

        {/* Phone Number */}
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
            Plate Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.plate_number}
            onChange={(e) => updateField("plate_number", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="ABC-1234"
          />
        </div>

        {/* Weekly Schedule */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600 font-medium">
            Weekly Schedule <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-gray-400 mb-1">
            Select the days this driver usually has trips (e.g., Monday,
            Wednesday, Friday).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {WEEK_DAYS.map((day) => {
              const checked = weeklyDays.includes(day);
              return (
                <label
                  key={day}
                  className={
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition " +
                    (checked
                      ? "border-primaryYellow bg-yellow-50 text-gray-900"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50")
                  }
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-yellow-400"
                    checked={checked}
                    onChange={() => toggleDay(day)}
                  />
                  <span>{day}</span>
                </label>
              );
            })}
          </div>
          {weeklyDays.length === 0 && (
            <p className="text-[11px] text-red-500 mt-1">
              Please select at least one day.
            </p>
          )}
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
            type="button"
            onClick={handleClose}
            className="flex-1 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex-1 py-2 rounded-lg text-gray-900 font-semibold ${
              canSubmit
                ? "bg-yellow-400 hover:bg-yellow-500"
                : "bg-yellow-300 cursor-not-allowed"
            }`}
          >
            {submitting ? "Adding..." : "Add Driver"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
