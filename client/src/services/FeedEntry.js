//FeedEntry.js

// // /lib/services/feedTypes.js
// import { supabase } from "@/lib/supabase";

// /**
//  * Admin-only RPC wrapper for add_feed_type_for_coop
//  * Args are trimmed; empty strings become null for brand/form.
//  * Returns the single row emitted by the RPC.
//  */
// export async function addFeedTypeForCoop({ name, brand, form }) {
//   const vName = (name || "").trim();
//   const vBrand = (brand || "").trim() || null;
//   const vForm  = (form || "").trim() || null;

//   if (!vName) throw new Error("Feed type name is required.");

//   const { data, error } = await supabase.rpc("add_feed_type_for_coop", {
//     p_name: vName,
//     p_brand: vBrand,
//     p_form: vForm,
//   });
//   if (error) throw error;

//   // RPC returns TABLE → usually [row]
//   return Array.isArray(data) ? data[0] : data;
// }

// /**
//  * List feed types for the current admin.
//  * If you have RLS (admin_id = auth.uid()) you can drop the .eq(...)
//  */
// export async function listMyFeedTypes() {
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) throw new Error("Not authenticated");

//   const { data, error } = await supabase
//     .from("feed_type")
//     .select("feed_type_id, name, brand, form, admin_id")
//     .eq("admin_id", user.id) // align with RPC (admin_id = auth.uid())
//   if (error) throw error;
//   return data || [];
// }
// /lib/services/feedTypes.js
import { supabase } from "@/lib/supabase";

/**
 * Admin-only RPC wrapper for add_feed_type_for_coop
 * Trims inputs; empty strings become null for brand/form.
 * Returns the single row emitted by the RPC.
 */
export async function addFeedTypeForCoop({ name, brand, form }) {
  const vName = (name || "").trim();
  const vBrand = (brand || "").trim() || null;
  const vForm  = (form  || "").trim() || null;

  if (!vName) throw new Error("Feed type name is required.");

  const { data, error } = await supabase.rpc("add_feed_type_for_coop", {
    p_name: vName,
    p_brand: vBrand,
    p_form: vForm,
  });
  if (error) throw error;

  // RPC returns TABLE → usually [row]
  return Array.isArray(data) ? data[0] : data;
}

/**
 * List feed types for the current admin via the VIEW.
 * We filter by admin_id = auth.uid() on the client.
 */
export async function listMyFeedTypes() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("view_my_feed_types")
    .select("feed_type_id, name, brand, form, admin_id")
    .eq("admin_id", user.id)
    .order("feed_type_id", { ascending: false });

  if (error) throw error;
  return data || [];
}
