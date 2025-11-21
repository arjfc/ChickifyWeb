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

export async function fetchCoopsOrAdmins() {
  const { data, error } = await supabase.rpc("view_coops_or_admins");

  if (error) {
    console.error("view_coops_or_admins error:", error);
    throw error;
  }

  // RPC returns TABLE, so `data` is already an array of rows
  return data ?? [];
}

export async function fetchBuyersList() {
  const { data, error } = await supabase.rpc("view_buyers_list");

  if (error) {
    console.error("view_buyers_list error:", error);
    throw error;
  }

  // RPC returns an array of rows
  return data ?? [];
}



// export async function fetchCoopsAndBuyers() {
//   const { data, error } = await supabase.rpc("view_coops_and_buyers");

//   if (error) {
//     console.error("view_coops_and_buyers error:", error);
//     throw error;
//   }

//   return data || [];
// }

// // Helper: split RPC result into coops/admins
// const fetchCoopsList = async () => {
//   const all = await fetchCoopsAndBuyers();
//   return (all || []).filter(
//     (row) => (row.account_type || "").toLowerCase() === "admin"
//   );
// };

// // Helper: split RPC result into buyers
// const fetchBuyerList = async () => {
//   const all = await fetchCoopsAndBuyers();
//   return (all || []).filter(
//     (row) => (row.account_type || "").toLowerCase() === "buyer"
//   );
// };

//===================================
// Monitor fees collected
//===================================
export async function fetchFeesCollectedByAdmin({
  dateFrom = null,
  dateTo = null,
} = {}) {
  // RPC expects DATE (YYYY-MM-DD)
  const normalizeDate = (d) => {
    if (!d) return null;
    const s = String(d).trim();
    return s.includes("T") ? s.split("T")[0] : s;
  };

  const { data, error } = await supabase.rpc("view_fees_collected_admin", {
    p_date_from: normalizeDate(dateFrom),
    p_date_to: normalizeDate(dateTo),
  });

  if (error) {
    console.error("view_fees_collected_admin error:", error);
    throw error;
  }

  return data ?? [];
}
