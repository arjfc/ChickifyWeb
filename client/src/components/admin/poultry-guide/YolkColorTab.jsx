// src/components/admin/poultry-guide/YolkColorTab.jsx
import React, { useMemo, useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2, FiDroplet, FiInfo } from "react-icons/fi";

/* ---------------- helpers ---------------- */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/* ---------------- default data (from your image) ---------------- */
const DEFAULT_DATA = {
  header: {
    title: "Yolk color: what it usually means",
    badge: "Quality",
    subtitle: "Simple guide on why yolks look lighter or deeper in color.",
  },
  bullets: [
    "Yolk color is mostly affected by feed pigments (carotenoids/xanthophylls).",
    "More corn, greens, marigold, or pigment-rich feeds often produce deeper yellow/orange yolks.",
    "Paler yolks usually mean less pigment in the diet (not automatically “bad”).",
    "Yolk color alone doesn’t guarantee nutrition — focus on balanced feed and bird health.",
  ],
  note:
    "Use yolk color as a diet signal, not a single “quality score.”",
};

/* ---------------- small UI bits ---------------- */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-slate-800 ring-1 ring-yellow-200">
      {children}
    </span>
  );
}

function MiniPill({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
      <span className="text-slate-600">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ---------------- modal ---------------- */
function EditModal({ open, onClose, draft, setDraft, onSave }) {
  if (!open) return null;

  const addBullet = () => {
    const next = deepCopy(draft);
    next.bullets.push("New note");
    setDraft(next);
  };

  const removeBullet = (idx) => {
    const next = deepCopy(draft);
    next.bullets.splice(idx, 1);
    setDraft(next);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-base font-extrabold text-slate-900">
              Edit Yolk Color Guide
            </div>
            <div className="text-xs text-slate-600">UI only — saves to local state.</div>
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
                  <label className="text-xs font-bold text-slate-600">Badge</label>
                  <input
                    value={draft.header.badge}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        header: { ...draft.header, badge: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-1">
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

            {/* Bullets */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-800">Key points</div>

                <button
                  type="button"
                  onClick={addBullet}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
                >
                  <FiPlus />
                  Add point
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                {draft.bullets.map((b, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-bold text-slate-600">Point {idx + 1}</div>

                      <button
                        type="button"
                        onClick={() => removeBullet(idx)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        title="Remove point"
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
                <label className="text-xs font-bold text-slate-600">Note</label>
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
export default function YolkColorTab() {
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

  // purely visual, derived from bullet count (keeps it UI-only)
  const strength = clamp(bullets.length, 1, 6);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[240px]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xl font-bold text-slate-900">{data.header.title}</div>
            {/* <Badge>{data.header.badge}</Badge> */}
          </div>
          <div className="mt-1 text-sm text-slate-600">{data.header.subtitle}</div>
        </div>

        <button
          onClick={open}
          className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
        >
          <FiEdit2 />
          Edit
        </button>
      </div>

      {/* New layout (not the same as EggFormation) */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: key points card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400 text-slate-900 ring-1 ring-yellow-300">
                <FiDroplet />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900">Key points</div>
                <div className="text-xs text-slate-500">What yolk color usually tells you</div>
              </div>
            </div>

            {/* A small “signal bar” purely for style */}
            <div className="hidden items-center gap-1 sm:flex" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-2 w-5 rounded-full ring-1 ring-slate-200",
                    i < strength ? "bg-yellow-300" : "bg-slate-100",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {bullets.map((b, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
              >
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400" />
                <div className="text-sm text-slate-700">{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: takeaway + chips */}
        <div className="grid gap-4">
          <div className="rounded-2xl bg-yellow-50 p-4 ring-1 ring-yellow-200">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <FiInfo />
              Quick takeaway
            </div>
            <div className="mt-2 text-sm text-slate-700">{data.note}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-extrabold text-slate-900">At a glance</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <MiniPill icon={<FiDroplet />} label="Feed pigments matter most" />
              <MiniPill icon={<FiDroplet />} label="Deeper color often = more pigment" />
              <MiniPill icon={<FiDroplet />} label="Paler = less pigment (not “bad”)" />
              <MiniPill icon={<FiDroplet />} label="Color ≠ guaranteed nutrition" />
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
