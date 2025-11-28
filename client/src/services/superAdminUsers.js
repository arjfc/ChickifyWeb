// src/services/superadminUsers.js
import { supabase } from "@/lib/supabase";

/**
 * 1) TOTALS (uses superadmin_user_totals)
 */
export async function fetchUserTotals() {
  const { data, error } = await supabase.rpc("superadmin_user_totals");
  if (error) {
    console.error("[fetchUserTotals] error:", error);
    throw error;
  }
  // function returns a single row
  return Array.isArray(data) ? data[0] : data;
}

/**
 * 2) LIST USERS (uses superadmin_list_users)
 *    filters: role (admin|farmer|buyer|null), createdOn 'YYYY-MM-DD' | null
 */
export async function fetchUsers({ role = null, createdOn = null } = {}) {
  const { data, error } = await supabase.rpc("superadmin_list_users", {
    p_role: role,          // null | 'admin' | 'farmer' | 'buyer'
    p_created_on: createdOn, // null | 'YYYY-MM-DD'
  });

  if (error) {
    console.error("[fetchUsers] error:", error);
    throw error;
  }

  // expected: [{ user_id, email, role, status, first_name, ... }, ...]
  return data ?? [];
}

/**
 * 3) CREATE USER (uses superadmin_create_user)
 *    NOTE: password is collected in the UI, but this RPC ONLY creates
 *    app_users + user_profile. It does NOT create a Supabase Auth account.
 *    You will need an API route with the service key to actually create
 *    Auth users with a password.
 */
export async function createUserWithPassword(payload) {
  const {
    last_name,
    first_name,
    middle_name,
    phone,
    email,
    role,       // 'Admin' | 'Farmer' | 'Buyer'
    sex,        // 'female' | 'male'
    coop_name,  // required if role === 'Farmer'
    password,   // collected but NOT used by this rpc yet
  } = payload;

  const normRole = role?.toLowerCase() || null; // admin/farmer/buyer

  const { data, error } = await supabase.rpc("superadmin_create_user", {
    p_email: email,
    p_role: normRole,
    p_first_name: first_name,
    p_middle_name: middle_name || null,
    p_last_name: last_name,
    p_contact_no: phone,
    p_sex: sex === "male" ? "M" : "F",
    p_coop_name:
      normRole === "farmer" ? (coop_name?.trim() || null) : null,
  });

  if (error) {
    console.error("[createUserWithPassword] rpc error:", error);
    throw error;
  }

  // rpc returns TABLE(...) => array with a single row
  return Array.isArray(data) ? data[0] : data;
}   

/**
 * 4) SUSPEND USER (assuming you have an rpc like superadmin_suspend_user)
 */
export async function suspendUser(userId) {
  const { data, error } = await supabase.rpc("superadmin_suspend_user", {
    p_user_id: userId,
  });

  if (error) {
    console.error("[suspendUser] error:", error);
    throw error;
  }
  return data;
}
