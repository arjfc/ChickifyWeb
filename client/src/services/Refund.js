// services/Refund.js
import { supabase } from "@/lib/supabase";

/**
 * Shape returned by view_refund_overview_admin (server):
 * [
 *  {
 *    refund_id, customer_name, order_id, reason, date_submitted,
 *    status, details: {
 *      current_status, image_proof_url, customer_name, order_id, reason,
 *      quantity_ordered_trays, mode_of_payment, gcash_name, gcash_number,
 *      order_summary: { subtotal, delivery_fee, service_fee, total_order }
 *    },
 *    // ... your RPC may also project: proof_image_url (from refund_req), created_at, resolved_at, etc.
 *  }, ...
 * ]
 */

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
 * Server behavior (updated):
 *  - Writes p_proof_img_url to refund_req.proof_img_url
 *  - Upserts user_payout_info (gcash_name/number only)
 *  - Returns (t_refund_id, t_order_id, t_payout_info_id, t_refund_status, t_resolved_at)
 *
 * @param {Object} args
 * @param {number} args.refundId              required
 * @param {string} args.proofImgUrl           required (stored in refund_req.proof_img_url)
 * @param {string|null} [args.gcashName=null] optional (upsert to user_payout_info)
 * @param {string|null} [args.gcashNumber=null] optional (upsert to user_payout_info)
 * @param {number|null} [args.amount=null]    optional override; otherwise server resolves
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
    p_proof_img_url: proofImgUrl,  // <-- now saved on refund_req.proof_img_url
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
    // RPC returns timestamptz (or casted); keep as-is for UI formatting
    resolvedAt: row.t_resolved_at ?? null,
  };
}
