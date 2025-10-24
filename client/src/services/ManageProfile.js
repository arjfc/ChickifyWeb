// services/Profile.js
import { supabase } from "@/lib/supabase";

/**
 * Update my profile + address using the RPC you created:
 *   rpc_upsert_my_profile_and_address(
 *     p_first_name text, p_middle_name text, p_last_name text,
 *     p_contact_no text, p_sex text, p_img_url text,
 *     p_house_number text, p_street text, p_barangay text, p_city text,
 *     p_province text, p_postal_code text, p_delivery_notes text,
 *     p_latitude numeric, p_longitude numeric
 *   )
 *
 * NOTE: Fields not supported by the RPC (e.g., username, email, full_address)
 * are ignored here on purpose.
 */
export async function updateMyUserProfile(payload) {
  // Make sure we have a signed-in user (RPC uses auth.uid())
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error("Not signed in");

  // Map your UI fields to the RPC parameters
  const params = {
    p_first_name: payload.first_name ?? null,
    p_middle_name: payload.middle_name ?? null,
    p_last_name: payload.last_name ?? null,
    p_contact_no: payload.contact_no ?? null,
    p_sex: payload.sex ?? null,
    p_img_url: payload.img_url ?? null, // optional if you store avatars

    p_house_number: payload.house_no ?? null,
    p_street: payload.street_name ?? null,
    p_barangay: payload.barangay ?? null,
    // support whichever key your UI uses
    p_city: payload.municipal ?? payload.municipality ?? payload.city ?? null,
    p_province: payload.province ?? null,
    p_postal_code: payload.zip_code ?? null,
    p_delivery_notes: payload.delivery_notes ?? null,

    // make sure we pass numeric values (or null)
    p_latitude:
      payload.latitude === undefined || payload.latitude === null
        ? null
        : Number(payload.latitude),
    p_longitude:
      payload.longitude === undefined || payload.longitude === null
        ? null
        : Number(payload.longitude),
  };

  const { data, error: rpcErr } = await supabase.rpc(
    "rpc_upsert_my_profile_and_address",
    params
  );
  if (rpcErr) throw rpcErr;

  // RPC returns something like: [{ out_profile_id, out_address_id }]
  return Array.isArray(data) ? data[0] : data;
}

/** Optional helper for gating elsewhere (unchanged) */
export function hasProfileAddress(p) {
  if (!p) return false;

  // Accept either flat shape or nested address object
  const a = p.address ?? p;

  const hasCore =
    !!a.province && !!(a.municipal ?? a.municipality ?? a.city) && !!a.barangay;
  const hasCoords =
    a.latitude !== undefined &&
    a.longitude !== undefined &&
    a.latitude !== null &&
    a.longitude !== null;

  return hasCore && hasCoords;
}
