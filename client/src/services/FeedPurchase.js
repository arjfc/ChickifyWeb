/**
 * Feed Purchase Service
 * Handles CRUD operations for feed purchases with proper validation and error handling
 */

// /lib/services/feedPurchases.js
import { supabase } from "@/lib/supabase";

/** Convert common inputs to a number or null */
function toNumberOrNull(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "string" && v.trim() === "") return null;

  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Normalize date to YYYY-MM-DD or null */
function toYmdOrNull(d) {
  if (!d) return null;

  try {
    // dayjs
    if (typeof d === "object" && typeof d.format === "function") {
      return d.format("YYYY-MM-DD");
    }

    // Date
    if (d instanceof Date && !Number.isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    // already string
    if (typeof d === "string") return d;

    return null;
  } catch (error) {
    console.error("Date conversion error:", error);
    return null;
  }
}

/**
 * Admin-only RPC wrapper for add_feed_purchase_for_coop
 * @param {Object} params - Purchase parameters
 * @param {number} params.feed_type_id - Required feed type ID
 * @param {number} params.qty_kg - Required quantity in KG (must be > 0)
 * @param {number|null} params.unit_price_per_kg - Optional price per kg
 * @param {number|null} params.price_per_sack - Optional price per sack
 * @param {string|Date|null} params.purchased_at - Optional purchase date
 * @returns {Promise<Object>} Purchase record
 * @throws {Error} Validation or database errors
 */
export async function addFeedPurchaseForCoop({
  feed_type_id,
  qty_kg,
  unit_price_per_kg = null,
  price_per_sack = null,
  purchased_at = null,
}) {
  try {
    const vFeedTypeId = toNumberOrNull(feed_type_id);
    const vQtyKg = toNumberOrNull(qty_kg);
    const vUnitPriceKg = toNumberOrNull(unit_price_per_kg);
    const vPricePerSack = toNumberOrNull(price_per_sack);
    const vPurchasedAt = toYmdOrNull(purchased_at);

    if (!vFeedTypeId) throw new Error("Feed type is required.");
    if (!vQtyKg || vQtyKg <= 0) throw new Error("qty_kg must be > 0.");

    // Never allow sending both prices
    if (vUnitPriceKg !== null && vPricePerSack !== null) {
      throw new Error("Provide either unit_price_per_kg OR price_per_sack (not both).");
    }

    if (vUnitPriceKg !== null && vUnitPriceKg < 0) {
      throw new Error("unit_price_per_kg must be >= 0.");
    }

    if (vPricePerSack !== null && vPricePerSack < 0) {
      throw new Error("price_per_sack must be >= 0.");
    }

    const { data, error } = await supabase.rpc("add_feed_purchase_for_coop", {
      p_feed_type_id: vFeedTypeId,
      p_qty_kg: vQtyKg,
      p_unit_price_per_kg: vUnitPriceKg,
      p_price_per_sack: vPricePerSack,
      p_purchased_at: vPurchasedAt,
    });

    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Failed to add feed purchase:", error);
    throw error;
  }
}

/**
 * Admin-only RPC wrapper for update_feed_purchase_for_coop
 * @param {Object} params - Update parameters
 * @param {number} params.purchase_id - Required purchase ID
 * @param {number|null} params.qty_kg - Optional quantity (only if no allocations)
 * @param {number|null} params.unit_price_per_kg - Optional price per kg
 * @param {number|null} params.price_per_sack - Optional price per sack
 * @param {string|Date|null} params.purchased_at - Optional purchase date
 * @returns {Promise<Object>} Updated purchase record
 * @throws {Error} Validation or database errors
 */
export async function updateFeedPurchaseForCoop({
  purchase_id,
  qty_kg = null,
  unit_price_per_kg = null,
  price_per_sack = null,
  purchased_at = null,
}) {
  try {
    const vPurchaseId = toNumberOrNull(purchase_id);
    const vQtyKg = toNumberOrNull(qty_kg);
    const vUnitPriceKg = toNumberOrNull(unit_price_per_kg);
    const vPricePerSack = toNumberOrNull(price_per_sack);
    const vPurchasedAt = toYmdOrNull(purchased_at);

    if (!vPurchaseId) throw new Error("Purchase ID is required.");

    // Never allow sending both prices
    if (vUnitPriceKg !== null && vPricePerSack !== null) {
      throw new Error("Provide either unit_price_per_kg OR price_per_sack (not both).");
    }

    if (vQtyKg !== null && vQtyKg <= 0) {
      throw new Error("qty_kg must be > 0.");
    }

    if (vUnitPriceKg !== null && vUnitPriceKg < 0) {
      throw new Error("unit_price_per_kg must be >= 0.");
    }

    if (vPricePerSack !== null && vPricePerSack < 0) {
      throw new Error("price_per_sack must be >= 0.");
    }

    const { data, error } = await supabase.rpc("update_feed_purchase_for_coop", {
      p_purchase_id: vPurchaseId,
      p_qty_kg: vQtyKg,
      p_unit_price_per_kg: vUnitPriceKg,
      p_price_per_sack: vPricePerSack,
      p_purchased_at: vPurchasedAt,
    });

    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Failed to update feed purchase:", error);
    throw error;
  }
}

/**
 * Fetch individual feed purchases for a specific feed type
 * @param {number} feed_type_id - Feed type ID
 * @returns {Promise<Array>} Array of purchase records
 * @throws {Error} Authentication or database errors
 */
export async function fetchFeedPurchasesByType(feed_type_id) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("view_my_feed_purchases")
      .select("*")
      .eq("admin_id", user.id)
      .eq("feed_type_id", feed_type_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch feed purchases by type:", error);
    throw error;
  }
}

/**
 * Fetch all individual feed purchase records
 * @returns {Promise<Array>} Array of all purchase records
 * @throws {Error} Authentication or database errors
 */
export async function fetchAllFeedPurchaseRecords() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("view_my_feed_purchases")
      .select("*")
      .eq("admin_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch all feed purchase records:", error);
    throw error;
  }
}

