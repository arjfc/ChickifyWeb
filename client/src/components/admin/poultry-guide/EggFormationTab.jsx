// src/components/admin/poultry-guide/EggFormationTab.jsx
import React, { useMemo, useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2, FiClock, FiInfo } from "react-icons/fi";

/* ---------------- helpers ---------------- */
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

function makeKey(prefix = "step") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/* ---------------- default data (from your image) ---------------- */
const DEFAULT_DATA = {
  header: {
    title: "How Eggs Are Formed",
    // badge: "Basics",
    subtitle: "A quick timeline from yolk release to laying.",
  },
  steps: [
    {
      key: "s1",
      text: "Yolk is released into the oviduct.",
      duration: "around 30 minutes",
    },
    {
      key: "s2",
      text: "Egg white (albumen) forms around the yolk and builds up.",
      duration: "around 3 hours",
    },
    {
      key: "s3",
      text: "Shell membranes are added and the egg shape is formed.",
      duration: "around 1 hour",
    },
    {
      key: "s4",
      text: "Shell is formed in the shell gland.",
      duration: "around 20 hours",
    },
    {
      key: "s5",
      text: "Bloom/cuticle is added, then the egg is laid.",
      duration: "",
    },
  ],
  totalNote:
    "Total time is commonly ~24–26 hours per egg (varies by bird & conditions).",
  tip:
    "The longest stage is usually shell formation in the shell gland. Stress, heat, nutrition, and age can affect timing.",
};

/* ---------------- tiny UI bits ---------------- */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-slate-800 ring-1 ring-yellow-200">
      {children}
    </span>
  );
}

function DurationChip({ value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-slate-700 ring-1 ring-slate-200">
      <FiClock className="text-[13px]" />
      {value}
    </span>
  );
}

function StepNumber({ n }) {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400 text-sm font-extrabold text-slate-900 shadow-sm ring-1 ring-yellow-300">
      {n}
    </div>
  );
}

/* ---------------- modal ---------------- */
function EditModal({ open, onClose, draft, setDraft, onSave }) {
  if (!open) return null;

  const addStep = () => {
    const next = deepCopy(draft);
    next.steps.push({
      key: makeKey(),
      text: "New step",
      duration: "",
    });
    setDraft(next);
  };

  const removeStep = (idx) => {
    const next = deepCopy(draft);
    next.steps.splice(idx, 1);
    setDraft(next);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-base font-extrabold text-slate-900">
              Edit Egg Formation Guide
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

        {/* body */}
        <div className="max-h-[75vh] overflow-auto px-5 py-5">
          <div className="grid gap-4">
            {/* header fields */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-extrabold text-slate-800">Header</div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-xs font-bold text-slate-600">Title</label>
                  <input
                    value={draft.header.title}
                    onChange={(e) =>
                      setDraft({ ...draft, header: { ...draft.header, title: e.target.value } })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                  />
                </div>

                {/* <div className="grid gap-1">
                  <label className="text-xs font-bold text-slate-600">Badge</label>
                  <input
                    value={draft.header.badge}
                    onChange={(e) =>
                      setDraft({ ...draft, header: { ...draft.header, badge: e.target.value } })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                  />
                </div> */}
              </div>

              <div className="mt-3 grid gap-1">
                <label className="text-xs font-bold text-slate-600">Subtitle</label>
                <textarea
                  value={draft.header.subtitle}
                  onChange={(e) =>
                    setDraft({ ...draft, header: { ...draft.header, subtitle: e.target.value } })
                  }
                  onInput={autoGrowTextarea}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
            </div>

            {/* steps */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-800">Steps</div>

                <button
                  type="button"
                  onClick={addStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
                >
                  <FiPlus />
                  Add step
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                {draft.steps.map((s, idx) => (
                  <div key={s.key} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-extrabold text-slate-900">
                        Step {idx + 1}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        title="Remove step"
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
                      <div className="grid gap-1">
                        <label className="text-xs font-bold text-slate-600">Text</label>
                        <textarea
                          value={s.text}
                          onChange={(e) => {
                            const next = deepCopy(draft);
                            next.steps[idx].text = e.target.value;
                            setDraft(next);
                          }}
                          onInput={autoGrowTextarea}
                          rows={2}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                        />
                      </div>

                      <div className="grid gap-1">
                        <label className="text-xs font-bold text-slate-600">Duration</label>
                        <input
                          value={s.duration}
                          onChange={(e) => {
                            const next = deepCopy(draft);
                            next.steps[idx].duration = e.target.value;
                            setDraft(next);
                          }}
                          placeholder="e.g., around 3 hours"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* total + tip */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-extrabold text-slate-800">Summary</div>

              <div className="mt-3 grid gap-1">
                <label className="text-xs font-bold text-slate-600">Total note</label>
                <textarea
                  value={draft.totalNote}
                  onChange={(e) => setDraft({ ...draft, totalNote: e.target.value })}
                  onInput={autoGrowTextarea}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>

              <div className="mt-3 grid gap-1">
                <label className="text-xs font-bold text-slate-600">Tip box</label>
                <textarea
                  value={draft.tip}
                  onChange={(e) => setDraft({ ...draft, tip: e.target.value })}
                  onInput={autoGrowTextarea}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-gray px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
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
export default function EggFormationTab() {
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

  const steps = useMemo(() => data.steps, [data.steps]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
      {/* top header row */}
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

      {/* summary strip */}
      <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-yellow-50 p-4 ring-1 ring-yellow-200">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FiClock />
            Estimated total time
          </div>
          <div className="mt-1 text-sm text-slate-700">{data.totalNote}</div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FiInfo />
            Tip
          </div>
          <div className="mt-1 text-sm text-slate-700">{data.tip}</div>
        </div>
      </div>

      {/* timeline */}
      <div className="mt-5">
        <div className="text-md font-bold text-slate-800">Timeline steps</div>

        <div className="mt-3 grid gap-3">
          {steps.map((s, idx) => (
            <div key={s.key} className="relative rounded-2xl border border-slate-200 bg-white p-4">
              {/* left rail */}
              <div className="flex gap-4">
                <div className="relative">
                  <StepNumber n={idx + 1} />
                  {/* connector line (not on last) */}
                  {idx !== steps.length - 1 ? (
                    <div className="mx-auto mt-2 h-[calc(100%-44px)] w-[3px] rounded-full bg-slate-200" />
                  ) : null}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="text-base font-bold text-slate-900">{s.text}</div>
                    <DurationChip value={s.duration} />
                  </div>

                  {/* subtle detail footer */}
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    <span>Stage {idx + 1} in the egg-formation process</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* edit modal */}
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
