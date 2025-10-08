import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchFarmersForAdmin } from "@/services/FarmerRequests";

/* ---------- Allocate Modal ---------- */
function AllocateFromPurchaseModal({ open, onClose, onConfirm, purchase, farmers }) {
  const overlayRef = useRef(null);
  const [amounts, setAmounts] = useState({});
  const remaining = Number(purchase?.amountKg || 0);

  useEffect(() => {
    if (!open || !purchase || farmers.length === 0) return;
    const n = farmers.length;
    const per = n > 0 ? Math.floor((remaining / n) * 10) / 10 : 0;
    const base = Object.fromEntries(farmers.map(f => [f.id, per]));
    let sum = Object.values(base).reduce((a, b) => a + b, 0);
    let i = 0;
    while (sum + 0.1 <= remaining && i < farmers.length) {
      base[farmers[i].id] = +(base[farmers[i].id] + 0.1).toFixed(1);
      sum = Object.values(base).reduce((a, b) => a + b, 0);
      i++;
    }
    setAmounts(base);
  }, [open, purchase, farmers, remaining]);

  const totalAlloc = useMemo(
    () => Object.values(amounts).reduce((a, b) => a + (Number(b) || 0), 0),
    [amounts]
  );
  const over = totalAlloc > remaining + 1e-9;

  const updateAmount = (id, val) => {
    const v = Math.max(0, Number(val) || 0);
    setAmounts((prev) => ({ ...prev, [id]: v }));
  };

  if (!open) return null;

  const header = "text-[#F6C32B] text-[16px] font-semibold";
  const cell = "text-[16px] text-gray-700 bg-[#faf4df] px-2 py-3";
  const grid = "grid grid-cols-[1.6fr_1.8fr_1fr] items-center";

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[100] bg-black/50 grid place-items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-[720px] max-w-[95vw] rounded-2xl bg-white shadow-xl">
        <div className="p-6 md:p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#F6C32B]">Allocate from Purchase</h2>
            <p className="mt-2 text-gray-800">
              <b>{purchase?.name}</b> • {purchase?.brand} • {purchase?.form} <br />
              Remaining available: <b>{remaining}</b> kg
            </p>
          </div>

          <div className={`mt-6 ${grid}`}>
            <div className={header}>Farmer</div>
            <div className={header}>Email</div>
            <div className={`${header} text-right`}>Amount (kg)</div>
          </div>
          <div className="mt-2 border-t border-gray-400" />

          <div className="py-2 space-y-2">
            {farmers.map((f) => (
              <div key={f.id} className={grid}>
                <div className={cell}>{f.name}</div>
                <div className={cell}>{f.email}</div>
                <div className={`${cell} text-right`}>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={amounts[f.id] ?? 0}
                    onChange={(e) => updateAmount(f.id, e.target.value)}
                    className="w-32 h-10 px-3 text-right bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-end gap-6 text-[14px]">
            <div>Allocated Total: <b>{totalAlloc.toFixed(1)}</b> kg</div>
            <div>Remaining After: <b>{(remaining - totalAlloc).toFixed(1)}</b> kg</div>
          </div>
          {over && (
            <div className="mt-2 text-right text-sm text-red-600">
              Allocation exceeds available feed. Reduce amounts.
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl bg-gray-400 text-white font-semibold hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={over || totalAlloc <= 0}
              onClick={() =>
                onConfirm?.({
                  purchaseId: purchase.id,
                  allocations: farmers.map((f) => ({
                    farmerId: f.id,
                    kg: Number(amounts[f.id] || 0),
                  })),
                  totalKg: totalAlloc,
                })
              }
              className={`h-12 rounded-xl text-white font-semibold ${
                over || totalAlloc <= 0 ? "bg-yellow-300 cursor-not-allowed" : "bg-[#F6C32B] hover:opacity-90"
              }`}
            >
              Confirm Allocation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function FarmersAllocation({ 
  selectedFarmers,
  onSelectFarmers,
  modalOpen,
  onOpenModal,
  onCloseModal,
  onConfirmAllocate,
  selectedPurchase
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchFarmersForAdmin({ status: "approved", onlyActive: true });
        if (!active) return;
        const normalized = (data || []).map((r) => ({
          id: String(r.farmer_id || r.id),
          name: r.name,
          email: r.email,
        }));
        setRows(normalized);
      } catch (e) {
        if (active) setErr(e?.message || "Failed to load farmers.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const ids = useMemo(() => rows.map((r) => r.id), [rows]);
  const allChecked = selectedFarmers.size > 0 && selectedFarmers.size === ids.length;
  const selectedRows = useMemo(() => rows.filter(r => selectedFarmers.has(r.id)), [rows, selectedFarmers]);

  const header = "text-[#F6C32B] text-[16px] font-semibold";
  const cell = "text-[16px] text-gray-700 bg-[#faf4df] px-2 py-3";
  const grid = "grid grid-cols-[60px_1.6fr_1.8fr] items-center";

  const toggleAll = () => onSelectFarmers(allChecked ? new Set() : new Set(ids));
  const toggleOne = (id) => {
    const next = new Set(selectedFarmers);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectFarmers(next);
  };

  const handleOpen = () => {
    if (!selectedPurchase) {
      alert("Please select a feed purchase first.");
      return;
    }
    if (selectedFarmers.size === 0) {
      alert("Select at least one farmer to allocate to.");
      return;
    }
    onOpenModal();
  };

  return (
    <div className="rounded-lg bg-white border border-gray-300 shadow-sm">
      <div className="px-6 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-semibold text-gray-700">
            Select Farmers to Allocate Feeds
          </h2>
          <span className="bg-gray-400 text-white text-[12px] font-semibold px-3 py-1 rounded-full">
            STEP 1
          </span>
        </div>
        {selectedFarmers.size > 0 && (
          <span className="text-[14px] font-semibold text-green-600">
            {selectedFarmers.size} selected
          </span>
        )}
      </div>

      <div className={`px-6 mt-4 ${grid}`}>
        <div className="flex justify-center">
          <input
            type="checkbox"
            aria-label="Select all"
            onChange={toggleAll}
            checked={allChecked}
            className="h-5 w-5 accent-[#F6C32B] cursor-pointer"
          />
        </div>
        <div className={header}>Farmer</div>
        <div className={header}>Email</div>
      </div>

      <div className="mx-6 mt-2 border-t-2 border-[#F6C32B]" />

      <div className="px-6 py-2 space-y-1">
        {loading && <div className="text-sm text-gray-500 py-3">Loading farmers…</div>}
        {!loading && err && <div className="text-sm text-red-600 py-3">{err}</div>}
        {!loading && !err && rows.length === 0 && (
          <div className="text-sm text-gray-500 py-3">No farmers found.</div>
        )}

        {!loading && !err && rows.map((r) => {
          const isSelected = selectedFarmers.has(r.id);
          return (
            <div 
              key={r.id} 
              className={`${grid} cursor-pointer rounded-lg transition-all ${
                isSelected 
                  ? 'bg-yellow-100 border-l-4 border-[#F6C32B]' 
                  : 'hover:bg-yellow-50'
              }`}
              onClick={() => toggleOne(r.id)}
            >
              <div className={`${cell} flex justify-center`}>
                <input
                  type="checkbox"
                  aria-label={`Select ${r.name}`}
                  onChange={() => toggleOne(r.id)}
                  checked={isSelected}
                  className="h-5 w-5 accent-[#F6C32B] cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className={cell}>{r.name}</div>
              <div className={cell}>{r.email}</div>
            </div>
          );
        })}
      </div>

      <AllocateFromPurchaseModal
        open={modalOpen}
        onClose={onCloseModal}
        onConfirm={onConfirmAllocate}
        purchase={selectedPurchase}
        farmers={selectedRows}
      />
    </div>
  );
}