import { supabase } from "@/lib/supabase";

// ==============================
// Monitor transaction logs for superadmin
// ==============================
export async function fetchTransactions() {
  const { data, error } = await supabase.rpc("view_fees_all");
  if (error) throw new error();
  return data || null;
}

//===================================
// Monitor transaction logs for admin
//===================================
export async function fetchTransactionsByAdmin() {
  const { data, error } = await supabase.rpc("get_transaction_records_admin", {
    p_date_from: null,
    p_date_to: null,
  });
  if (error) throw error;
  return data ?? [];
}
