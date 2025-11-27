import { supabase } from "@/lib/supabase";

/*** For notifications: get all pending refund requests (admin only).* */
export async function fetchRefundNotificationsAdmin() {
  const { data, error } = await supabase.rpc("view_refund_requests_admin");

  console.log("[fetchRefundNotificationsAdmin] data:", data);
  console.log("[fetchRefundNotificationsAdmin] error:", error);

  if (error) {
    console.error("fetchRefundNotificationsAdmin error:", error);
    throw error;
  }

  return data || [];
}

/**
 * Admin: view payout requests (for notifications).
 * Wraps the RPC: view_payout_requests_admin()
 */
export async function fetchPayoutRequestsAdmin() {
  const { data, error } = await supabase.rpc("view_payout_requests_admin");

  if (error) {
    console.error("Error fetching payout requests for admin:", error);
    throw error;
  }

  // Always return an array
  return data || [];
}
