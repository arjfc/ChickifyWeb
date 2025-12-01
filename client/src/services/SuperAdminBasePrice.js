// src/services/SuperadminBasePrice.js
import { supabase } from "@/lib/supabase";

/**
 * Fetch all sizes + their global base prices.
 * Assumes table is "size" with these columns:
 *   size_id, size_description, eggs_per_tray, price_per_tray
 */
export async function fetchSizeBasePrices() {
  const { data, error } = await supabase
    .from("size")
    .select(
      "size_id, size_description, eggs_per_tray, price_per_tray"
    )
    .order("size_id", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Call your RPC to update a single size's base price.
 * Adjust argument names if your RPC uses different ones.
 */
export async function updateSizeBasePrice(sizeId, newPricePerTray) {
  const { data, error } = await supabase.rpc("update_size_base_price", {
    // ⚠️ change arg names here if your RPC uses different ones
    p_size_id: sizeId,
    p_price_per_tray: newPricePerTray,
  });

  if (error) throw error;
  return data;
}
