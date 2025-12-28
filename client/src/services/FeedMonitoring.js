import { supabase } from "@/lib/supabase";

/** Get current session user id (admin uuid) */
async function getSessionUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data?.user?.id;
  if (!uid) throw new Error("No signed-in user");
  return uid;
}

/** Fetch feed purchases for the signed-in admin (uses new view) */

export async function fetchFeedPurchases() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("view_my_feed_purchases")
    .select(
      `
      purchase_id,
      admin_id,
      feed_type_id,
      feed_name,
      brand,
      form,
      remaining_kg,
      purchased_at,
      created_at
    `
    )
    .eq("admin_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Group by feed type and combine amounts, filter out zero stock
  const grouped = {};
  (data || []).forEach((r) => {
    const remainingKg = Number(r.remaining_kg || 0);
    if (remainingKg <= 0) return; // Skip purchases with no remaining stock
    
    const key = `${r.feed_type_id}-${r.feed_name}-${r.brand}-${r.form}`;
    
    if (grouped[key]) {
      // Combine with existing entry
      grouped[key].amountKg += remainingKg;
      // Collect all purchase records for editing
      grouped[key].purchases.push({
        purchase_id: r.purchase_id,
        remaining_kg: remainingKg,
        purchased_at: r.purchased_at,
        created_at: r.created_at
      });
      // Keep the most recent purchase date
      if (new Date(r.purchased_at) > new Date(grouped[key].purchased_at)) {
        grouped[key].purchased_at = r.purchased_at;
      }
    } else {
      // Create new entry
      grouped[key] = {
        id: r.feed_type_id, // Use feed_type_id as unique identifier for display
        name: r.feed_name,
        brand: r.brand,
        form: r.form,
        amountKg: remainingKg,
        purchased_at: r.purchased_at,
        created_at: r.created_at,
        feed_type_id: r.feed_type_id,
        purchases: [{
          purchase_id: r.purchase_id,
          remaining_kg: remainingKg,
          purchased_at: r.purchased_at,
          created_at: r.created_at
        }]
      };
    }
  });

  // Convert back to array and sort by most recent purchase
  return Object.values(grouped).sort((a, b) => 
    new Date(b.purchased_at) - new Date(a.purchased_at)
  );
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
    form: r.form,
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

/**
 * Fetch farmers for feed allocation using RPC
 */
export async function fetchFarmersForFeedAllocation(onlyActive = true) {
  try {
    console.log("Calling RPC admin_list_farmers_for_feed_allocation with:", { p_only_active: onlyActive });
    
    const { data, error } = await supabase.rpc("admin_list_farmers_for_feed_allocation", {
      p_only_active: onlyActive
    });

    console.log("RPC response:", { data, error });

    if (error) {
      console.error("RPC error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    const result = (data || []).map((r) => ({
      id: String(r.farmer_id),
      name: r.name,
      email: r.email,
      contactNo: r.contact_no,
      totalRemainingKg: Number(r.total_remaining_kg || 0),
      lastAllocatedAt: r.last_allocated_at,
      activeAllocationsCount: Number(r.active_allocations_count || 0),
      isActive: r.is_active,
    }));
    
    console.log("Processed farmers:", result);
    return result;
  } catch (error) {
    console.error("Service error:", error);
    return [];
  }
}