// pages/super-admin/pricing/PriceManagement.jsx (or your existing path)

import { useEffect, useState, useMemo } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import SmallCard from "../../../components/super-admin/SmallCard";
import PriceTable from "../../../components/admin/tables/PriceTable";
import Modal from "react-modal";

import {
  fetchSizeBasePrices,
  updateSizeBasePrice,
} from "@/services/SuperadminBasePrice";

const editModalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 20,
    maxHeight: "90vh",
    width: "90vw",
    maxWidth: "480px",
    overflow: "auto",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

const infoModalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 10,
    maxHeight: "100vh",
    width: "25vw",
    minWidth: 320,
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

export default function PriceManagement() {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // local editable values keyed by size_id
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);

  /** Load sizes from DB */
  const reloadSizes = async () => {
    setLoading(true);
    try {
      const rows = await fetchSizeBasePrices();
      setSizes(rows);
    } catch (e) {
      console.error("[fetchSizeBasePrices] error:", e);
      alert(e.message || "Failed to load base prices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadSizes();
  }, []);

  /** Open edit modal, pre-fill inputs with current base prices */
  const handleOpenEditModal = () => {
    const map = {};
    sizes.forEach((s) => {
      map[s.size_id] = s.price_per_tray != null ? String(s.price_per_tray) : "";
    });
    setEditValues(map);
    setIsModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const handleInfoModal = () => {
    setIsInfoModalOpen((prev) => !prev);
  };

  /** Save all changed base prices via RPC */
  const handleSaveChanges = async () => {
    if (saving) return;

    // collect changed + valid values
    const updates = [];
    for (const size of sizes) {
      const raw = editValues[size.size_id];
      if (raw == null || raw === "") continue;

      const newVal = Number(raw);
      if (!Number.isFinite(newVal) || newVal <= 0) {
        alert(`Invalid price for "${size.size_description}".`);
        return;
      }

      const currentVal = Number(size.price_per_tray ?? 0);
      if (Math.abs(newVal - currentVal) < 0.0001) continue; // unchanged

      updates.push({ size_id: size.size_id, value: newVal });
    }

    if (!updates.length) {
      setIsModalOpen(false);
      return;
    }

    setSaving(true);
    try {
      // sequential calls; can be Promise.all if you prefer
      for (const u of updates) {
        await updateSizeBasePrice(u.size_id, u.value);
      }
      await reloadSizes();
      setIsModalOpen(false);
    } catch (e) {
      console.error("[updateSizeBasePrice] error:", e);
      alert(e.message || "Failed to update base prices.");
    } finally {
      setSaving(false);
    }
  };

  const cards = useMemo(
    () =>
      sizes.map((s) => ({
        id: s.size_id,
        label: s.size_description,
        pricePerTray: Number(s.price_per_tray ?? 0),
      })),
    [sizes]
  );

  return (
    <div className="flex flex-col gap-5">
      {/* CURRENT GLOBAL BASE PRICE CARDS */}
      <div className="flex flex-col gap-5 p-6 rounded-lg border border-gray-200 shadow-lg">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center">
            <h1 className="text-2xl text-primaryYellow font-semibold">
              Current Global Base Price of Tray
            </h1>
            <FaCircleInfo
              onClick={handleInfoModal}
              className="text-lg text-gray-400 cursor-pointer"
              title="What is Price per Tray?"
            />
          </div>
          <button
            onClick={handleOpenEditModal}
            disabled={loading}
            className="bg-primaryYellow text-white font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
          >
            Edit Base Prices
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading base prices…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5">
            {cards.map((c) => (
              <SmallCard
                key={c.id}
                id={c.id}
                size={c.label}
                number={c.pricePerTray}
              />
            ))}
            {!cards.length && (
              <p className="text-sm text-gray-500 col-span-full">
                No sizes found. Check your size table.
              </p>
            )}
          </div>
        )}
      </div>

      {/* OPTIONAL: table below (if you still need it) */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-5 items-center text-primaryYellow text-3xl font-bold">
            <h1>Current Base Price Management</h1>
          </div>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
          <PriceTable />
        </div>
      </div>

      {/* EDIT MODAL – change base prices per tray */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseEditModal}
        style={editModalStyle}
        ariaHideApp={false}
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-primaryYellow font-bold text-xl text-center">
            Edit Global Base Price (per Tray)
          </h1>

          {sizes.map((s) => (
            <div
              key={s.size_id}
              className="flex flex-col gap-1 text-sm mb-2"
            >
              <label className="text-gray-500 font-semibold">
                {s.size_description}{" "}
                <span className="text-xs text-gray-400">
                  ({s.eggs_per_tray} eggs / tray)
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editValues[s.size_id] ?? ""}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    [s.size_id]: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
                placeholder="Enter price per tray (₱)"
              />
            </div>
          ))}

          <div className="flex flex-row items-center justify-between gap-4 mt-4">
            <button
              onClick={handleCloseEditModal}
              disabled={saving}
              className="flex-1 text-center bg-gray-400 text-white font-medium rounded-lg px-5 py-2 hover:opacity-90 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex-1 text-center bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* INFO MODAL */}
      <Modal
        isOpen={isInfoModalOpen}
        onRequestClose={handleInfoModal}
        style={infoModalStyle}
        ariaHideApp={false}
      >
        <div className="flex flex-col gap-5 items-center justify-center p-6">
          <h1 className="text-primaryYellow font-bold text-xl">
            Price Per Tray
          </h1>
          <p className="font-semibold opacity-70 text-center text-sm">
            Price per Tray refers to the cost assigned to one standard tray of
            eggs (typically 30 pieces). It serves as the base unit for pricing
            in egg sales. This metric is commonly used in poultry trading
            because it standardizes egg pricing, making it simple to compare,
            track, and adjust prices across markets.
          </p>
          <button
            onClick={handleInfoModal}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90 w-full text-center"
          >
            <span className="text-lg">Okay</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
