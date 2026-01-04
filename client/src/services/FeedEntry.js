// /lib/services/feedTypes.js
import { supabase } from "@/lib/supabase";

/**
 * Admin-only RPC wrapper for add_feed_type_for_coop
 * Trims inputs; empty strings become null for brand/form.
 * Returns the single row emitted by the RPC.
 */
export async function addFeedTypeForCoop({
  name,
  brand,
  form,
  current_price_per_kg = null,
  pack_size_kg = null,
}) {
  const vName = (name || "").trim();
  const vBrand = (brand || "").trim() || null;
  const vForm = (form || "").trim() || null;

  if (!vName) throw new Error("Feed type name is required.");

  const { data, error } = await supabase.rpc("add_feed_type_for_coop", {
    p_name: vName,
    p_brand: vBrand,
    p_form: vForm,
    p_current_price_per_kg: current_price_per_kg,
    p_pack_size_kg: pack_size_kg,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Admin-only RPC wrapper for update_feed_type_for_coop
 *
 * IMPORTANT behavior:
 * - Passing undefined => field will NOT be changed (we don't send it)
 * - Passing "" (empty string) => will be trimmed to null => clears brand/form in DB
 * - Passing null explicitly => keeps old value (because RPC treats NULL as "keep existing")
 *
 * For name: we only send p_name if it's provided and non-empty after trim.
 */
export async function updateFeedTypeForCoop({
  feed_type_id,
  name,
  brand,
  form,
  current_price_per_kg,
  pack_size_kg,
}) {
  if (!feed_type_id) throw new Error("Feed type ID is required.");

  // Build payload dynamically so "undefined" doesn't accidentally wipe values.
  const payload = {
    p_feed_type_id: feed_type_id,
  };

  // name: optional
  if (name !== undefined) {
    const vName = (name || "").trim();
    // If you want to allow clearing name, you can pass "" and handle server-side,
    // but usually we prevent empty names.
    payload.p_name = vName ? vName : null;
  }

  // brand/form: allow clearing by passing "" (becomes null)
  if (brand !== undefined) {
    payload.p_brand = (brand || "").trim() || ""; // send "" so RPC nullif(trim(...),'') -> NULL
  }
  if (form !== undefined) {
    payload.p_form = (form || "").trim() || ""; // same behavior
  }

  // numeric fields: only send if not undefined
  if (current_price_per_kg !== undefined) {
    payload.p_current_price_per_kg = current_price_per_kg;
  }
  if (pack_size_kg !== undefined) {
    payload.p_pack_size_kg = pack_size_kg;
  }

  const { data, error } = await supabase.rpc("update_feed_type_for_coop", payload);
  if (error) throw error;

  return Array.isArray(data) ? data[0] : data;
}

/**
 * List feed types for the current admin via the VIEW.
 * We filter by admin_id = auth.uid() on the client.
 */
export async function listMyFeedTypes() {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("view_my_feed_types")
    .select(
      "feed_type_id, name, brand, form, current_price_per_kg, pack_size_kg, admin_id"
    )
    .eq("admin_id", user.id)
    .order("feed_type_id", { ascending: false });

  if (error) throw error;
  return data || [];
}

// // /lib/services/feedTypes.js
// import { supabase } from "@/lib/supabase";

// /**
//  * Admin-only RPC wrapper for add_feed_type_for_coop
//  * Trims inputs; empty strings become null for brand/form.
//  * Returns the single row emitted by the RPC.
//  */
// export async function addFeedTypeForCoop({ name, brand, form, current_price_per_kg, pack_size_kg }) {
//   const vName = (name || "").trim();
//   const vBrand = (brand || "").trim() || null;
//   const vForm  = (form  || "").trim() || null;

//   if (!vName) throw new Error("Feed type name is required.");

//   const { data, error } = await supabase.rpc("add_feed_type_for_coop", {
//     p_name: vName,
//     p_brand: vBrand,
//     p_form: vForm,
//     p_current_price_per_kg: current_price_per_kg,
//     p_pack_size_kg: pack_size_kg,
//   });
//   if (error) throw error;

//   // RPC returns TABLE → usually [row]
//   return Array.isArray(data) ? data[0] : data;
// }

// /**
//  * Admin-only RPC wrapper for update_feed_type_for_coop
//  * Updates an existing feed type.
//  */
// export async function updateFeedTypeForCoop({ feed_type_id, name, brand, form, current_price_per_kg, pack_size_kg }) {
//   if (!feed_type_id) throw new Error("Feed type ID is required.");

//   const { data, error } = await supabase.rpc("update_feed_type_for_coop", {
//     p_feed_type_id: feed_type_id,
//     p_name: name || null,
//     p_brand: brand || null,
//     p_form: form || null,
//     p_current_price_per_kg: current_price_per_kg,
//     p_pack_size_kg: pack_size_kg,
//   });
//   if (error) throw error;

//   return Array.isArray(data) ? data[0] : data;
// }

// /**
//  * List feed types for the current admin via the VIEW.
//  * We filter by admin_id = auth.uid() on the client.
//  */
// export async function listMyFeedTypes() {
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) throw new Error("Not authenticated");

//   const { data, error } = await supabase
//     .from("view_my_feed_types")
//     .select("feed_type_id, name, brand, form, current_price_per_kg, pack_size_kg, admin_id")
//     .eq("admin_id", user.id)
//     .order("feed_type_id", { ascending: false });

//   if (error) throw error;
//   return data || [];
// }
