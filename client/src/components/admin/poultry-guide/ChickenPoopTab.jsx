// src/components/admin/poultry-guide/ChickenPoopTab.jsx
import React, { useMemo, useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function autoGrowTextarea(e) {
  e.currentTarget.style.height = "auto";
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
}

function makeKey(prefix = "poop") {
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
    title: "Chicken poop",
  },
  bullets: [
    "Normal poop: brown + white cap (urates).",
    "One weird poop is common; repeated abnormal poop is the warning.",
    "Always check behavior: appetite, energy, egg production, hydration.",
  ],
  alert:
    "Blood/red repeatedly, tar-black, or very watery for 2+ days = isolate and consult a vet.",
  items: [
    {
      key: "normal",
      title: "Normal",
      status: "Normal",
      description:
        "Usually brown + a white cap. Stool is semi-solid; urates look like white dusting/cap.",
      looksLike: "Brown stool with a white urate cap",
      imageUrl: "", // base64 dataURL after attach
    },
    {
      key: "green",
      title: "Green",
      status: "Watch",
      description:
        "Often from too many greens. If repeated and bird looks weak, watch for illness signs.",
      looksLike: "Dark/bright green droppings",
      imageUrl: "",
    },
    {
      key: "yellow",
      title: "Yellow",
      status: "Watch",
      description:
        "Can be diet-related. If watery + lethargic, watch for coccidiosis and other issues.",
      looksLike: "Yellow/mustard poop",
      imageUrl: "",
    },
    {
      key: "black",
      title: "Black",
      status: "Urgent",
      description:
        "Sometimes from dark treats. Persistent black/tarry poop can signal internal bleeding.",
      looksLike: "Very dark/black, tarry droppings",
      imageUrl: "",
    },
    {
      key: "orange",
      title: "Orange",
      status: "Watch",
      description:
        "Often intestinal lining (can be normal sometimes). Monitor if it repeats.",
      looksLike: "Orange stool",
      imageUrl: "",
    },
    {
      key: "bluegreen",
      title: "Aquamarine / Blue-green",
      status: "Watch",
      description:
        "Can happen with diet change. If weak + repeated, investigate further.",
      looksLike: "Blue-green poop",
      imageUrl: "",
    },
    {
      key: "white",
      title: "White (mostly white)",
      status: "Watch",
      description:
        "Can be too much water. If repeated + sick-looking, watch for disease signs.",
      looksLike: "Mostly white watery droppings",
      imageUrl: "",
    },
    {
      key: "watery",
      title: "Clear / Watery",
      status: "Watch",
      description:
        "Often excess water/heat stress. If persistent, could be digestive issue — monitor closely.",
      looksLike: "Mostly clear liquid with small bits",
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
      title: "New poop type",
      status: "Watch",
      description: "",
      looksLike: "",
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
              Edit Chicken Poop Guide
            </div>
            <div className="text-xs text-slate-600">
              UI only — saves to local state.
            </div>
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
          {/* General */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-bold text-slate-800">
              Top Guide Notes
            </div>

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
                <label className="text-xs font-semibold text-slate-600">
                  Alert Box
                </label>
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
              <div className="text-sm font-bold text-slate-800">Poop Types</div>

              {/* ✅ Add item button inside modal */}
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
                <div
                  key={it.key}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-slate-900">
                        Item {idx + 1}
                      </div>

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
                      <label className="text-xs font-semibold text-slate-600">
                        Status
                      </label>
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

                  {/* Title */}
                  <div className="mt-3 grid gap-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Title
                    </label>
                    <input
                      value={it.title}
                      onChange={(e) => {
                        const next = deepCopy(draft);
                        next.items[idx].title = e.target.value;
                        setDraft(next);
                      }}
                      placeholder="e.g. Green"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                    />
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Description
                      </label>
                      <textarea
                        value={it.description}
                        onChange={(e) => {
                          const next = deepCopy(draft);
                          next.items[idx].description = e.target.value;
                          setDraft(next);
                        }}
                        onInput={autoGrowTextarea}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Looks like
                      </label>
                      <textarea
                        value={it.looksLike}
                        onChange={(e) => {
                          const next = deepCopy(draft);
                          next.items[idx].looksLike = e.target.value;
                          setDraft(next);
                        }}
                        onInput={autoGrowTextarea}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-yellow-200"
                      />

                      {/* ✅ Attach image inside modal */}
                      <div className="mt-3 grid gap-2">
                        <label className="text-xs font-semibold text-slate-600">
                          Image (attach)
                        </label>

                        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                          {/* Preview */}
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

                          {/* Buttons */}
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
                  </div>
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

export default function ChickenPoopTab() {
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

  const ordered = useMemo(() => data.items, [data.items]);

  return (
    <div>
      {/* Header row */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xl font-extrabold text-slate-900">
            {data.header.title}
          </div>

          <div className="mt-1 text-sm text-slate-600">
            Quick visual guide for common droppings — focus on patterns, not one off.
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
          <span className="font-bold">Heads up:</span> {data.alert}
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

            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 ring-1 ring-slate-200">
              <div className="font-bold text-slate-800">Looks like</div>
              <div className="mt-1">{it.looksLike}</div>
            </div>
          </div>
        ))}
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
