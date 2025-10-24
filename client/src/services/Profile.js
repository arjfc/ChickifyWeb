// services/Profile.js
import { supabase } from "@/lib/supabase";

/** Current auth user (throws if unauthenticated) */
async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user ?? null;
}

/**
 * Load the current user's profile using your RPC: rpc_my_profile_full
 * RPC returns (as you showed):
 *   user_id, first_name, last_name, middle_name, contact_no, sex,
 *   address_id, house_number, street, barangay, city, province,
 *   postal_code, latitude, longitude
 */
export async function getMyUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc("rpc_my_profile_full");
  if (error) throw error;

  // rpc_my_profile_full returns a TABLE(..). We take the first row for this user.
  // (If your RPC already filters to auth.uid(), you'll get a single row.)
  const row =
    Array.isArray(data)
      ? data.find((r) => r.user_id === user.id) ?? data[0] ?? null
      : data ?? null;

  return row;
}

/** 
 * Strong address check for your RPC fields.
 * Requires: province, city, barangay, and numeric latitude & longitude.
 */
export function hasProfileAddress(p) {
  if (!p) return false;

  // Text presence
  const provinceOk = !!(p.province ?? p.province_name);
  const cityOk = !!(p.city ?? p.municipality ?? p.municipal);
  const brgyOk = !!(p.barangay);

  // Coordinates (coerce to numbers to be safe)
  const lat = typeof p.latitude === "number" ? p.latitude : Number(p.latitude);
  const lng = typeof p.longitude === "number" ? p.longitude : Number(p.longitude);
  const latOk = Number.isFinite(lat);
  const lngOk = Number.isFinite(lng);

  return provinceOk && cityOk && brgyOk && latOk && lngOk;
}
