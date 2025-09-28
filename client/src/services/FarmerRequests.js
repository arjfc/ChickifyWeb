import { supabase } from "@/lib/supabase";

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw error ?? new Error("No session");
  return data.user.id;
}

/**
 * Fetch pending farmer requests for the current admin via RPC:
 * admin_view_pending(_admin_id uuid)
 * Returns: id, status, requested_at, farmer_id, farmer_name, farmer_email
 */
export async function fetchPendingFarmerRequestsForAdmin() {
  const adminId = await getCurrentUserId();

  const { data, error } = await supabase.rpc("admin_view_pending", {
    _admin_id: adminId,
  });
  if (error) throw error;

  // Normalize for the table
  return (data || []).map((r) => ({
    id: r.id,
    admin_id: adminId,
    farmer_id: r.farmer_id,
    status: r.status,
    requested_at: r.requested_at,
    farmer_name: r.farmer_name,
    farmer_email: r.farmer_email,
  }));
}

/** Internal helper that calls your RPC */
async function processFarmerRequest(rowId, action, reason) {
  const { error } = await supabase.rpc("admin_process_farmer_request", {
    row_id: rowId,
    action,                    // 'approved' | 'rejected'
    reason: reason ?? null,    // nullable on the RPC
  });
  if (error) throw error;
}

/** Approve via RPC */
export async function approveFarmerRequest(rowId) {
  await processFarmerRequest(rowId, "approved", "Approved by admin");
}

/** Reject via RPC */
export async function rejectFarmerRequest(rowId, reason) {
  await processFarmerRequest(rowId, "rejected", reason || "Rejected by admin");
}

/**
 * List farmers under this coop.
 * Defaults: approved + onlyActive=true (i.e., ended_at is null).
 */
export async function fetchFarmersForAdmin({ status = "approved", onlyActive = true } = {}) {
  const adminId = await getCurrentUserId();
  const { data, error } = await supabase.rpc("admin_view_decisions", {
    adminid: adminId,
    status,
    onlyactive: onlyActive,
  });
  if (error) throw error;
  // normalize to the fields the table needs
  return (data || []).map(r => ({
    id: r.id,
    farmer_id: r.farmer_id,
    name: r.farmer_name || r.farmer_id,
    email: r.farmer_email || "—",
    status: r.status,           // 'approved' or 'rejected'
    since: r.requested_at,      // or r.processed_at
    ended_at: r.ended_at,
  }));
}