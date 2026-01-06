// src/services/membershipPaymentAdmin.js
import { supabase } from "@/lib/supabase";

/* =========================================================
 * Internal RPC helper for membership payment actions
 * =======================================================*/
async function processMembershipPayment(membershipPaymentId, action, reason) {
  const { data, error } = await supabase.rpc(
    "admin_verify_membership_payment_only",
    {
      p_membership_payment_id: membershipPaymentId,
      p_action: action, // 'verified' | 'rejected' | 'cancelled'
      p_reason: reason ?? null,
    }
  );

  if (error) throw error;
  return data; // updated coop_membership_payment row
}

/* =========================================================
 * Verify membership payment
 * - creates cash_ledger entries
 * - (and whatever your RPC does next)
 * =======================================================*/
export async function verifyMembershipPayment(membershipPaymentId, reason) {
  return processMembershipPayment(membershipPaymentId, "verified", reason);
}

/* =========================================================
 * Cancel membership payment (recommended for request rejection)
 * =======================================================*/
export async function cancelMembershipPayment(membershipPaymentId, reason) {
  const msg = reason || "Cancelled by admin";
  return processMembershipPayment(membershipPaymentId, "cancelled", msg);
}

/* =========================================================
 * Reject membership payment (recommended for invalid proof)
 * =======================================================*/
export async function rejectMembershipPayment(membershipPaymentId, reason) {
  const msg = reason || "Rejected by admin";
  return processMembershipPayment(membershipPaymentId, "rejected", msg);
}
