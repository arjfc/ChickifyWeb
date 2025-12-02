import { supabase } from "@/lib/supabase";

export async function fetchAdminFees() {
  const { data, error } = await supabase.rpc("view_admin_fees");

  if (error) {
    console.error("view_admin_fees error:", error);
    throw error;
  }

  const rows = data ?? [];
  const totalFees = rows.length > 0 ? Number(rows[0].total_fees ?? 0) : 0;

  return { rows, totalFees };
}

export async function adminSubmitRemittance({ amount, img }) {
  const { data, error } = await supabase.rpc("admin_submit_remittance", {
    p_amount: amount,
    p_img: img ?? null,
  });

  if (error) throw error;

  // data = [{ admin_ledger_id, superadmin_ledger_id }]
  return data?.[0] ?? null;
}


export async function uploadRemittanceProof(file) {
  if (!file) return null;

  const ext = file.name.split(".").pop();
  const fileName = `remit_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("remittance-proofs")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("remittance-proofs")
    .getPublicUrl(fileName);

  return data.publicUrl;
}


/*** Superadmin: view all remittances that admins remitted.*/
export async function fetchAllRemittances() {
  const { data, error } = await supabase.rpc("view_all_remittances");

  if (error) {
    console.error("[fetchAllRemittances] Error fetching remittances:", error);
    throw error;
  }
  return data || [];
}



export async function fetchAdminRemittanceHistoryy(params = {}) {
  const { dateFrom = null, dateTo = null } = params;

  const { data, error } = await supabase.rpc(
    "view_admin_remittance_historyy",
    {
      p_date_from: dateFrom || null, // "YYYY-MM-DD" or null
      p_date_to: dateTo || null,
      // backend forces auth.uid() as admin, this is just for signature
      p_admin_id: null,
    }
  );

  if (error) {
    console.error("Error fetching admin remittance historyy:", error);
    throw error;
  }

  return data || [];
}


/* Small helper to normalize dates → "YYYY-MM-DD" */
const toYMD = (d) => {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10); // "YYYY-MM-DD"
};

/**
 * Super Admin: view remittance history of admins → superadmin.
 *
 * @param {Object} params
 * @param {string|Date|null} [params.dateFrom] - inclusive start date
 * @param {string|Date|null} [params.dateTo]   - inclusive end date
 * @param {string|null} [params.adminId]       - UUID of specific admin (optional)
 *
 * @returns {Promise<Array>} rows with:
 *   remittance_date, coop_name, admin_name, total_remitted,
 *   payment_method, gcash_name, gcash_number, remitted_to
 */
export async function fetchAdminRemittanceHistory(params = {}) {
  const {
    dateFrom = null,
    dateTo = null,
    adminId = null,
  } = params;

  const { data, error } = await supabase.rpc(
    "view_admin_remittance_history",
    {
      p_date_from: toYMD(dateFrom),
      p_date_to: toYMD(dateTo),
      p_admin_id: adminId || null,
    }
  );

  if (error) {
    console.error("view_admin_remittance_history error:", error);
    throw error;
  }

  return data || [];
}
