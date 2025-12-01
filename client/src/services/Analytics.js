// src/services/analytics.js
import { supabase } from "@/lib/supabase";

/* ----------------------------------------------------------------
 * Common helper
 * ---------------------------------------------------------------- */
function assertNoError(error) {
  if (error) throw error;
}

/* ----------------------------------------------------------------
 * 1) DASHBOARD SUMMARY + GROWTH
 * ---------------------------------------------------------------- */

/** Dashboard KPIs (uses your existing rpc_dashboard_summary) */
export async function getDashboardSummary() {
  const { data, error } = await supabase.rpc("rpc_dashboard_summary");
  if (error) throw error;

  // rpc returns a single-row table
  const row = Array.isArray(data) ? data[0] : data;

  return {
    total_active_users: row?.total_active_users ?? 0,
    total_sales_today: row?.total_sales_today ?? 0,
    total_egg_trays: row?.total_egg_trays ?? 0,
    total_farmers: row?.total_farmers ?? 0,
  };
}

/** Customer growth bars (uses your existing rpc_customer_growth) */
export async function getCustomerGrowth(days = 30) {
  const { data, error } = await supabase.rpc("rpc_customer_growth", {
    p_days: days,
  });
  if (error) throw error;
  // expected: [{ d: 'YYYY-MM-DD', new_users: int }, ...]
  return data ?? [];
}

/* ----------------------------------------------------------------
 * 2) SEASONAL PRICE HELPER
 * ---------------------------------------------------------------- */

const SEASON = [
  [1, 1.0, "balanced", "post-holiday normalization"],
  [2, 0.98, "balanced", "cool season, steady demand"],
  [3, 0.95, "not-in-demand", "start of hot season / summer break"],
  [4, 0.93, "not-in-demand", "hot season peak / lower baking"],
  [5, 0.94, "not-in-demand", "end of summer"],
  [6, 0.97, "balanced", "school opening, demand picks up"],
  [7, 1.0, "balanced", "mid-year steady"],
  [8, 1.02, "in-demand", "pre-ber uptick"],
  [9, 1.03, "in-demand", 'start of "ber" months'],
  [10, 1.05, "in-demand", "pre-holiday build"],
  [11, 1.07, "in-demand", "holiday baking demand"],
  [12, 1.1, "in-demand", "Christmas & New Year peak"],
];

/**
 * Generate Cebu monthly egg prices for a year.
 * @param {number} year       e.g. 2025
 * @param {number} basePrice  baseline PHP/tray (e.g. 300)
 */
export function getCebuSeasonalPricesLocal(
  year = new Date().getFullYear(),
  basePrice = 300
) {
  const round2 = (n) => Math.round(n * 100) / 100;
  return SEASON.map(([m, mult, tag, note]) => {
    const d = new Date(Date.UTC(year, m - 1, 1));
    return {
      month_date: d.toISOString().slice(0, 10), // YYYY-MM-DD
      price: round2(basePrice * mult),
      demand_tag: tag,
      note,
    };
  });
}

/* ----------------------------------------------------------------
 * 3) ORDER STATUS DONUT + SALES + TOP PRODUCT
 * ---------------------------------------------------------------- */

export async function getAdminOrderStatusBuckets() {
  const { data, error } = await supabase.rpc(
    "rpc_admin_order_status_4buckets"
  );
  assertNoError(error);

  const map = {
    pending: 0,
    on_delivery: 0,
    complete: 0,
    cancelled: 0,
  };

  (data ?? []).forEach((r) => {
    const k = String(r.status || "").toLowerCase();
    if (k in map) map[k] = Number(r.qty) || 0;
  });

  return {
    labels: ["pending", "on_delivery", "complete", "cancelled"],
    series: [map.pending, map.on_delivery, map.complete, map.cancelled],
    raw: data ?? [],
  };
}

/** Daily sales for ONLY this admin’s products */
export async function getSalesTimeseriesAdmin(days = 7) {
  const { data, error } = await supabase.rpc("rpc_sales_timeseries_admin", {
    p_days: days,
  });
  assertNoError(error);
  // expected: [{ d:'YYYY-MM-DD', revenue: number }]
  return (data ?? []).map((r) => ({
    d: r.d,
    revenue: Number(r.revenue || 0),
  }));
}

/** Top-selling product for ONLY this admin’s products */
export async function getTopProductAdmin(days = 30) {
  const { data, error } = await supabase.rpc("rpc_top_product_admin", {
    p_days: days,
  });
  assertNoError(error);
  // { prod_id, prod_name, trays, revenue } or null
  return data?.[0] ?? null;
}

/* ----------------------------------------------------------------
 * 4) EGG PRODUCTION TIMESERIES
 * ---------------------------------------------------------------- */

export async function getEggProductionTimeseries(days = 90) {
  const { data, error } = await supabase.rpc(
    "view_admin_egg_production_timeseries",
    { p_days: days }
  );

  if (error) {
    console.error("[getEggProductionTimeseries] RPC error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  const shaped = (data || []).map((row) => ({
    d: row.production_date,
    size_id: row.size_id,
    size_description: row.size_description,
    eggs: Number(row.total_eggs ?? 0),
  }));

  return shaped;
}

/* ----------------------------------------------------------------
 * 5) GROSS & NET INCOME (MONTHLY) – NEW IMPLEMENTATION
 * ---------------------------------------------------------------- */

/**
 * Helper: get first/last day (YYYY-MM-DD) for a month.
 * If year/month not provided, use current month.
 */
function getMonthRange(year, month) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1; // 1–12

  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0)); // day 0 of next month = last day of this month

  const fmt = (d) => d.toISOString().slice(0, 10);
  return {
    from: fmt(start),
    to: fmt(end),
  };
}

/**
 * Gross Income for a given month (single slice donut-compatible).
 * Uses RPC: view_gross_income_admin(p_date_from, p_date_to)
 */
export async function getAdminGrossIncomeBreakdown(year, month) {
  const { from, to } = getMonthRange(year, month);

  const { data, error } = await supabase.rpc("view_gross_income_admin", {
    p_date_from: from,
    p_date_to: to,
  });
  assertNoError(error);

  const row = Array.isArray(data) ? data[0] : data || null;
  const label = row?.label ?? "Gross Income";
  const amount = Number(row?.amount || 0);

  return {
    labels: [label],
    series: [amount],
    raw: data ?? [],
  };
}

/**
 * Net Income for a given month (single slice donut-compatible).
 * Uses RPC: view_net_income_admin(p_date_from, p_date_to)
 */
export async function getAdminNetIncomeBreakdown(year, month) {
  const { from, to } = getMonthRange(year, month);

  const { data, error } = await supabase.rpc("view_net_income_admin", {
    p_date_from: from,
    p_date_to: to,
  });
  assertNoError(error);

  const row = Array.isArray(data) ? data[0] : data || null;
  const label = row?.label ?? "Net Income";
  const amount = Number(row?.amount || 0);

  return {
    labels: [label],
    series: [amount],
    raw: data ?? [],
  };
}

/* ----------------------------------------------------------------
 * 6) FARMER-SIDE ALLOCATION HELPERS
 * ---------------------------------------------------------------- */

export async function fetchFarmerPendingAllocations() {
  // RPC should return pending allocations for auth.uid()
  const { data, error } = await supabase.rpc(
    "admin_farmer_view_allocations"
  );
  if (error) throw error;
  return data ?? [];
}

/* ======= CONFIRM: eggs-first, trays still supported, full confirm by default ======= */

export async function confirmMyAllocation(ordAllocationId, options) {
  const payload = {
    p_ord_allocation_id: ordAllocationId,
    p_confirm_trays: null,
    p_confirm_eggs: null,
    p_actor_id: options?.actorId ?? null,
  };

  if (typeof options?.eggs === "number") {
    payload.p_confirm_eggs = options.eggs;
  } else if (typeof options?.trays === "number") {
    payload.p_confirm_trays = options.trays;
  }

  const { data, error } = await supabase.rpc(
    "admin_farmer_confirm_allocation",
    payload
  );
  if (error) throw error;
  return data;
}

export const confirmMyAllocationFull = (id, actorId) =>
  confirmMyAllocation(id, { actorId: actorId ?? null });

export const confirmMyAllocationByTrays = (id, trays, actorId) =>
  confirmMyAllocation(id, { trays, actorId: actorId ?? null });

export const confirmMyAllocationByEggs = (id, eggs, actorId) =>
  confirmMyAllocation(id, { eggs, actorId: actorId ?? null });
