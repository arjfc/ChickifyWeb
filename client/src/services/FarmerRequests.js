// src/lib/services/FarmerRequests.js
import { supabase } from "@/lib/supabase";

/* =========================================================
 * Auth helper
 * =======================================================*/
export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw error ?? new Error("No session");
  return data.user.id;
}

/* =========================================================
 * Pending farmer requests for this admin
 * RPC: admin_view_pending(_admin_id uuid)
 * Returns: id, status, requested_at, farmer_id, farmer_name, farmer_email,
 *          farmer_contact_no, membership_payment_id, payment_status,
 *          payment_amount, payment_method, payment_paid_at
 * =======================================================*/
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
    farmer_contact_no: r.farmer_contact_no,
    membership_payment_id: r.membership_payment_id,
    payment_status: r.payment_status,
    payment_amount: r.payment_amount,
    payment_method: r.payment_method,
    payment_paid_at: r.payment_paid_at,
  }));
}

/* =========================================================
 * Fetch coop name of CURRENT ADMIN (coop)
 *   SELECT coop_name FROM user_profile WHERE user_id = current admin id
 * =======================================================*/
export async function fetchCoopNameForUser() {
  const adminId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("user_profile")
    .select("coop_name")
    .eq("user_id", adminId)
    .maybeSingle(); // ✅ avoid 406 when 0 rows

  if (error) {
    console.error("Error fetching coop_name:", error);
    return null;
  }

  return data?.coop_name || null;
}

/* =========================================================
 * Edge Function caller: send farmer permit status email
 * Edge function: farmer-verif-status
 * =======================================================*/
async function sendFarmerPermitStatusEmail({
  to,
  name,
  status,
  reason,
  coopName,
}) {
  if (!to) return;

  const friendly = name || "Farmer";
  const isApproved = status === "approved";
  const statusPlain = isApproved ? "APPROVED" : "REJECTED";

  // How coop appears in subject/body
  const coopPhrase = coopName ? `under ${coopName}` : "on Chickify";
  const coopHtml = coopName
    ? `under <strong>${coopName}</strong>`
    : "on <strong>Chickify</strong>";

  const subject = isApproved
    ? `Your farmer verification ${coopPhrase} has been approved`
    : `Your farmer verification ${coopPhrase} has been rejected`;

  const reasonHtml =
    !isApproved && reason ? `<p><strong>Reason:</strong> ${reason}</p>` : "";

  const html = `
    <p>Hi ${friendly},</p>
    <p>Your farmer verification request ${coopHtml} has been <strong>${statusPlain}</strong>.</p>
    ${reasonHtml}
    <p>You can open your Chickify app to view the updated status.</p>
    <p>Thank you,<br/>Chickify Team</p>
  `;

  const text = `Hi ${friendly},

Your Chickify farmer verification ${
    coopName ? `under ${coopName}` : ""
  } has been ${statusPlain}.
${
  !isApproved && reason ? `Reason: ${reason}\n\n` : ""
}Please log in to your Chickify account to view the update.

Thank you,
Chickify Team`;

  try {
    const { data, error } = await supabase.functions.invoke(
      "farmer-verif-status",
      {
        body: {
          to,
          subject,
          html,
          text,
        },
      }
    );

    if (error) {
      console.error("sendFarmerPermitStatusEmail invoke error:", error);
    } else {
      console.log("Email sent:", data);
    }
  } catch (err) {
    console.error("sendFarmerPermitStatusEmail unexpected error:", err);
  }
}

/* =========================================================
 * Internal RPC helper for approve/reject
 * =======================================================*/
async function processFarmerRequest(rowId, action, reason) {
  const { error } = await supabase.rpc("admin_process_farmer_request", {
    row_id: rowId,
    action, // 'approved' | 'rejected'
    reason: reason ?? null,
  });
  if (error) throw error;
}

/* =========================================================
 * Approve farmer request
 * =======================================================*/
export async function approveFarmerRequest(row, reason) {
  // 1) Update DB via RPC
  await processFarmerRequest(row.id, "approved", reason);

  // 2) Fetch coop name of current admin
  const coopName = await fetchCoopNameForUser();

  // 3) Send email
  await sendFarmerPermitStatusEmail({
    to: row.farmer_email,
    name: row.farmer_name,
    status: "approved",
    reason: null,
    coopName,
  });
}

/* =========================================================
 * Reject farmer request
 * =======================================================*/
export async function rejectFarmerRequest(row, reason) {
  const rejectionReason = reason || "Rejected by admin";

  // 1) Update DB via RPC
  await processFarmerRequest(row.id, "rejected", rejectionReason);

  // 2) Fetch coop name of current admin
  const coopName = await fetchCoopNameForUser();

  // 3) Send email
  await sendFarmerPermitStatusEmail({
    to: row.farmer_email,
    name: row.farmer_name,
    status: "rejected",
    reason: rejectionReason,
    coopName,
  });
}

/* =========================================================
 * Mark membership payment as paid (COD payments)
 * RPC: admin_mark_membership_payment_paid(p_membership_payment_id bigint)
 * =======================================================*/
export async function markMembershipPaymentPaid(membershipPaymentId) {
  const { data, error } = await supabase.rpc(
    "admin_mark_membership_payment_paid",
    {
      p_membership_payment_id: membershipPaymentId,
    }
  );
  if (error) throw error;
  return data;
}

/* =========================================================
 * UI Helper functions for payment status and button logic
 * =======================================================*/
export function shouldShowMarkAsPaidButton(row) {
  return row.payment_method === "COD" && row.payment_status === "pending";
}

export function canApproveRequest(row) {
  return ["paid", "verified"].includes(row.payment_status);
}

/* =========================================================
 * List farmers under this coop (admin_view_decisions)
 * Defaults: status='approved', onlyActive=true
 * =======================================================*/
export async function fetchFarmersForAdmin({
  // kept params for compatibility, but they are no longer used
  status = "approved",
  onlyActive = true,
} = {}) {
  const adminId = await getCurrentUserId();

  const { data, error } = await supabase.rpc("admin_fetch_active_farmers", {
    p_admin_id: adminId,
  });

  if (error) throw error;

  return (data || []).map((r) => ({
    id: r.farmer_id,
    farmer_id: r.farmer_id,
    name: r.farmer_name || r.farmer_id,
    email: r.farmer_email || "—",
    is_active: !!r.is_active,
    status: r.is_active ? "approved" : "inactive",
    since: r.approved_at, // from RPC
    ended_at: null, // not applicable anymore
  }));
}

/* =========================================================
 * View specific farmer profile (admin_get_farmer_profile)
 * =======================================================*/
export async function fetchFarmerDetails(farmerId) {
  const { data, error } = await supabase.rpc("admin_get_farmer_profile", {
    p_farmer_id: farmerId,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    id: row.user_id,
    name: row.full_name,
    firstName: row.first_name || "",
    middleName: row.middle_name || "",
    lastName: row.last_name || "",
    sex: (row.sex || "").trim().toLowerCase(),
    phoneNumber: row.contact_no,
    address: row.full_address,
    addressParts: {
      houseNumber: row.house_number,
      street: row.street,
      barangay: row.barangay,
      city: row.city,
      province: row.province,
      postalCode: row.postal_code,
      deliveryNotes: row.delivery_notes,
      lat: row.latitude ?? null,
      lon: row.longitude ?? null,
    },
    imgUrl: row.img_url,
    permitUrl: row.permit_url,
  };
}

/* =========================================================
 * Update farmer profile (admin_update_farmer_profile)
 * =======================================================*/
export async function adminUpdateFarmerProfile(payload) {
  const {
    id, // farmer user_id
    firstName,
    middleName,
    lastName,
    sex,
    phoneNumber,
    addressParts,
  } = payload;

  const {
    houseNumber,
    street,
    barangay,
    city,
    province,
    postalCode,
    deliveryNotes,
    lat,
    lon,
  } = addressParts || {};

  const { error } = await supabase.rpc("admin_update_farmer_profile", {
    p_farmer_id: id,
    p_first_name: firstName,
    p_middle_name: middleName ?? null,
    p_last_name: lastName,
    p_sex: sex,
    p_contact_no: phoneNumber,
    p_house_number: houseNumber,
    p_street: street,
    p_barangay: barangay,
    p_city: city,
    p_province: province,
    p_postal_code: postalCode,
    p_delivery_notes: deliveryNotes,
    p_lat: lat ?? null,
    p_lon: lon ?? null,
  });

  if (error) throw error;
}

/* =========================================================
 * Fetch farmer permit (get_farmer_permit)
 *   + resolve public URL from storage
 * =======================================================*/
export async function fetchFarmerPermit(farmerId) {
  const { data, error } = await supabase.rpc("get_farmer_permit", {
    p_farmer_id: farmerId,
  });

  if (error) {
    console.error("get_farmer_permit error:", error);
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  let path = row.permit_url || "";

  if (/^https?:\/\//i.test(path)) {
    const marker = "/business-permit/";
    const idx = path.indexOf(marker);
    if (idx !== -1) {
      path = path.slice(idx + marker.length); // -> "permits/.../permit.jpg"
    }
  }

  if (path) {
    const { data: urlData } = supabase.storage
      .from("business-permit")
      .getPublicUrl(path);

    row.permit_image_url = urlData?.publicUrl || null;
  } else {
    row.permit_image_url = null;
  }

  return row;
}

// export async function fetchFarmerDetails(farmerId) {
//   const { data, error } = await supabase.rpc("admin_get_farmer_profile", {
//     p_farmer_id: farmerId,
//   });

//   if (error) throw error;

//   const row = Array.isArray(data) ? data[0] : data;
//   if (!row) return null;

//   return {
//     id: row.user_id,
//     name: row.full_name,
//     sex: (row.sex || "").trim().toLowerCase(),
//     phoneNumber: row.contact_no,
//     address: row.full_address,
//     addressParts: {
//       houseNumber: row.house_number,
//       street: row.street,
//       barangay: row.barangay,
//       city: row.city,
//       province: row.province,
//       postalCode: row.postal_code,
//       deliveryNotes: row.delivery_notes,
//     },
//     imgUrl: row.img_url,
//     permitUrl: row.permit_url,
//   };
// }

// export async function adminUpdateFarmerProfile(payload) {
//   const {
//     id, // farmer user_id
//     firstName,
//     middleName,
//     lastName,
//     sex,
//     phoneNumber,
//     addressParts,
//   } = payload;

//   const { houseNumber, street, barangay, city, province, postalCode, deliveryNotes } =
//     addressParts || {};

//   const { error } = await supabase.rpc("admin_update_farmer_profile", {
//     p_farmer_id: id,
//     p_first_name: firstName,
//     p_middle_name: middleName,
//     p_last_name: lastName,
//     p_sex: sex,
//     p_contact_no: phoneNumber,
//     p_house_number: houseNumber,
//     p_street: street,
//     p_barangay: barangay,
//     p_city: city,
//     p_province: province,
//     p_postal_code: postalCode,
//     p_delivery_notes: deliveryNotes,
//   });

//   if (error) throw error;
// }

//
