// src/services/coopServicePlan.js
import { supabase } from "@/lib/supabase";

async function getAuthUid() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data?.user?.id;
  if (!uid) throw new Error("Not authenticated.");
  return uid;
}

/** ---------- Fetch ---------- */

export async function fetchMyServicePlans() {
  const adminId = await getAuthUid();

  const { data, error } = await supabase
    .from("admin_coop_service_plan")
    .select(
      "plan_id, admin_id, service_type, title, description, is_recommended, is_active, created_at"
    )
    .eq("admin_id", adminId)
    .order("plan_id", { ascending: true });

  if (error) throw error;

  // UI expects updated_at -> map created_at to updated_at (no UI change)
  return (data || []).map((row) => ({
    ...row,
    updated_at: row.created_at ?? null,
  }));
}

export async function fetchTiersByPlanIds(planIds) {
  if (!planIds?.length) return [];

  // ✅ REMOVED est_monthly from select (column doesn't exist in your DB)
  const { data, error } = await supabase
    .from("admin_coop_service_plan_tier")
    .select(
      "tier_id, plan_id, heads, est_feed_kg_month, est_sacks_month, rtl_cost, feeds_cost, total_cost, months_to_pay"
    )
    .in("plan_id", planIds)
    .order("plan_id", { ascending: true })
    .order("heads", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchTierFeedsByTierIds(tierIds) {
  if (!tierIds?.length) return [];

  const { data, error } = await supabase
    .from("admin_coop_service_plan_tier_feed")
    .select("tier_feed_id, tier_id, feed_type_id, est_feed_kg_month")
    .in("tier_id", tierIds)
    .order("tier_id", { ascending: true })
    .order("feed_type_id", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchFeedTypes() {
  const { data, error } = await supabase
    .from("feed_type")
    .select("feed_type_id, name")
    .order("name", { ascending: true });

  if (error) return [];
  return data || [];
}

/** ---------- Update Plan ---------- */

export async function updateServicePlan(planId, patch) {
  const adminId = await getAuthUid();

  const safePatch = { ...(patch || {}) };
  delete safePatch.updated_at;
  delete safePatch.created_at;
  delete safePatch.admin_id;
  delete safePatch.service_type;
  delete safePatch.plan_id;

  const { data, error } = await supabase
    .from("admin_coop_service_plan")
    .update(safePatch)
    .eq("plan_id", planId)
    .eq("admin_id", adminId)
    .select(
      "plan_id, admin_id, service_type, title, description, is_recommended, is_active, created_at"
    )
    .single();

  if (error) throw error;

  return {
    ...(data || {}),
    updated_at: data?.created_at ?? null,
  };
}

/** ---------- Tiers (Upsert/Delete) ---------- */

export async function upsertPlanTiers(rows) {
  if (!rows?.length) return [];

  const cleaned = rows.map((r) => {
    const x = { ...r };

    // remove UI-only fields if present
    delete x._k;
    delete x._deleted;

    // ✅ IMPORTANT: strip fields that DO NOT exist in DB
    delete x.est_monthly; // <--- fixes your error if modal/page included it

    // cast numeric fields
    if (x.heads != null) x.heads = Number(x.heads || 0);
    if (x.months_to_pay != null) x.months_to_pay = Number(x.months_to_pay || 0);
    if (x.est_feed_kg_month != null)
      x.est_feed_kg_month = Number(x.est_feed_kg_month || 0);
    if (x.est_sacks_month != null)
      x.est_sacks_month = Number(x.est_sacks_month || 0);
    if (x.rtl_cost != null) x.rtl_cost = Number(x.rtl_cost || 0);
    if (x.feeds_cost != null) x.feeds_cost = Number(x.feeds_cost || 0);
    if (x.total_cost != null) x.total_cost = Number(x.total_cost || 0);

    // allow insert if no tier_id
    if (!x.tier_id) delete x.tier_id;

    return x;
  });

  // ✅ REMOVED est_monthly from select (column doesn't exist)
  const { data, error } = await supabase
    .from("admin_coop_service_plan_tier")
    .upsert(cleaned, { onConflict: "tier_id" })
    .select(
      "tier_id, plan_id, heads, est_feed_kg_month, est_sacks_month, rtl_cost, feeds_cost, total_cost, months_to_pay"
    );

  if (error) throw error;
  return data || [];
}

export async function deletePlanTiers(tierIds) {
  if (!tierIds?.length) return;

  // delete tier feeds first (safe even if none)
  await supabase
    .from("admin_coop_service_plan_tier_feed")
    .delete()
    .in("tier_id", tierIds);

  const { error } = await supabase
    .from("admin_coop_service_plan_tier")
    .delete()
    .in("tier_id", tierIds);

  if (error) throw error;
}

/** ---------- Tier Feeds (Replace per Tier) ---------- */

export async function replaceTierFeeds(tierId, items) {
  const tid = Number(tierId);

  if (!Number.isFinite(tid) || tid <= 0) {
    throw new Error(
      "Invalid tier_id. Save tiers first before saving feed breakdown."
    );
  }

  if (!items?.length) {
    // optional: try to clear feeds; if RLS blocks delete it will just do nothing
    await supabase
      .from("admin_coop_service_plan_tier_feed")
      .delete()
      .eq("tier_id", tid);
    return;
  }

  // ✅ dedupe by feed_type_id (last wins)
  const map = new Map();
  for (const it of items) {
    const ftid = Number(it?.feed_type_id);
    if (!Number.isFinite(ftid) || ftid <= 0) continue;
    map.set(ftid, Number(it?.est_feed_kg_month || 0));
  }

  const payload = Array.from(map.entries()).map(
    ([feed_type_id, est_feed_kg_month]) => ({
      tier_id: tid,
      feed_type_id,
      est_feed_kg_month,
    })
  );

  if (!payload.length) return;

  // ✅ IMPORTANT: upsert using the UNIQUE constraint columns
  // this prevents duplicate key errors even if old rows still exist
  const { error: upErr } = await supabase
    .from("admin_coop_service_plan_tier_feed")
    .upsert(payload, { onConflict: "tier_id,feed_type_id" });

  if (upErr) throw upErr;

  // ✅ Optional cleanup: remove feed types not in current payload
  // (If delete is blocked by RLS, it will just delete 0 rows; that's fine.)
  const keepIds = payload.map((p) => p.feed_type_id);

  const { error: delExtraErr } = await supabase
    .from("admin_coop_service_plan_tier_feed")
    .delete()
    .eq("tier_id", tid)
    .not("feed_type_id", "in", `(${keepIds.join(",")})`);

  // Don't hard-fail on cleanup because some setups block delete via RLS
  // but the important part (no duplicates) is already solved via UPSERT.
  if (delExtraErr) {
    // comment this out if you don't want console noise
    console.warn("Cleanup delete blocked/failed:", delExtraErr.message);
  }
}

export async function fetchMyServiceAvailmentsRpc(params = {}) {
  const {
    farmerId = "",
    status = "",
    serviceType = "",
    fromDate = "", // YYYY-MM-DD
    toDate = "", // YYYY-MM-DD
    limit = 25,
    offset = 0,
  } = params;

  const rpcArgs = {
    p_farmer_id: farmerId || null,
    p_status: status || null,
    p_service_type: serviceType || null,
    p_from: fromDate || null,
    p_to: toDate || null,
    p_limit: Number(limit || 25),
    p_offset: Number(offset || 0),
  };

  const { data, error } = await supabase.rpc(
    "get_farmers_services_availment",
    rpcArgs
  );
  if (error) throw error;

  const rows = data || [];
  const total = rows.length ? Number(rows[0]?.total_count || 0) : 0;

  return { rows, count: total };
}


// ✅ Farmers dropdown list (RPC)
export async function fetchMyCoopFarmersForFilterRpc() {
  const { data, error } = await supabase.rpc("get_my_coop_farmers_for_filter");
  if (error) throw error;

  return (data || []).map((r) => ({
    user_id: r.farmer_id,
    label: r.full_name || r.farmer_id,
    contact_no: r.contact_no || "",
  }));
}