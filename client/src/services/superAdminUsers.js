// src/services/superadminUsers.js
import { supabase } from "@/lib/supabase";

// helper
function normalizeRole(label) {
  if (!label) return null;
  return label.toLowerCase();
}

function normalizeUserRow(row) {
  if (!row) return null;

  return {
    user_id: row.user_id,

    first_name: row.first_name,
    middle_name: row.middle_name,
    last_name: row.last_name,

    sex: row.sex, // 'male' | 'female' | null

    phone: row.contact_no,
    email: row.email,

    role: row.role,
    is_active: row.is_active,
    status: row.is_active ? "Active" : "Inactive",

    created_at: row.created_at,

    house_number: row.house_number,
    street: row.street,
    barangay: row.barangay,
    city: row.city,
    province: row.province,
    postal_code: row.postal_code,
  };
}

/** CREATE user (auth + profile + address) using your existing v3 RPC */
export async function createUserWithPassword(payload) {
  const {
    email,
    password,
    role,
    first_name,
    middle_name,
    last_name,
    phone,          // from UI
    sex,            // "male" | "female"
    coop_name,
    house_number,
    street,
    barangay,
    city,
    province,
    postal_code,
  } = payload;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }
  if (!phone) {
    throw new Error("Phone number is required.");
  }
  if (!first_name || !last_name) {
    throw new Error("First and last name are required.");
  }

  // STEP 1: create auth user
  const { data: signUpData, error: signUpError } =
    await supabase.auth.signUp({ email, password });

  if (signUpError) {
    console.error("[auth.signUp] error:", signUpError);
    throw new Error(signUpError.message || "Failed to create auth user");
  }

  const user = signUpData.user;
  if (!user) {
    throw new Error("Auth user was not returned by signUp");
  }

  // STEP 2: call RPC v3
  const rpcPayload = {
    p_auth_uid: user.id,
    p_email: email,
    p_role: normalizeRole(role),
    p_first_name: first_name || "",
    p_middle_name: middle_name || "",
    p_last_name: last_name || "",
    p_contact_no: phone || "",
    p_sex: sex === "male" ? "M" : "F",
    p_coop_name: coop_name || null,
    p_house_number: house_number || "",
    p_street: street || "",
    p_barangay: barangay || "",
    p_city: city || "",
    p_province: province || "",
    p_postal_code: postal_code || "",
  };

  const { data, error } = await supabase.rpc(
    "superadmin_create_user_v3",
    rpcPayload
  );

  if (error) {
    // detailed console debug like you asked
    console.error(
      "[superadmin_create_user_v3] rpc error:",
      JSON.stringify(error, null, 2)
    );
    throw new Error(error.message || "Failed to create user");
  }

  // v3 returns s_user_id – normalise to user_id for the rest of the app
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  const normalized = {
    ...row,
    user_id: row.s_user_id,
  };

  return normalized;
}


/** LIST users for table */
export async function fetchUsers({ role = null, createdOn = null } = {}) {
  const { data, error } = await supabase.rpc("superadmin_list_users", {
    p_role: role,
    p_created_on: createdOn,
  });

  if (error) {
    console.error("[superadmin_list_users] error:", error);
    throw new Error(error.message || "Failed to load users");
  }

  const rows = Array.isArray(data) ? data : [];
  return rows.map(normalizeUserRow);
}

/** KPI totals (unchanged) */
export async function fetchUserTotals() {
  const { data, error } = await supabase.rpc("superadmin_user_totals");
  if (error) throw error;
  return data?.[0] ?? { total_admins: 0, total_farmers: 0, total_buyers: 0 };
}

/** SUSPEND user (set is_active = false) */
export async function suspendUser(userId) {
  const { error } = await supabase.rpc("superadmin_suspend_user", {
    p_s_user_id: userId,   // must match the RPC parameter name
  });

  if (error) {
    console.error("[superadmin_suspend_user] error:", error);
    throw new Error(error.message || "Failed to suspend user");
  }
}

/** GET one user (for edit screen) */
export async function fetchUserById(userId) {
  const { data, error } = await supabase.rpc("superadmin_get_user", {
    p_user_id: userId,
  });

  if (error) {
    console.error("[superadmin_get_user] error:", error);
    throw new Error(error.message || "Failed to fetch user");
  }

  const row = Array.isArray(data) ? data[0] : data;
  return normalizeUserRow(row);
}

/** UPDATE profile + address */
export async function updateUserProfile(payload) {
  const { error } = await supabase.rpc("superadmin_update_user", {
    p_barangay:     payload.barangay,
    p_city:         payload.city,
    p_contact_no:   payload.phone,
    p_first_name:   payload.first_name,
    p_house_number: payload.house_number,
    p_last_name:    payload.last_name,
    p_middle_name:  payload.middle_name,
    p_postal_code:  payload.postal_code,
    p_province:     payload.province,
    p_sex:          payload.sex,
    p_street:       payload.street,
    p_user_id:      payload.user_id,   // uuid from app_users / auth.users
  });

  if (error) {
    console.error("[superadmin_update_user] error:", error);
    throw new Error(error.message || "Failed to update user");
  }
}



