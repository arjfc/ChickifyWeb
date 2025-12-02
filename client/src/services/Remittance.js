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



export async function fetchAdminRemittanceHistory(params = {}) {
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
