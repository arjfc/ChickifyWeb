// src/lib/services/superAdminProfile.js
import { supabase } from "@/lib/supabase";

export async function fetchMySettings() {
  const { data, error } = await supabase.rpc("superadmin_get_profile");

  if (error) {
    console.error("[superadmin_get_profile] error:", error);
    throw error;
  }

  if (!data || data.length === 0) return null;

  // data is an array of rows; return the first one
  return data[0];
}

export async function updateMySettings(payload) {
  const {
    first_name,
    middle_name,
    last_name,
    sex,
    contact_no,
    house_number,
    street,
    barangay,
    city,
    province,
    postal_code,
  } = payload;

  const { error } = await supabase.rpc("update_my_profile", {
    p_first_name: first_name,
    p_middle_name: middle_name ?? null,
    p_last_name: last_name,
    p_sex: sex,
    p_contact_no: contact_no,
    p_house_number: house_number,
    p_street: street,
    p_barangay: barangay,
    p_city: city,
    p_province: province,
    p_postal_code: postal_code,
  });

  if (error) {
    console.error("[superadmin_update_profile] error:", error);
    throw error;
  }
}
