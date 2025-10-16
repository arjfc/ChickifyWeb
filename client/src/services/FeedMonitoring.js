import { supabase } from "@/lib/supabase";

/** Get current session user id (admin uuid) */
async function getSessionUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data?.user?.id;
  if (!uid) throw new Error("No signed-in user");
  return uid;
}

/** Fetch feed purchases for the signed-in admin (uses UID explicitly) */
export async function fetchFeedPurchases({
  dateFrom = null,
  dateTo = null,
  brand = null,
  feedTypeId = null,
  search = null,
} = {}) {
  const adminId = await getSessionUserId();

  console.log("[feedmonitoring] adminId:", adminId);
  const { data, error } = await supabase.rpc("feed_purchases_for_admin", {
    p_admin_id: adminId,
    p_date_from: dateFrom,
    p_date_to: dateTo,
    p_brand: brand,
    p_feed_type_id: feedTypeId,
    p_search: search,
  });

  if (error) {
    console.error("[feedmonitoring] RPC error:", error);
    throw error;
  }

  console.log("[feedmonitoring] rows:", data?.length ?? 0, data);
  return (data || []).map((r) => ({
    id: r.purchase_id,
    name: r.feed_name,
    brand: r.brand,
    form: r.form,
    qtyKg: Number(r.qty_kg ?? 0),          // ← purchased
    amountKg: Number(r.remaining_kg ?? 0), // ← remaining
    unitPrice: r.unit_price,
    totalAmount: r.total_amount,
    purchasedAt: r.purchased_at,
    expensesId: r.expenses_id,
    feedTypeId: r.feed_type_id,
  }));
}

export function sumAvailableKg(rows) {
  return rows.reduce((sum, r) => sum + (Number(r.amountKg) || 0), 0);
}

/**
 * Fetch allocations for the signed-in admin.
 * Mirrors SQL: public.feed_allocations_for_admin(p_date_from, p_date_to, p_search)
 */
export async function fetchFeedAllocations({
  dateFrom = null,
  dateTo = null,
  search = null,
} = {}) {
  const { data, error } = await supabase.rpc("feed_allocations_for_admin", {
    p_date_from: dateFrom,
    p_date_to: dateTo,
    p_search: search,
  });
  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: String(r.allocation_id),
    farmer: r.farmer_name,
    brand: r.brand,
    type: r.feed_name, // "Feed Type" column
    // 🔽 Use allocation-level remaining for your "Remaining (kg)" column
    remainingKg: Number(r.allocation_remaining_kg ?? 0),
    allocatedKg: Number(r.allocated_kg ?? 0),
    // Optional extras if you want to show/use them later:
    consumedKg: Number(r.consumed_kg ?? 0),
    purchaseRemainingKg: Number(r.purchase_remaining_kg ?? 0),
    allocationDate: r.allocated_at, // DATE
  }));
}

// optional: pretty print in UI
export const fmtKg = (n) =>
  typeof n === "number" ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0";

// export async function fetchFeedAllocations({
//   dateFrom = null,
//   dateTo = null,
//   search = null,
// } = {}) {
//   const { data, error } = await supabase.rpc("feed_allocations_for_admin", {
//     p_date_from: dateFrom,
//     p_date_to: dateTo,
//     p_search: search,
//   });
//   if (error) throw error;

//   // Normalize for UI
//   return (data || []).map((r) => ({
//     id: String(r.allocation_id),
//     farmer: r.farmer_name,
//     brand: r.brand,
//     type: r.feed_name, // your column header says "Feed Type" but SQL returns name
//     remainingKg: Number(r.remaining_kg ?? 0),
//     allocatedKg: Number(r.allocated_kg ?? 0),
//     allocationDate: r.allocated_at, // DATE
//   }));
// }

