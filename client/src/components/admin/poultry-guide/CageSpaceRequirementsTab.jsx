// src/pages/dashboard/admin/poultry-guide/tabs/CageSpaceRequirementsTab.jsx
import React, { useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import { LuLayoutGrid } from "react-icons/lu";

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

export default function CageSpaceRequirementsTab() {
  const [data, setData] = useState(() => ({
    title: "Cage Space Requirements",
    subtitle: "guide from DA",
    bullets: [
      "Layers (space guide): Day-old to 4 weeks — 15 sq.in./chick.",
      "Layers (space guide): 4 to 8 weeks — 30 sq.in./chick.",
      "Layers (space guide): 9 weeks to laying age — 50–60 sq.cm./bird.",
    ],
  }));

  const [openEdit, setOpenEdit] = useState(false);
  const [draft, setDraft] = useState(() => deepCopy(data));

  const open = () => {
    setDraft(deepCopy(data));
    setOpenEdit(true);
  };

  const close = () => setOpenEdit(false);

  const save = () => {
    setData(deepCopy(draft));
    setOpenEdit(false);
  };

  const addBullet = () => {
    setDraft((d) => ({ ...d, bullets: [...(d.bullets || []), ""] }));
  };

  const updateBullet = (idx, value) => {
    setDraft((d) => {
      const next = [...(d.bullets || [])];
      next[idx] = value;
      return { ...d, bullets: next };
    });
  };

  const removeBullet = (idx) => {
    setDraft((d) => ({
      ...d,
      bullets: (d.bullets || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <>
      {/* MAIN CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* ✅ ICON IN SQUARE */}
            <div className="mt-0.5 grid h-11 w-11 place-items-center rounded-2xl bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200">
              <LuLayoutGrid className="text-[20px]" />
            </div>

            <div>
              {/* ✅ Bigger text */}
              <div className="text-lg font-bold text-slate-900">
                {data.title}
              </div>
              <div className="mt-0.5 text-[15px] font-medium text-slate-500">
                {data.subtitle}
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={open}
            className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 text-[14px] font-bold text-slate-900 hover:bg-yellow-100"
          >
            <FiEdit2 className="text-base" />
            Edit
          </button>
        </div>

        {/* ✅ Yellow bullets + bigger text */}
        <ul className="mt-5 space-y-3">
          {(data.bullets || []).map((b, i) => (
            <li key={i} className="flex gap-3 text-[15.5px] text-slate-700">
              <span className="mt-[10px] h-2 w-2 shrink-0 rounded-full bg-yellow-500 ring-2 ring-yellow-100" />
              <span className="leading-7">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* EDIT MODAL */}
      {openEdit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] ring-1 ring-slate-200">
            {/* Modal header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-lg font-extrabold text-slate-900">
                  Edit 
                </div>
                <div className="mt-0.5 text-[14px] text-slate-500">
                  {data.title}
                </div>
              </div>

              <button
                onClick={close}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                aria-label="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-800">
                  Bullet items
                </div>

                {/* ✅ Add inside modal */}
                <button
                  onClick={addBullet}
                  className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-[14px] font-bold text-slate-900 hover:bg-yellow-100"
                >
                  <FiPlus className="text-base" />
                  Add item
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {(draft.bullets || []).map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <textarea
                      value={b}
                      onChange={(e) => {
                        updateBullet(idx, e.target.value);
                        autoGrowTextarea(e);
                      }}
                      onInput={autoGrowTextarea}
                      rows={1}
                      placeholder="Type item..."
                      className="min-h-[44px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-[15px] text-slate-800 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100"
                    />

                    <button
                      onClick={() => removeBullet(idx)}
                      className="grid h-[44px] w-[44px] place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      aria-label="Remove item"
                      title="Remove"
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                onClick={close}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[14px] font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={save}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-[14px] font-extrabold text-white hover:bg-yellow-600"
              >
                <FiCheck className="text-base" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
