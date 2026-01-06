// src/services/feedProgram.js
import { supabase } from "@/lib/supabase";

/* ---------------- helpers ---------------- */
async function getUidSafe() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user?.id ?? null;
}

function normNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* ---------------- queries ---------------- */

export async function fetchFeedPrograms() {
  const { data, error } = await supabase
    .from("feed_program")
    .select("feed_program_id, name, admin_id, is_default, is_active")
    .order("admin_id", { ascending: false, nullsFirst: true })
    .order("feed_program_id", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchFeedTypes() {
  const { data, error } = await supabase
    .from("feed_type")
    .select("feed_type_id, name")
    .order("feed_type_id", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function fetchFeedProgramSteps(feedProgramId) {
  const { data, error } = await supabase
    .from("feed_program_step")
    .select(
      "step_id, feed_program_id, week_no, feed_type_id, grams_per_head_per_day, feedings_per_day, lighting_hours, remarks"
    )
    .eq("feed_program_id", Number(feedProgramId))
    .order("week_no", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/* ---------------- duplication (Generic -> My Copy) ---------------- */

export async function ensureEditableFeedProgram(programId) {
  const uid = await getUidSafe();
  if (!uid) throw new Error("Not authenticated.");

  const { data: prog, error: pe } = await supabase
    .from("feed_program")
    .select("*")
    .eq("feed_program_id", Number(programId))
    .single();

  if (pe) throw pe;

  // already mine -> editable
  if (prog?.admin_id && String(prog.admin_id) === String(uid)) {
    return { editableProgramId: Number(programId), created: false };
  }

  // not generic and not mine -> block
  if (prog?.admin_id && String(prog.admin_id) !== String(uid)) {
    throw new Error("You can’t edit a feed program owned by another admin.");
  }

  // generic -> create copy
  const { data: insertedProg, error: ie } = await supabase
    .from("feed_program")
    .insert({
      admin_id: uid,
      name: `${prog?.name ?? "Feeding Program"} - My Copy`,
      is_default: false,
      is_active: true,
    })
    .select("feed_program_id")
    .single();

  if (ie) throw ie;

  const newId = insertedProg.feed_program_id;

  // load original steps
  const { data: steps, error: se } = await supabase
    .from("feed_program_step")
    .select("week_no, feed_type_id, grams_per_head_per_day, feedings_per_day, lighting_hours, remarks")
    .eq("feed_program_id", Number(programId))
    .order("week_no", { ascending: true });

  if (se) throw se;

  const stepRows = (steps ?? []).map((s) => ({
    feed_program_id: newId,
    week_no: s.week_no,
    feed_type_id: s.feed_type_id ?? null,
    grams_per_head_per_day: s.grams_per_head_per_day ?? null,
    feedings_per_day: s.feedings_per_day ?? null,
    lighting_hours: s.lighting_hours ?? null,
    remarks: s.remarks ?? "",
  }));

  // ✅ IMPORTANT:
  // If your DB has a trigger that seeds steps on program insert,
  // inserting again would violate uq_feed_program_week.
  // So we UPSERT on (feed_program_id, week_no).
  if (stepRows.length) {
    const { error: upErr } = await supabase
      .from("feed_program_step")
      .upsert(stepRows, { onConflict: "feed_program_id,week_no" });

    if (upErr) throw upErr;
  }

  return { editableProgramId: Number(newId), created: true };
}

/* ---------------- save steps ----------------
   - deletes removed by week_no
   - upserts by (feed_program_id, week_no)
*/
export async function saveFeedProgramSteps(feedProgramId, draftRows, originWeeks) {
  const uid = await getUidSafe();
  if (!uid) throw new Error("Not authenticated.");

  const pid = Number(feedProgramId);

  // delete removed weeks
  const draftWeeks = new Set(
    (draftRows ?? [])
      .map((r) => normNumber(r.week_no))
      .filter((n) => Number.isFinite(n) && n > 0)
  );

  const toDelete = (originWeeks ?? []).filter((w) => !draftWeeks.has(Number(w)));

  if (toDelete.length) {
    const { error: de } = await supabase
      .from("feed_program_step")
      .delete()
      .eq("feed_program_id", pid)
      .in("week_no", toDelete);

    if (de) throw de;
  }

  // upsert rows by unique (feed_program_id, week_no)
  const payload = (draftRows ?? []).map((r) => ({
    feed_program_id: pid,
    week_no: normNumber(r.week_no) ?? 0,
    feed_type_id: normNumber(r.feed_type_id),
    grams_per_head_per_day: normNumber(r.grams_per_head_per_day),
    feedings_per_day: normNumber(r.feedings_per_day),
    lighting_hours: normNumber(r.lighting_hours),
    remarks: (r.remarks ?? "").trim(),
  }));

  const { error: ue } = await supabase
    .from("feed_program_step")
    .upsert(payload, { onConflict: "feed_program_id,week_no" });

  if (ue) throw ue;

  return true;
}
