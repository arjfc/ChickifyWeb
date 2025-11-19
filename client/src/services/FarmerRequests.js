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


/**
 * View specific farmer in this coop.
 */
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

/**
 * Update the details of the specific farmer in this coop.
 * Except email which is immutable here.
 */
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
    const { data: urlData } = supabase
      .storage
      .from("business-permit")          // 👈 bucket name
      .getPublicUrl(path);              // 👈 relative path inside that bucket

    row.permit_image_url = urlData?.publicUrl || null;
  } else {
    row.permit_image_url = null;
  }

  return row;
}