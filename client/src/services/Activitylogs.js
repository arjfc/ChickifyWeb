import { supabase } from "@/lib/supabase";

// ======================================================
// ACTIVITY LOGS FOR SUPERADMIN
// ======================================================

// view function: fetch all activity logs filtered by role in parent file
export async function fetchActivityLogs({ action_type = null } = {}) {
  const { data, error } = await supabase.rpc("get_activity_log_order_status", {
    action_filter: action_type,
  });

  if (error) throw error;
  return data || [];
}

//view function: get all action type and populate it
export async function fetchAllActionType() {
  const { data, error } = await supabase.rpc("get_all_activity_types");
  if (error) throw new error();
  return data.map((row) => row.action_type);
}

//view function: get last signins with limit
export async function fetchLastSignins({
  limit = 20,
  offset = null,
  role = null,
  s_date = null,
  e_date = null,
} = {}) {
  const { data, error } = await supabase.rpc("get_last_signins", {
    p_limit: limit,
    p_offset: offset,
    role_filter: role,
    start_date: s_date,
    end_date: e_date,
  });

  if (error) throw error;
  return data || [];
}
