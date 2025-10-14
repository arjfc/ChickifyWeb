import { supabase } from "@/lib/supabase";

export async function fetchTransactions() {
  const { data, error } = await supabase.rpc("view_fees_all");
  if (error) throw new error();
  return data || null;
}
