// services/Fees.js
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
