// src/components/admin/poultry-guide/HeatStressTab.jsx
import React, { useMemo, useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import { LuChevronDown, LuChevronUp, LuThermometerSun } from "react-icons/lu";

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

function makeKey(prefix = "heat") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STATUS_STYLES = {
  Normal: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Watch: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Urgent: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const DEFAULT_DATA = {
  header: {
    title: "Heat stress: signs + what to do",
    tag: "Hot weather",
  },
  bullets: [
    "Early signs: open-mouth panting, faster breathing, wings held away from body.",
    "Behavior: less movement, more resting, reduced feed intake, drinking more water.",
    "Physical: pale comb/wattles, weakness/limp posture.",
    "Egg impact: fewer eggs + thinner shells because birds eat less.",
    "Do now: shade, ventilation, cool clean water (multiple points), electrolytes if available.",
    "Emergency: limp/unresponsive = cool immediately (cool water, not ice; avoid soaking head).",
  ],
  alert:
    "If a chicken becomes limp/unconscious, treat it as an emergency and cool immediately.",
  items: [
    {
      key: "panting",
      title: "Open-mouth panting",
      status: "Watch",
      description:
        "Bird breathes with open beak and faster breathing to release heat. Provide shade and airflow.",
      imageUrl: "",
    },
    {
      key: "wings",
      title: "Wings held out",
      status: "Watch",
      description:
        "Cooling posture: wings away from body to release heat. Improve ventilation and reduce crowding.",
      imageUrl: "",
    },
    {
      key: "lethargy",
      title: "Lethargy / weak posture",
      status: "Watch",
      description:
        "Less movement, sitting more, looks tired. Offer cool water and place in shaded area.",
      imageUrl: "",
    },
    {
      key: "palecomb",
      title: "Pale comb/wattles",
      status: "Watch",
      description:
        "Can indicate stress and reduced circulation. Monitor closely and cool environment.",
      imageUrl: "",
    },
    {
      key: "eggdrop",
      title: "Egg drop / thin shells",
      status: "Watch",
      description:
        "Heat reduces appetite and calcium intake. Ensure access to water and minerals; cool the coop.",
      imageUrl: "",
    },
    {
      key: "collapse",
      title: "Collapse / unresponsive",
      status: "Urgent",
      description:
        "Emergency. Cool immediately using cool water (not ice). Keep airway clear and consult a vet.",
      imageUrl: "",
    },
  ],
};

function Pill({ status }) {
  const cls =
    STATUS_STYLES[status] ?? "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold",
        cls,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function PhotoBox({ imageUrl, title }) {
  return (
    <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-200">
      <div className="aspect-[16/10] w-full bg-gradient-to-br from-yellow-50 via-white to-slate-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              Image placeholder
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditModal({ open, onClose, draft, setDraft, onSave }) {
  if (!open) return null;

  const addItem = () => {
    const next = deepCopy(draft);
    next.items.push({
      key: makeKey(),
      title: "New sign",
      status: "Watch",
      description: "",
      imageUrl: "",
    });
    setDraft(next);
  };

  const removeItem = (idx) => {
    const next = deepCopy(draft);
    next.items.splice(idx, 1);
    setDraft(next);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <div className="text-base font-bold text-slate-900">
              Edit Heat Stress Guide
            </div>
            <div className="text-xs text-slate-600">UI only — saves to local state.</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 hover:bg-white hover:text-slate-900 ring-1 ring-slate-200"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-auto px-5 py-5">
          {/* Header fields */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-800">Header</div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-slate-600">Title</label>
                <input
                  value={draft.header.title}
                  onChange={(e) =>
                    setDraft({ ...draft, header: { ...draft.header, title: e.target.value } })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-slate-600">Tag</label>
                <input
                  value={draft.header.tag}
                  onChange={(e) =>
                    setDraft({ ...draft, header: { ...draft.header, tag: e.target.value } })
                  }
                  placeholder="e.g. Hot weather"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
            </div>
          </div>

          {/* Bullets + Alert */}
          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-800">Key Notes</div>

            <div className="mt-3 grid gap-3">
              {draft.bullets.map((b, idx) => (
                <div key={idx} className="grid gap-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Bullet {idx + 1}
                  </label>
                  <textarea
                    value={b}
                    onChange={(e) => {
                      const next = deepCopy(draft);
                      next.bullets[idx] = e.target.value;
                      setDraft(next);
                    }}
                    onInput={autoGrowTextarea}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                  />
                </div>
              ))}

              <div className="grid gap-1">
                <label className="text-xs font-semibold text-slate-600">Emergency Alert</label>
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

          {/* Items */}
          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-bold text-slate-800">Signs Cards</div>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
              >
                <FiPlus />
                Add item
              </button>
            </div>

            <div className="mt-3 grid gap-4">
              {draft.items.map((it, idx) => (
                <div key={it.key} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-slate-900">Item {idx + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        title="Remove this item"
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600">Status</label>
                      <select
                        value={it.status}
                        onChange={(e) => {
                          const next = deepCopy(draft);
                          next.items[idx].status = e.target.value;
                          setDraft(next);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-200"
                      >
                        <option>Normal</option>
                        <option>Watch</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">Title</label>
                      <input
                        value={it.title}
                        onChange={(e) => {
                          const next = deepCopy(draft);
                          next.items[idx].title = e.target.value;
                          setDraft(next);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">Description</label>
                      <textarea
                        value={it.description}
                        onChange={(e) => {
                          const next = deepCopy(draft);
                          next.items[idx].description = e.target.value;
                          setDraft(next);
                        }}
                        onInput={autoGrowTextarea}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                      />
                    </div>
                  </div>

                  {/* Attach image */}
                  <div className="mt-3 grid gap-2">
                    <label className="text-xs font-semibold text-slate-600">Image (attach)</label>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                      <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
                        <div className="aspect-[16/10] w-full bg-slate-50">
                          {it.imageUrl ? (
                            <img
                              src={it.imageUrl}
                              alt={`${it.title} preview`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <div className="rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                No image attached
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300">
                          Attach image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const dataUrl = await readFileAsDataURL(file);

                              const next = deepCopy(draft);
                              next.items[idx].imageUrl = dataUrl;
                              setDraft(next);

                              e.target.value = "";
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const next = deepCopy(draft);
                            next.items[idx].imageUrl = "";
                            setDraft(next);
                          }}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* end attach */}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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

export default function HeatStressTab() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [openEdit, setOpenEdit] = useState(false);
  const [draft, setDraft] = useState(() => deepCopy(DEFAULT_DATA));
  const [expanded, setExpanded] = useState(true);

  const open = () => {
    setDraft(deepCopy(data));
    setOpenEdit(true);
  };

  const close = () => setOpenEdit(false);

  const save = () => {
    setData(deepCopy(draft));
    setOpenEdit(false);
  };

  const ordered = useMemo(() => data.items, [data.items]);

  return (
    <div>
      {/* Header row */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[260px]">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50 ring-1 ring-yellow-200">
              <LuThermometerSun className="text-xl text-yellow-700" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-extrabold text-slate-900">
                  {data.header.title}
                </div>
                {data.header.tag ? (
                  <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-bold text-yellow-800 ring-1 ring-yellow-200">
                    {data.header.tag}
                  </span>
                ) : null}
              </div>

              <div className="mt-1 text-sm text-slate-600">
                Quick checklist for hot days — respond early to prevent collapse.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            title="Collapse/Expand"
          >
            {/* {expanded ? <LuChevronUp /> : <LuChevronDown />}
            {expanded ? "Collapse" : "Expand"} */}
          </button>

          <button
            onClick={open}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-300"
          >
            <FiEdit2 />
            Edit
          </button>
        </div>
      </div>

      {!expanded ? null : (
        <>
          {/* Notes + alert */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <ul className="grid gap-2 text-sm text-slate-700">
              {data.bullets.map((b, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm text-slate-800 ring-1 ring-yellow-200">
              <span className="font-bold">Emergency:</span> {data.alert}
            </div>
          </div>

          {/* Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((it) => (
              <div
                key={it.key}
                className="group rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-base font-extrabold text-slate-900">
                    {it.title}
                  </div>
                  <Pill status={it.status} />
                </div>

                <div className="mt-3">
                  <PhotoBox imageUrl={it.imageUrl} title={it.title} />
                </div>

                <div className="mt-3 text-sm text-slate-700">{it.description}</div>
              </div>
            ))}
          </div>
        </>
      )}

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
