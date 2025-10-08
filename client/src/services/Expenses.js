// lib/services/expenses.js
import { supabase } from "@/lib/supabase";


export async function fetchExpenseCategories() {
  const { data, error } = await supabase
    .from("expense_categ")
    .select("exp_categ_id, exp_categ_name")
    .order("exp_categ_name");
  if (error) throw error;
  return data; // [{exp_categ_id:1, exp_categ_name:'Electricity'}, ...]
}

// /** Get distinct feed brands current user can access (RLS decides visibility) */
// export async function fetchFeedBrands() {
//   const { data, error } = await supabase
//     .from("feed_type")
//     .select("brand")
//     .order("brand", { ascending: true });
//   if (error) throw error;

//   // de-dup in JS (safe & simple)
//   const brands = Array.from(new Set((data || []).map(r => r.brand).filter(Boolean)));
//   return brands; // ["B-MEG Integra", "Pilmico", ...]
// }

// /** Get feed names for a given brand; returns full rows so you have feed_type_id */
// export async function fetchFeedTypesByBrand(brand) {
//   if (!brand) return [];
//   const { data, error } = await supabase
//     .from("feed_type")
//     .select("feed_type_id, name, brand, form")
//     .eq("brand", brand)
//     .order("name", { ascending: true });
//   if (error) throw error;
//   return data || []; // [{feed_type_id, name, brand, form}]
// }
// services/Expenses.js
/** RPC: feed_brands_for_admin → ["B-MEG Integra", "Pilmico", ...] */
export async function fetchFeedBrands() {
  const { data, error } = await supabase.rpc("feed_brands_for_admin");
  if (error) throw error;
  return (data || []).map(r => r.brand);
}

/** RPC: feed_types_by_brand(p_brand) → [{feed_type_id, name, brand, form}] */
export async function fetchFeedTypesByBrand(brand) {
  if (!brand) return [];
  const { data, error } = await supabase.rpc("feed_types_by_brand", {
    p_brand: brand,
  });
  if (error) throw error;
  return data || [];
}
//////////////////////////////////////////////////////////////////////////////////////

/**
 * Call Postgres RPC: public.add_expense(p_exp_categ_id, p_amount, p_expense_date)
 * Uses auth.uid() on the server; do not pass user_id from the client.
 * @param {{ exp_categ_id: number, amount: number, expense_date?: string|Date }} params
 * @returns {Promise<{ expenses_id: number }>}
 */
export async function addExpense({ exp_categ_id, amount, expense_date } = {}) {
  if (typeof exp_categ_id !== "number") {
    throw new Error("exp_categ_id must be a number");
  }
  if (typeof amount !== "number") {
    throw new Error("amount must be a number");
  }

  // Normalize optional date to YYYY-MM-DD
  let p_expense_date = null;
  if (expense_date instanceof Date) {
    p_expense_date = expense_date.toISOString().slice(0, 10);
  } else if (typeof expense_date === "string" && expense_date.trim()) {
    p_expense_date = expense_date;
  }

  const { data, error } = await supabase.rpc("add_expense", {
    p_exp_categ_id: exp_categ_id,
    p_amount: amount,
    p_expense_date, // null -> defaults to CURRENT_DATE in SQL
  });
  if (error) throw error;

  // returns table(expenses_id int) -> array with one row
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.expenses_id !== "number") {
    throw new Error("Unexpected RPC response: missing expenses_id");
  }
  return { expenses_id: row.expenses_id };
}

/**
 * Call RPC: add_feed_expense
 * @param {Object} p
 * @param {number} p.exp_categ_id     // category id for "Feed"
 * @param {number} p.amount
 * @param {number} p.feed_type_id     // from your feed types table
 * @param {number} p.qty_kg
 * @param {number} [p.unit_price]     // optional
 * @param {string|Date} [p.date]      // YYYY-MM-DD or Date
 * @returns {Promise<{expenses_id:number, purchase_id:number}>}
 */
export async function addFeedExpense({
  exp_categ_id,
  amount,
  feed_type_id,
  qty_kg,
  unit_price,
  date,
}) {
  if (![exp_categ_id, amount, feed_type_id, qty_kg].every((n) => typeof n === "number")) {
    throw new Error("exp_categ_id, amount, feed_type_id, qty_kg must be numbers");
  }

  let p_date = null;
  if (date instanceof Date) p_date = date.toISOString().slice(0, 10);
  else if (typeof date === "string" && date.trim()) p_date = date;

  const { data, error } = await supabase.rpc("add_feed_expense", {
    p_exp_categ_id: exp_categ_id,
    p_amount: amount,
    p_feed_type_id: feed_type_id,
    p_qty_kg: qty_kg,
    p_unit_price: typeof unit_price === "number" ? unit_price : null,
    p_date,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.expenses_id !== "number" || typeof row.purchase_id !== "number") {
    throw new Error("Unexpected RPC response");
  }
  return { expenses_id: row.expenses_id, purchase_id: row.purchase_id };
}

//////////////////////////////////////////////////////////////////////////////////////

export async function listAdminExpenses({ from, to, exp_categ_id, limit = 100, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc("view_admin_expenses", {
    p_from: from ?? null,
    p_to: to ?? null,
    p_exp_categ_id: exp_categ_id ?? null,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw error;
  return (data ?? []).map(r => ({
    expenses_id: r.expenses_id,
    user_id: r.user_id,
    owner_name: r.owner_name ?? "Me",
    exp_categ_id: r.exp_categ_id,
    exp_categ_name: r.exp_categ_name,
    amount: Number(r.amount),
    expense_date: r.expense_date,
  }));
}


export async function listFarmersExpenses({ from, to, exp_categ_id, limit = 100, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc("view_my_farmers_expenses", {
    p_from: from ?? null,
    p_to: to ?? null,
    p_exp_categ_id: exp_categ_id ?? null,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw error;
  return (data ?? []).map(r => ({
    expenses_id: r.expenses_id,
    user_id: r.user_id,
    owner_name: r.owner_name,  // farmer’s full name/email
    exp_categ_id: r.exp_categ_id,
    exp_categ_name: r.exp_categ_name,
    amount: Number(r.amount),
    expense_date: r.expense_date,
  }));
}
