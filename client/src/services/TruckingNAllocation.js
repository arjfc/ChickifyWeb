// /services/TrackingNAllocation.js
import { supabase } from "@/lib/supabase";

/**
 * Fetch list of drivers with schedule + nextSchedule.
 *
 * @param {Object} params
 * @param {string|null} [params.companyName]   Filter by company (null = all)
 * @param {string|null} [params.search]        Search by driver name
 * @param {string|null} [params.dateFrom]      'YYYY-MM-DD' or null
 * @param {string|null} [params.dateTo]        'YYYY-MM-DD' or null
 */
export async function fetchDriverList({
  companyName = null,
  search = null,
  dateFrom = null,
  dateTo = null,
} = {}) {
  const { data, error } = await supabase.rpc("view_driver_list", {
    p_company_name: companyName || null,
    p_search: search || null,
    p_date_from: dateFrom || null,
    p_date_to: dateTo || null,
  });

  if (error) {
    console.error("[fetchDriverList] error:", error);
    throw error;
  }

  // Map RPC result → shape expected by <TruckingTable />
  return (data ?? []).map((row) => ({
    tracking_profile_id: row.tracking_profile_id,
    name: row.driver_name,          // 👈 TruckingTable uses `row.name`
    company_name: row.company_name,
    truck_number: row.truck_number,
    phone_number: row.phone_number,
    plate_number: row.plate_number,
    is_active: row.is_active,
    schedule: row.schedule,
    nextSchedule: row.next_schedule // 👈 TruckingTable uses `nextSchedule`
  }));
}

/**
 * Fetch distinct trucking companies for the "Filter by company" dropdown.
 */
export async function fetchTruckingCompanies() {
  const { data, error } = await supabase
    .from("tracking_profile")
    .select("company_name, is_active")
    .order("company_name", { ascending: true });

  if (error) {
    console.error("[fetchTruckingCompanies] error:", error);
    throw error;
  }

  // Deduplicate company names, only active ones
  const set = new Set();
  (data ?? []).forEach((row) => {
    if (row.is_active && row.company_name) {
      set.add(row.company_name);
    }
  });

  return Array.from(set);
}

/**
 * Optional: fetch single driver by id (useful for edit modal, etc.).
 */
export async function fetchDriverById(trackingProfileId) {
  const { data, error } = await supabase
    .from("tracking_profile")
    .select("*")
    .eq("tracking_profile_id", trackingProfileId)
    .single();

  if (error) {
    console.error("[fetchDriverById] error:", error);
    throw error;
  }

  return data;
}
