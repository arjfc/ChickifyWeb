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

export async function fetchAllActionType() {
  const { data, error } = await supabase.rpc("get_all_activity_types");
  if (error) throw new error();
  console.log(data);
  return data.map((row) => row.action_type);
}
