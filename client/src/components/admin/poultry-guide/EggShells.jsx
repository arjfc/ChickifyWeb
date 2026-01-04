// src/components/admin/poultry-guide/SoftThinEggShellsTab.jsx
import React, { useMemo, useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2, FiAlertTriangle } from "react-icons/fi";

/* ---------------- helpers ---------------- */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

function makeKey(prefix = "cause") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/* ---------------- default data (from image) ---------------- */
const DEFAULT_DATA = {
  header: {
    title: "Soft / Thin Egg Shells: Common causes",
    subtitle: "Most cases come down to calcium, absorption, stress, age, or illness.",
  },
  bullets: [
    "Not enough calcium in the layer diet (or inconsistent calcium intake).",
    "Low vitamin D3 / poor mineral balance (affects calcium absorption).",
    "Heat stress, dehydration, or sudden feed changes (temporary shell issues).",
    "Older hens often lay thinner shells; very young layers can lay odd shells too.",
    "Disease can also cause shell issues—watch for a sudden drop in egg production plus soft-shelled eggs and abnormal droppings.",
  ],
  alert:
    "If you see sudden drop in egg production + soft-shelled eggs + sick birds, isolate and consult a veterinarian ASAP.",
};

/* ---------------- small UI bits ---------------- */
function IconBadge() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-yellow-400 text-slate-900 ring-1 ring-yellow-300">
      <FiAlertTriangle className="text-lg" />
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-slate-800 ring-1 ring-yellow-200">
      {children}
    </span>
  );
}

/* ---------------- edit modal ---------------- */
function EditModal({ open, onClose, draft, setDraft, onSave }) {
  if (!open) return null;

  const addBullet = () => {
    const next = deepCopy(draft);
    next.bullets.push("New cause");
    setDraft(next);
  };

  const removeBullet = (idx) => {
    const next = deepCopy(draft);
    next.bullets.splice(idx, 1);
    setDraft(next);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-base font-extrabold text-slate-900">
              Edit Soft/Thin Shell Guide
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:text-slate-900"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-auto px-5 py-5">
          <div className="grid gap-4">
            {/* Header fields */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-extrabold text-slate-800">Header</div>

              <div className="mt-3 grid gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-bold text-slate-600">Title</label>
                  <input
                    value={draft.header.title}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, title: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-bold text-slate-600">Subtitle</label>
                  <textarea
                    value={draft.header.subtitle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, subtitle: e.target.value },
                      })
                    }
                    onInput={autoGrowTextarea}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                  />
                </div>
              </div>
            </div>

            {/* Causes */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-800">Common causes</div>

                <button
                  type="button"
                  onClick={addBullet}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
                >
                  <FiPlus />
                  Add cause
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                {draft.bullets.map((b, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-bold text-slate-600">Cause {idx + 1}</div>

                      <button
                        type="button"
                        onClick={() => removeBullet(idx)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        title="Remove cause"
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                    </div>

                    <textarea
                      value={b}
                      onChange={(e) => {
                        const next = deepCopy(draft);
                        next.bullets[idx] = e.target.value;
                        setDraft(next);
                      }}
                      onInput={autoGrowTextarea}
                      rows={2}
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Alert */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-extrabold text-slate-800">Warning box</div>
              <div className="mt-3 grid gap-1">
                <label className="text-xs font-bold text-slate-600">Alert text</label>
                <textarea
                  value={draft.alert}
                  onChange={(e) => setDraft({ ...draft, alert: e.target.value })}
                  onInput={autoGrowTextarea}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <FiX />
            Cancel
          </button>

          <button
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-yellow-300"
          >
            <FiCheck />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- main tab ---------------- */
export default function SoftThinEggShellsTab() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [openEdit, setOpenEdit] = useState(false);
  const [draft, setDraft] = useState(() => deepCopy(DEFAULT_DATA));

  const open = () => {
    setDraft(deepCopy(data));
    setOpenEdit(true);
  };

  const close = () => setOpenEdit(false);

  const save = () => {
    setData(deepCopy(draft));
    setOpenEdit(false);
  };

  const bullets = useMemo(() => data.bullets, [data.bullets]);

  // UI-only tags derived from content (no backend)
  const tags = useMemo(() => {
    const t = new Set();
    const text = bullets.join(" ").toLowerCase();
    if (text.includes("calcium")) t.add("Calcium");
    if (text.includes("vitamin d")) t.add("Vitamin D3");
    if (text.includes("heat") || text.includes("dehyd")) t.add("Heat/Water");
    if (text.includes("older") || text.includes("young")) t.add("Age");
    if (text.includes("disease")) t.add("Illness");
    return Array.from(t);
  }, [bullets]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[260px]">
          <div className="flex items-start gap-3">
            <IconBadge />
            <div>
              <div className="text-xl font-bold text-slate-900">{data.header.title}</div>
              <div className="mt-1 text-sm text-slate-600">{data.header.subtitle}</div>

              {/* {!!tags.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((x) => (
                    <Tag key={x}>{x}</Tag>
                  ))}
                </div>
              )} */}
            </div>
          </div>
        </div>

        <button
          onClick={open}
          className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
        >
          <FiEdit2 />
          Edit
        </button>
      </div>

      {/* Content grid (new layout) */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Causes list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-extrabold text-slate-900">Common causes</div>
          <div className="mt-3 grid gap-2">
            {bullets.map((b, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
              >
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400" />
                <div className="text-sm text-slate-700">{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert + quick check */}
        <div className="grid gap-4">
          <div className="rounded-2xl bg-yellow-50 p-4 ring-1 ring-yellow-200">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <FiAlertTriangle />
              Important warning
            </div>
            <div className="mt-2 text-sm text-slate-800">{data.alert}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-extrabold text-slate-900">Quick checks</div>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="font-extrabold text-slate-900">Diet</div>
                <div className="mt-1">Calcium source + consistency (layer feed, oyster shell).</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="font-extrabold text-slate-900">Environment</div>
                <div className="mt-1">Heat stress + water access (hydration affects shells).</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="font-extrabold text-slate-900">Pattern</div>
                <div className="mt-1">Sudden production drop + sick signs = act fast.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditModal
        open={openEdit}
        onClose={close}
        draft={draft}
        setDraft={setDraft}
        onSave={save}
      />
    </div>
  );
}
