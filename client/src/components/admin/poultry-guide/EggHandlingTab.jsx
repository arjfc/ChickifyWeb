// src/components/admin/poultry-guide/EggHandlingTab.jsx
import React, { useMemo, useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2, FiArchive } from "react-icons/fi";

/* ---------------- helpers ---------------- */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

/* ---------------- default data (from image) ---------------- */
const DEFAULT_DATA = {
  header: {
    title: "Egg Handling",
    subtitle: "Simple habits that reduce cracks, dirt, and spoilage during storage.",
  },
  bullets: [
    "Collect eggs often to reduce cracks and dirt.",
    "Store eggs in a clean tray/carton, away from sunlight and strong odors.",
    "Keep handling gentle: cracks = faster spoilage.",
    "Store eggs with pointed end down to help maintain freshness.",
    "Track date collected (FIFO: first in, first out).",
    "Practice daily fumigation of eggs.",
  ],
  note:
    "Small handling mistakes add up — clean storage + gentle handling protects quality and market value.",
};

/* ---------------- small UI bits ---------------- */
function IconBadge() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-yellow-400 text-slate-900 ring-1 ring-yellow-300">
      <FiArchive className="text-lg" />
    </div>
  );
}

function Chip({ children }) {
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
    next.bullets.push("New handling tip");
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
            <div className="text-base font-extrabold text-slate-900">Edit Egg Handling</div>
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

              <div className="mt-3 grid gap-3 md:grid-cols-2">
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

            {/* Bullets */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-800">Handling tips</div>

                <button
                  type="button"
                  onClick={addBullet}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
                >
                  <FiPlus />
                  Add tip
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                {draft.bullets.map((b, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-bold text-slate-600">Tip {idx + 1}</div>

                      <button
                        type="button"
                        onClick={() => removeBullet(idx)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        title="Remove tip"
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

            {/* Note */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-extrabold text-slate-800">Bottom note</div>
              <div className="mt-3 grid gap-1">
                <label className="text-xs font-bold text-slate-600">Note text</label>
                <textarea
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
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
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
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
export default function EggHandlingTab() {
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

  const chips = useMemo(() => {
    const t = bullets.join(" ").toLowerCase();
    const out = [];
    if (t.includes("collect")) out.push("Frequent collection");
    if (t.includes("tray") || t.includes("carton")) out.push("Clean storage");
    if (t.includes("sunlight") || t.includes("odors")) out.push("Avoid odor & sun");
    if (t.includes("pointed end")) out.push("Pointed end down");
    if (t.includes("fifo")) out.push("FIFO dating");
    if (t.includes("fumigation")) out.push("Daily fumigation");
    return out.slice(0, 5);
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

              {/* {!!chips.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <Chip key={c}>{c}</Chip>
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

      {/* New layout: "Checklist" cards */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {bullets.map((b, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-yellow-400 text- font-extrabold text-slate-900 ring-1 ring-yellow-300">
                {idx + 1}
              </div>
              <div className="text-sm text-slate-700">{b}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div className="mt-4 rounded-2xl bg-yellow-50 p-4 text-sm text-slate-800 ring-1 ring-yellow-200">
        <span className="font-extrabold">Reminder:</span> {data.note}
      </div>

      {/* Edit modal */}
      <EditModal open={openEdit} onClose={close} draft={draft} setDraft={setDraft} onSave={save} />
    </div>
  );
}
