// services/SuperAdminAnalytics.js
import { supabase } from "@/lib/supabase";

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* ------------------------------------------------------------------ */
/* USER COUNTS                                                        */
/* ------------------------------------------------------------------ */
export async function getUserCounts() {
  const { data, error } = await supabase.rpc("superadmin_user_counts");
  if (error) throw error;

  // SQL returns a single row; Supabase gives [row]
  const row = Array.isArray(data) ? data[0] : data || {};
  return {
    admins: safeNum(row.admins),
    farmers: safeNum(row.farmers),
    buyers: safeNum(row.buyers),
  };
}

/* ------------------------------------------------------------------ */
/* PRODUCTS                                                           */
/* ------------------------------------------------------------------ */
export async function getTotalProducts() {
  const { data, error } = await supabase.rpc("superadmin_total_products");
  if (error) throw error;
  return safeNum(Array.isArray(data) ? data[0] : data);
}

/* ------------------------------------------------------------------ */
/* SALES TODAY                                                        */
/* ------------------------------------------------------------------ */
export async function getSalesToday() {
  const { data, error } = await supabase.rpc("superadmin_sales_today");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return safeNum(row);
}

/* ------------------------------------------------------------------ */
/* COMPLETED ORDERS                                                   */
/* ------------------------------------------------------------------ */
export async function getCompletedOrders() {
  const { data, error } = await supabase.rpc("superadmin_completed_orders");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return safeNum(row);
}

/* ------------------------------------------------------------------ */
/* PENDING PAYOUTS                                                    */
/* ------------------------------------------------------------------ */
export async function getPendingPayouts() {
  const { data, error } = await supabase.rpc("superadmin_pending_payouts");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return safeNum(row);
}

/* ------------------------------------------------------------------ */
/* ADMIN FEES                                                         */
/* ------------------------------------------------------------------ */
export async function getTotalAdminFees() {
  const { data, error } = await supabase.rpc("superadmin_total_admin_fees");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return safeNum(row);
}

export async function getSalesTrendOverall(mode = "daily") {
  const { data, error } = await supabase.rpc("superadmin_sales_trend", {
    p_mode: mode,
  });

  if (error) {
    console.error("[getSalesTrendOverall] error:", error);
    throw error;
  }
  return data || [];
}

export async function getAdminFeesTimeseries(months = 6) {
  const { data, error } = await supabase.rpc(
    "view_admin_monthly_remittance_overview",
    {
      p_month: month, // 1–12
      p_year: year,   // e.g. 2024
    }
  );

  if (error) {
    console.error("[getTotalAdminFees] error:", error);
    throw error;
  }

  // Supabase RPC returns a scalar directly
  return Number(data ?? 0);
}

export async function getSuperAdminSalesTimeseries(pDays = 7) {
  const { data, error } = await supabase.rpc("superadmin_sales_timeseries", {
    p_days: pDays,
  });

  if (error) {
    console.error("[superadmin_sales_timeseries] error:", error);
    throw error;
  }

  return data || [];
}

export async function getRecentActivities(limit = 10) {
  const { data, error } = await supabase.rpc(
    "superadmin_recent_activities",
    { p_limit: limit }
  );

  if (error) throw error;
  return data ?? [];
}
