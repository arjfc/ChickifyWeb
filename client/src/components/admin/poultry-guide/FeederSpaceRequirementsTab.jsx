// src/pages/dashboard/admin/poultry-guide/tabs/FeederSpaceRequirementsTab.jsx
import React, { useState } from "react";
import { LuWheat } from "react-icons/lu";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

export default function FeederSpaceRequirementsTab() {
  const [data, setData] = useState(() => ({
    title: "Feeder space requirements",
    subtitle: "guide from DA",
    bullets: [
      "Feeding space (minimum): Day-old to 4 weeks — 2.5 to 5 cm/bird.",
      "Feeding space (minimum): 4 to 8 weeks — 5 to 6.5 cm/bird.",
      "Feeding space (minimum): 9 weeks to near laying age — 7.5 to 9 cm/bird.",
      "Feeding space (layers): 10 cm/bird.",
    ],
    warning: "",
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* icon square */}
            <div className="mt-0.5 grid h-11 w-11 place-items-center rounded-2xl bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200">
              <LuWheat className="text-[20px]" />
            </div>

            <div>
              <div className="text-lg font-extrabold text-slate-900">
                {data.title}
              </div>
              <div className="mt-0.5 text-[15px] font-medium text-slate-500">
                {data.subtitle}
              </div>
            </div>
          </div>

          <button
            onClick={open}
            className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 text-[14px] font-bold text-slate-900 hover:bg-yellow-100"
          >
            <FiEdit2 className="text-base" />
            Edit
          </button>
        </div>

        {/* yellow bullets */}
        <ul className="mt-5 space-y-3">
          {(data.bullets || []).map((b, i) => (
            <li key={i} className="flex gap-3 text-[15.5px] text-slate-700">
              <span className="mt-[10px] h-2 w-2 shrink-0 rounded-full bg-yellow-500 ring-2 ring-yellow-100" />
              <span className="leading-7">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ HORIZONTAL COMPACT MODAL */}
      {openEdit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-3">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] ring-1 ring-slate-200">
            {/* header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
              <div>
                <div className="text-base font-extrabold text-slate-900">
                  Edit
                </div>
                <div className="mt-0.5 text-[15px] text-slate-500">
                  {data.title}
                </div>
              </div>

              <button
                onClick={close}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                aria-label="Close"
              >
                <FiX className="text-[18px]" />
              </button>
            </div>

            {/* body */}
            <div className="max-h-[82vh] overflow-y-auto px-5 py-4">
              {/* Title + Subtitle (2 cols) */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-[12px] font-bold text-slate-800">
                    Title
                  </div>
                  <input
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>

                <div>
                  <div className="text-[12px] font-bold text-slate-800">
                    Subtitle
                  </div>
                  <input
                    value={draft.subtitle}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, subtitle: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              {/* Bullets */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="text-[12px] font-bold text-slate-800">
                  Bullet items
                </div>
                <button
                  onClick={addBullet}
                  className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-[12px] font-bold text-slate-900 hover:bg-yellow-100"
                >
                  <FiPlus className="text-[14px]" />
                  Add
                </button>
              </div>

              <div className="mt-2 max-h-[320px] overflow-y-auto pr-1 space-y-2">
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
                      placeholder="Type..."
                      className="min-h-[40px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100"
                    />

                    <button
                      onClick={() => removeBullet(idx)}
                      className="grid h-[40px] w-[40px] place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      aria-label="Remove"
                      title="Remove"
                    >
                      <FiTrash2 className="text-[15px]" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Optional warning (kept for future use) */}
              <div className="mt-4">
                <div className="text-[12px] font-bold text-slate-800">
                  Warning / Note (optional)
                </div>
                <textarea
                  value={draft.warning || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, warning: e.target.value }))
                  }
                  placeholder="Optional..."
                  className="mt-1 min-h-[70px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100"
                />
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
              <button
                onClick={close}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={save}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-3 py-2 text-[12px] font-extrabold text-white hover:bg-yellow-600"
              >
                <FiCheck className="text-[15px]" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
