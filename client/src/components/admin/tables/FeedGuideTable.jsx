import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiX, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import { supabase } from "@/lib/supabase";

/* ---------------- helpers ---------------- */
function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function asInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function asNum(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

function labelForProgram(p) {
  return (
    p?.title ||
    p?.name ||
    p?.program_name ||
    p?.label ||
    `Program #${p?.feed_program_id ?? p?.program_id ?? "—"}`
  );
}

function labelForFeedType(t) {
  return t?.name || t?.label || t?.feed_name || t?.title || String(t?.feed_type_id ?? "");
}

/* ---------------- component ---------------- */
export default function FeedGuideTable() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState(null);

  const [feedTypes, setFeedTypes] = useState([]);
  const feedTypeMap = useMemo(() => {
    const m = new Map();
    for (const f of feedTypes) m.set(f.feed_type_id, labelForFeedType(f));
    return m;
  }, [feedTypes]);

  const [rows, setRows] = useState([]);
  const [weekFilter, setWeekFilter] = useState("");

  /* ---- edit modal ---- */
  const [openEdit, setOpenEdit] = useState(false);
  const [draft, setDraft] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);

  const filteredRows = useMemo(() => {
    const w = String(weekFilter || "").trim();
    if (!w) return rows;
    const wn = Number(w);
    if (!Number.isFinite(wn)) return rows;
    return rows.filter((r) => Number(r.week_no) === wn);
  }, [rows, weekFilter]);

  const rowsLabel = useMemo(() => {
    const total = rows.length;
    const shown = filteredRows.length;
    return `Showing ${shown} of ${total}`;
  }, [rows, filteredRows]);

  /* ---------------- fetchers ---------------- */
  async function fetchPrograms() {
    setErr("");
    const { data, error } = await supabase
      .from("feed_program")
      .select("*")
      .order("feed_program_id", { ascending: true });

    if (error) throw error;

    setPrograms(data || []);

    // pick default if none
    if (!programId && data?.length) {
      const pid = data[0]?.feed_program_id ?? data[0]?.program_id ?? null;
      setProgramId(pid);
    }
  }

  async function fetchFeedTypes() {
    // optional table; if you don't have it, this will just fail silently
    const { data, error } = await supabase
      .from("feed_type")
      .select("*")
      .order("feed_type_id", { ascending: true });

    if (error) return; // ignore if table doesn't exist
    setFeedTypes(data || []);
  }

  async function fetchSteps(pid) {
    if (!pid) return;
    setErr("");

    const { data, error } = await supabase
      .from("feed_program_step")
      .select("*")
      .eq("feed_program_id", pid)
      .order("week_no", { ascending: true });

    if (error) throw error;

    setRows(data || []);
  }

  async function refreshAll() {
    try {
      setBusy(true);
      await Promise.all([fetchPrograms(), fetchFeedTypes()]);
      if (programId) await fetchSteps(programId);
    } catch (e) {
      setErr(e?.message ?? "Failed to load feed guide.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // refetch steps when program changes
    (async () => {
      try {
        if (!programId) return;
        setBusy(true);
        await fetchSteps(programId);
      } catch (e) {
        setErr(e?.message ?? "Failed to load feed steps.");
      } finally {
        setBusy(false);
      }
    })();
  }, [programId]);

  /* ---------------- edit logic ---------------- */
  function openEditor() {
    setErr("");
    setDeletedIds([]);

    // keep a locked snapshot of week for existing rows
    const clean = (rows || []).map((r) => ({
      step_id: r.step_id ?? null,
      _tmp: r.step_id ? null : makeId("tmp"),

      // ✅ week lock snapshot
      _origin_week: r.week_no ?? 0,

      week_no: r.week_no ?? 0,
      feed_type_id: r.feed_type_id ?? null,
      grams_per_head_per_day: r.grams_per_head_per_day ?? null,
      feedings_per_day: r.feedings_per_day ?? null,
      lighting_hours: r.lighting_hours ?? null,
      remarks: r.remarks ?? "",
    }));

    setDraft(clean);
    setOpenEdit(true);
  }

  function closeEditor() {
    setOpenEdit(false);
  }

  function updateDraftRow(idx, key, value) {
    setDraft((prev) => {
      const next = [...prev];
      const row = { ...next[idx] };

      if (key === "week_no") row.week_no = asInt(value);
      else if (key === "feed_type_id") row.feed_type_id = value === "" ? null : asInt(value);
      else if (key === "grams_per_head_per_day") row.grams_per_head_per_day = value === "" ? null : asNum(value);
      else if (key === "feedings_per_day") row.feedings_per_day = value === "" ? null : asInt(value);
      else if (key === "lighting_hours") row.lighting_hours = value === "" ? null : asNum(value);
      else if (key === "remarks") row.remarks = value;

      next[idx] = row;
      return next;
    });
  }

  function addRow() {
    const maxWeek = Math.max(
      0,
      ...draft.map((d) => Number(d.week_no || 0)).filter((n) => Number.isFinite(n))
    );

    setDraft((prev) => [
      ...prev,
      {
        step_id: null,
        _tmp: makeId("tmp"),
        _origin_week: null, // ✅ new row → week editable
        week_no: maxWeek + 1,
        feed_type_id: null,
        grams_per_head_per_day: null,
        feedings_per_day: null,
        lighting_hours: null,
        remarks: "",
      },
    ]);
  }

  function removeRow(idx) {
    setDraft((prev) => {
      const row = prev[idx];
      // if existing, remember to delete it
      if (row?.step_id) setDeletedIds((d) => [...d, row.step_id]);
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  }

  function validateDraft() {
    // 1) week required and positive
    for (const r of draft) {
      const w = Number(r.week_no);
      if (!Number.isFinite(w) || w <= 0) {
        return "Week must be a positive number.";
      }
    }

    // 2) existing row week cannot change
    for (const r of draft) {
      const locked = r._origin_week !== null && r._origin_week !== undefined;
      if (locked && Number(r.week_no) !== Number(r._origin_week)) {
        return `Week cannot be changed for existing rows (Week ${r._origin_week}). Add a new row instead.`;
      }
    }

    // 3) no duplicate weeks inside draft
    const seen = new Set();
    for (const r of draft) {
      const k = String(Number(r.week_no));
      if (seen.has(k)) return `Duplicate week detected in editor: Week ${k}.`;
      seen.add(k);
    }

    // 4) new rows cannot use an existing week (prevents accidental overwrite on upsert)
    const originalWeeks = new Set(rows.map((r) => String(Number(r.week_no))));
    for (const r of draft) {
      const isNew = !r.step_id;
      const k = String(Number(r.week_no));
      if (isNew && originalWeeks.has(k)) {
        return `Week ${k} already exists. Edit the existing row instead of adding a new one.`;
      }
    }

    return "";
  }

  async function saveEditor() {
    if (!programId) return;

    const msg = validateDraft();
    if (msg) {
      setErr(msg);
      return;
    }

    setErr("");
    setBusy(true);

    try {
      // 1) delete removed existing rows
      if (deletedIds.length) {
        const { error: delErr } = await supabase
          .from("feed_program_step")
          .delete()
          .in("step_id", deletedIds);

        if (delErr) throw delErr;
      }

      // 2) upsert current draft
      const payload = draft.map((r) => ({
        step_id: r.step_id ?? undefined, // keep if exists
        feed_program_id: programId,
        week_no: Number(r.week_no),
        feed_type_id: r.feed_type_id ?? null,
        grams_per_head_per_day: r.grams_per_head_per_day ?? null,
        feedings_per_day: r.feedings_per_day ?? null,
        lighting_hours: r.lighting_hours ?? null,
        remarks: r.remarks ?? "",
      }));

      // IMPORTANT: onConflict matches your constraint uq_feed_program_week (feed_program_id, week_no)
      const { error: upErr } = await supabase
        .from("feed_program_step")
        .upsert(payload, { onConflict: "feed_program_id,week_no" });

      if (upErr) throw upErr;

      // 3) refresh
      await fetchSteps(programId);
      setOpenEdit(false);
    } catch (e) {
      // shows the same banner error you’re seeing in screenshot
      setErr(e?.message ?? "Failed to save feed guide.");
      console.error("FeedGuideTable save error:", e);
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- render ---------------- */
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-bold text-slate-900">Feeding Guide</div>
          <div className="mt-1 text-sm text-slate-500">
            Pulled from <span className="font-mono">feed_program</span> and{" "}
            <span className="font-mono">feed_program_step</span>.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
          >
            ⟳ Refresh
          </button>
          <button
            onClick={openEditor}
            disabled={busy || !programId}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <FiEdit2 className="text-base" />
            Edit
          </button>
        </div>
      </div>

      {/* Error banner (same style as screenshot) */}
      {err ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      {/* Filters row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div>
          <div className="text-xs font-semibold text-slate-600">Program</div>
          <select
            value={programId ?? ""}
            onChange={(e) => setProgramId(asInt(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
          >
            {programs.map((p) => {
              const pid = p.feed_program_id ?? p.program_id;
              return (
                <option key={pid} value={pid}>
                  {labelForProgram(p)}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-600">Filter by week</div>
          <input
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            placeholder="e.g. 12"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-600">Rows</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{rowsLabel}</div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full table-auto">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-bold text-slate-700">
              <th className="px-5 py-4">Week</th>
              <th className="px-5 py-4">Feed Type</th>
              <th className="px-5 py-4">g / head / day</th>
              <th className="px-5 py-4">Feedings / day</th>
              <th className="px-5 py-4">Lighting (hrs)</th>
              <th className="px-5 py-4">Remarks</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-sm text-slate-500">
                  No rows found.
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r.step_id ?? makeId("row")} className="border-t border-slate-200 text-sm">
                  <td className="px-5 py-4">{r.week_no ?? "—"}</td>
                  <td className="px-5 py-4">
                    {feedTypeMap.get(r.feed_type_id) ?? r.feed_type_id ?? "—"}
                  </td>
                  <td className="px-5 py-4">{r.grams_per_head_per_day ?? "—"}</td>
                  <td className="px-5 py-4">{r.feedings_per_day ?? "—"}</td>
                  <td className="px-5 py-4">{r.lighting_hours ?? "—"}</td>
                  <td className="px-5 py-4">{r.remarks ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={closeEditor} />

          <div className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-yellow-50 px-6 py-4">
              <div className="text-lg font-semibold text-slate-900">Edit Feeding Guide</div>
              <button
                onClick={closeEditor}
                className="rounded-xl p-2 text-slate-700 transition hover:bg-yellow-100"
                aria-label="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">
                  Program: <span className="font-bold text-slate-900">{programId}</span>
                </div>

                <button
                  onClick={addRow}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-50 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-yellow-200 hover:bg-yellow-100"
                >
                  <FiPlus />
                  Add row
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-auto">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-bold text-slate-700">
                      <th className="px-4 py-3">Week</th>
                      <th className="px-4 py-3">Feed Type</th>
                      <th className="px-4 py-3">g / head / day</th>
                      <th className="px-4 py-3">Feedings / day</th>
                      <th className="px-4 py-3">Lighting (hrs)</th>
                      <th className="px-4 py-3">Remarks</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {draft.map((r, idx) => {
                      const locked =
                        r._origin_week !== null && r._origin_week !== undefined;

                      return (
                        <tr key={r.step_id ?? r._tmp} className="border-t border-slate-200 text-sm">
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={r.week_no ?? ""}
                              onChange={(e) => updateDraftRow(idx, "week_no", e.target.value)}
                              disabled={locked}
                              title={locked ? "Week is locked for existing rows" : ""}
                              className={[
                                "w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-200",
                                locked ? "cursor-not-allowed bg-slate-100 text-slate-500" : "",
                              ].join(" ")}
                            />
                          </td>

                          <td className="px-4 py-3">
                            <select
                              value={r.feed_type_id ?? ""}
                              onChange={(e) => updateDraftRow(idx, "feed_type_id", e.target.value)}
                              className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-200"
                            >
                              <option value="">—</option>
                              {feedTypes.map((ft) => (
                                <option key={ft.feed_type_id} value={ft.feed_type_id}>
                                  {labelForFeedType(ft)}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={r.grams_per_head_per_day ?? ""}
                              onChange={(e) =>
                                updateDraftRow(idx, "grams_per_head_per_day", e.target.value)
                              }
                              className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-200"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={r.feedings_per_day ?? ""}
                              onChange={(e) => updateDraftRow(idx, "feedings_per_day", e.target.value)}
                              className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-200"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={r.lighting_hours ?? ""}
                              onChange={(e) => updateDraftRow(idx, "lighting_hours", e.target.value)}
                              className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-200"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              value={r.remarks ?? ""}
                              onChange={(e) => updateDraftRow(idx, "remarks", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-200"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeRow(idx)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
                              title="Remove"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={closeEditor}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEditor}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-yellow-600 disabled:opacity-60"
              >
                <FiCheck className="text-base" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
