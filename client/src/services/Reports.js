// services/Reports.js
import { supabase } from "@/lib/supabase";

/** Convert Date/string -> 'YYYY-MM-DD' or null */
const toYMD = (d) => {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
};

/** Map dateRange -> { since, until } as 'YYYY-MM-DD' (inclusive) */
function resolveRange(dateRange) {
  const now = new Date();

  const ymd = (d) => d.toISOString().slice(0, 10);
  const startOfDay = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
  const endOfDay = (d) => new Date(new Date(d).setHours(23, 59, 59, 999));

  switch (dateRange) {
    case "today": {
      const s = startOfDay(now);
      const e = endOfDay(now);
      return { since: ymd(s), until: ymd(e) };
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { since: ymd(startOfDay(y)), until: ymd(endOfDay(y)) };
    }
    case "7": {
      const end = endOfDay(now);
      const start = new Date(now);
      start.setDate(now.getDate() - 6); // inclusive 7 days
      return { since: ymd(startOfDay(start)), until: ymd(end) };
    }
    case "30": {
      const end = endOfDay(now);
      const start = new Date(now);
      start.setDate(now.getDate() - 29); // inclusive 30 days
      return { since: ymd(startOfDay(start)), until: ymd(end) };
    }
    case "last_month": {
      const y = now.getFullYear();
      const m = now.getMonth(); // 0-11
      const firstOfLast = new Date(y, m - 1, 1);
      const lastOfLast = new Date(y, m, 0);
      return {
        since: ymd(startOfDay(firstOfLast)),
        until: ymd(endOfDay(lastOfLast)),
      };
    }
    case "all":
    default:
      return { since: null, until: null };
  }
}

/** Merge explicit since/until with dateRange (dateRange wins if provided) */
function rangeFromParams(params = {}) {
  if (params.dateRange && params.dateRange !== "all") {
    return resolveRange(params.dateRange);
  }
  return {
    since: params.since ? toYMD(params.since) : null,
    until: params.until ? toYMD(params.until) : null,
  };
}

/**
 * Calls RPC: view_egg_production(p_since date, p_until date, p_flock_id int)
 * @param {Object} params
 * @param {string} [params.dateRange] "all" | "today" | "yesterday" | "7" | "30" | "last_month"
 * @param {string|Date|null} [params.since]
 * @param {string|Date|null} [params.until]
 * @param {number|null} [params.flockId]
 */
export async function fetchEggProduction(params = {}) {
  const { since, until } = rangeFromParams(params);
  const p_since = toYMD(since);
  const p_until = toYMD(until);
  const p_flock_id = params.flockId ?? null;

  const { data, error } = await supabase.rpc("view_egg_production", {
    p_since,
    p_until,
    p_flock_id,
  });

  if (error) throw new Error(`[view_egg_production] ${error.message}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Calls RPC: view_egg_batch(p_since date, p_until date, p_size_id int, p_farmer_id uuid)
 * Filters by date_collected on the backend.
 */
export async function fetchEggBatch(params = {}) {
  const { since, until } = rangeFromParams(params);
  const p_since = toYMD(since);
  const p_until = toYMD(until);
  const p_size_id = params.sizeId ?? null;
  const p_farmer_id = params.farmerId ?? null;

  const { data, error } = await supabase.rpc("view_egg_batch", {
    p_since,
    p_until,
    p_size_id,
    p_farmer_id,
  });

  if (error) throw new Error(`[view_egg_batch] ${error.message}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Calls RPC: view_admin_sales_records
 * Tries with p_since/p_until first; if the RPC doesn't accept params, falls back to no-arg + client-side filter.
 */
export async function fetchAdminSalesRecords(params = {}) {
  const { since, until } = rangeFromParams(params);
  const p_since = toYMD(since);
  const p_until = toYMD(until);

  // Try param version (if your RPC supports date filtering)
  if (p_since || p_until) {
    try {
      const { data, error } = await supabase.rpc("view_admin_sales_records", {
        p_since,
        p_until,
      });
      if (!error) return Array.isArray(data) ? data : [];
      // If it errors due to unexpected params, we'll fall through to the no-arg call
      // eslint-disable-next-line no-console
      console.warn(
        "[view_admin_sales_records] param call failed, falling back:",
        error.message
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(
        "[view_admin_sales_records] param call threw, falling back:",
        e?.message || e
      );
    }
  }

  // Fallback: no-arg RPC + client-side filter by order_date
  const { data, error } = await supabase.rpc("view_admin_sales_records");
  if (error) throw new Error(`[view_admin_sales_records] ${error.message}`);

  let rows = Array.isArray(data) ? data : [];
  if (p_since || p_until) {
    const s = p_since ? new Date(p_since) : null;
    const u = p_until ? new Date(p_until) : null;
    rows = rows.filter((r) => {
      const d = r.order_date ? new Date(r.order_date) : null;
      if (!d || Number.isNaN(d.getTime())) return false;
      if (s && d < s) return false;
      if (u && d > u) return false;
      return true;
    });
  }
  return rows;
}

export async function fetchPayoutOverviewAdmin(payoutId = null) {
  const { data, error } = await supabase.rpc("view_payout_overview_admin", {
    p_payout_id: payoutId ?? null,
  });

  if (error) throw new Error(`[view_payout_overview_admin] ${error.message}`);

  // If a single id was requested, return one row (or null)
  if (payoutId != null) {
    return Array.isArray(data) ? data[0] ?? null : null;
  }

  // Otherwise return the list
  return Array.isArray(data) ? data : [];
}

/**
 * Convenience helpers if you prefer explicit calls
 */
export const fetchPayoutOverviewList = () => fetchPayoutOverviewAdmin(null);
export const fetchPayoutOverviewOne = (payoutId) =>
  fetchPayoutOverviewAdmin(payoutId);

/* ---------- Optional quick ranges ---------- */
export const todayRange = () => {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10);
  return { since: ymd, until: ymd };
};

export const last7Days = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6); // 7 days inclusive
  return {
    since: start.toISOString().slice(0, 10),
    until: end.toISOString().slice(0, 10),
  };
};

export async function fetchFarmersUnderCoop(adminId, status = "approved") {
  if (!adminId)
    throw new Error("[view_farmers_under_coop] adminId is required");

  // ✅ map to the right rpc param names and order
  const { data, error } = await supabase.rpc("view_farmers_under_coop", {
    p_admin_id: adminId, // uuid FIRST
    p_status: status, // text SECOND (use null to ignore)
  });

  if (error) throw new Error(`[view_farmers_under_coop] ${error.message}`);
  return Array.isArray(data) ? data : [];
}


export async function fetchMyFarmersList(status = "approved") {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user?.id)
    throw userErr ?? new Error("Not authenticated");

  const adminId = userRes.user.id; // must match v_admin_id.admin_id
  return fetchFarmersUnderCoop(adminId, status);
}


export async function fetchAdminProfile() {
  const { data, error } = await supabase.rpc("view_admin_profile");

  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  // function always returns max 1 row (for auth.uid())
  return rows[0] || null;
}


export async function fetchSuperadminProfile() {
  const { data, error } = await supabase.rpc("view_superadmin_profile");

  if (error) {
    console.error("Error fetching superadmin profile:", error);
    throw error;
  }

  // RPC returns a table → array of rows, but this one should only ever return 1 row
  return data?.[0] ?? null;
}
