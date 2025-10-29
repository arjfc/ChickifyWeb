// services/Refund.js
import { supabase } from "@/lib/supabase";

/**
 * Calls public.view_refund_overview_admin
 * @param {Object} [opts]
 * @param {number|null} [opts.refundId=null]
 * @param {number|null} [opts.orderId=null]
 * @param {string|null} [opts.status=null]  // ILIKE on refund status (e.g., "Pending")
 * @returns {Promise<Array>}
 */
export async function viewRefundOverviewAdmin(opts = {}) {
  const {
    refundId = null,
    orderId = null,
    status = null,
  } = opts;

  const { data, error } = await supabase.rpc("view_refund_overview_admin", {
    p_refund_id: refundId,
    p_order_id: orderId,
    p_status: status,
  });

  if (error) {
    throw new Error(
      `view_refund_overview_admin failed: ${error.message}${
        error.code ? ` (${error.code})` : ""
      }`
    );
  }

  return data || [];
}

/**
 * Convenience: fetch a single refund row by ID (or null).
 * @param {number} refundId
 */
export async function getRefundOverviewById(refundId) {
  const rows = await viewRefundOverviewAdmin({ refundId });
  return rows?.[0] ?? null;
}

/**
 * Approve refund RPC wrapper.
 * Server behavior:
 *  - Writes p_proof_img_url to refund_req.proof_img_url
 *  - Upserts user_payout_info (gcash_name/number only)
 *  - Returns (t_refund_id, t_order_id, t_payout_info_id, t_refund_status, t_resolved_at)
 *
 * @param {Object} args
 * @param {number} args.refundId
 * @param {string} args.proofImgUrl
 * @param {string|null} [args.gcashName=null]
 * @param {string|null} [args.gcashNumber=null]
 * @param {number|null} [args.amount=null]
 * @returns {Promise<{refundId:number, orderId:number, payoutInfoId:number, status:string, resolvedAt:string|null}>}
 */
export async function approveRefundAdmin({
  refundId,
  proofImgUrl,
  gcashName = null,
  gcashNumber = null,
  amount = null,
}) {
  if (!refundId) throw new Error("approveRefundAdmin: refundId is required");
  if (!proofImgUrl) throw new Error("approveRefundAdmin: proofImgUrl is required");

  const { data, error } = await supabase.rpc("approve_refund", {
    p_refund_id: refundId,
    p_proof_img_url: proofImgUrl,
    p_gcash_name: gcashName,
    p_gcash_number: gcashNumber,
    p_amount: amount,
  });

  if (error) {
    throw new Error(
      `approve_refund failed: ${error.message}${
        error.code ? ` (${error.code})` : ""
      }`
    );
  }

  const row = data?.[0] ?? null;
  if (!row) throw new Error("approve_refund returned no data.");

  return {
    refundId: row.t_refund_id,
    orderId: row.t_order_id,
    payoutInfoId: row.t_payout_info_id,
    status: row.t_refund_status,
    resolvedAt: row.t_resolved_at ?? null,
  };
}

/**
 * ❌ Reject refund RPC wrapper (Admin/Super Admin only; enforced server-side).
 * Server returns: (t_refund_id, t_order_id, t_status, t_rejected_at)
 *
 * @param {Object} args
 * @param {number} args.refundId   required
 * @param {string} args.reason     required (why rejected)
 * @returns {Promise<{refundId:number, orderId:number, status:string, rejectedAt:string}>}
 */
export async function rejectRefundAdmin({ refundId, reason }) {
  if (!refundId) throw new Error("rejectRefundAdmin: refundId is required");
  if (!reason || !String(reason).trim()) {
    throw new Error("rejectRefundAdmin: reason is required");
  }

  const { data, error } = await supabase.rpc("reject_refund_admin", {
    p_refund_id: refundId,
    p_reason: reason,
  });

  if (error) {
    throw new Error(
      `reject_refund_admin failed: ${error.message}${
        error.code ? ` (${error.code})` : ""
      }`
    );
  }

  const row = data?.[0] ?? null;
  if (!row) throw new Error("reject_refund_admin returned no data.");

  return {
    refundId: row.t_refund_id,
    orderId: row.t_order_id,
    status: row.t_status,           // expected "Rejected"
    rejectedAt: row.t_rejected_at,  // timestamptz string
  };
}

/**
 * (Optional) Convenience helper to reject multiple refunds with the same reason.
 * @param {Array<number>} refundIds
 * @param {string} reason
 */
export async function rejectManyRefundsAdmin(refundIds, reason) {
  const results = [];
  for (const id of refundIds || []) {
    // eslint-disable-next-line no-await-in-loop
    const res = await rejectRefundAdmin({ refundId: id, reason });
    results.push(res);
  }
  return results;
}
