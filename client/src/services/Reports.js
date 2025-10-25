import { supabase } from "@/lib/supabase";

/** Convert Date/string -> 'YYYY-MM-DD' or null */
const toYMD = (d) => {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10); // keep same ISO->YMD style you use elsewhere
};

/**
 * Calls RPC: view_egg_production(p_since date, p_until date, p_flock_id int)
 * @param {Object} params
 * @param {string|Date|null} [params.since] inclusive start date
 * @param {string|Date|null} [params.until] inclusive end date
 * @param {number|null} [params.flockId] filter by flock_id
 * @returns {Promise<Array>} rows from RPC (each row has farmer_name, size_description, etc.)
 */
export async function fetchEggProduction(params = {}) {
  const p_since = toYMD(params.since ?? null);
  const p_until = toYMD(params.until ?? null);
  const p_flock_id = params.flockId ?? null;

  const { data, error } = await supabase.rpc("view_egg_production", {
    p_since,
    p_until,
    p_flock_id,
  });

  if (error) {
    // Bubble up a concise error
    throw new Error(`[view_egg_production] ${error.message}`);
  }

  return Array.isArray(data) ? data : [];
}

/**
 * Calls RPC: view_egg_batch(p_since date, p_until date, p_size_id int, p_farmer_id uuid)
 * @param {Object} params
 * @param {string|Date|null} [params.since] inclusive start date (filters date_collected)
 * @param {string|Date|null} [params.until] inclusive end date (filters date_collected)
 * @param {number|null}      [params.sizeId] filter by size_id
 * @param {string|null}      [params.farmerId] UUID of farmer to filter
 * @returns {Promise<Array>} rows from RPC (each row has farmer_name, size_description, etc.)
 */
export async function fetchEggBatch(params = {}) {
  const p_since = toYMD(params.since ?? null);
  const p_until = toYMD(params.until ?? null);
  const p_size_id = params.sizeId ?? null;
  const p_farmer_id = params.farmerId ?? null;

  const { data, error } = await supabase.rpc("view_egg_batch", {
    p_since,
    p_until,
    p_size_id,
    p_farmer_id,
  });

  if (error) {
    throw new Error(`[view_egg_batch] ${error.message}`);
  }

  return Array.isArray(data) ? data : [];
}


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
