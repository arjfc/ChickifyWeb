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
