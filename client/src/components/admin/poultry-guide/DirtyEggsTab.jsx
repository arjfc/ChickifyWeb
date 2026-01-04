// src/components/admin/poultry-guide/DirtyEggsTab.jsx
import React, { useMemo, useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2, FiAlertCircle } from "react-icons/fi";

/* ---------------- helpers ---------------- */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

function makeKey(prefix = "item") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/* ---------------- default data (from image) ---------------- */
const DEFAULT_DATA = {
  header: {
    title: "Dirty eggs: what it means and what to do",
    subtitle: "Dirty shells raise contamination risk — fix the source first, then clean correctly.",
  },
  bullets: [
    "Dirty eggs usually mean the egg contacted manure, wet litter, or dirty nest areas.",
    "It increases the risk of contamination and lowers market value.",
    "Fix the source: keep nests dry/clean, change litter often, and collect eggs more frequently.",
    "Clean eggs properly: start with dry cleaning (brush/light sandpaper). If wet washing is needed, wash quickly using clean warm running water, then dry completely.",
    "Never mix very dirty eggs with clean eggs in the same tray for selling.",
  ],
  alert:
    'Do not soak when wet washing, as this removes the protective "bloom" layer, requiring immediate refrigeration.',
  sections: [
    {
      key: "s1",
      title: "Fix the source (prevention)",
      points: ["Keep nests dry", "Change litter often", "Collect eggs more frequently"],
    },
    {
      key: "s2",
      title: "Clean correctly",
      points: [
        "Dry clean first (brush / light sandpaper)",
        "If needed: quick warm running water wash",
        "Dry completely after washing",
      ],
    },
    {
      key: "s3",
      title: "Sorting & selling",
      points: ["Separate very dirty eggs", "Do not mix with clean eggs in the same tray"],
    },
  ],
};

/* ---------------- small UI bits ---------------- */
function BadgeIcon() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-yellow-400 text-slate-900 ring-1 ring-yellow-300">
      <FiAlertCircle className="text-lg" />
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-slate-800 ring-1 ring-yellow-200">
      {children}
    </span>
  );
}

/* ---------------- modal ---------------- */
function EditModal({ open, onClose, draft, setDraft, onSave }) {
  if (!open) return null;

  const addBullet = () => {
    const next = deepCopy(draft);
    next.bullets.push("New bullet");
    setDraft(next);
  };

  const removeBullet = (idx) => {
    const next = deepCopy(draft);
    next.bullets.splice(idx, 1);
    setDraft(next);
  };

  const addSection = () => {
    const next = deepCopy(draft);
    next.sections.push({
      key: makeKey("sec"),
      title: "New section",
      points: ["New point"],
    });
    setDraft(next);
  };

  const removeSection = (idx) => {
    const next = deepCopy(draft);
    next.sections.splice(idx, 1);
    setDraft(next);
  };

  const addPoint = (secIdx) => {
    const next = deepCopy(draft);
    next.sections[secIdx].points.push("New point");
    setDraft(next);
  };

  const removePoint = (secIdx, pIdx) => {
    const next = deepCopy(draft);
    next.sections[secIdx].points.splice(pIdx, 1);
    setDraft(next);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-base font-extrabold text-slate-900">
              Edit Dirty Eggs Guide
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
                <div className="text-sm font-extrabold text-slate-800">Top bullets</div>

                <button
                  type="button"
                  onClick={addBullet}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
                >
                  <FiPlus />
                  Add bullet
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                {draft.bullets.map((b, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-bold text-slate-600">Bullet {idx + 1}</div>

                      <button
                        type="button"
                        onClick={() => removeBullet(idx)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        title="Remove bullet"
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

            {/* Sections */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-800">Action sections</div>

                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
                >
                  <FiPlus />
                  Add section
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                {draft.sections.map((sec, secIdx) => (
                  <div key={sec.key} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-extrabold text-slate-900">
                        Section {secIdx + 1}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => addPoint(secIdx)}
                          className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-3 py-2 text-xs font-extrabold text-slate-900 hover:bg-yellow-300"
                        >
                          <FiPlus />
                          Add point
                        </button>

                        <button
                          type="button"
                          onClick={() => removeSection(secIdx)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <FiTrash2 />
                          Remove section
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-1">
                      <label className="text-xs font-bold text-slate-600">Title</label>
                      <input
                        value={sec.title}
                        onChange={(e) => {
                          const next = deepCopy(draft);
                          next.sections[secIdx].title = e.target.value;
                          setDraft(next);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                      />
                    </div>

                    <div className="mt-3 grid gap-2">
                      {sec.points.map((p, pIdx) => (
                        <div key={pIdx} className="flex gap-2">
                          <textarea
                            value={p}
                            onChange={(e) => {
                              const next = deepCopy(draft);
                              next.sections[secIdx].points[pIdx] = e.target.value;
                              setDraft(next);
                            }}
                            onInput={autoGrowTextarea}
                            rows={2}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                          />

                          <button
                            type="button"
                            onClick={() => removePoint(secIdx, pIdx)}
                            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                            title="Remove point"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
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
export default function DirtyEggsTab() {
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
  const sections = useMemo(() => data.sections, [data.sections]);

  const chipText = useMemo(() => {
    const t = bullets.join(" ").toLowerCase();
    const chips = [];
    if (t.includes("manure") || t.includes("dirty")) chips.push("Contamination risk");
    if (t.includes("nest") || t.includes("litter")) chips.push("Nest hygiene");
    if (t.includes("collect")) chips.push("Frequent collection");
    if (t.includes("dry clean") || t.includes("sandpaper")) chips.push("Dry cleaning first");
    if (t.includes("soak")) chips.push("No soaking");
    return chips.slice(0, 4);
  }, [bullets]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[260px]">
          <div className="flex items-start gap-3">
            <BadgeIcon />
            <div>
              <div className="text-xl font-bold text-slate-900">{data.header.title}</div>
              <div className="mt-1 text-sm text-slate-600">{data.header.subtitle}</div>

              {/* {!!chipText.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {chipText.map((c) => (
                    <Pill key={c}>{c}</Pill>
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

      {/* Top bullets */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-extrabold text-slate-900">What it means</div>
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

      {/* Action sections */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {sections.map((sec) => (
          <div key={sec.key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-extrabold text-slate-900">{sec.title}</div>

            <div className="mt-3 grid gap-2">
              {sec.points.map((p, idx) => (
                <div key={idx} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">
                  {p}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="mt-4 rounded-2xl bg-yellow-50 p-4 ring-1 ring-yellow-200">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          <FiAlertCircle />
          Do this (important)
        </div>
        <div className="mt-2 text-sm text-slate-800">{data.alert}</div>
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
