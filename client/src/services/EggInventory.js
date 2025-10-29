// services/EggInventory.js
import { supabase } from "@/lib/supabase";

/** Normalize any size_description to your UI keys: XS, S, M, L, XL, J */
function normalizeSizeKey(desc) {
  const s = String(desc || "").trim().toUpperCase();
  if (["XS", "S", "M", "L", "XL", "J"].includes(s)) return s;
  if (/\bJ(UMBO)?\b/.test(s)) return "J";
  if (/EXTRA\s*SMALL|\bXS\b/.test(s)) return "XS";
  if (/\bSMALL\b|\bS\b/.test(s)) return "S";
  if (/\bMED(IUM)?\b|\bM\b/.test(s)) return "M";
  if (/EXTRA\s*LARGE|\bXL\b/.test(s)) return "XL";
  if (/\bLARGE\b|\bL\b/.test(s)) return "L";
  const token = s.split(/\s+/)[0] || "";
  return ["XS", "S", "M", "L", "XL", "J"].includes(token) ? token : "";
}

/** Header cards — totals per size (trays) */
export async function fetchEggTotals({
  from = null,
  to = null,
  includeZero = false,
  onlyManual = true,
} = {}) {
  const { data, error } = await supabase.rpc(
    "admin_view_stock_totals_by_size_live",
    {
      p_date_from: from,
      p_date_to: to,
      p_include_zero: includeZero,
      p_only_manual: onlyManual,
    }
  );
  if (error) throw error;

  const totals = { XS: 0, S: 0, M: 0, L: 0, XL: 0, J: 0 };
  (data || []).forEach((r) => {
    const key = normalizeSizeKey(r.size_description);
    if (key && totals[key] !== undefined) {
      totals[key] = Number(r.total_trays || 0);
    }
  });
  return totals;
}

/** Table — one row per farmer per date, ordered by status/expiry in SQL */
export async function fetchEggBatchesGrouped({
  farmerId = null,
  from = null,
  to = null,
  onlyManual = true,
} = {}) {
  const { data, error } = await supabase.rpc(
    "admin_view_batches_per_farmer_grouped_live",
    {
      p_farmer_id: farmerId,
      p_date_from: from,
      p_date_to: to,
      p_only_manual: onlyManual,
    }
  );
  if (error) throw error;

  return (data || []).map((r) => {
    const batchList = Array.isArray(r.batch_ids)
      ? r.batch_ids.join(", ")
      : String(r.batch_ids ?? "");

    // RPC now returns: { size, eggs, allocatable, poolable }
    const sizeBreakdown = Array.isArray(r.size_breakdown)
      ? r.size_breakdown.map((s) => ({
          size: String(s.size || "").toUpperCase(),
          qty: Number(s.allocatable ?? s.trays ?? 0), // ✅ allocatable (sum of per-batch floors)
          eggs: Number(s.eggs || 0),
          poolable: Number(s.poolable ?? 0), // info only
        }))
      : [];

    return {
      id: `${r.farmer_id}-${r.produced}`, // "<uuid>-YYYY-MM-DD"
      farmer: r.farmer_name || r.farmer_id,
      date: r.produced,
      batchId: batchList,

      // ✅ these already match allocator (no pooling)
      trayStocks: Number(r.stocks_tray || 0), // total allocatable across sizes
      looseEggs: Number(r.loose_eggs || 0),   // sum of per-batch remainders
      totalEggs: Number(r.qty_eggs || 0),

      // optional info
      poolableTrays: Number(r.poolable_trays || 0),
      poolableLoose: Number(r.poolable_loose || 0),

      status: r.status,
      daysToExpiry: r.days_to_expiry,
      sizeBreakdown,
    };
  });
}

/** Load size labels from DB (fallback to common labels) */
export async function fetchSizes() {
  try {
    const { data, error } = await supabase
      .from("size")
      .select("size_description")
      .order("size_id", { ascending: true });
    if (error) throw error;

    const labels = (data || [])
      .map((r) => String(r.size_description || "").trim().toUpperCase())
      .filter(Boolean);

    const seen = new Set();
    const uniq = labels.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));

    return uniq.length ? uniq : ["XS", "S", "M", "L", "XL", "J"];
  } catch {
    return ["XS", "S", "M", "L", "XL", "J"];
  }
}

/** Label -> { id, ept } */
export async function fetchSizeMetaMap() {
  const { data, error } = await supabase
    .from("size")
    .select("size_id, size_description, eggs_per_tray")
    .order("size_id", { ascending: true });
  if (error) throw error;

  const byLabel = {};
  (data || []).forEach((r) => {
    const label = String(r.size_description || "").trim().toUpperCase();
    if (!label) return;
    byLabel[label] = { id: r.size_id, ept: Number(r.eggs_per_tray || 30) };
  });
  return byLabel;
}

// import { supabase } from "@/lib/supabase";

// /** Normalize any size_description to your UI keys: XS, S, M, L, XL, J */
// function normalizeSizeKey(desc) {
//   const s = String(desc || "").trim().toUpperCase();
//   if (["XS", "S", "M", "L", "XL", "J"].includes(s)) return s;
//   if (/\bJ(UMBO)?\b/.test(s)) return "J";
//   if (/EXTRA\s*SMALL|\bXS\b/.test(s)) return "XS";
//   if (/\bSMALL\b|\bS\b/.test(s)) return "S";
//   if (/\bMED(IUM)?\b|\bM\b/.test(s)) return "M";
//   if (/EXTRA\s*LARGE|\bXL\b/.test(s)) return "XL";
//   if (/\bLARGE\b|\bL\b/.test(s)) return "L";
//   const token = s.split(/\s+/)[0] || "";
//   return ["XS", "S", "M", "L", "XL", "J"].includes(token) ? token : "";
// }

// /** Header cards — totals per size (trays) */
// export async function fetchEggTotals({
//   from = null,
//   to = null,
//   includeZero = false,
//   onlyManual = true,
// } = {}) {
//   const { data, error } = await supabase.rpc(
//     "admin_view_stock_totals_by_size_live",
//     {
//       p_date_from: from,
//       p_date_to: to,
//       p_include_zero: includeZero,
//       p_only_manual: onlyManual,
//     }
//   );
//   if (error) throw error;

//   const totals = { XS: 0, S: 0, M: 0, L: 0, XL: 0, J: 0 };
//   (data || []).forEach((r) => {
//     const key = normalizeSizeKey(r.size_description);
//     if (key && totals[key] !== undefined) {
//       totals[key] = Number(r.total_trays || 0);
//     }
//   });
//   return totals;
// }

// /** Table — one row per farmer per date, ordered by status/expiry in SQL */
// export async function fetchEggBatchesGrouped({
//   farmerId = null,
//   from = null,
//   to = null,
//   onlyManual = true,
// } = {}) {
//   const { data, error } = await supabase.rpc(
//     "admin_view_batches_per_farmer_grouped_live",
//     {
//       p_farmer_id: farmerId,
//       p_date_from: from,
//       p_date_to: to,
//       p_only_manual: onlyManual,
//     }
//   );
//   if (error) throw error;

//   return (data || []).map((r) => {
//     const batchList = Array.isArray(r.batch_ids)
//       ? r.batch_ids.join(", ")
//       : String(r.batch_ids ?? "");

//     const sizeBreakdown = Array.isArray(r.size_breakdown)
//       ? r.size_breakdown.map((s) => ({
//           size: s.size,
//           qty: Number(s.trays || 0),
//           eggs: Number(s.eggs || 0), // keep eggs in breakdown so modal can compute loose
//         }))
//       : [];

//     return {
//       id: `${r.farmer_id}-${r.produced}`, // "<uuid>-YYYY-MM-DD"
//       farmer: r.farmer_name || r.farmer_id,
//       date: r.produced,
//       batchId: batchList,
//       trayStocks: Number(r.stocks_tray || 0),
//       looseEggs: Number(r.loose_eggs || 0),
//       totalEggs: Number(r.qty_eggs || 0),
//       status: r.status,
//       daysToExpiry: r.days_to_expiry,
//       sizeBreakdown,
//     };
//   });
// }

// /** Load size labels from DB (fallback to common labels) */
// export async function fetchSizes() {
//   try {
//     const { data, error } = await supabase
//       .from("size")
//       .select("size_description")
//       .order("size_id", { ascending: true });
//     if (error) throw error;

//     const labels = (data || [])
//       .map((r) => String(r.size_description || "").trim().toUpperCase())
//       .filter(Boolean);

//     const seen = new Set();
//     const uniq = labels.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));

//     return uniq.length ? uniq : ["XS", "S", "M", "L", "XL", "J"];
//   } catch {
//     return ["XS", "S", "M", "L", "XL", "J"];
//   }
// }

// /** Label -> { id, ept } */
// export async function fetchSizeMetaMap() {
//   const { data, error } = await supabase
//     .from("size")
//     .select("size_id, size_description, eggs_per_tray")
//     .order("size_id", { ascending: true });
//   if (error) throw error;

//   const byLabel = {};
//   (data || []).forEach((r) => {
//     const label = String(r.size_description || "").trim().toUpperCase();
//     if (!label) return;
//     byLabel[label] = { id: r.size_id, ept: Number(r.eggs_per_tray || 30) };
//   });
//   return byLabel;
// }

// // services/EggInventory.js
// import { supabase } from "@/lib/supabase";

// /** Normalize any size_description to your UI keys: XS, S, M, L, XL, J */
// function normalizeSizeKey(desc) {
//   const s = String(desc || "").trim().toUpperCase();
//   if (["XS", "S", "M", "L", "XL", "J"].includes(s)) return s;
//   if (/\bJ(UMBO)?\b/.test(s)) return "J";
//   if (/EXTRA\s*SMALL|\bXS\b/.test(s)) return "XS";
//   if (/\bSMALL\b|\bS\b/.test(s)) return "S";
//   if (/\bMED(IUM)?\b|\bM\b/.test(s)) return "M";
//   if (/EXTRA\s*LARGE|\bXL\b/.test(s)) return "XL";
//   if (/\bLARGE\b|\bL\b/.test(s)) return "L";
//   const token = s.split(/\s+/)[0] || "";
//   return ["XS", "S", "M", "L", "XL", "J"].includes(token) ? token : "";
// }

// /** Header cards — totals per size (trays) */
// export async function fetchEggTotals({
//   from = null,
//   to = null,
//   includeZero = false,
//   onlyManual = true,
// } = {}) {
//   const { data, error } = await supabase.rpc(
//     "admin_view_stock_totals_by_size_live",
//     {
//       p_date_from: from,
//       p_date_to: to,
//       p_include_zero: includeZero,
//       p_only_manual: onlyManual,
//     }
//   );
//   if (error) throw error;

//   const totals = { XS: 0, S: 0, M: 0, L: 0, XL: 0, J: 0 };
//   (data || []).forEach((r) => {
//     const key = normalizeSizeKey(r.size_description);
//     if (key && totals[key] !== undefined) {
//       totals[key] = Number(r.total_trays || 0);
//     }
//   });
//   return totals;
// }

// /** Table — one row per farmer per date, ordered by status/expiry in SQL */
// export async function fetchEggBatchesGrouped({
//   farmerId = null,
//   from = null,
//   to = null,
//   onlyManual = true,
// } = {}) {
//   const { data, error } = await supabase.rpc(
//     "admin_view_batches_per_farmer_grouped_live",
//     {
//       p_farmer_id: farmerId,
//       p_date_from: from,
//       p_date_to: to,
//       p_only_manual: onlyManual,
//     }
//   );
//   if (error) throw error;

//   return (data || []).map((r) => {
//     const batchList = Array.isArray(r.batch_ids)
//       ? r.batch_ids.join(", ")
//       : String(r.batch_ids ?? "");

//     const sizeBreakdown = Array.isArray(r.size_breakdown)
//       ? r.size_breakdown.map((s) => ({ size: s.size, qty: Number(s.trays || 0) }))
//       : [];

//     return {
//       id: `${r.farmer_id}-${r.produced}`,
//       farmer: r.farmer_name || r.farmer_id,
//       date: r.produced,
//       batchId: batchList,          // not displayed now, but kept if needed later
//       trayStocks: Number(r.stocks_tray || 0),
//       looseEggs: Number(r.loose_eggs || 0),
//       status: r.status,            // Sell Soon | Expiring | Fresh | Expired
//       daysToExpiry: r.days_to_expiry,
//       sizeBreakdown,
//     };
//   });
// }

// // ...existing imports & code above

// /** Load size labels from DB (fallback to common labels) */
// export async function fetchSizes() {
//   try {
//     const { data, error } = await supabase
//       .from("size")
//       .select("size_description")
//       .order("size_id", { ascending: true });
//     if (error) throw error;

//     const labels = (data || [])
//       .map((r) => String(r.size_description || "").trim().toUpperCase())
//       .filter(Boolean);

//     // de-dup while preserving order
//     const seen = new Set();
//     const uniq = labels.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));

//     return uniq.length ? uniq : ["XS", "S", "M", "L", "XL", "J"];
//   } catch {
//     return ["XS", "S", "M", "L", "XL", "J"];
//   }
// }

// // services/EggInventory.js (add)

// export async function fetchSizeMetaMap() {
//   const { data, error } = await supabase
//     .from("size")
//     .select("size_id, size_description, eggs_per_tray")
//     .order("size_id", { ascending: true });
//   if (error) throw error;

//   // label (UPPER) -> { id, ept }
//   const byLabel = {};
//   (data || []).forEach((r) => {
//     const label = String(r.size_description || "").trim().toUpperCase();
//     if (!label) return;
//     byLabel[label] = { id: r.size_id, ept: Number(r.eggs_per_tray || 30) };
//   });
//   return byLabel;
// }
