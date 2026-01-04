// src/components/admin/tables/FeedGuideTable.jsx
import React, { useMemo, useState } from "react";
import { FiEdit2, FiX } from "react-icons/fi";

const PAGE_SIZE = 9;

// ✅ Initial rows (lighting removed)
const INITIAL_ROWS = [
  { week: 1, feedName: "Chick Starter", gramsPerHead: 25.0, mealsPerDay: 4, remarks: "Intro" },
  { week: 2, feedName: "Chick Starter", gramsPerHead: 30.0, mealsPerDay: 4, remarks: "" },
  { week: 3, feedName: "Chick Starter", gramsPerHead: 35.0, mealsPerDay: 4, remarks: "" },
  { week: 4, feedName: "Chick Starter", gramsPerHead: 40.0, mealsPerDay: 4, remarks: "" },
  { week: 5, feedName: "Chick Starter", gramsPerHead: 45.0, mealsPerDay: 4, remarks: "" },
  { week: 6, feedName: "Chick Starter", gramsPerHead: 50.0, mealsPerDay: 4, remarks: "" },
  { week: 7, feedName: "Chick Starter", gramsPerHead: 55.0, mealsPerDay: 4, remarks: "" },
  { week: 8, feedName: "Grower", gramsPerHead: 60.0, mealsPerDay: 3, remarks: "" },
  { week: 9, feedName: "Grower", gramsPerHead: 65.0, mealsPerDay: 3, remarks: "" },

  // page 2
  { week: 10, feedName: "Grower", gramsPerHead: 70.0, mealsPerDay: 3, remarks: "" },
  { week: 11, feedName: "Grower", gramsPerHead: 72.0, mealsPerDay: 3, remarks: "" },
  { week: 12, feedName: "Grower", gramsPerHead: 74.0, mealsPerDay: 3, remarks: "" },
  { week: 13, feedName: "Grower", gramsPerHead: 76.0, mealsPerDay: 3, remarks: "" },
  { week: 14, feedName: "Grower", gramsPerHead: 78.0, mealsPerDay: 3, remarks: "" },
  { week: 15, feedName: "Grower", gramsPerHead: 80.0, mealsPerDay: 3, remarks: "" },
  { week: 16, feedName: "Grower", gramsPerHead: 82.0, mealsPerDay: 3, remarks: "" },
  { week: 17, feedName: "Grower", gramsPerHead: 84.0, mealsPerDay: 3, remarks: "" },
  { week: 18, feedName: "Grower", gramsPerHead: 85.0, mealsPerDay: 3, remarks: "Transition to layer" },
];

function format2(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(2);
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function FeedGuideTable() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [page, setPage] = useState(1);

  // modal
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    week: "",
    feedName: "",
    gramsPerHead: "",
    mealsPerDay: "",
    remarks: "",
  });

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  function globalIndexFromPageIndex(i) {
    return (safePage - 1) * PAGE_SIZE + i;
  }

  function openEdit(globalIndex) {
    const r = rows[globalIndex];
    setEditingIndex(globalIndex);
    setForm({
      week: String(r.week ?? ""),
      feedName: r.feedName ?? "",
      gramsPerHead: String(r.gramsPerHead ?? ""),
      mealsPerDay: String(r.mealsPerDay ?? ""),
      remarks: r.remarks ?? "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingIndex(null);
  }

  function saveEdit() {
    if (editingIndex === null) return;

    const next = [...rows];
    next[editingIndex] = {
      week: Number(form.week),
      feedName: form.feedName,
      gramsPerHead: Number(form.gramsPerHead),
      mealsPerDay: Number(form.mealsPerDay),
      remarks: form.remarks,
    };

    setRows(next);
    closeModal();
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[90px]" />
            <col className="w-[180px]" />
            <col className="w-[140px]" />
            <col className="w-[140px]" />
            <col className="w-[160px]" />
            <col className="w-[150px]" />
          </colgroup>

          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-6 py-3 font-semibold">Week</th>
              <th className="px-6 py-3 font-semibold">Feed Name</th>
              <th className="px-6 py-3 font-semibold">g/hd/day</th>
              <th className="px-6 py-3 font-semibold">Meals/day</th>
              <th className="px-6 py-3 font-semibold">Remarks</th>
              <th className="px-10 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {paged.map((r, i) => {
              const gi = globalIndexFromPageIndex(i);
              return (
                <tr key={`${r.week}-${gi}`} className={i % 2 ? "bg-yellow-50/30" : "bg-white"}>
                  <td className="px-6 py-4 font-bold">{r.week}</td>
                  <td className="px-6 py-4 truncate">{r.feedName}</td>
                  <td className="px-6 py-4">{format2(r.gramsPerHead)}</td>
                  <td className="px-11 py-4">{r.mealsPerDay}</td>
                  <td className="px-9 py-4 truncate">{r.remarks || "-"}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openEdit(gi)}
                      className="inline-flex items-center gap-2 rounded-xl border border-yellow-300 bg-white px-4 py-2 text-sm font-semibold text-yellow-900 hover:bg-yellow-50"
                    >
                      <FiEdit2 /> Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
          className="h-9 w-9 rounded-lg border"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`h-9 w-9 rounded-lg border ${
              safePage === i + 1 ? "bg-yellow-50 border-yellow-400" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
          className="h-9 w-9 rounded-lg border"
        >
          ›
        </button>
      </div>

      {/* Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
          <div className="w-full max-w-xl rounded-2xl bg-white">
            <div className="flex justify-between border-b px-6 py-5">
              <h3 className="font-bold">Edit Feed Guide</h3>
              <button onClick={closeModal}><FiX /></button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <Field label="Week">
                <input value={form.week} onChange={(e)=>setForm(s=>({...s,week:e.target.value}))} className="input" />
              </Field>
              <Field label="Feed Name">
                <input value={form.feedName} onChange={(e)=>setForm(s=>({...s,feedName:e.target.value}))} className="input" />
              </Field>
              <Field label="g/hd/day">
                <input value={form.gramsPerHead} onChange={(e)=>setForm(s=>({...s,gramsPerHead:e.target.value}))} className="input" />
              </Field>
              <Field label="Meals/day">
                <input value={form.mealsPerDay} onChange={(e)=>setForm(s=>({...s,mealsPerDay:e.target.value}))} className="input" />
              </Field>
              <Field label="Remarks">
                <input value={form.remarks} onChange={(e)=>setForm(s=>({...s,remarks:e.target.value}))} className="input" />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-5">
              <button onClick={closeModal}>Cancel</button>
              <button onClick={saveEdit} className="bg-yellow-400 px-5 py-2 rounded-xl">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
