// services/Payouts.js
import { supabase } from "@/lib/supabase";

/** OPTIONAL: sign a storage path like "payout-proofs/folder/123.png" from a private bucket */
async function signIfStoragePath(urlOrPath, bucket = "payout-proofs", expiresIn = 60) {
  if (!urlOrPath) return null;
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath; // already public
  const path = String(urlOrPath).replace(/^\/+/, "");
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

/**
 * Get ALL payouts (for table)
 * Returns rows with:
 *  - payout_id, requestor_name, amount, request_date, status,
 *  - gcash_name, gcash_number, img_url,
 *  - processed_at, processed_by_name   <-- NEW from RPC
 * Plus: img_url_signed when signImages = true
 */
export async function fetchPayoutOverviewList({ signImages = false } = {}) {
  const { data, error } = await supabase.rpc("view_payout_overview_admin", { p_payout_id: null });
  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  if (!signImages) return rows;

  const withSigned = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      img_url_signed: await signIfStoragePath(r.img_url),
    }))
  );
  return withSigned;
}

/**
 * Get ONE payout by id (for details modal)
 * Returns a single row with the same fields as list, including:
 *  - processed_at, processed_by_name   <-- NEW
 * Plus: img_url_signed when signImages = true
 */
export async function fetchPayoutOverviewById(payoutId, { signImages = false } = {}) {
  const { data, error } = await supabase.rpc("view_payout_overview_admin", { p_payout_id: payoutId });
  if (error) throw error;
  const row = (data && data[0]) || null;
  if (!row || !signImages) return row;
  return { ...row, img_url_signed: await signIfStoragePath(row.img_url) };
}

/**
 * Approve a payout (admin only).
 * If your RPC requires a proof image now, `proofUrl` must be provided.
 */
export async function adminApprovePayout({
  payoutId,
  proofUrl,                 // REQUIRED if RPC enforces proof image
  method = "GCash",         // 'COD' | 'PayPal' | 'GCash' | 'Card'
  memo = null,
}) {
  if (!proofUrl || String(proofUrl).trim() === "") {
    throw new Error("Proof image URL is required to approve a payout.");
  }

  const { data, error } = await supabase.rpc("approve_payout", {
    p_payout_id: payoutId,
    p_proof_img_url: proofUrl,
    p_method: method,
    p_memo: memo,
  });
  if (error) throw error;
  return (data && data[0]) || null;
}

/**
 * Reject a payout (admin only).
 * Calls RPC: reject_payout(p_payout_id int)
 * Returns the updated row (commonly includes t_processed_at inside RPC),
 * but we keep the signature generic and pass back the first row.
 */
export async function adminRejectPayout({ payoutId }) {
  if (payoutId == null) throw new Error("payoutId is required.");
  const { data, error } = await supabase.rpc("reject_payout", {
    p_payout_id: payoutId,
  });
  if (error) throw error;
  return (data && data[0]) || null;
}
