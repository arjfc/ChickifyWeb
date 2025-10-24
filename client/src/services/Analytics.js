import { supabase } from "@/lib/supabase";

function assertNoError(error) {
  if (error) throw error;
}

/** Dashboard KPIs (uses your existing rpc_dashboard_summary) */
export async function getDashboardSummary() {
  const { data, error } = await supabase.rpc("rpc_dashboard_summary");
  if (error) throw error;
  // rpc returns a single-row table
  const row = Array.isArray(data) ? data[0] : data;
  return {
    total_active_users: row?.total_active_users ?? 0,
    total_sales_today:  row?.total_sales_today  ?? 0,
    total_egg_trays:    row?.total_egg_trays    ?? 0,
  };
}

/** Customer growth bars (uses your existing rpc_customer_growth) */
export async function getCustomerGrowth(days = 30) {
  const { data, error } = await supabase.rpc("rpc_customer_growth", { p_days: days });
  if (error) throw error;
  // expected: [{ d: 'YYYY-MM-DD', new_users: int }, ...]
  return (data ?? []);
}





const SEASON = [
  [1,  1.00, 'balanced',      'post-holiday normalization'],
  [2,  0.98, 'balanced',      'cool season, steady demand'],
  [3,  0.95, 'not-in-demand', 'start of hot season / summer break'],
  [4,  0.93, 'not-in-demand', 'hot season peak / lower baking'],
  [5,  0.94, 'not-in-demand', 'end of summer'],
  [6,  0.97, 'balanced',      'school opening, demand picks up'],
  [7,  1.00, 'balanced',      'mid-year steady'],
  [8,  1.02, 'in-demand',     'pre-ber uptick'],
  [9,  1.03, 'in-demand',     'start of “ber” months'],
  [10, 1.05, 'in-demand',     'pre-holiday build'],
  [11, 1.07, 'in-demand',     'holiday baking demand'],
  [12, 1.10, 'in-demand',     'Christmas & New Year peak'],
];

/**
 * Generate Cebu monthly egg prices for a year.
 * @param {number} year       e.g. 2025
 * @param {number} basePrice  baseline PHP/tray (e.g. 300)
 * @returns {Array<{month_date:string, price:number, demand_tag:string, note:string}>}
 */
export function getCebuSeasonalPricesLocal(
  year = new Date().getFullYear(),
  basePrice = 300
) {
  const round2 = (n) => Math.round(n * 100) / 100;
  return SEASON.map(([m, mult, tag, note]) => {
    const d = new Date(Date.UTC(year, m - 1, 1));
    return {
      month_date: d.toISOString().slice(0, 10), // YYYY-MM-DD (first of month)
      price: round2(basePrice * mult),
      demand_tag: tag,
      note,
    };
  });
}




export async function getAdminOrderStatusBuckets() {
  const { data, error } = await supabase.rpc("rpc_admin_order_status_4buckets");
  assertNoError(error);

  const map = { pending: 0, on_delivery: 0, complete: 0, cancelled: 0 };
  (data ?? []).forEach((r) => {
    const k = String(r.status || "").toLowerCase();
    if (k in map) map[k] = Number(r.qty) || 0;
  });

  // Debug to verify we’re getting rows
  console.group("[rpc_admin_order_status_4buckets]");
  console.table(data ?? []);
  console.log("normalized:", map);
  console.groupEnd();

  return {
    labels: ["pending", "on_delivery", "complete", "cancelled"],
    series: [map.pending, map.on_delivery, map.complete, map.cancelled],
    raw: data ?? [],
  };
}

/** Daily sales for ONLY this admin’s products */
export async function getSalesTimeseriesAdmin(days = 7) {
  const { data, error } = await supabase.rpc("rpc_sales_timeseries_admin", { p_days: days });
  assertNoError(error);
  // expected: [{ d:'YYYY-MM-DD', revenue: number }]
  return (data ?? []).map(r => ({ d: r.d, revenue: Number(r.revenue || 0) }));
}

/** Top-selling product for ONLY this admin’s products */
export async function getTopProductAdmin(days = 30) {
  const { data, error } = await supabase.rpc("rpc_top_product_admin", { p_days: days });
  assertNoError(error);
  return data?.[0] ?? null; // { prod_id, prod_name, trays, revenue } or null
}