// src/components/admin/tables/FeedGuideTable.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiEdit2,
  FiX,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase";

/**
 * ✅ UI stays the same (header, dropdowns, table look).
 * ✅ Fixes:
 *  - Editing remarks no longer INSERTs (uses UPDATE for existing step_id)
 *  - Locks week (cannot change week)
 *  - Prevents duplicate week in draft (avoids uq_feed_program_week)
 *  - Adds new rows safely (auto next week, week locked)
 *  - Clear error banner like your screenshot
 */

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function asInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function asNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pickLabel(row) {
  if (!row) return "";
  return (
    row.title ??
    row.name ??
    row.label ??
    row.feed_type_name ??
    row.display_name ??
    row.code ??
    String(row.feed_type_id ?? row.id ?? "")
  );
}

export default function FeedGuideTable() {
  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState("");
  const [feedTypes, setFeedTypes] = useState([]);

  const [rows, setRows] = useState([]);
  const [filterWeek, setFilterWeek] = useState("");

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [draft, setDraft] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);

  // used to validate week cannot be changed for existing rows
  const originalWeekByIdRef = useRef(new Map());

  const filteredRows = useMemo(() => {
    const w = asInt(filterWeek);
    if (!w) return rows;
    return rows.filter((r) => Number(r.week_no) === w);
  }, [rows, filterWeek]);

  const rowsLabel = useMemo(() => {
    const shown = filteredRows.length;
    const total = rows.length;
    return `Showing ${shown} of ${total}`;
  }, [filteredRows.length, rows.length]);

  async function fetchPrograms() {
    // try common schemas: feed_program (id/title/admin_id)
    const { data, error } = await supabase
      .from("feed_program")
      .select("*")
      .order("feed_program_id", { ascending: true });

    if (error) throw error;

    const norm =
      (data ?? []).map((p) => ({
        id: String(p.feed_program_id ?? p.program_id ?? p.id ?? ""),
        title:
          p.title ??
          p.program_name ??
          p.name ??
          `Program ${p.feed_program_id ?? p.program_id ?? p.id ?? ""}`,
        raw: p,
      })) ?? [];

    setPrograms(norm);

    // choose default program only once
    if (!programId && norm.length) {
      setProgramId(norm[0].id);
    }
  }

  async function fetchFeedTypes() {
    // optional table; if missing, just keep [] and show numeric values
    const { data, error } = await supabase.from("feed_type_meta").select("*");
    if (error) {
      // don't block page if table doesn't exist
      console.warn("feed_type_meta fetch warning:", error.message);
      setFeedTypes([]);
      return;
    }
    const norm =
      (data ?? []).map((t) => ({
        id: t.feed_type_id ?? t.id,
        label: pickLabel(t),
        raw: t,
      })) ?? [];
    setFeedTypes(norm);
  }

  async function fetchSteps(pid) {
    if (!pid) return;
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase
        .from("feed_program_step")
        .select("*")
        .eq("feed_program_id", pid)
        .order("week_no", { ascending: true });

      if (error) throw error;

      const norm =
        (data ?? []).map((r) => ({
          step_id: r.step_id ?? r.id ?? null,
          feed_program_id: r.feed_program_id ?? pid,

          // canonical columns used in save
          week_no: r.week_no ?? r.week ?? r.week_number ?? null,
          feed_type_id: r.feed_type_id ?? r.feed_type ?? null,
          grams_per_head_per_day:
            r.grams_per_head_per_day ??
            r.g_per_head_per_day ??
            r.g_per_head_day ??
            null,
          feedings_per_day: r.feedings_per_day ?? r.feedings_day ?? null,
          lighting_hours: r.lighting_hours ?? r.lighting_hrs ?? null,
          remarks: r.remarks ?? "",
        })) ?? [];

      setRows(norm);

      // snapshot original weeks for "week cannot change" validation
      const m = new Map();
      for (const r of norm) {
        if (r.step_id) m.set(String(r.step_id), Number(r.week_no));
      }
      originalWeekByIdRef.current = m;
    } catch (e) {
      setErr(e?.message ?? "Failed to fetch feed program steps.");
      console.error("fetchSteps error:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function openEditor() {
    setErr("");
    setDeletedIds([]);
    setDraft(deepCopy(rows));
    setOpenEdit(true);
  }

  function closeEditor() {
    setOpenEdit(false);
  }

  function nextWeekNumber(currentDraft) {
    const weeks = new Set(
      (currentDraft ?? [])
        .map((r) => Number(r.week_no))
        .filter((n) => Number.isFinite(n) && n > 0)
    );
    // default: next after max
    let max = 0;
    for (const w of weeks) max = Math.max(max, w);
    return max + 1;
  }

  function addRow() {
    setDraft((prev) => {
      const next = deepCopy(prev ?? []);
      const week = nextWeekNumber(next);
      next.push({
        step_id: null,
        feed_program_id: programId,
        week_no: week,
        feed_type_id: null,
        grams_per_head_per_day: null,
        feedings_per_day: null,
        lighting_hours: null,
        remarks: "",
      });
      return next;
    });
  }

  function removeRow(idx) {
    setDraft((prev) => {
      const next = deepCopy(prev ?? []);
      const row = next[idx];

      // if existing row -> mark for delete
      if (row?.step_id) {
        setDeletedIds((d) => Array.from(new Set([...d, row.step_id])));
      }

      next.splice(idx, 1);
      return next;
    });
  }

  function validateDraft(d) {
    if (!programId) return "Please select a program first.";

    // no duplicates
    const seen = new Set();
    for (const r of d) {
      const w = asInt(r.week_no);
      if (!w || w <= 0) return "Week must be a positive number.";
      if (seen.has(w)) return `Duplicate week detected: week ${w}.`;
      seen.add(w);
    }

    // week cannot change for existing rows
    const m = originalWeekByIdRef.current;
    for (const r of d) {
      if (!r.step_id) continue;
      const orig = m.get(String(r.step_id));
      const now = Number(r.week_no);
      if (Number.isFinite(orig) && orig !== now) {
        return `Week cannot be changed for existing rows (step_id ${r.step_id}).`;
      }
    }

    // basic numeric sanity (optional, but prevents junk)
    for (const r of d) {
      const g = r.grams_per_head_per_day;
      const f = r.feedings_per_day;
      const l = r.lighting_hours;

      if (g !== null && g !== "" && asNum(g) !== null && asNum(g) < 0)
        return "g / head / day cannot be negative.";
      if (f !== null && f !== "" && asNum(f) !== null && asNum(f) < 0)
        return "Feedings / day cannot be negative.";
      if (l !== null && l !== "" && asNum(l) !== null && asNum(l) < 0)
        return "Lighting (hrs) cannot be negative.";
    }

    return "";
  }

  async function saveEditor() {
    const d = deepCopy(draft ?? []);
    const msg = validateDraft(d);
    if (msg) {
      setErr(msg);
      return;
    }

    setBusy(true);
    setErr("");

    try {
      const existing = d.filter((r) => !!r.step_id);
      const created = d.filter((r) => !r.step_id);

      // ✅ UPDATE existing rows only
      for (const r of existing) {
        const payload = {
          feed_type_id: r.feed_type_id ?? null,
          grams_per_head_per_day:
            r.grams_per_head_per_day === "" ? null : asNum(r.grams_per_head_per_day),
          feedings_per_day:
            r.feedings_per_day === "" ? null : asNum(r.feedings_per_day),
          lighting_hours:
            r.lighting_hours === "" ? null : asNum(r.lighting_hours),
          remarks: r.remarks ?? "",
        };

        const { error } = await supabase
          .from("feed_program_step")
          .update(payload)
          .eq("step_id", r.step_id)
          .eq("feed_program_id", programId);

        if (error) throw error;
      }

      // ✅ INSERT only brand-new rows
      if (created.length) {
        const inserts = created.map((r) => ({
          feed_program_id: programId,
          week_no: asInt(r.week_no),
          feed_type_id: r.feed_type_id ?? null,
          grams_per_head_per_day:
            r.grams_per_head_per_day === "" ? null : asNum(r.grams_per_head_per_day),
          feedings_per_day:
            r.feedings_per_day === "" ? null : asNum(r.feedings_per_day),
          lighting_hours:
            r.lighting_hours === "" ? null : asNum(r.lighting_hours),
          remarks: r.remarks ?? "",
        }));

        const { error: insErr } = await supabase
          .from("feed_program_step")
          .insert(inserts);

        if (insErr) throw insErr;
      }

      // ✅ DELETE rows marked for deletion
      if (deletedIds.length) {
        const { error: delErr } = await supabase
          .from("feed_program_step")
          .delete()
          .in("step_id", deletedIds)
          .eq("feed_program_id", programId);

        if (delErr) throw delErr;
      }

      await fetchSteps(programId);
      setOpenEdit(false);
    } catch (e) {
      setErr(e?.message ?? "Failed to save feed guide.");
      console.error("FeedGuideTable save error:", e);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchPrograms(), fetchFeedTypes()]);
      } catch (e) {
        setErr(e?.message ?? "Failed to load page data.");
        console.error("initial load error:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSteps(programId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  const feedTypeLabel = useMemo(() => {
    const m = new Map();
    for (const t of feedTypes) m.set(String(t.id), t.label);
    return (id) => {
      if (id === null || id === undefined || id === "") return "—";
      return m.get(String(id)) ?? String(id);
    };
  }, [feedTypes]);

  return (
    <>
      {/* Header (same layout style as your screenshot) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-bold text-slate-900">Feeding Guide</div>
          <div className="mt-1 text-sm text-slate-500">
            Pulled from feed_program and feed_program_step.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSteps(programId)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={openEditor}
            disabled={!programId || loading}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition",
              !programId || loading
                ? "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
            ].join(" ")}
          >
            <FiEdit2 />
            Edit
          </button>
        </div>
      </div>

      {/* Error banner */}
      {err ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      {/* Controls row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label className="text-xs font-semibold text-slate-600">
          Program
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-slate-600">
          Filter by week
          <input
            value={filterWeek}
            onChange={(e) => setFilterWeek(e.target.value)}
            placeholder="e.g. 12"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
          />
        </label>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-600">Rows</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {loading ? "Loading..." : rowsLabel}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-700">
            <tr>
              <th className="px-5 py-4">Week</th>
              <th className="px-5 py-4">Feed Type</th>
              <th className="px-5 py-4">g / head / day</th>
              <th className="px-5 py-4">Feedings / day</th>
              <th className="px-5 py-4">Lighting (hrs)</th>
              <th className="px-5 py-4">Remarks</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredRows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-slate-500" colSpan={6}>
                  {loading ? "Loading..." : "No rows found."}
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r.step_id ?? `new-${r.week_no}`}>
                  <td className="px-5 py-4 text-slate-900">{r.week_no}</td>
                  <td className="px-5 py-4 text-slate-900">
                    {feedTypeLabel(r.feed_type_id)}
                  </td>
                  <td className="px-5 py-4 text-slate-900">
                    {r.grams_per_head_per_day ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-900">
                    {r.feedings_per_day ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-900">
                    {r.lighting_hours ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-900">
                    {r.remarks || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal (same styling pattern you use) */}
      {openEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={busy ? undefined : closeEditor}
          />

          <div className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-yellow-50 px-6 py-4">
              <div className="text-lg font-semibold text-slate-900">
                Edit Feeding Guide
              </div>

              <button
                onClick={busy ? undefined : closeEditor}
                className={[
                  "rounded-xl p-2 text-slate-700 transition",
                  busy ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-100",
                ].join(" ")}
                aria-label="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">Steps</div>

                <button
                  onClick={addRow}
                  disabled={busy}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl bg-yellow-50 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-yellow-200",
                    busy ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-100",
                  ].join(" ")}
                >
                  <FiPlus />
                  Add row
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Week</th>
                      <th className="px-4 py-3">Feed Type</th>
                      <th className="px-4 py-3">g / head / day</th>
                      <th className="px-4 py-3">Feedings / day</th>
                      <th className="px-4 py-3">Lighting (hrs)</th>
                      <th className="px-4 py-3">Remarks</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {draft.map((r, idx) => (
                      <tr key={r.step_id ?? `draft-${r.week_no}-${idx}`}>
                        {/* ✅ Week locked (cannot change week) */}
                        <td className="px-4 py-3">
                          <input
                            value={r.week_no ?? ""}
                            disabled
                            className="w-20 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 outline-none"
                            title="Week is locked"
                          />
                        </td>

                        <td className="px-4 py-3">
                          {feedTypes.length ? (
                            <select
                              value={r.feed_type_id ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((prev) => {
                                  const next = deepCopy(prev);
                                  next[idx].feed_type_id = val === "" ? null : asInt(val);
                                  return next;
                                });
                              }}
                              disabled={busy}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
                            >
                              <option value="">—</option>
                              {feedTypes.map((ft) => (
                                <option key={String(ft.id)} value={ft.id}>
                                  {ft.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              value={r.feed_type_id ?? ""}
                              onChange={(e) => {
                                setDraft((prev) => {
                                  const next = deepCopy(prev);
                                  next[idx].feed_type_id = e.target.value === "" ? null : e.target.value;
                                  return next;
                                });
                              }}
                              disabled={busy}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
                              placeholder="Feed type"
                            />
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={r.grams_per_head_per_day ?? ""}
                            onChange={(e) => {
                              setDraft((prev) => {
                                const next = deepCopy(prev);
                                next[idx].grams_per_head_per_day = e.target.value;
                                return next;
                              });
                            }}
                            disabled={busy}
                            className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={r.feedings_per_day ?? ""}
                            onChange={(e) => {
                              setDraft((prev) => {
                                const next = deepCopy(prev);
                                next[idx].feedings_per_day = e.target.value;
                                return next;
                              });
                            }}
                            disabled={busy}
                            className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={r.lighting_hours ?? ""}
                            onChange={(e) => {
                              setDraft((prev) => {
                                const next = deepCopy(prev);
                                next[idx].lighting_hours = e.target.value;
                                return next;
                              });
                            }}
                            disabled={busy}
                            className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            value={r.remarks ?? ""}
                            onChange={(e) => {
                              setDraft((prev) => {
                                const next = deepCopy(prev);
                                next[idx].remarks = e.target.value;
                                return next;
                              });
                            }}
                            disabled={busy}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-yellow-200"
                            placeholder="Remarks..."
                          />
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeRow(idx)}
                            disabled={busy}
                            className={[
                              "inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200 transition",
                              busy ? "opacity-50 cursor-not-allowed" : "hover:bg-white",
                            ].join(" ")}
                            title="Remove row"
                            aria-label="Remove row"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {draft.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-slate-500">
                          No rows.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={busy ? undefined : closeEditor}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition",
                  busy
                    ? "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                Cancel
              </button>

              <button
                onClick={saveEditor}
                disabled={busy}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
                  busy ? "bg-yellow-300 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600",
                ].join(" ")}
              >
                <FiCheck className="text-base" />
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
